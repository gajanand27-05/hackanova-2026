#!/usr/bin/env bash
# Fails if staged changes contain a service_role key, a JWT-looking string, or an env/export file.
set -u
hits=0
if git diff --cached --name-only | grep -E '(^|/)\.env($|\.)|\.(xlsx|csv)$' | grep -v '\.env\.example$'; then hits=1; fi
if git diff --cached -U0 -- . ':(exclude)scripts/secret-scan.sh' | grep -E '^\+' | grep -iE 'service_role|eyJhbGciOi[A-Za-z0-9_-]{20,}'; then hits=1; fi
if [ $hits -ne 0 ]; then echo "SECRET SCAN FAILED"; exit 1; fi
echo "secret scan clean"
