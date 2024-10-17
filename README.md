# Docker Portfolio

Este repositorio contiene un entorno completo para desplegar un portafolio personal utilizando Docker. Está compuesto por dos servicios principales: el backend para gestionar el envío de correos electrónicos y el frontend que sirve la interfaz del portafolio. Ambos servicios están orquestados utilizando Docker Compose.

## Tecnologías Utilizadas

### 1. Docker y Docker Compose

- **Docker**: Se utiliza para crear contenedores independientes que encapsulan la aplicación y sus dependencias, asegurando que el entorno de ejecución sea consistente.
- **Docker Compose**: Permite orquestar múltiples contenedores en un solo archivo de configuración (`docker-compose.yml`), facilitando la gestión de los servicios y sus interacciones.

### 2. Nginx

- **Nginx** actúa como un servidor web para el frontend, sirviendo los archivos estáticos y funcionando como un proxy inverso para redirigir las solicitudes de correo electrónico al backend.

### 3. Node.js

- El backend está construido con **Node.js**, utilizando el framework **Express.js** para gestionar las rutas y procesar las solicitudes de envío de correo.
- **Nodemailer** se usa en el backend para enviar correos electrónicos a través de un servidor SMTP.

### 4. HTML, CSS y JavaScript

- La interfaz del portafolio está desarrollada con **HTML**, **CSS** y **JavaScript** para ofrecer una experiencia de usuario interactiva y visualmente atractiva.
- Se utilizan bibliotecas de animación y fuentes web para mejorar el diseño del sitio.

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
# portfolio-front
PROXY_PASS=http://portfolio-back
PROXY_LOCATION=/send-email

# portfolio-back
BACK_PORT=3000
SMTP_HOST=xxxxxx
SMTP_PORT=587
SMTP_USER=xxxxxx:xxxxxx
MAIL_FROM=nxxxxxx@example.com
TO_EMAIL=xxxxxx@outlook.com
ALLOWED_ORIGINS=http://localhost:8081
```

3. Ejecuta el proyecto con Docker Compose:

```bash
docker-compose -f docker-compose.yml up -d --build
```

4. Accede al portafolio en tu navegador:

```bash
http://localhost:8081
```

### Apagar los Servicios

Para detener los contenedores, ejecuta:

```bash
docker-compose -f docker-compose.yml down
```
