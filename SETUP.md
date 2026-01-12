# Guía de Configuración Inicial - VECODE

Sigue estos pasos para clonar y configurar el proyecto en tu entorno local.

## 1. Clonar el repositorio
```bash
git clone https://github.com/JoseMaldonadoO/vecode.git
cd vecode
```

## 2. Instalar dependencias
Asegúrate de tener instalado PHP (con Composer) y Node.js.

### Backend (Laravel)
```bash
composer install
```

### Frontend (React/Vite)
```bash
npm install
```

## 3. Configuración de Entorno
Copia el archivo de ejemplo y genera la clave de la aplicación.
```bash
cp .env.example .env
php artisan key:generate
```

## 4. Base de Datos
1. Crea una base de datos vacía (por ejemplo, llamada `vecode`) en tu gestor de base de datos (MySQL/MariaDB).
2. Abre el archivo `.env` y configura tus credenciales:
```ini
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=vecode
DB_USERNAME=root
DB_PASSWORD=
```
3. Ejecuta las migraciones y seeders:
```bash
php artisan migrate --seed
```
*Esto creará el usuario administrador `admin@vecode.com` / `password`.*

## 5. Ejecutar el Proyecto
Necesitarás dos terminales abiertas.

**Terminal 1 (Servidor Laravel):**
```bash
php artisan serve
```

**Terminal 2 (Compilación Frontend):**
Para desarrollo (caliente):
```bash
npm run dev
```
Para producción (compilar una vez):
```bash
npm run build
```

## 6. Acceso
Abre tu navegador en [http://127.0.0.1:8000](http://127.0.0.1:8000).
