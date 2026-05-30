#!/bin/bash
# Envío vía mail-service (mismo relay que el portfolio).
# Uso:
#   export MAIL_SERVICE_URL=http://127.0.0.1:3025
#   export MAIL_SERVICE_API_KEY=...
#   ./scripts/send-mail.sh "Asunto" "Cuerpo del mensaje"
#   ./scripts/send-mail.sh "Asunto" "Cuerpo" destino@example.com
set -euo pipefail

TO="${3:-${TO_EMAIL:-destinatario@ejemplo.com}}"
SUBJECT="${1:?Falta asunto}"
TEXT="${2:?Falta cuerpo}"
URL="${MAIL_SERVICE_URL:-http://mail-service:3025}"
KEY="${MAIL_SERVICE_API_KEY:?Falta MAIL_SERVICE_API_KEY}"

curl -fsS -X POST "${URL%/}/v1/send" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: ${KEY}" \
  -d "$(jq -n --arg to "$TO" --arg s "$SUBJECT" --arg t "$TEXT" \
    '{to:$to,subject:$s,text:$t}')"

echo ""
echo "OK → ${TO}"
