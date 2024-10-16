FROM nginx:alpine3.20-slim

# Copiar el archivo de configuración de Nginx al contenedor
COPY nginx/nginx.conf /etc/nginx/nginx.conf.template
COPY nginx/html /usr/share/nginx/html/.

# Ejecutar envsubst para reemplazar las variables de entorno en la configuración
CMD ["/bin/sh", "-c", "envsubst '${PROXY_PASS} ${BACK_PORT} ${PROXY_LOCATION}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf && nginx -g 'daemon off;'"]
