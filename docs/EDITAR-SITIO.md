# Cómo editar el portfolio (sin programar)

Todo el contenido visible se edita con **archivos de texto**. No hace falta panel de admin ni tocar el backend del email salvo que quieras cambiar el envío de correos.

## Mapa rápido

| Qué querés cambiar | Archivo |
|--------------------|---------|
| Textos en español (menú, home, sobre mí, experiencia, proyectos, contacto) | `portfolio_front/nginx/html/languages/es.json` |
| Textos en inglés | `portfolio_front/nginx/html/languages/en.json` |
| Stack tecnológico (iconos y nombres) | `portfolio_front/nginx/html/skills-data.js` |
| Link del CV | `cv_drive_id` (Google Drive) o `cv_path` (PDF en el repo) en `home` de `es.json` / `en.json` |
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
  "cv_drive_id": "1abc...xyz",
  "cv_filename": "CV-Alejandro-Villalba.pdf"
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

## 5. CV (PDF) — Google Drive

Archivos: **`languages/es.json`** y **`languages/en.json`**, clave `home`:

```json
"cv_drive_id": "1abc...xyz",
"cv_filename": "CV-Alejandro-Villalba.pdf"
```

### Configuración inicial (una sola vez)

1. Subí el PDF a **Google Drive**.
2. Clic derecho → **Compartir** → **Cualquier persona con el enlace** (lector).
3. Copiá el ID del enlace. Ejemplo:  
   `https://drive.google.com/file/d/ **1abc...xyz** /view` → el ID es `1abc...xyz`.
4. Pegalo en **`cv_drive_id`** (español e inglés, mismo valor).

El botón usa descarga directa (`uc?export=download`), no la página `/view` de Drive.

### Actualizar el CV sin tocar el sitio

En Drive el enlace depende del **ID del archivo**, no del nombre del PDF.

| Acción | ¿Sigue funcionando el botón? |
|--------|------------------------------|
| Mismo archivo → **Administrar versiones** → subir PDF nuevo | **Sí** (mismo `cv_drive_id`) |
| Borrar el PDF y subir otro con el mismo nombre | **No** (nuevo ID → actualizá `cv_drive_id` una vez) |

**Recomendado:** mantener un solo archivo fijo en Drive y reemplazar contenido con *Administrar versiones*.

### Alternativa: PDF en el repo (sin Drive)

1. Guardá el PDF como **`portfolio_front/nginx/html/assets/cv/cv.pdf`**.
2. En `home` de ambos JSON:

```json
"cv_path": "./assets/cv/cv.pdf",
"cv_filename": "CV-Alejandro-Villalba.pdf"
```

(Borrá o comentá `cv_drive_id` si usás `cv_path`.)

3. Al cambiar el PDF: reemplazá el archivo y subí **`PORTFOLIO_VERSION`** en `version.js`.

---

## 6. Foto personal

1. Guardá tu foto como **`assets/images/profile.jpg`** (JPG, ~400×500 px).
2. Si existe, reemplaza el placeholder automáticamente.
3. Volvé a desplegar el contenedor `portfolio-front`.

---

## 7. Caché al refrescar

Al publicar cambios de CSS/JS, subí el número en **`version.js`** y, si cambiaste roadmap/experiencia/contenido, la fecha:

```javascript
window.PORTFOLIO_VERSION = '2.9.0';
window.PORTFOLIO_LAST_UPDATED = '2026-05-30';  // YYYY-MM-DD
```

La fecha se muestra en **Sobre mí** y en el **footer** (ES/EN automático). Eso fuerza al navegador a cargar archivos nuevos.

---

## 8. Email (no tocar salvo correo)

El formato del mail (De del visitante, asunto `[Portfolio]`, cuerpo formateado) está en:

- `portfolio_back/server.js`
- `mail_service/server.js`

Secretos en `.env` del servidor (`MAILTRAP_API_TOKEN`, `TO_EMAIL`, etc.). Ver `docs/MAILTRAP-SETUP.md`.

---

## 9. Despliegue

```bash
# Local / servidor con compose
docker compose --env-file .env up -d --build portfolio-front portfolio-back mail-service
```

Pipeline Jenkins: job `docker-portfolio` en tu homelab.

---

## Consejo

Editá **siempre** `es.json` y `en.json` juntos para que ES/EN sigan iguales en estructura. Probá con **Ctrl+F5** después del deploy.
