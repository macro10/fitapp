#!/bin/bash
# log-commands.sh
# Logs every Bash command Claude executes to a local log file.
# Used as a PostToolUse hook for Bash operations.
# Log file: .claude/command-log.txt

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

if [ -z "$COMMAND" ]; then
  exit 0
fi

LOG_DIR="${CLAUDE_PROJECT_DIR:-.}/.claude"
LOG_FILE="$LOG_DIR/command-log.txt"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] $COMMAND" >> "$LOG_FILE"

exit 0
