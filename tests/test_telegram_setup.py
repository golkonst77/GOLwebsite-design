"""Synthetic temporary files only. Never contact Telegram/SMTP or run setup main."""
import contextlib
import importlib.util
import io
import itertools
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

REPO = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("telegram_setup", REPO / "scripts/setup-telegram.py")
setup = importlib.util.module_from_spec(spec)
spec.loader.exec_module(setup)
TOKEN = "123456789:" + "x" * 35
CHAT = "9876543210"


class TelegramSetupTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="telegram-fixture-")
        self.root = Path(self.temp.name)
        (self.root / "node_modules").symlink_to(REPO / "node_modules", target_is_directory=True)
        clean = {k: v for k, v in os.environ.items() if k not in setup.KEYS and k != "__NEXT_PROCESSED_ENV"}
        self.env = patch.dict(os.environ, clean, clear=True)
        self.env.start()

    def tearDown(self):
        self.env.stop()
        self.temp.cleanup()

    def configure(self):
        return setup.configure(self.root, TOKEN, CHAT)

    def test_preserves_all_smtp_lexradar_and_multiline_bytes(self):
        other = 'SMTP_HOST=smtp.mail.ru\r\nSMTP_PASS="synthetic-only"\r\nLEXRADAR_FORM_ENABLED=true\r\nTEXT="first\nTELEGRAM_BOT_TOKEN=inside-other-value\nlast"\n# keep\n'
        for name in setup.FILES:
            (self.root / name).write_bytes(other.encode())
        self.configure()
        for name in setup.FILES:
            data = (self.root / name).read_bytes()
            if name == ".env.local":
                self.assertTrue(data.startswith(other.encode()))
                self.assertIn(b"TELEGRAM_NOTIFICATIONS_ENABLED=false\n", data)
                self.assertEqual((self.root / name).stat().st_mode & 0o777, 0o600)
            else:
                self.assertEqual(data, other.encode())
        self.assertFalse(list(self.root.glob("*.bak")))
        self.assertFalse(list(self.root.glob(".smtp-setup-*")))

    def test_roundtrip_uses_real_next_loader_without_output(self):
        output = io.StringIO()
        with contextlib.redirect_stdout(output), contextlib.redirect_stderr(output):
            setup.validate_encoding(self.root, TOKEN, CHAT, setup._helpers.encode_password(TOKEN), setup._helpers.encode_password(CHAT))
        self.assertEqual(output.getvalue(), "")

    def test_configured_by_syntax_alone_stays_disabled(self):
        state = self.configure()
        self.assertIn(b"TELEGRAM_NOTIFICATIONS_ENABLED=false", state[".env.local"][0])

    def test_enable_requires_both_api_acceptance_and_owner_receipt(self):
        for accepted, received in itertools.product([False, True], repeat=2):
            state = self.configure()
            self.assertEqual(setup.enable(self.root, state, accepted=accepted, received=received), accepted and received)
            text = (self.root / ".env.local").read_text()
            self.assertIn("TELEGRAM_NOTIFICATIONS_ENABLED=" + ("true" if accepted and received else "false"), text)

    def test_reconfiguration_has_no_duplicates_and_keeps_other_lines(self):
        self.configure()
        with (self.root / ".env.local").open("a") as f:
            f.write("OTHER=keep\n")
        self.configure()
        text = (self.root / ".env.local").read_text()
        self.assertIn("OTHER=keep\n", text)
        for key in setup.KEYS:
            self.assertEqual(text.count(key + "="), 1)

    def test_duplicate_same_file_aborts_without_writing(self):
        path = self.root / ".env.local"
        text = "TELEGRAM_CHAT_ID=123\nTELEGRAM_CHAT_ID=456\nSMTP_HOST=keep\n"
        path.write_text(text)
        with self.assertRaisesRegex(ValueError, "DUPLICATE_OR_SHADOWED"):
            self.configure()
        self.assertEqual(path.read_text(), text)

    def test_shadowed_key_across_sources_aborts(self):
        for name in [".env.local", ".env.production.local"]:
            (self.root / name).write_text("TELEGRAM_NOTIFICATIONS_ENABLED=false\n")
        before = setup._helpers.snapshot(self.root)
        with self.assertRaisesRegex(ValueError, "DUPLICATE_OR_SHADOWED"):
            self.configure()
        self.assertEqual(setup._helpers.snapshot(self.root), before)

    def test_inherited_telegram_even_empty_aborts_without_values(self):
        with patch.dict(os.environ, {"TELEGRAM_BOT_TOKEN": TOKEN}):
            with self.assertRaisesRegex(ValueError, "PROCESS_OVERRIDES") as error:
                self.configure()
        self.assertNotIn(TOKEN, str(error.exception))
        self.assertFalse((self.root / ".env.local").exists())

    def test_malformed_multiline_aborts_without_changes(self):
        text = 'OTHER="unfinished\nTELEGRAM_CHAT_ID=must-not-edit\n'
        (self.root / ".env.local").write_text(text)
        with self.assertRaisesRegex(ValueError, "ENV_FORMAT_REVIEW"):
            self.configure()
        self.assertEqual((self.root / ".env.local").read_text(), text)

    def test_symlink_aborts_without_touching_target(self):
        target = self.root / "target"
        target.write_text("OTHER=keep\n")
        (self.root / ".env.local").symlink_to(target)
        with self.assertRaisesRegex(ValueError, "SYMLINK"):
            self.configure()
        self.assertEqual(target.read_text(), "OTHER=keep\n")

    def test_invalid_token_or_chat_id_never_writes(self):
        for token, chat in [("bad", CHAT), (TOKEN, "@user"), (TOKEN + "\n", CHAT), (TOKEN, "1\n")]:
            with self.assertRaisesRegex(ValueError, "FORMAT_REVIEW"):
                setup.configure(self.root, token, chat)
        self.assertFalse((self.root / ".env.local").exists())

    def test_concurrent_operator_edit_prevents_enable(self):
        state = self.configure()
        path = self.root / ".env.local"
        path.write_text("OPERATOR_EDIT=keep\n")
        with self.assertRaisesRegex(ValueError, "ENV_CHANGED"):
            setup.enable(self.root, state, accepted=True, received=True)
        self.assertEqual(path.read_text(), "OPERATOR_EDIT=keep\n")

    def test_atomic_partial_failure_rolls_back_other_files(self):
        (self.root / ".env.production.local").write_text("TELEGRAM_NOTIFICATIONS_ENABLED=false\nSMTP_HOST=keep\n")
        (self.root / ".env.local").write_text("LEXRADAR_FORM_ENABLED=true\n")
        before = setup._helpers.snapshot(self.root)
        real = setup._helpers.atomic_file
        calls = 0
        def fail_second(*args, **kwargs):
            nonlocal calls
            calls += 1
            if calls == 2:
                raise OSError("synthetic write failure")
            return real(*args, **kwargs)
        with patch.object(setup._helpers, "atomic_file", side_effect=fail_second):
            with self.assertRaises(OSError):
                self.configure()
        self.assertEqual(setup._helpers.snapshot(self.root), before)

    def test_inspect_cli_has_no_network_and_rejects_token_arguments(self):
        (self.root / "lib").mkdir()
        (self.root / "scripts").mkdir()
        for name in ["package.json", "lib/telegram-notifications.ts", "scripts/telegram-notifications.ts"]:
            (self.root / name).touch()
        (self.root / "package.json").write_text("{}\n")
        self.configure()
        command = [sys.executable, "-B", str(REPO / "scripts/setup-telegram.py")]
        result = subprocess.run(command + ["--inspect"], cwd=self.root, text=True, capture_output=True, timeout=10)
        self.assertEqual(result.returncode, 0)
        self.assertIn("NO_NETWORK_NO_CHANGES", result.stdout)
        self.assertNotIn(TOKEN, result.stdout + result.stderr)
        self.assertNotIn(CHAT, result.stdout + result.stderr)
        result = subprocess.run(command + [TOKEN], cwd=self.root, text=True, capture_output=True, timeout=10)
        self.assertEqual(result.returncode, 1)
        self.assertNotIn(TOKEN, result.stdout + result.stderr)

    def test_interactive_main_requires_explicit_test_and_receipt_without_secret_argv(self):
        (self.root / "lib").mkdir()
        (self.root / "scripts").mkdir()
        (self.root / "package.json").write_text("{}\n")
        for name in ["lib/telegram-notifications.ts", "scripts/telegram-notifications.ts"]:
            (self.root / name).touch()
        original_run = subprocess.run
        for permission, received, accepted in [("", "", True), ("ОТПРАВИТЬ", "", True), ("ОТПРАВИТЬ", "ПОЛУЧЕНО", True), ("ОТПРАВИТЬ", "", False)]:
            controls = []
            def run(args, **kwargs):
                self.assertNotIn(TOKEN, args)
                self.assertNotIn(CHAT, args)
                if "--send-test" in args:
                    controls.append(args)
                    return subprocess.CompletedProcess(args, 0 if accepted else 1)
                return original_run(args, **kwargs)
            answers = iter(["НАСТРОИТЬ", CHAT, permission, received])
            output = io.StringIO()
            with patch.object(setup.Path, "cwd", return_value=self.root), patch.object(setup.sys, "argv", ["setup-telegram.py"]), patch.object(setup.sys.stdin, "isatty", return_value=True), patch.object(setup.sys.stderr, "isatty", return_value=True), patch("builtins.input", side_effect=lambda prompt: next(answers)), patch.object(setup.getpass, "getpass", return_value=TOKEN), patch.object(setup.subprocess, "run", side_effect=run), contextlib.redirect_stdout(output):
                code = setup.main()
            self.assertEqual(len(controls), 1 if permission else 0)
            self.assertEqual(code, 1 if permission and not accepted else 0)
            enabled = permission and received and accepted
            text = (self.root / ".env.local").read_text()
            self.assertIn("TELEGRAM_NOTIFICATIONS_ENABLED=" + ("true" if enabled else "false"), text)
            self.assertNotIn(TOKEN, output.getvalue())
            self.assertNotIn(CHAT, output.getvalue())
