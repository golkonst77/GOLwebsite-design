"""Produce one standalone Windows script; no production connection."""
import base64
from pathlib import Path

root = Path(__file__).resolve().parent
helper = (root / "gol_config_backup.py").read_bytes()
template = (root / "SiteConfig-Backup.template.ps1").read_text()
output = template.replace("__HELPER_BASE64__", base64.b64encode(helper).decode("ascii"))
assert "__HELPER_BASE64__" not in output
(root / "SiteConfig-Backup.ps1").write_text(output, encoding="utf8")
