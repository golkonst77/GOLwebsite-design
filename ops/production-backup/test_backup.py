import contextlib
import hashlib
import importlib.util
import io
import json
import os
from pathlib import Path
import socket
import subprocess
import tarfile
import tempfile
import unittest
from unittest.mock import patch

import gol_config_backup as backup


def unpack(data):
    with tarfile.open(fileobj=io.BytesIO(data), mode="r:gz") as tar:
        return {entry.name: tar.extractfile(entry).read() for entry in tar}


class BackupTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="gol-backup-fixture-")
        self.root = Path(self.temp.name)
        self.app = self.root / "application"
        self.nginx = self.root / "proxy"
        self.pm2 = self.root / "process-manager"
        self.proc = self.root / "proc/42"
        for directory in (self.app, self.nginx / "sites-enabled", self.nginx / "snippets", self.pm2, self.proc):
            directory.mkdir(parents=True, exist_ok=True)
        self.sock = socket.socket(socket.AF_UNIX)
        self.sock.bind(str(self.pm2 / "rpc.sock"))
        for name in backup.ENV_FILES:
            (self.app / name).write_text("SMTP_PASS=synthetic-mail-secret\nTELEGRAM_BOT_TOKEN=synthetic-token\n")
        (self.app / ".env.development").write_text("EXCLUDED_DEVELOPMENT=never-copy\n")
        (self.app / "user-data.txt").write_text("EXCLUDED_USER_DATA")
        (self.app / "scripts").mkdir()
        (self.app / "scripts/test-yandex-smtp.mjs").write_text("EXCLUDED_LEGACY_SCRIPT")
        (self.proc / "environ").write_bytes(b"PATH=/fixture/runtime/bin:/usr/bin\0NODE_ENV=production\0SMTP_PASS=synthetic-runtime-secret\0TELEGRAM_CHAT_ID=12345\0UNRELATED_SECRET=EXCLUDED_INHERITED_SECRET\0")
        self.snippet = self.nginx / "snippets/gol-proxy.conf"
        self.snippet.write_text('proxy_set_header X-Real-IP $remote_addr;\n')
        self.vhost = self.nginx / "sites-enabled/sample-app"
        self.vhost.write_text('''# Fixture only; braces in comments { }
server { listen 80; server_name unrelated.invalid; root /srv/EXCLUDED_OTHER_SITE; }
server {
  listen 443 ssl; server_name site.example.invalid www.site.example.invalid;
  include snippets/gol-proxy.conf;
  ssl_certificate /fixture/tls/fullchain.pem;
  ssl_certificate_key /fixture/tls/privkey.pem;
  location / { proxy_pass http://127.0.0.1:3000; proxy_set_header Connection "upgrade"; }
  add_header X-Quoted "text { # }";
}
''')
        self.settings = {"status": "online", "pm_cwd": str(self.app),
                         "pm_exec_path": "/fixture/runtime/bin/npm", "args": ["start"],
                         "exec_interpreter": "/fixture/runtime/bin/node",
                         "exec_mode": "fork_mode", "watch": False, "autorestart": True}
        self.calls = []
        backup.configure({"ExpectedCommit": "a" * 40, "AppName": "sample-app",
            "AppDirectory": str(self.app), "RemoteBackupDirectory": str(self.root / "ciphertexts"),
            "NginxDirectory": str(self.nginx), "Pm2Home": str(self.pm2),
            "RemoteWorkDirectory": str(self.root), "Domains": ["site.example.invalid", "www.site.example.invalid"]})

    def tearDown(self):
        self.sock.close()
        self.temp.cleanup()

    def runner(self, args):
        self.calls.append(args)
        if args[:1] == ["git"]:
            return backup.SHA.encode() + b"\n"
        if args == ["env", "PM2_HOME=" + str(self.pm2), "pm2", "jlist"]:
            return backup.encode([
                {"name": "sample-app", "pid": 42, "pm2_env": self.settings},
                {"name": "other-project", "pm2_env": {"env": {"SECRET": "EXCLUDED_OTHER_PM2"}}}])
        if args == ["nginx", "-t"]:
            return b""
        raise AssertionError("Unexpected command")

    def collect(self):
        return backup.collect(self.app, self.nginx, self.pm2, self.runner, self.root / "proc")

    def snapshot(self):
        return {str(p): (p.read_bytes(), p.stat().st_mode, p.stat().st_mtime_ns)
                for p in self.root.rglob("*") if p.is_file()}

    def test_collects_only_site_settings_and_never_mutates_sources(self):
        before = self.snapshot()
        archive = self.collect()
        self.assertEqual(before, self.snapshot())
        self.assertGreater(backup.inspect_archive(archive), 0)
        files = unpack(archive)
        self.assertEqual(len([p for p in files if p.startswith("app/env/")]), 4)
        merged = b"\n".join(files.values())
        for excluded in (b"EXCLUDED_USER_DATA", b"EXCLUDED_OTHER_SITE", b"EXCLUDED_OTHER_PM2", b"EXCLUDED_INHERITED_SECRET", b"EXCLUDED_LEGACY_SCRIPT", b"EXCLUDED_DEVELOPMENT"):
            self.assertNotIn(excluded, merged)
        process = json.loads(files["pm2/ecosystem.app.json"])["apps"][0]
        self.assertEqual(process["name"], "sample-app")
        self.assertEqual(process["env"]["SMTP_PASS"], "synthetic-runtime-secret")
        self.assertNotIn("UNRELATED_SECRET", process["env"])
        self.assertIn("/fixture/runtime/bin", process["env"]["PATH"])
        self.assertIn(str(self.snippet).lstrip("/"), "\n".join(files))
        self.assertFalse(any("privkey.pem" in name for name in files))
        self.assertEqual([args[:2] for args in self.calls], [["git", "-C"], ["env", "PM2_HOME=" + str(self.pm2)], ["nginx", "-t"]])

    def test_actual_aes_encryption_decryption_wrong_password_and_tamper(self):
        archive = self.collect()
        password = "synthetic fixture passphrase 12345"
        encrypted = backup.crypt(archive, password, run_directory=self.root)
        self.assertNotIn(b"synthetic-mail-secret", encrypted)
        self.assertNotIn(b"synthetic-runtime-secret", encrypted)
        self.assertNotEqual(encrypted, archive)
        recovered = backup.crypt(encrypted, password, True, self.root)
        self.assertEqual(recovered, archive)
        backup.inspect_archive(recovered)
        for payload, phrase in [(encrypted, "wrong passphrase for the test only"),
                                (encrypted[:-12], password),
                                (encrypted[:100] + bytes([encrypted[100] ^ 1]) + encrypted[101:], password)]:
            with self.assertRaises(backup.BackupError):
                backup.crypt(payload, phrase, True, self.root)
        # The helper's ephemeral GPG home contained no secret backup files and was removed.
        self.assertFalse(list(self.root.glob("gol-gpg-*")))

    def test_manifest_detects_changed_missing_extra_and_duplicate_members(self):
        original = unpack(self.collect())
        for variant in ("changed", "missing", "extra", "duplicate", "traversal", "symlink"):
            members = dict(original)
            if variant == "changed":
                members["app/env/.env.local"] = b"changed"
            elif variant == "missing":
                members.pop("app/env/.env.local")
            elif variant == "extra":
                members["unlisted"] = b"extra"
            elif variant == "traversal":
                members["../escape"] = b"invalid"
            output = io.BytesIO()
            with tarfile.open(fileobj=output, mode="w:gz") as tar:
                for name, value in members.items():
                    entry = tarfile.TarInfo(name)
                    entry.size = len(value)
                    tar.addfile(entry, io.BytesIO(value))
                if variant == "duplicate":
                    entry = tarfile.TarInfo("manifest.json")
                    entry.size = 2
                    tar.addfile(entry, io.BytesIO(b"{}"))
                if variant == "symlink":
                    entry = tarfile.TarInfo("link")
                    entry.type = tarfile.SYMTYPE
                    entry.linkname = "/etc/passwd"
                    tar.addfile(entry)
            with self.assertRaises(backup.BackupError):
                backup.inspect_archive(output.getvalue())

    def test_pm2_daemon_check_does_not_start_pm2(self):
        self.sock.close()
        (self.pm2 / "rpc.sock").unlink()
        with self.assertRaisesRegex(backup.BackupError, "NO_AUTOSTART"):
            self.collect()
        self.assertFalse(any("pm2" in args for args in self.calls))

    def test_shared_server_names_abort_instead_of_copying_other_projects(self):
        self.vhost.write_text("server { server_name site.example.invalid unrelated.invalid; }")
        with self.assertRaisesRegex(backup.BackupError, "MIXED_SERVER_NAMES"):
            self.collect()

    def test_missing_site_and_external_include_abort(self):
        for text, code in [("server { server_name unrelated.invalid; }", "SITE_NOT_FOUND"),
            ("server { server_name site.example.invalid; include /some/unknown/secret.conf; }", "INCLUDE_MISSING")]:
            self.vhost.write_text(text)
            with self.assertRaisesRegex(backup.BackupError, code):
                self.collect()

    def test_external_env_symlink_aborts(self):
        outside = self.root / "unrelated.env"
        outside.write_text("do-not-copy")
        (self.app / ".env.local").unlink()
        (self.app / ".env.local").symlink_to(outside)
        with self.assertRaisesRegex(backup.BackupError, "EXTERNAL_ENV"):
            self.collect()

    def test_explicit_node_env_file_and_optional_missing_file(self):
        (self.app / "runtime.env").write_text("SMTP_PASS=synthetic-extra")
        self.settings["node_args"] = ["--env-file=runtime.env", "--env-file-if-exists=absent.env"]
        files = unpack(self.collect())
        self.assertIn("app/env/runtime.env", files)
        self.assertNotIn("app/env/absent.env", files)

    def test_safe_write_exclusive_and_private(self):
        path = self.root / "cipher.gpg"
        backup.write_new(path, b"synthetic ciphertext")
        self.assertEqual(path.stat().st_mode & 0o777, 0o600)
        with self.assertRaises(FileExistsError):
            backup.write_new(path, b"replacement")
        self.assertEqual(path.read_bytes(), b"synthetic ciphertext")

    def test_oversized_config_file_fails(self):
        (self.app / ".env.local").write_bytes(b"x" * 4097)
        with patch.object(backup, "MAX_FILE", 4096):
            with self.assertRaisesRegex(backup.BackupError, "UNSAFE_CONFIG_FILE"):
                self.collect()

    def test_public_script_embeds_exact_helper_and_contains_no_fixture_values(self):
        root = Path(__file__).parent
        subprocess.run(["python3", str(root / "build.py")], check=True)
        import base64
        import re
        source = (root / "SiteConfig-Backup.ps1").read_text()
        match = re.search(r"FromBase64String\('([A-Za-z0-9+/=]+)'\)", source)
        self.assertIsNotNone(match)
        self.assertEqual(base64.b64decode(match[1]), (root / "gol_config_backup.py").read_bytes())
        for secret in ["synthetic-mail-secret", "synthetic-runtime-secret", "synthetic-token"]:
            self.assertNotIn(secret, source)
        self.assertNotIn("StrictHostKeyChecking=no", source)
        self.assertNotIn("pm2 restart", source)

    def test_import_has_no_default_production_binding_or_side_effects(self):
        path = Path(__file__).with_name("gol_config_backup.py")
        spec = importlib.util.spec_from_file_location("isolated_backup", path)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        for key in ("APP", "SHA", "DEST", "APP_NAME", "NGINX", "PM2_HOME", "RUN_DIRECTORY"):
            self.assertIsNone(getattr(module, key))
        self.assertEqual(module.DOMAINS, set())

    def test_owned_domain_with_exact_ssh_ip_and_neutral_markers_is_selected(self):
        backup.TARGET_IP = backup.ipaddress.ip_address("192.0.2.10")
        text = '''server { server_name site.example.invalid www.site.example.invalid 192.0.2.10 _ ""; }
server { server_name _; root /fixture/EXCLUDED_DEFAULT; }
server { server_name unrelated.invalid; root /fixture/EXCLUDED_OTHER; }
server { server_name 192.0.2.10; root /fixture/EXCLUDED_IP_ONLY; }
'''
        blocks = backup.site_blocks(text)
        self.assertEqual(len(blocks), 1)
        self.assertNotIn("EXCLUDED_", blocks[0])
        self.assertEqual(backup.server_records(text)[0]["roles"],
            ["OWNED_DOMAIN", "OWNED_DOMAIN", "OWNED_SSH_TARGET_IP", "NEUTRAL_NAME_MARKER", "NEUTRAL_NAME_MARKER"])

    def test_unproven_ip_domain_regex_and_wildcard_still_stop_selection(self):
        backup.TARGET_IP = backup.ipaddress.ip_address("192.0.2.10")
        for foreign in ["192.0.2.11", "other.example.invalid", "*.site.example.invalid", "$hostname", "~^.*$"]:
            with self.assertRaisesRegex(backup.BackupError, "MIXED_SERVER_NAMES"):
                backup.site_blocks("server { server_name site.example.invalid " + foreign + "; }")

    def test_only_real_server_context_directives_define_ownership(self):
        # Old parser incorrectly treated the header argument server_name as a directive.
        text = '''server {
 server_name SITE.EXAMPLE.INVALID. www.site.example.invalid.;
 proxy_set_header server_name $host;
 add_header X-Note "server_name foreign.invalid;";
 location / { proxy_set_header server_name PRIVATE_HEADER_VALUE; }
}'''
        self.assertEqual(len(backup.site_blocks(text)), 1)
        self.assertEqual(backup.directives(text, "server_name", at_depth=1),
            [["SITE.EXAMPLE.INVALID.", "www.site.example.invalid."]])
        self.assertFalse(backup.site_blocks('server { server_name other.invalid; location / { add_header server_name site.example.invalid; } }'))

    def test_diagnosis_is_read_only_filters_output_and_reports_mixed_block(self):
        self.vhost.write_text('''# PRIVATE_COMMENT
server { server_name site.example.invalid _; set $api_key "PRIVATE_TOKEN_VALUE"; }
server { server_name other.example.invalid; set $secret "PRIVATE_OTHER_VALUE"; }
server { server_name site.example.invalid other.example.invalid; }
''')
        before = self.snapshot()
        output = io.StringIO()
        with contextlib.redirect_stdout(output):
            self.assertFalse(backup.diagnose_nginx(self.nginx))
        text = output.getvalue()
        self.assertIn('"selection": "ELIGIBLE"', text)
        self.assertIn('"selection": "REVIEW_REQUIRED"', text)
        self.assertIn('"name": "other.example.invalid", "role": "UNPROVEN_NAME"', text)
        self.assertNotIn("PRIVATE_", text)
        self.assertNotIn(str(self.root), text)
        self.assertEqual(text.count("NGINX_SITE_BLOCK "), 2)
        self.assertEqual(before, self.snapshot())
        self.assertEqual(self.calls, [])

    def test_duplicate_vhost_symlink_is_not_backed_up_twice(self):
        (self.nginx / "sites-enabled/alias").symlink_to(self.vhost)
        files = unpack(self.collect())
        self.assertEqual(len([name for name in files if name.startswith("nginx/sites/")]), 1)


if __name__ == "__main__":
    unittest.main(verbosity=2)
