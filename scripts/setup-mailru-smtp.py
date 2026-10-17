#!/usr/bin/env python3
"""Interactive production operation; never run by deployment or CI automatically."""
import fcntl
import getpass
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import tempfile
import warnings

FILES = (".env.production.local", ".env.local", ".env.production", ".env")
MANAGED = frozenset((
    "SMTP_HOST", "SMTP_PORT", "SMTP_SECURE", "SMTP_USER", "SMTP_PASS",
    "SMTP_PASSWORD", "SMTP_FROM", "SMTP_AUTH_METHOD", "MAIL_TO", "LEAD_TO_EMAIL",
    "YANDEX_EMAIL", "YANDEX_PASSWORD", "LEXRADAR_FORM_ENABLED",
))
VALUES = (
    "SMTP_HOST=smtp.mail.ru", "SMTP_PORT=465", "SMTP_SECURE=true",
    "SMTP_AUTH_METHOD=LOGIN", "SMTP_USER=golwebstudio@bk.ru",
    "SMTP_FROM=golwebstudio@bk.ru", "MAIL_TO=golwebstudio@bk.ru",
    "LEXRADAR_FORM_ENABLED=false",
)
HEADER = re.compile(r"^[ \t]*(?:export[ \t]+)?([\w.-]+)[ \t]*(?:=|:[ \t]+)[ \t]*", re.M)


def strip_keys(text, keys=MANAGED):
    """Remove entire managed assignments, respecting OTHER multiline values."""
    result = []
    cursor = 0
    while cursor < len(text):
        end = text.find("\n", cursor)
        end = len(text) if end < 0 else end + 1
        match = HEADER.match(text, cursor)
        if not match:
            result.append(text[cursor:end])
            cursor = end
            continue
        start = match.end()
        if start < len(text) and text[start] in "'\"" + chr(96):
            quote = text[start]
            pattern = re.escape(quote) + r"(?:\\" + re.escape(quote) + "|[^" + re.escape(quote) + "])*" + re.escape(quote)
            quoted = re.match(pattern, text[start:])
            if not quoted:
                raise ValueError("ENV_FORMAT_REVIEW")
            close = start + quoted.end()
            end = text.find("\n", close)
            end = len(text) if end < 0 else end + 1
            if text[close:end].strip() and not text[close:end].lstrip().startswith("#"):
                raise ValueError("ENV_FORMAT_REVIEW")
        if match[1] not in keys:
            result.append(text[cursor:end])
        cursor = end
    return "".join(result)


def encode_password(password):
    if not password.strip() or any(ch in password for ch in "\0\r\n"):
        raise ValueError("PASSWORD_FORMAT_REVIEW")
    escaped = password.replace("$", "\\$")
    for quote in ("'", '"', chr(96)):
        if quote not in password and not (quote == '"' and ("\\n" in password or "\\r" in password)):
            return quote + escaped + quote
    raise ValueError("PASSWORD_ENCODING_REVIEW")


def validate_encoding(root, password, encoded):
    # Secret travels only through a local subprocess pipe, never argv/logs.
    program = r"""
try {
  const fs = require('node:fs');
  const data = JSON.parse(fs.readFileSync(0, 'utf8'));
  const { processEnv } = require('@next/env');
  const [env] = processEnv([{path:'.env.local',contents:'SMTP_PASS='+data.encoded+'\n',env:{}}],
    process.cwd(), {info(){},error(){throw Error();}}, true);
  process.stdout.write(env.SMTP_PASS === data.password ? 'ENCODING_OK' : 'ENCODING_FAILED');
} catch { process.stdout.write('ENCODING_FAILED'); process.exitCode=1; }
"""
    clean = {key: value for key, value in os.environ.items() if key not in MANAGED}
    clean["NODE_ENV"] = "production"
    result = subprocess.run(
        ["node", "-e", program], cwd=root, env=clean,
        input=json.dumps({"password": password, "encoded": encoded}),
        text=True, capture_output=True, timeout=15, check=False,
    )
    if result.returncode or result.stdout != "ENCODING_OK":
        raise ValueError("PASSWORD_ENCODING_FAILED")


def snapshot(root):
    result = {}
    for name in FILES:
        path = root / name
        if path.is_symlink():
            raise ValueError("ENV_SYMLINK_REQUIRES_MANUAL_REVIEW")
        if path.exists():
            stat = path.stat()
            if not path.is_file() or stat.st_uid != os.geteuid() or stat.st_nlink != 1:
                raise ValueError("ENV_OWNERSHIP_REVIEW")
            result[name] = (path.read_bytes(), stat.st_mode & 0o777)
        else:
            result[name] = (None, None)
    return result


def atomic_file(path, data, mode=0o600):
    temporary = None
    try:
        fd, temporary = tempfile.mkstemp(prefix=".smtp-setup-", dir=path.parent)
        with os.fdopen(fd, "wb") as stream:
            os.fchmod(stream.fileno(), mode)
            stream.write(data)
            stream.flush()
            os.fsync(stream.fileno())
        os.replace(temporary, path)
        temporary = None
    finally:
        if temporary is not None:
            os.unlink(temporary)


def apply_plan(root, before, plan):
    if snapshot(root) != before:
        raise ValueError("ENV_CHANGED_DURING_SETUP")
    written = []
    try:
        for name, data in plan.items():
            if data == before[name][0]:
                continue
            atomic_file(root / name, data)
            written.append(name)
    except BaseException:
        # Roll back only our own writes. Never overwrite a concurrent operator edit.
        for name in reversed(written):
            path = root / name
            if path.read_bytes() != plan[name]:
                raise ValueError("CONCURRENT_EDIT_ROLLBACK_REQUIRES_REVIEW") from None
            data, mode = before[name]
            if data is None:
                path.unlink()
            else:
                atomic_file(path, data, mode)
        raise


def configure(root, password):
    before = snapshot(root)
    encoded = encode_password(password)
    validate_encoding(root, password, encoded)
    plan = {}
    for name, (data, _) in before.items():
        if data is not None or name == ".env.local":
            text = strip_keys((data or b"").decode("utf8"))
            if name == ".env.local":
                text += ("" if not text or text.endswith("\n") else "\n")
                text += "\n".join(VALUES) + "\nSMTP_PASS=" + encoded + "\n"
            plan[name] = text.encode("utf8")
    apply_plan(root, before, plan)
    return snapshot(root)


def enable(root, expected, *, accepted, received, ready):
    if not (accepted and received and ready):
        return False
    text = expected[".env.local"][0].decode("utf8")
    text = strip_keys(text, {"LEXRADAR_FORM_ENABLED"})
    text += ("" if text.endswith("\n") else "\n") + "LEXRADAR_FORM_ENABLED=true\n"
    apply_plan(root, expected, {".env.local": text.encode("utf8")})
    return True


def main():
    root = Path.cwd()
    if not all((root / name).is_file() for name in (
        "package.json", "scripts/diagnose-smtp.ts", "lib/lexradar-config.ts",
    )):
        print("APPLICATION_DIRECTORY_REQUIRED_NO_CHANGES")
        return 1
    if not sys.stdin.isatty() or not sys.stderr.isatty():
        print("INTERACTIVE_TTY_REQUIRED_NO_CHANGES")
        return 1
    inherited = sorted(key for key in MANAGED if key in os.environ)
    if inherited or os.environ.get("__NEXT_PROCESSED_ENV") or os.environ.get("NODE_ENV") == "test":
        print("ENVIRONMENT_OVERRIDES_REQUIRE_REVIEW_NO_CHANGES")
        print(" ".join(inherited))  # Fixed variable names only, no values.
        return 1
    if (root / ".git").exists():
        tracked = subprocess.run(
            ["git", "ls-files", "--", ".env.local"], cwd=root,
            capture_output=True, text=True, timeout=10, check=False,
        )
        if tracked.returncode or tracked.stdout.strip():
            print("GIT_ENV_TRACKING_REQUIRES_REVIEW_NO_CHANGES")
            return 1
    # Directory flock coordinates concurrent instances without a persistent lock file.
    lock = os.open(root, os.O_RDONLY)
    try:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        snapshot(root)
        print("Будут заменены только SMTP/старые YANDEX/mail aliases и флаг формы в:")
        print(", ".join(FILES))
        print("Прочие настройки сохраняются. PM2/Nginx не меняются и не перезапускаются.")
        if input("Для настройки введите НАСТРОИТЬ: ").strip() != "НАСТРОИТЬ":
            print("SETUP_CANCELLED_NO_CHANGES")
            return 1
        with warnings.catch_warnings():
            warnings.simplefilter("error", getpass.GetPassWarning)
            password = getpass.getpass("Пароль приложения Mail.ru (ввод скрыт): ", stream=sys.stderr)
        expected = configure(root, password)
        del password
        print("SMTP_CONFIGURED_FORM_DISABLED")
        diagnostic = subprocess.run(
            ["node", "--import", "tsx", "scripts/diagnose-smtp.ts", "--production-test"],
            cwd=root, check=False,
        )
        if diagnostic.returncode:
            print("SMTP_TEST_FAILED_FORM_LEFT_DISABLED")
            return 1
        print("SMTP принял письмо. Найдите письмо с Test ID в golwebstudio@bk.ru, включая спам.")
        received = input("Чтобы подтвердить реальное получение и разрешить включение формы, введите ПОЛУЧЕНО (Enter — оставить выключенной): ").strip() == "ПОЛУЧЕНО"
        if not received:
            print("FORM_LEFT_DISABLED")
            return 0
        program = """
const {loadEnvConfig}=require('@next/env'); let failed=false;
loadEnvConfig(process.cwd(),false,{info(){},error(){failed=true;}});
const {getLexradarConfig}=require('./lib/lexradar-config.ts');
process.stdout.write(!failed && getLexradarConfig().ready ? 'FORM_READY' : 'FORM_NOT_READY');
"""
        check = subprocess.run(
            ["node", "-r", "tsx/cjs", "-e", program], cwd=root,
            capture_output=True, text=True, timeout=15, check=False,
        )
        ready = check.returncode == 0 and check.stdout == "FORM_READY"
        if not ready:
            print("FORM_NOT_READY_CHECK_ORIGIN_AND_ABUSE_CONFIG_FORM_LEFT_DISABLED")
            return 1
        if enable(root, expected, accepted=True, received=received, ready=ready):
            print("FORM_FLAG_ENABLED_RESTART_REQUIRES_AUTHORIZED_OPERATOR")
        return 0
    finally:
        os.close(lock)


if __name__ == "__main__":
    try:
        sys.exit(main())
    except (KeyboardInterrupt, EOFError):
        print("SETUP_CANCELLED_CHECK_FORM_REMAINS_DISABLED")
        sys.exit(1)
    except Exception as error:
        # Never print exceptions/locals, which could contain the password.
        safe_codes = {
            "ENV_FORMAT_REVIEW", "PASSWORD_FORMAT_REVIEW", "PASSWORD_ENCODING_REVIEW",
            "PASSWORD_ENCODING_FAILED", "ENV_SYMLINK_REQUIRES_MANUAL_REVIEW",
            "ENV_OWNERSHIP_REVIEW", "ENV_CHANGED_DURING_SETUP",
            "CONCURRENT_EDIT_ROLLBACK_REQUIRES_REVIEW",
        }
        code = str(error) if isinstance(error, ValueError) and str(error) in safe_codes else "SETUP_FAILED"
        print(code + "_NO_SECRET_DETAILS_CHECK_FORM_DISABLED")
        sys.exit(1)
