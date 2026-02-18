#!/bin/bash
# lint-python.sh
# Checks Python syntax after Claude edits a .py file.
# Used as a PostToolUse hook for Edit|Write operations.

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

if [ -z "$FILE_PATH" ]; then
  exit 0
fi

# Only check Python files
if [[ "$FILE_PATH" != *.py ]]; then
  exit 0
fi

# Check that the file exists
if [ ! -f "$FILE_PATH" ]; then
  exit 0
fi

# Run Python syntax check
python3 -m py_compile "$FILE_PATH" 2>&1
RESULT=$?

if [ $RESULT -ne 0 ]; then
  echo "Python syntax error in $FILE_PATH" >&2
  exit 2
fi

exit 0
