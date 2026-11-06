#!/usr/bin/env bash
set -euo pipefail

SKILL_NAME="dev-assistant"
REPO_URL="https://github.com/<username>/<repo>.git"
TARGET_DIR="${1:-$HOME/.claude/skills/$SKILL_NAME}"

if ! command -v git >/dev/null 2>&1; then
  echo "Error: ไม่พบคำสั่ง git ในเครื่อง กรุณาติดตั้ง Git ก่อนดำเนินการ" >&2
  exit 1
fi

if [ -d "$TARGET_DIR/.git" ]; then
  echo "กำลังอัปเดต $SKILL_NAME ใน $TARGET_DIR ..."
  git -C "$TARGET_DIR" pull --ff-only
else
  mkdir -p "$(dirname "$TARGET_DIR")"
  echo "กำลังติดตั้ง $SKILL_NAME ไปยัง $TARGET_DIR ..."
  git clone "$REPO_URL" "$TARGET_DIR"
fi

echo "ติดตั้งสำเร็จที่: $TARGET_DIR"

