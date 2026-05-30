# Relay SMTP en la nube (mail-service)

El portfolio **ya no envía SMTP directo**. Un servicio **`mail-service`** concentra las credenciales del proveedor (Brevo, SendGrid, Mailjet, etc.).

```
Visitante → portfolio-front → portfolio-back → mail-service → Brevo SMTP → tu bandeja
Otros Ubuntu → curl / script → mail-service → Brevo SMTP → destinatario configurado
```

## Mailtrap (tu caso: dominio ya verificado)

Usá **Email Sending** (API o SMTP), no el Sandbox.

1. **API Token** (un solo string): Mailtrap → **Settings → API Tokens** → Create.  
   Ese valor va en `MAILTRAP_API_TOKEN` (Bearer).  
   Los códigos tipo `09c573a80a,9278a5f...` de la verificación DNS en Cloudflare **no** son el API token.

2. En `.env_portfolio`:

```env
MAILTRAP_API_TOKEN=tu-token-completo-aqui
MAIL_FROM_EMAIL=no-reply@avillalba.com.ar
MAIL_FROM_NAME=avillalba.com.ar
TO_EMAIL=destinatario@ejemplo.com
```

3. Probar igual que el curl de Mailtrap, pero vía `mail-service`:

```bash
curl -X POST http://mail-service:3025/v1/send \
  -H "X-API-Key: TU_MAIL_SERVICE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"to":"destinatario@ejemplo.com","subject":"Test","text":"Hola"}'
```

## Proveedor alternativo: Brevo (gratis)

1. Cuenta en [brevo.com](https://www.brevo.com).
2. **Transactional** → remitente `no-reply@avillalba.com.ar` (o el que uses en `MAIL_FROM_EMAIL`) en el dominio verificado.
3. **SMTP & API** → copiar:
   - Servidor: `smtp-relay.brevo.com`
   - Puerto: `587`
   - Login: tu email de Brevo
   - Clave SMTP: `xsmtpsib-...` (no confundir con API key REST)

Alternativas free tier: SendGrid (100/día), Mailjet (200/día).

## Variables (`.env` o `.env_portfolio`)

Ver `.env_example`. Lo importante:

| Variable | Uso |
|----------|-----|
| `MAIL_SERVICE_API_KEY` | Secreto compartido (portfolio-back + tus otros servers) |
| `SMTP_*` / `MAIL_FROM` | Solo en **mail-service** |
| `TO_EMAIL` | Destino por defecto (formulario portfolio) |

## Otros Ubuntu (alertas, scripts, Postfix opcional)

Mismo relay sin abrir SMTP en cada host:

```bash
curl -sS -X POST "http://mail-service:3025/v1/send" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: TU_MAIL_SERVICE_API_KEY" \
  -d '{
    "to": "destinatario@ejemplo.com",
    "subject": "Alerta docker00",
    "text": "Mensaje de prueba desde el servidor"
  }'
```

Si `mail-service` solo está en Docker interno, publicá el puerto en NPM o usá la IP del host con puerto mapeado (solo red de confianza + API key).

Script de ejemplo: `scripts/send-mail.sh`.

## Postfix en docker00

Podés **apagar** el relay local y usar solo Brevo vía `mail-service`, o dejar Postfix con `relayhost` a Brevo (duplicado). Lo más simple: un solo `mail-service` + API.
