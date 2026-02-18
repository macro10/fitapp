#!/bin/bash
# protect-files.sh
# Prevents Claude from modifying sensitive or auto-generated files.
# Used as a PreToolUse hook for Edit|Write operations.

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

if [ -z "$FILE_PATH" ]; then
  exit 0
fi

PROTECTED_PATTERNS=(
  ".env.production"
  ".env.development"
  "package-lock.json"
  ".git/"
  "migrations/"
  "backend/backend/settings.py"
)

for pattern in "${PROTECTED_PATTERNS[@]}"; do
  if [[ "$FILE_PATH" == *"$pattern"* ]]; then
    echo "Blocked: $FILE_PATH matches protected pattern '$pattern'. These files should be modified manually." >&2
    exit 2
  fi
done

exit 0
