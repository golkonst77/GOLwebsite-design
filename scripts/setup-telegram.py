#!/usr/bin/env python3
"""Local interactive operator tool; never run automatically in CI/deployment."""
import fcntl
import getpass
import importlib.util
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import warnings

# Reuse the existing audited scanner/editor and atomic multi-file transaction.
_spec = importlib.util.spec_from_file_location("smtp_env_helpers", Path(__file__).with_name("setup-mailru-smtp.py"))
_helpers = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_helpers)
FILES = _helpers.FILES
KEYS = frozenset(("TELEGRAM_NOTIFICATIONS_ENABLED", "TELEGRAM_BOT_TOKEN", "TELEGRAM_CHAT_ID"))
TOKEN = re.compile(r"[0-9]{5,20}:[A-Za-z0-9_-]{30,100}\Z", re.ASCII)
CHAT = re.compile(r"-?[1-9][0-9]{0,19}\Z", re.ASCII)


def definition_keys(text):
    """Inspect top-level names, skipping OTHER multiline values just like strip_keys."""
    keys = []
    cursor = 0
    while cursor < len(text):
        end = text.find("\n", cursor)
        end = len(text) if end < 0 else end + 1
        match = _helpers.HEADER.match(text, cursor)
        if not match:
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
        if match[1] in KEYS:
            keys.append(match[1])
        cursor = end
    return keys


def inspect_definitions(before, inherited):
    if any(key in inherited for key in KEYS) or inherited.get("__NEXT_PROCESSED_ENV"):
        raise ValueError("TELEGRAM_PROCESS_OVERRIDES_REQUIRE_REVIEW")
    seen = set()
    for data, _ in before.values():
        for key in definition_keys((data or b"").decode("utf8")):
            if key in seen:
                raise ValueError("TELEGRAM_DUPLICATE_OR_SHADOWED_KEY_REQUIRES_REVIEW")
            seen.add(key)
    return bool(seen)


def validate_encoding(root, token, chat_id, encoded_token, encoded_chat):
    # Only stdin pipe carries private values; argv/stdout/stderr never contain them.
    program = r"""
try {
 const data=JSON.parse(require('node:fs').readFileSync(0,'utf8'));
 const {processEnv}=require('@next/env');
 const [env]=processEnv([{path:'.env.local',contents:
  'TELEGRAM_BOT_TOKEN='+data.encodedToken+'\nTELEGRAM_CHAT_ID='+data.encodedChat+'\n',env:{}}],
  process.cwd(),{info(){},error(){throw Error();}},true);
 process.stdout.write(env.TELEGRAM_BOT_TOKEN===data.token && env.TELEGRAM_CHAT_ID===data.chatId ? 'ENCODING_OK':'ENCODING_FAILED');
} catch {process.stdout.write('ENCODING_FAILED');process.exitCode=1;}
"""
    clean = {k: v for k, v in os.environ.items() if k not in KEYS}
    clean["NODE_ENV"] = "production"
    result = subprocess.run(["node", "-e", program], cwd=root, env=clean,
        input=json.dumps({"token": token, "chatId": chat_id, "encodedToken": encoded_token, "encodedChat": encoded_chat}),
        text=True, capture_output=True, timeout=15, check=False)
    if result.returncode or result.stdout != "ENCODING_OK":
        raise ValueError("TELEGRAM_ENCODING_FAILED")


def configure(root, token, chat_id):
    if not TOKEN.fullmatch(token) or not CHAT.fullmatch(chat_id):
        raise ValueError("TELEGRAM_FORMAT_REVIEW")
    before = _helpers.snapshot(root)
    inspect_definitions(before, os.environ)
    encoded_token = _helpers.encode_password(token)
    encoded_chat = _helpers.encode_password(chat_id)
    validate_encoding(root, token, chat_id, encoded_token, encoded_chat)
    plan = {}
    for name, (data, _) in before.items():
        if data is not None or name == ".env.local":
            text = _helpers.strip_keys((data or b"").decode("utf8"), KEYS)
            if name == ".env.local":
                text += ("" if not text or text.endswith("\n") else "\n")
                text += "TELEGRAM_NOTIFICATIONS_ENABLED=false\n"
                text += "TELEGRAM_BOT_TOKEN=" + encoded_token + "\n"
                text += "TELEGRAM_CHAT_ID=" + encoded_chat + "\n"
            plan[name] = text.encode("utf8")
    _helpers.apply_plan(root, before, plan)
    return _helpers.snapshot(root)


def enable(root, expected, *, accepted, received):
    if not (accepted and received):
        return False
    # Re-check ambiguity/format before enabling, and prevent any concurrent edit.
    inspect_definitions(expected, os.environ)
    text = _helpers.strip_keys(expected[".env.local"][0].decode("utf8"), {"TELEGRAM_NOTIFICATIONS_ENABLED"})
    text += ("" if text.endswith("\n") else "\n") + "TELEGRAM_NOTIFICATIONS_ENABLED=true\n"
    _helpers.apply_plan(root, expected, {".env.local": text.encode("utf8")})
    return True


def main():
    root = Path.cwd()
    if sys.argv[1:] not in ([], ["--inspect"]):
        print("TELEGRAM_ARGUMENTS_NOT_ALLOWED_NO_CHANGES")
        return 1
    if not all((root / name).is_file() for name in ("package.json", "lib/telegram-notifications.ts", "scripts/telegram-notifications.ts")):
        print("APPLICATION_DIRECTORY_REQUIRED_NO_CHANGES")
        return 1
    if os.environ.get("NODE_ENV") == "test":
        print("TEST_ENVIRONMENT_NOT_ALLOWED_NO_CHANGES")
        return 1
    if sys.argv[1:] == ["--inspect"]:
        exists = inspect_definitions(_helpers.snapshot(root), os.environ)
        print("TELEGRAM_DEFINITIONS_PRESENT" if exists else "TELEGRAM_DEFINITIONS_ABSENT")
        print("TELEGRAM_INSPECTION_ONLY_NO_NETWORK_NO_CHANGES")
        return 0
    if not sys.stdin.isatty() or not sys.stderr.isatty():
        print("INTERACTIVE_TTY_REQUIRED_NO_CHANGES")
        return 1
    # Same directory flock as SMTP tool: the two editors cannot race each other.
    lock = os.open(root, os.O_RDONLY)
    try:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        print("Изменяются только TELEGRAM_NOTIFICATIONS_ENABLED, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID.")
        print("Файлы: " + ", ".join(FILES))
        print("SMTP, LexRadar и остальные строки сохраняются. PM2/Nginx не меняются. Уведомления сначала выключены.")
        if input("Для настройки введите НАСТРОИТЬ: ").strip() != "НАСТРОИТЬ":
            print("TELEGRAM_SETUP_CANCELLED_NO_CHANGES")
            return 1
        inspect_definitions(_helpers.snapshot(root), os.environ)
        if (root / ".git").exists():
            tracked = subprocess.run(["git", "ls-files", "--", *FILES], cwd=root,
                capture_output=True, text=True, timeout=10, check=False)
            if tracked.returncode or tracked.stdout.strip():
                raise ValueError("GIT_ENV_TRACKING_REQUIRES_REVIEW")
        with warnings.catch_warnings():
            warnings.simplefilter("error", getpass.GetPassWarning)
            token = getpass.getpass("Токен бота (ввод скрыт): ", stream=sys.stderr)
        chat_id = input("Личный chat_id владельца [241367335]: ").strip() or "241367335"
        expected = configure(root, token, chat_id)
        del token, chat_id
        print("TELEGRAM_CONFIGURED_NOTIFICATIONS_DISABLED")
        if input("Разрешить одно контрольное Telegram-сообщение? Введите ОТПРАВИТЬ (Enter — пропустить): ").strip() != "ОТПРАВИТЬ":
            print("TELEGRAM_LEFT_DISABLED_NO_MESSAGE_SENT")
            return 0
        # No email, no supplied secret in argv; CLI reads only the saved server config.
        result = subprocess.run(["node", "--import", "tsx", "scripts/telegram-notifications.ts", "--send-test"],
            cwd=root, timeout=20, check=False)
        if result.returncode:
            print("TELEGRAM_CONTROL_NOT_CONFIRMED_LEFT_DISABLED")
            return 1
        print("API принял сообщение. Это не подтверждает прочтение. Проверьте чат владельца.")
        received = input("Только после фактического получения введите ПОЛУЧЕНО (Enter — оставить выключенным): ").strip() == "ПОЛУЧЕНО"
        if enable(root, expected, accepted=True, received=received):
            print("TELEGRAM_ENABLED_RESTART_REQUIRES_AUTHORIZED_OPERATOR")
        else:
            print("TELEGRAM_LEFT_DISABLED")
        return 0
    finally:
        os.close(lock)


if __name__ == "__main__":
    try:
        sys.exit(main())
    except (KeyboardInterrupt, EOFError):
        print("TELEGRAM_SETUP_CANCELLED_CHECK_DISABLED")
        sys.exit(1)
    except Exception as error:
        codes = {"ENV_FORMAT_REVIEW", "TELEGRAM_PROCESS_OVERRIDES_REQUIRE_REVIEW",
            "TELEGRAM_DUPLICATE_OR_SHADOWED_KEY_REQUIRES_REVIEW", "TELEGRAM_FORMAT_REVIEW",
            "TELEGRAM_ENCODING_FAILED", "GIT_ENV_TRACKING_REQUIRES_REVIEW",
            "ENV_SYMLINK_REQUIRES_MANUAL_REVIEW", "ENV_OWNERSHIP_REVIEW",
            "ENV_CHANGED_DURING_SETUP", "CONCURRENT_EDIT_ROLLBACK_REQUIRES_REVIEW"}
        code = str(error) if isinstance(error, ValueError) and str(error) in codes else "TELEGRAM_SETUP_FAILED"
        print(code + "_NO_SECRET_DETAILS_CHECK_DISABLED")
        sys.exit(1)
