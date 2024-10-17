# Docker Portfolio

Este repositorio contiene un entorno completo para desplegar un portafolio personal utilizando Docker. Está compuesto por dos servicios principales: el backend para gestionar el envío de correos electrónicos y el frontend que sirve la interfaz del portafolio. Ambos servicios están orquestados utilizando Docker Compose.

## Tecnologías Utilizadas

### 1. Docker y Docker Compose

- **Docker**: Se utiliza para crear contenedores independientes que encapsulan la aplicación y sus dependencias, asegurando que el entorno de ejecución sea consistente.
- **Docker Compose**: Permite orquestar múltiples contenedores en un solo archivo de configuración (`docker-compose_dev.yml`), facilitando la gestión de los servicios y sus interacciones.

### 2. Nginx

- **Nginx** actúa como un servidor web para el frontend, sirviendo los archivos estáticos y funcionando como un proxy inverso para redirigir las solicitudes de correo electrónico al backend.

### 3. Node.js

- El backend está construido con **Node.js**, utilizando el framework **Express.js** para gestionar las rutas y procesar las solicitudes de envío de correo.
- **Nodemailer** se usa en el backend para enviar correos electrónicos a través de un servidor SMTP.

### 4. HTML, CSS y JavaScript

- La interfaz del portafolio está desarrollada con **HTML**, **CSS** y **JavaScript** para ofrecer una experiencia de usuario interactiva y visualmente atractiva.
- Se utilizan bibliotecas de animación y fuentes web para mejorar el diseño del sitio.

## Estructura del Repositorio

El proyecto está organizado de la siguiente manera:

```bash
.
├── LICENSE
├── README.md
├── docker-compose.yml
├── docker-compose_dev.yml
├── portfolio_back
│   ├── Dockerfile
│   ├── package.json
│   └── server.js
├── portfolio_front
│   ├── Dockerfile
│   └── nginx
│       └── nginx.conf
```

- **docker-compose_dev.yml**: Archivo de configuración para el entorno de desarrollo, que orquesta los servicios del backend y frontend.
- **portfolio_back/**: Contiene el backend del portafolio, implementado en Node.js.
  - **Dockerfile**: Define la imagen de Docker para el backend.
  - **server.js**: Código fuente del servidor Express.js que gestiona el envío de correos.
- **portfolio_front/**: Contiene el frontend del portafolio.
  - **Dockerfile**: Define la imagen de Docker para el frontend (Nginx).
  - **nginx/nginx.conf**: Archivo de configuración de Nginx para servir los archivos estáticos y configurar el proxy inverso.

## Funcionalidades

### 1. Portafolio Personal (Frontend)

- Sirve una página web estática con la información del portafolio personal.
- Incluye secciones como "Sobre mí", "Habilidades", "Proyectos" y "Contacto".
- Implementa un formulario de contacto que permite a los usuarios enviar mensajes.

### 2. Servicio de Envío de Correos (Backend)

- Gestiona las solicitudes de envío de correos provenientes del formulario de contacto en el frontend.
- Utiliza **Nodemailer** para enviar correos electrónicos configurados con un servidor SMTP.

## Instalación y Uso

### Requisitos Previos

- Tener **Docker** y **Docker Compose** instalados en tu sistema.

### Pasos para Ejecutar el Proyecto

1. Clona el repositorio:

   ```bash
   git clone https://github.com/tu-usuario/docker-portfolio.git
   cd docker-portfolio
   ```

2. Crea un archivo `.env` en la raíz del proyecto para definir las variables de entorno necesarias:

   ```env
   PROXY_PASS=http://portfolio-email_service:3000
   PROXY_LOCATION=/send-email
   PORTFOLIO_EMAIL_PORT=3000
   SMTP_HOST=localhost
   SMTP_PORT=2525
   TO_EMAIL=example@example.com
   ALLOWED_ORIGINS=http://localhost:8081
   ```

3. Ejecuta el proyecto con Docker Compose:

   ```bash
   docker-compose -f docker-compose_dev.yml up -d --build
   ```

4. Accede al portafolio en tu navegador:

   ```bash
   http://localhost:8081
   ```

### Apagar los Servicios

Para detener los contenedores, ejecuta:

```bash
docker-compose -f docker-compose_dev.yml down
```
