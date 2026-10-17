"""Installer fixtures only; no real SMTP or production changes."""
import importlib.util
import itertools
import os
from pathlib import Path
import subprocess
import tempfile
import unittest
from unittest.mock import patch

REPO = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("smtp_setup", REPO / "scripts/setup-mailru-smtp.py")
setup = importlib.util.module_from_spec(spec)
spec.loader.exec_module(setup)


class SetupTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="lexradar-mailru-")
        self.root = Path(self.temp.name)
        (self.root / "node_modules").symlink_to(REPO / "node_modules", target_is_directory=True)

    def tearDown(self):
        self.temp.cleanup()

    def test_other_settings_and_multiline_assignments_are_preserved_exactly(self):
        other = '# keep\nDATABASE_URL="private fixture"\nTEXT="first\nSMTP_PASS=inside-text\nlast"\nORIGIN=https://example.invalid\n'
        source = "SMTP_HOST=smtp.yandex.ru\n" + other + "SMTP_PASS='old\nmultiline'\nexport SMTP_PASS=duplicate\n"
        self.assertEqual(setup.strip_keys(source), other)

    def test_unclosed_quote_aborts_instead_of_deleting_other_settings(self):
        with self.assertRaises(ValueError):
            setup.strip_keys('OTHER="unfinished\nSMTP_PASS=must-not-delete\n')

    def test_password_representation_roundtrips_through_actual_next_loader(self):
        for password in ["fixture-only", " fixture#$value ", "quote'\\n$fixture", 'quote" $fixture', "fixture\\$VALUE"]:
            setup.validate_encoding(self.root, password, setup.encode_password(password))

    def test_cleanup_consolidates_all_profiles_and_keeps_form_disabled(self):
        for name in setup.FILES:
            (self.root / name).write_text(
                "OTHER_" + name.replace(".", "_") + "=keep\n"
                "SMTP_HOST=smtp.yandex.ru\nSMTP_PASS=old\nSMTP_PASS=duplicate\n"
                "YANDEX_EMAIL=old@example.invalid\nYANDEX_PASSWORD=old\n"
                "LEAD_TO_EMAIL=old@example.invalid\nLEXRADAR_FORM_ENABLED=true\n")
        state = setup.configure(self.root, "fixture-only")
        for name in setup.FILES:
            text = (self.root / name).read_text()
            self.assertIn("=keep\n", text)
            self.assertNotIn("YANDEX_", text)
            self.assertNotIn("LEAD_TO_EMAIL=", text)
            self.assertEqual((self.root / name).stat().st_mode & 0o777, 0o600)
            self.assertEqual(text.count("SMTP_HOST="), 1 if name == ".env.local" else 0)
        local = state[".env.local"][0].decode()
        self.assertIn("MAIL_TO=golwebstudio@bk.ru\n", local)
        self.assertIn("SMTP_USER=golwebstudio@bk.ru\n", local)
        self.assertIn("LEXRADAR_FORM_ENABLED=false\n", local)
        self.assertEqual(local.count("SMTP_PASS="), 1)

    def test_repeat_configuration_does_not_create_duplicates(self):
        setup.configure(self.root, "first-fixture")
        setup.configure(self.root, "second-fixture")
        text = (self.root / ".env.local").read_text()
        for key in setup.MANAGED - {"YANDEX_EMAIL", "YANDEX_PASSWORD", "LEAD_TO_EMAIL", "SMTP_PASSWORD"}:
            self.assertEqual(text.count(key + "="), 1)

    def test_form_requires_smtp_success_receipt_confirmation_and_ready_protection(self):
        for accepted, received, ready in itertools.product([False, True], repeat=3):
            state = setup.configure(self.root, "fixture-only")
            result = setup.enable(self.root, state, accepted=accepted, received=received, ready=ready)
            self.assertEqual(result, accepted and received and ready)
            text = (self.root / ".env.local").read_text()
            self.assertIn("LEXRADAR_FORM_ENABLED=" + ("true" if result else "false"), text)

    def test_concurrent_edit_prevents_overwrite(self):
        state = setup.configure(self.root, "fixture-only")
        (self.root / ".env.local").write_text("OPERATOR_EDIT=keep\n")
        with self.assertRaises(ValueError):
            setup.enable(self.root, state, accepted=True, received=True, ready=True)
        self.assertEqual((self.root / ".env.local").read_text(), "OPERATOR_EDIT=keep\n")

    def test_partial_write_failure_rolls_back_original_files(self):
        (self.root / ".env.production.local").write_text("SMTP_PASS=old\nOTHER=keep\n")
        (self.root / ".env.local").write_text("SMTP_HOST=old\nSECOND=keep\n")
        before = setup.snapshot(self.root)
        real = setup.atomic_file
        calls = 0

        def fail_second(*args, **kwargs):
            nonlocal calls
            calls += 1
            if calls == 2:
                raise OSError("fixture write failure")
            return real(*args, **kwargs)

        with patch.object(setup, "atomic_file", fail_second), self.assertRaises(OSError):
            setup.configure(self.root, "fixture-only")
        self.assertEqual(setup.snapshot(self.root), before)

    def test_symlink_is_rejected_before_changes(self):
        target = self.root / "external-fixture"
        target.write_text("OTHER=keep\n")
        (self.root / ".env.local").symlink_to(target)
        with self.assertRaises(ValueError):
            setup.configure(self.root, "fixture-only")
        self.assertEqual(target.read_text(), "OTHER=keep\n")

    def test_noninteractive_launch_never_prompts_or_writes(self):
        for name in ("package.json", "scripts/diagnose-smtp.ts", "lib/lexradar-config.ts"):
            target = self.root / name
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text("")
        result = subprocess.run(
            ["python3", str(REPO / "scripts/setup-mailru-smtp.py")],
            cwd=self.root, stdin=subprocess.DEVNULL, capture_output=True, text=True,
            env={key: value for key, value in os.environ.items() if key not in setup.MANAGED},
            timeout=10,
        )
        self.assertEqual(result.returncode, 1)
        self.assertEqual(result.stdout, "INTERACTIVE_TTY_REQUIRED_NO_CHANGES\n")
        self.assertEqual(result.stderr, "")
        self.assertFalse((self.root / ".env.local").exists())

    def test_wrong_working_directory_is_rejected_without_changes(self):
        result = subprocess.run(
            ["python3", str(REPO / "scripts/setup-mailru-smtp.py")],
            cwd=self.root, capture_output=True, text=True, timeout=10,
        )
        self.assertEqual(result.returncode, 1)
        self.assertEqual(result.stdout, "APPLICATION_DIRECTORY_REQUIRED_NO_CHANGES\n")
        self.assertFalse((self.root / ".env.local").exists())


if __name__ == "__main__":
    unittest.main()
