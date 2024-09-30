# Usa una imagen base oficial de Node.js
FROM node:18-bullseye

# Establece el directorio de trabajo en /app
WORKDIR /app

# Copia los archivos de configuración de npm
COPY package*.json ./

# Instala las dependencias de la aplicación
RUN npm install

# Copia el resto del código de la aplicación
COPY . .

# Expone el puerto que usará la aplicación
EXPOSE 10000

# Define el comando para ejecutar la aplicación
CMD ["node", "app.js"]
