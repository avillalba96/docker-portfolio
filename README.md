# docker-portfolio

Sitio web personal (**avillalba.com.ar**) en Docker: frontend estático, API de contacto y envío de correo vía **Mailtrap** (dominio verificado).

## Arquitectura

```
Visitante (navegador)
    → portfolio-front (Nginx + HTML/JS)
    → portfolio-back (Express, CORS, límites de envío)
    → mail-service (API interna, credenciales Mailtrap)
    → Mailtrap Email Sending
    → tu bandeja (TO_EMAIL)
```

| Servicio | Qué hace | Público en Git |
|----------|----------|----------------|
| **portfolio-front** | Sitio web + proxy `/send-email` | Sí |
| **portfolio-back** | Valida origen y reenvía al mail-service | Sí |
| **mail-service** | Llama a Mailtrap; **no** expone SMTP al mundo | Sí (sin secretos) |

Los secretos van en `.env` / `.env_portfolio` (ver `.env_example`). **No** subas tokens a GitHub.

## Correo del formulario de contacto

| Campo | Valor típico |
|-------|----------------|
| **De (From)** | `no-reply@avillalba.com.ar` — remitente verificado en Mailtrap |
| **Para (To)** | Tu correo (`TO_EMAIL`, ej. Outlook) |
| **Reply-To** | Email que escribe quien usa el formulario |

El remitente es `no-reply@` porque es un envío automático del sitio, no una casilla personal.

**Asunto y cuerpo:** el backend antepone `[Portfolio]` al asunto y abre el mensaje indicando que proviene del formulario de contacto del sitio (no es un mail personal tuyo). El nombre del remitente en Mailtrap suele ser `Portfolio · avillalba.com.ar` (`MAIL_FROM_NAME`).

## Inicio rápido

```bash
git clone https://github.com/avillalba96/docker-portfolio.git
cd docker-portfolio
cp .env_example .env
# Editar .env: MAILTRAP_API_TOKEN, MAIL_SERVICE_API_KEY, TO_EMAIL, ALLOWED_ORIGINS
docker compose up -d --build
```

Sitio detrás de reverse proxy (ej. NPM) en `https://avillalba.com.ar`. CORS debe incluir esa URL en `ALLOWED_ORIGINS`.

## Variables principales

Ver [`.env_example`](.env_example).

- **Mailtrap (envío real):** [docs/MAILTRAP-SETUP.md](docs/MAILTRAP-SETUP.md) — cómo crear el API Token.
- **Arquitectura de correo:** [docs/SMTP-RELAY.md](docs/SMTP-RELAY.md).
- **Script desde otros servidores:** [scripts/send-mail.sh](scripts/send-mail.sh).

## Jenkins / CI

En CI el `.env` suele vivir un nivel arriba del clone (`../.env_portfolio`). Plantilla en el repo [docker-jenkins](https://github.com/avillalba96/docker-jenkins) → `examples/portfolio/`.

## Tecnologías

- Docker Compose, Nginx, Node.js (Express), HTML/CSS/JS
- Mailtrap Email Sending API (dominio `avillalba.com.ar` en Cloudflare)

## Licencia

MIT — ver [LICENSE](LICENSE).
