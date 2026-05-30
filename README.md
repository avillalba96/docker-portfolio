# docker-portfolio

Sitio estático con formulario de contacto, API backend y microservicio de correo transaccional. Diseñado para ejecutarse detrás de un reverse proxy y cargar secretos desde variables de entorno.

## Editar contenido del sitio

Guía paso a paso (textos, CV, stack, foto, proyectos): **[docs/EDITAR-SITIO.md](docs/EDITAR-SITIO.md)**

Tras cambiar CSS/JS, incrementá `PORTFOLIO_VERSION` en `portfolio_front/nginx/html/version.js`.

## Ramas

| Rama | Uso |
|------|-----|
| `main` | Desarrollo activo (rediseño DevSecOps) |
| `legacy/hacker-theme` | Tema terminal/hacker congelado tal cual estaba |

## Arquitectura

```
Cliente
  → Nginx (estáticos + proxy /send-email)
  → API Express (CORS, rate limit)
  → mail-service (Mailtrap API o SMTP)
  → proveedor de correo
```

| Servicio | Rol |
|----------|-----|
| `portfolio-front` | HTML/CSS/JS y proxy al backend |
| `portfolio-back` | Validación y reenvío al mail-service |
| `mail-service` | Envío de correo (credenciales solo aquí) |

## Inicio rápido

```bash
git clone <url-del-repositorio>
cd docker-portfolio
cp .env_example .env
# Completar MAILTRAP_API_TOKEN, MAIL_SERVICE_API_KEY, TO_EMAIL, ALLOWED_ORIGINS
docker compose up -d --build
```

Publicar detrás de HTTPS (Nginx Proxy Manager, Traefik, etc.). Incluir el dominio público en `ALLOWED_ORIGINS`.

## Correo

| Campo | Uso |
|-------|-----|
| `MAIL_FROM_EMAIL` | Remitente verificado (ej. `no-reply@tudominio.com`) |
| `TO_EMAIL` | Bandeja que recibe los mensajes del formulario |
| Reply-To | Email del visitante (automático en el backend) |

Los mensajes del formulario llevan prefijo `[Portfolio]` en asunto y cuerpo para identificar el origen.

Documentación:

- [docs/MAILTRAP-SETUP.md](docs/MAILTRAP-SETUP.md) — token API Mailtrap
- [docs/SMTP-RELAY.md](docs/SMTP-RELAY.md) — alternativa SMTP

## Variables

Ver [`.env_example`](.env_example). No versionar `.env` ni tokens.

## CI/CD

Pipeline típico: `checkout` → `docker compose --env-file <ruta-secrets> up -d --build`.

El archivo de secretos puede vivir fuera del clone (ej. `../.env_production`). Requiere red Docker externa definida en `docker-compose.yml` (`npm-network` por defecto).

## Tecnologías

Docker Compose · Nginx · Node.js (Express) · Mailtrap API

## Licencia

MIT — [LICENSE](LICENSE)
