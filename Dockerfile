# Usa una imagen base oficial de NGINX para servir el sitio estático
FROM nginx:alpine

# Copia todos los archivos del proyecto al directorio de NGINX
COPY . /usr/share/nginx/html

# Expone el puerto 80 para el sitio web
EXPOSE 80

# NGINX ya ejecutará el servicio automáticamente

