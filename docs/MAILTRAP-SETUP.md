# Cómo generar el API Token en Mailtrap

Para **envío real** (no el Sandbox de pruebas).

## Pasos en [mailtrap.io](https://mailtrap.io)

1. Iniciá sesión.
2. Menú **Settings** (engranaje) → **API Tokens**.
3. **Add Token** → nombre ej. `portfolio-docker00`.
4. Permisos: al menos envío transaccional / **Sending** (según lo que ofrezca el plan).
5. Copiá el token **completo** (solo se muestra una vez).

## Dónde pegarlo (no en GitHub)

En el servidor Jenkins / producción:

```text
jenkins-agent/workspace/.../Enable/.env_portfolio
```

```env
MAILTRAP_API_TOKEN=el-token-nuevo-aqui
MAIL_FROM_EMAIL=no-reply@avillalba.com.ar
```

## Remitente `no-reply@`

En **Sending Domains** → `avillalba.com.ar` → agregá el remitente `no-reply@avillalba.com.ar` si Mailtrap lo pide (además del dominio verificado).

## Probar

```bash
curl -X POST https://send.api.mailtrap.io/api/send \
  -H "Authorization: Bearer TU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "from":{"email":"no-reply@avillalba.com.ar","name":"avillalba.com.ar"},
    "to":[{"email":"tu@outlook.com"}],
    "subject":"Test Mailtrap",
    "text":"OK"
  }'
```

Si responde **401** → token inválido o revocado; generá uno nuevo.
