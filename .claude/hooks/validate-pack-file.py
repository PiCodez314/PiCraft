#!/usr/bin/env python3
"""PostToolUse hook: validates JSON/JS syntax after Claude edits a
behavior_pack or resource_pack file, catching mistakes immediately
instead of at in-game test time."""

import json
import subprocess
import sys
import os


def main():
    payload = json.load(sys.stdin)
    file_path = payload.get("tool_input", {}).get("file_path", "")

    if "PiCraft/behavior_pack" not in file_path.replace("\\", "/") and \
       "PiCraft/resource_pack" not in file_path.replace("\\", "/"):
        return

    if file_path.endswith(".json"):
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                json.load(f)
            print(f"PiCraft check: JSON OK - {file_path}")
        except Exception as e:
            print(f"PiCraft check: JSON ERROR in {file_path}")
            print(str(e))
    elif file_path.endswith(".js"):
        result = subprocess.run(
            ["node", "--check", file_path],
            capture_output=True,
            text=True,
        )
        if result.returncode == 0:
            print(f"PiCraft check: script OK - {file_path}")
        else:
            print(f"PiCraft check: SCRIPT ERROR in {file_path}")
            print(result.stderr.strip())


if __name__ == "__main__":
    main()
