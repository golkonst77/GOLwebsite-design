#!/usr/bin/env python3
"""Offline-tested operator tool. No production operation runs on import."""
import fcntl
import getpass
import glob
import hashlib
import io
import json
import os
from pathlib import Path
import re
import resource
import shlex
import shutil
import stat
import subprocess
import sys
import tarfile
import tempfile
import warnings
from datetime import datetime, timezone

SHA = None
APP = None
DEST = None
DOMAINS = set()
APP_NAME = None
NGINX = None
PM2_HOME = None
RUN_DIRECTORY = None
EXTRA_INCLUDES = set()
ENV_FILES = (".env.production.local", ".env.local", ".env.production", ".env")
MAX_FILE = 4 * 1024 * 1024
MAX_TOTAL = 32 * 1024 * 1024
NAME = re.compile(r"site-config-[0-9TZ-]+-[a-f0-9]{12}\.tar\.gz\.gpg\Z")
RUNTIME_KEYS = {"NODE_ENV", "NODE_OPTIONS", "NODE_PATH", "PATH", "PORT", "HOSTNAME", "TZ",
                "MAIL_TO", "LEAD_TO_EMAIL"}
RESTORE = """Site configuration recovery. Source commit and application are recorded in manifest.json.

This archive contains secrets. Keep it encrypted. Never upload decrypted files to GitHub,
chat, tickets, logs, a web root, a shared folder or a cloud-sync folder.
The encryption password is not stored in the archive. Keep it in a password manager.

1. Recover the exact source commit in a separate release directory using Node 24 and npm.
   Run npm ci and npm run check before switching the live site. Do not reset the live tree.
2. On a trusted Linux recovery machine: install GnuPG if needed. Compare the encrypted
   file's SHA256 to its sidecar (transport check, not proof of authenticity).
   The helper verify command decrypts into memory, verifies GPG MDC plus every manifest
   hash, validates tar paths and does not extract files. No application restart is needed.
3. For recovery only, in a private, non-synced directory on a trusted encrypted filesystem:
   umask 077
   mkdir -m 700 recovered
   set -o pipefail
   gpg --decrypt -- backup.tar.gz.gpg | tar --no-same-owner --no-same-permissions -xzf - -C recovered
   Substitute the real filename. GPG prompts privately; never put the password in argv.
   Do not use extracted files if GPG or tar fails. Run the helper verify command first.
4. Read manifest.json. app/env contains only production env files used by this site.
   Restore them to the recorded paths, owner and mode; restrict secrets to 600.
   Preserve the established SMTP Mail.ru values, aliases, Telegram and abuse settings.
   Do not run smtp:setup or replace these files with .env.example.
5. pm2/ecosystem.app.json restores ONLY the the selected app process definition and
   its application environment. It intentionally excludes other PM2 apps, logs, dump.pm2
   and unrelated shell variables. It includes values inherited by the live process for
   SMTP_*, LEXRADAR_*, TELEGRAM_*, NEXT_PUBLIC_*, and listed Node/runtime/recipient keys.
   Review script/interpreter/args/cwd in the JSON. Restore to the same production path,
   or adapt paths explicitly if the release directory changed.
   Do not run pm2 resurrect: that could affect other projects. After an approved switch,
   use the extracted ecosystem JSON to startOrReload ONLY the selected app --update-env.
6. nginx/sites contains ONLY server blocks with this site's server_name. manifest.json
   records their original paths and symlinks. Merge those blocks with existing config;
   do not overwrite a shared vhost file. nginx/includes contains referenced snippets.
   Global nginx.conf, other vhosts, shared global maps/upstreams and TLS certificates/
   private keys are NOT backed up. Retain them on this server, or provision/reissue
   certificates before disaster recovery. This is a site-configuration backup, not a
   complete server image. Review dependencies in nginx/requirements.json.
   Validate nginx -t before an explicitly authorized reload; never reload on failure.
7. After explicit approval and restoring settings: check PM2 online, nginx -t,
   npm run lexradar:inspect and npm run telegram:inspect from the application directory.
   Expected: FORM_READY, FORM_FLAG_ENABLED, TELEGRAM_ENABLED, TELEGRAM_CONFIG_READY.
   A standalone CLI does not prove the PM2 process uses the same environment.
   One marked test submission should reach email and Telegram; do not repeat blindly.
8. Remove any decrypted recovery copies when finished. Secure deletion is not reliable
   on SSD/snapshots; use an encrypted filesystem and its retention policy.

Creation and verification only read settings; they never restart/save PM2, reload Nginx,
edit configuration, invoke an SMTP setup, send a test lead or change the source checkout.
"""


class BackupError(Exception):
    pass


def require(condition, code):
    if not condition:
        raise BackupError(code)


def run(args):
    result = subprocess.run(args, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                            timeout=30, check=False)
    require(result.returncode == 0, "READ_COMMAND_FAILED")
    require(len(result.stdout) <= MAX_TOTAL, "COMMAND_OUTPUT_TOO_LARGE")
    return result.stdout


def read_stable(path):
    before = path.stat()
    require(stat.S_ISREG(before.st_mode) and before.st_size <= MAX_FILE, "UNSAFE_CONFIG_FILE")
    with path.open("rb") as stream:
        data = stream.read(MAX_FILE + 1)
        after = os.fstat(stream.fileno())
    final = path.stat()
    signature = lambda s: (s.st_dev, s.st_ino, s.st_size, s.st_mtime_ns, s.st_ctime_ns)
    require(signature(before) == signature(after) == signature(final), "CONFIG_CHANGED_RETRY")
    require(len(data) <= MAX_FILE, "CONFIG_TOO_LARGE")
    return data, {"source": str(path), "mode": oct(stat.S_IMODE(before.st_mode)),
                  "uid": before.st_uid, "gid": before.st_gid}


def tokens(text):
    """Small Nginx lexer: preserve offsets; ignore braces/comments in quoted values."""
    result = []
    i = 0
    while i < len(text):
        if text[i].isspace():
            i += 1
            continue
        if text[i] == "#":
            end = text.find("\n", i)
            i = len(text) if end < 0 else end + 1
            continue
        start = i
        if text[i] in "{};":
            i += 1
        else:
            quote = None
            while i < len(text):
                char = text[i]
                if char == "\\":
                    i += 2
                    continue
                if quote:
                    if char == quote:
                        quote = None
                    i += 1
                    continue
                if char in "\"'":
                    quote = char
                    i += 1
                elif text.startswith("${", i):
                    end = text.find("}", i + 2)
                    require(end >= 0, "NGINX_PARSE_REVIEW")
                    i = end + 1
                elif char.isspace() or char in "{};#":
                    break
                else:
                    i += 1
            require(quote is None and i > start, "NGINX_PARSE_REVIEW")
        result.append((text[start:i], start, i))
    return result


def directives(text, name):
    parts = tokens(text)
    values = []
    for i, (value, _, _) in enumerate(parts):
        if value != name:
            continue
        args = []
        for atom, _, _ in parts[i + 1:]:
            if atom == ";":
                values.append(args)
                break
            require(atom not in "{}", "NGINX_PARSE_REVIEW")
            args.append(atom.strip("\"'"))
    return values


def site_blocks(text):
    parts = tokens(text)
    selected = []
    for i in range(len(parts) - 1):
        if parts[i][0] != "server" or parts[i + 1][0] != "{":
            continue
        depth = 0
        end = None
        for atom, _, stop in parts[i + 1:]:
            depth += (atom == "{") - (atom == "}")
            if depth == 0:
                end = stop
                break
        require(end is not None, "NGINX_PARSE_REVIEW")
        block = text[parts[i][1]:end]
        names = {name.lower() for group in directives(block, "server_name") for name in group}
        if names & DOMAINS:
            require(names <= DOMAINS, "NGINX_MIXED_SERVER_NAMES_REVIEW")
            selected.append(block)
    return selected


def collect(app=None, nginx=None, pm2_home=None, runner=run, proc_root=Path("/proc")):
    app = app or APP
    nginx = nginx or NGINX
    pm2_home = pm2_home or PM2_HOME
    require(app.resolve() == app, "APPLICATION_SYMLINK_REVIEW")
    require(runner(["git", "-C", str(app), "rev-parse", "HEAD"]).decode().strip() == SHA,
            "SOURCE_COMMIT_DIFFERS")
    require((pm2_home / "rpc.sock").is_socket(), "PM2_DAEMON_NOT_RUNNING_NO_AUTOSTART")
    pm2 = runner(["env", "PM2_HOME=" + str(pm2_home), "pm2", "jlist"])
    processes = [p for p in json.loads(pm2) if p.get("name") == APP_NAME]
    require(len(processes) == 1, "PM2_EXPECTED_ONE_PROCESS_REVIEW_TOPOLOGY")
    process = processes[0]
    settings = process["pm2_env"]
    require(settings.get("status") == "online" and process.get("pid", 0) > 0, "PM2_NOT_ONLINE")
    require(Path(settings["pm_cwd"]).resolve() == app, "PM2_APPLICATION_PATH_DIFFERS")
    raw_env, _ = read_proc(proc_root / str(process["pid"]) / "environ")
    inherited = dict(item.split(b"=", 1) for item in raw_env.split(b"\0") if b"=" in item)
    effective = {k.decode(): v.decode() for k, v in inherited.items()}
    selected_env = {k: v for k, v in effective.items() if k in RUNTIME_KEYS or
                    k.startswith(("SMTP_", "LEXRADAR_", "TELEGRAM_", "NEXT_PUBLIC_"))}
    files = {}
    meta = {}
    def add(name, data, detail):
        require(name not in files, "DUPLICATE_MEMBER")
        files[name] = data
        meta[name] = detail
        require(sum(map(len, files.values())) <= MAX_TOTAL, "BACKUP_TOO_LARGE")

    env_paths = {app / name for name in ENV_FILES if (app / name).exists()}
    # Node --env-file arguments may supplement Next's production env profiles.
    extra_args = []
    for value in [settings.get("args", []), settings.get("node_args", []), effective.get("NODE_OPTIONS", "")]:
        extra_args.extend(shlex.split(value) if isinstance(value, str) else value)
    for i, value in enumerate(extra_args):
        if value.startswith(("--env-file=", "--env-file-if-exists=")):
            candidate = app / value.split("=", 1)[1]
            if not value.startswith("--env-file-if-exists=") or candidate.exists():
                env_paths.add(candidate)
        elif value in ("--env-file", "--env-file-if-exists"):
            require(i + 1 < len(extra_args), "ENV_ARGUMENT_REVIEW")
            candidate = app / extra_args[i + 1]
            if value != "--env-file-if-exists" or candidate.exists():
                env_paths.add(candidate)
    for path in sorted(env_paths):
        resolved = path.resolve()
        require(resolved.is_relative_to(app), "EXTERNAL_ENV_FILE_REQUIRES_REVIEW")
        data, detail = read_stable(resolved)
        detail["logical_source"] = str(path)
        add("app/env/" + str(path.relative_to(app)), data, detail)

    definition = {"name": APP_NAME, "cwd": str(app), "script": settings["pm_exec_path"],
                  "env": selected_env}
    for source, target in [("args", "args"), ("node_args", "node_args"),
                           ("exec_interpreter", "interpreter"), ("exec_mode", "exec_mode"),
                           ("autorestart", "autorestart"), ("watch", "watch"),
                           ("max_memory_restart", "max_memory_restart"),
                           ("kill_timeout", "kill_timeout"), ("listen_timeout", "listen_timeout"),
                           ("restart_delay", "restart_delay"), ("exp_backoff_restart_delay", "exp_backoff_restart_delay"),
                           ("pm_out_log_path", "out_file"), ("pm_err_log_path", "error_file"),
                           ("merge_logs", "merge_logs"), ("log_date_format", "log_date_format"),
                           ("cron_restart", "cron_restart"), ("min_uptime", "min_uptime"),
                           ("max_restarts", "max_restarts"), ("wait_ready", "wait_ready"),
                           ("shutdown_with_message", "shutdown_with_message"), ("namespace", "namespace")]:
        if source in settings:
            definition[target] = settings[source]
    definition["instances"] = 1
    require(not definition.get("watch"), "PM2_WATCH_REQUIRES_REVIEW")
    add("pm2/ecosystem.app.json", encode({"apps": [definition]}),
        {"source": "live PM2 the selected app; filtered runtime environment"})

    # Capture diagnostics without printing nginx -T (which could disclose other vhosts).
    runner(["nginx", "-t"])
    candidates = sorted(set(list((nginx / "sites-enabled").glob("*")) + list((nginx / "conf.d").glob("*.conf"))))
    dependency_paths = set()
    requirements = []
    def dependencies(text, depth=0):
        require(depth < 12, "NGINX_INCLUDE_DEPTH_REVIEW")
        for group in directives(text, "include"):
            require(len(group) == 1, "NGINX_INCLUDE_REVIEW")
            pattern = Path(group[0])
            if not pattern.is_absolute():
                pattern = nginx / pattern
            matches = sorted(glob.glob(str(pattern)))
            require(matches, "NGINX_INCLUDE_MISSING")
            for filename in matches:
                path = Path(filename).resolve()
                allowed = path.is_relative_to(nginx.resolve()) or path in EXTRA_INCLUDES
                require(allowed, "NGINX_EXTERNAL_INCLUDE_REVIEW")
                if path in dependency_paths:
                    continue
                dependency_paths.add(path)
                data, detail = read_stable(path)
                snippet = data.decode()
                require(not any(a == "server" and b == "{" for a, b in zip(
                    [t[0] for t in tokens(snippet)], [t[0] for t in tokens(snippet)][1:])), "NGINX_SHARED_INCLUDE_REVIEW")
                add("nginx/includes/" + str(path).lstrip("/"), data, detail)
                dependencies(snippet, depth + 1)

    count = 0
    for path in candidates:
        if not path.is_file():
            continue
        data, detail = read_stable(path.resolve())
        blocks = site_blocks(data.decode())
        if not blocks:
            continue
        count += 1
        text = "\n\n".join(blocks) + "\n"
        detail.update({"logical_source": str(path), "restore": "merge only selected server blocks"})
        add(f"nginx/sites/site-{count}.conf", text.encode(), detail)
        dependencies(text)
        for directive in ("ssl_certificate", "ssl_certificate_key", "ssl_dhparam", "proxy_pass"):
            for group in directives(text, directive):
                requirements.append({"directive": directive, "arguments": group})
    require(count > 0, "NGINX_SITE_NOT_FOUND_REQUIRES_REVIEW")
    add("nginx/requirements.json", encode({"external_dependencies_not_copied": requirements,
        "global_config_maps_upstreams_and_TLS_material": "not copied; preserve or provision on recovery"}),
        {"source": "site directives; no TLS key/certificate content"})
    add("RESTORE.txt", RESTORE.encode(), {"source": "backup tool"})
    return pack(files, meta)


def read_proc(path):
    # procfs advertises size zero; its live environment is bounded explicitly.
    data = path.read_bytes()
    require(len(data) <= MAX_FILE, "PROCESS_ENV_TOO_LARGE")
    return data, {}


def encode(value):
    return json.dumps(value, ensure_ascii=False, indent=2).encode("utf8")


def pack(files, meta):
    manifest = {"format": 1, "app": APP_NAME, "source_commit": SHA,
                "created_utc": datetime.now(timezone.utc).isoformat(), "members": {}}
    for name, data in files.items():
        manifest["members"][name] = {**meta[name], "sha256": hashlib.sha256(data).hexdigest(), "size": len(data)}
    members = {**files, "manifest.json": encode(manifest)}
    buffer = io.BytesIO()
    with tarfile.open(fileobj=buffer, mode="w:gz") as tar:
        for name, data in members.items():
            entry = tarfile.TarInfo(name)
            entry.size = len(data)
            entry.mode = 0o600
            entry.mtime = 0
            tar.addfile(entry, io.BytesIO(data))
    return buffer.getvalue()


def inspect_archive(data):
    require(len(data) <= MAX_TOTAL, "DECRYPTED_ARCHIVE_TOO_LARGE")
    members = {}
    total = 0
    with tarfile.open(fileobj=io.BytesIO(data), mode="r:gz") as tar:
        for entry in tar:
            name = entry.name
            path = Path(name)
            require(entry.isfile() and not path.is_absolute() and ".." not in path.parts,
                    "UNSAFE_ARCHIVE_MEMBER")
            require(name not in members and entry.size <= MAX_FILE and len(members) < 256,
                    "UNSAFE_ARCHIVE_SIZE_OR_DUPLICATE")
            total += entry.size
            require(total <= MAX_TOTAL, "UNSAFE_ARCHIVE_TOTAL")
            members[name] = tar.extractfile(entry).read(MAX_FILE + 1)
    require("manifest.json" in members, "MISSING_MANIFEST")
    manifest = json.loads(members.pop("manifest.json"))
    require(manifest.get("format") == 1 and manifest.get("source_commit") == SHA and manifest.get("app") == APP_NAME,
            "MANIFEST_VERSION_OR_COMMIT_MISMATCH")
    require(set(members) == set(manifest["members"]), "MANIFEST_MEMBER_MISMATCH")
    for name, data in members.items():
        entry = manifest["members"][name]
        require(len(data) == entry["size"] and hashlib.sha256(data).hexdigest() == entry["sha256"],
                "MANIFEST_HASH_MISMATCH")
    require("RESTORE.txt" in members and "pm2/ecosystem.app.json" in members,
            "REQUIRED_MEMBER_MISSING")
    return len(members)


def crypt(data, password, decrypt=False, run_directory=None):
    run_directory = run_directory or RUN_DIRECTORY or tempfile.gettempdir()
    # Passphrase and plaintext use separate anonymous pipes, never argv/env/temp files.
    read_fd, write_fd = os.pipe()
    try:
        os.write(write_fd, password.encode("utf8") + b"\n")
        os.close(write_fd)
        write_fd = None
        with tempfile.TemporaryDirectory(prefix="gol-gpg-", dir=run_directory) as home:
            args = ["gpg", "--no-options", "--homedir", home, "--batch", "--no-tty", "--quiet",
                    "--pinentry-mode", "loopback", "--no-symkey-cache", "--passphrase-fd", str(read_fd)]
            if decrypt:
                args += ["--decrypt"]
            else:
                args += ["--symmetric", "--cipher-algo", "AES256", "--force-mdc",
                         "--s2k-mode", "3", "--s2k-digest-algo", "SHA512", "--s2k-count", "65011712",
                         "--compress-algo", "none"]
            result = subprocess.run(args, input=data, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                                    pass_fds=(read_fd,), timeout=90, check=False)
        require(result.returncode == 0, "DECRYPT_FAILED_OR_ARCHIVE_DAMAGED" if decrypt else "ENCRYPT_FAILED")
        require(len(result.stdout) <= MAX_TOTAL, "CRYPTO_OUTPUT_TOO_LARGE")
        return result.stdout
    finally:
        os.close(read_fd)
        if write_fd is not None:
            os.close(write_fd)


def password(confirm=False):
    require(sys.stdin.isatty() and sys.stderr.isatty(), "INTERACTIVE_TTY_REQUIRED")
    with warnings.catch_warnings():
        warnings.simplefilter("error", getpass.GetPassWarning)
        value = getpass.getpass("Backup password (hidden): ")
        require(20 <= len(value) <= 256 and not any(c in value for c in "\r\n\0"),
                "PASSWORD_REQUIRE_20_TO_256_CHARACTERS")
        if confirm:
            require(value == getpass.getpass("Repeat password (hidden): "), "PASSWORDS_DIFFER")
    return value


def private_directory():
    require(DEST.parent.is_dir() and not DEST.parent.is_symlink(), "BACKUP_PARENT_REVIEW")
    if not DEST.exists():
        DEST.mkdir(mode=0o700)
    info = DEST.lstat()
    require(stat.S_ISDIR(info.st_mode) and info.st_uid == os.geteuid() and
            stat.S_IMODE(info.st_mode) == 0o700, "BACKUP_DIRECTORY_MUST_BE_PRIVATE_0700")


def write_new(path, data):
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW, 0o600)
    try:
        with os.fdopen(fd, "wb") as stream:
            stream.write(data)
            stream.flush()
            os.fsync(stream.fileno())
    except BaseException:
        path.unlink(missing_ok=True)
        raise


def configure(settings):
    global SHA, APP, DEST, DOMAINS, APP_NAME, NGINX, PM2_HOME, RUN_DIRECTORY, EXTRA_INCLUDES
    SHA = settings["ExpectedCommit"]
    require(isinstance(SHA, str) and re.fullmatch(r"[a-f0-9]{40}", SHA), "INVALID_EXPECTED_COMMIT")
    APP_NAME = settings["AppName"]
    require(isinstance(APP_NAME, str) and re.fullmatch(r"[A-Za-z0-9_.-]+", APP_NAME), "INVALID_APP_NAME")
    paths = {}
    for key in ("AppDirectory", "RemoteBackupDirectory", "NginxDirectory", "Pm2Home", "RemoteWorkDirectory"):
        path = Path(settings[key])
        require(path.is_absolute() and str(path) != "/" and ".." not in path.parts, "INVALID_CONFIG_PATH")
        paths[key] = path
    APP, DEST, NGINX, PM2_HOME, RUN_DIRECTORY = (paths[key] for key in
        ("AppDirectory", "RemoteBackupDirectory", "NginxDirectory", "Pm2Home", "RemoteWorkDirectory"))
    require(isinstance(settings["Domains"], list), "DOMAINS_MUST_BE_A_LIST")
    require(not DEST.resolve().is_relative_to(APP.resolve()) and not RUN_DIRECTORY.resolve().is_relative_to(APP.resolve()), "BACKUP_AND_WORK_DIRECTORY_MUST_BE_OUTSIDE_APP")
    DOMAINS = set(settings["Domains"])
    require(DOMAINS and all(isinstance(d, str) and re.fullmatch(r"[a-z0-9.-]+", d) for d in DOMAINS), "INVALID_DOMAINS")
    EXTRA_INCLUDES = {Path(p).resolve() for p in settings.get("AdditionalNginxIncludes", [])}


def main():
    resource.setrlimit(resource.RLIMIT_CORE, (0, 0))
    os.umask(0o077)
    require(os.geteuid() == 0, "ROOT_REQUIRED")
    require(len(sys.argv) == 4 and sys.argv[1] in ("prepare", "create", "verify", "cleanup"), "INVALID_ARGUMENTS")
    action, name, config_path = sys.argv[1:]
    configure(json.loads(Path(config_path).read_text()))
    require(NAME.fullmatch(name), "INVALID_BACKUP_NAME")
    require(shutil.which("gpg"), "GPG_REQUIRED_NO_PACKAGES_INSTALLED")
    private_directory()
    if action == "prepare":
        print("PRIVATE_BACKUP_DIRECTORY_READY")
        return
    lock = os.open(DEST, os.O_RDONLY)
    try:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        path = DEST / name
        sidecar = DEST / (name + ".sha256")
        if action == "cleanup":
            # Only caller-supplied randomized ciphertext names; never configuration.
            for target in (path, sidecar):
                if target.exists() or target.is_symlink():
                    require(not target.is_symlink() and target.is_file(), "UNSAFE_BACKUP_PATH")
                    target.unlink()
            print("ENCRYPTED_REMOTE_COPY_REMOVED")
            return
        if action == "create":
            require(not path.exists() and not sidecar.exists(), "BACKUP_ALREADY_EXISTS")
            archive = collect()
            count = inspect_archive(archive)
            phrase = password(confirm=True)
            encrypted = crypt(archive, phrase)
            recovered = crypt(encrypted, phrase, decrypt=True)
            require(recovered == archive, "ROUNDTRIP_MISMATCH")
            inspect_archive(recovered)
            phrase = None
            write_new(path, encrypted)
            digest = hashlib.sha256(encrypted).hexdigest()
            write_new(sidecar, (digest + "  " + name + "\n").encode())
            print(f"BACKUP_CREATED_AND_DECRYPTION_TEST_PASSED FILES={count}")
        else:
            require(not path.is_symlink(), "UNSAFE_BACKUP_PATH")
            encrypted, _ = read_stable_larger(path)
            phrase = password()
            count = inspect_archive(crypt(encrypted, phrase, decrypt=True))
            phrase = None
            print(f"DECRYPTION_AND_MANIFEST_OK FILES={count}")
    finally:
        os.close(lock)


def read_stable_larger(path):
    require(path.is_file() and path.stat().st_size <= MAX_TOTAL, "CIPHERTEXT_SIZE_REVIEW")
    return path.read_bytes(), {}


if __name__ == "__main__":
    try:
        main()
    except BackupError as error:
        print("BACKUP_STOPPED_" + str(error), file=sys.stderr)
        sys.exit(1)
    except (KeyboardInterrupt, EOFError):
        print("BACKUP_CANCELLED", file=sys.stderr)
        sys.exit(1)
    except Exception:
        # No raw exceptions, captured command output, environment values or passwords.
        print("BACKUP_FAILED_NO_SECRET_DETAILS", file=sys.stderr)
        sys.exit(1)
