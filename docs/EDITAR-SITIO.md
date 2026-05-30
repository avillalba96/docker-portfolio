# Cómo editar el portfolio (sin programar)

Todo el contenido visible se edita con **archivos de texto**. No hace falta panel de admin ni tocar el backend del email salvo que quieras cambiar el envío de correos.

## Mapa rápido

| Qué querés cambiar | Archivo |
|--------------------|---------|
| Textos en español (menú, home, sobre mí, experiencia, proyectos, contacto) | `portfolio_front/nginx/html/languages/es.json` |
| Textos en inglés | `portfolio_front/nginx/html/languages/en.json` |
| Stack tecnológico (iconos y nombres) | `portfolio_front/nginx/html/skills-data.js` |
| Link del CV | `cv_link` dentro de `home` en `es.json` / `en.json` |
| Tu foto | Subir `portfolio_front/nginx/html/assets/images/profile.jpg` |
| Logo del sitio (pestaña del navegador) | `portfolio_front/nginx/html/assets/images/favicon.svg` |
| Imagen del proyecto Portfolio | `assets/images/cap-portafolio.png` |
| URLs de LinkedIn / GitHub | `index.html` (buscar `linkedin.com` y `github.com`) |
| Colores y diseño | `assets/stylesheet/index.css` y `mobile.css` |

Después de editar: commit + push → Jenkins despliega solo (o `docker compose up -d --build` en el servidor).

---

## 1. Textos (español e inglés)

Archivos: **`languages/es.json`** y **`languages/en.json`**

Misma estructura en ambos. Ejemplos:

```json
"home": {
  "home_text-1": "Hola, soy",
  "home_text-2": "Alejandro Villalba",
  "cv_link": "https://drive.google.com/..."
}
```

- **Sobre mí**: clave `sobre-mi` → `texto_sobreMi` (acepta HTML simple: `<p>`, `<strong>`, `<ul>`, `<li>`).
- **Experiencia**: `experiencia` → `items` (array). Podés agregar o quitar objetos `{ role, company, period, summary, tags, ... }`.
- **Proyectos**: `proyectos` → `title-proyecto1`, `info-proyecto1`, etc.
- **Contacto**: placeholders y mensajes del formulario en `contacto`.

Si agregás una clave nueva, el HTML debe tener `data-section="..."` y `data-value="..."` que coincidan (ver `index.html`).

---

## 2. Stack tecnológico

Archivo: **`skills-data.js`**

```javascript
{
  title: { es: 'DevSecOps & Cloud', en: 'DevSecOps & Cloud' },
  skills: [
    { icon: 'docker', name: { es: 'Docker', en: 'Docker' } },
  ]
}
```

- **Quitar** una skill: borrá la línea del array.
- **Agregar**: copiá una línea y cambiá `icon` + `name`. El `icon` debe existir en `app.js` (mapa `SKILL_ICONS` o `SKILL_FA`).
- **Renombrar grupo**: editá `title.es` y `title.en`.

---

## 3. Nueva sección (opcional)

1. Agregá bloque en `index.html` con `<section id="mi-seccion">`.
2. Agregá link en el menú del mismo archivo.
3. Agregá textos en `es.json` y `en.json`.
4. Si es contenido dinámico (lista), podés extender `app.js` siguiendo el patrón de `renderExperience`.

Para algo estático, alcanza con HTML + JSON.

---

## 4. Proyectos (tarjetas)

En **`index.html`**: duplicá un `<article class="cards--proyectos">` y cambiá links/imagen.

En **`es.json` / `en.json`**: agregá `title-proyecto3`, `info-proyecto3`, etc., y en HTML `data-value="title-proyecto3"`.

---

## 5. Foto personal

1. Guardá tu foto como **`assets/images/profile.jpg`** (JPG, ~400×500 px).
2. Si existe, reemplaza el placeholder automáticamente.
3. Volvé a desplegar el contenedor `portfolio-front`.

---

## 6. Caché al refrescar

Al publicar cambios de CSS/JS, subí el número en **`version.js`**:

```javascript
window.PORTFOLIO_VERSION = '2.4.1';  // incrementar
```

Eso fuerza al navegador a cargar archivos nuevos. Los JSON de idioma ya se piden sin caché.

---

## 7. Email (no tocar salvo correo)

El formato del mail (De del visitante, asunto `[Portfolio]`, cuerpo formateado) está en:

- `portfolio_back/server.js`
- `mail_service/server.js`

Secretos en `.env` del servidor (`MAILTRAP_API_TOKEN`, `TO_EMAIL`, etc.). Ver `docs/MAILTRAP-SETUP.md`.

---

## 8. Despliegue

```bash
# Local / servidor con compose
docker compose --env-file .env up -d --build portfolio-front portfolio-back mail-service
```

Pipeline Jenkins: job `docker-portfolio` en tu homelab.

---

## Consejo

Editá **siempre** `es.json` y `en.json` juntos para que ES/EN sigan iguales en estructura. Probá con **Ctrl+F5** después del deploy.
