# 🛠️ Guía de Configuración: Despliegue Automatizado "Unicorn Level"

Esta guía detalla cómo implementar desde cero el sistema de despliegue robusto utilizado en VECODE, ideal para entornos de hosting compartido (Hostinger).

---

## 🏗️ Fase 1: Estructura de Git y Repositorio

### 1. Inicialización o Clonación
Si el proyecto ya existe en GitHub:
```bash
git clone https://github.com/usuario/repositorio.git
cd repositorio
```

Si el proyecto es nuevo:
```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/usuario/nuevo-repo.git
git push -u origin main
```

### 2. Configuración de Ramas (Regla de Oro)
Para evitar errores en producción, utiliza ramas personales y reserva `main` solo para despliegues.
```bash
# Crear tu rama personal
git checkout -b tu-nombre
git push -u origin tu-nombre
```

---

## ⚙️ Fase 2: Configuración de Infraestructura

### 1. Secretos de GitHub (CI/CD)
En GitHub, ve a **Settings > Secrets and variables > Actions** y agrega:
- `FTP_SERVER`: IP o Host del servidor.
- `FTP_USERNAME`: Usuario FTP.
- `FTP_PASSWORD`: Contraseña FTP.

### 2. Archivos "Controladores" en el Servidor
Copia estos archivos (disponibles en la raíz de VECODE) a tu nuevo proyecto:
- `extract_debug.php`: La "llave maestra" que descomprime el código en el servidor.
- `fix_perms.php`: Corrige permisos de archivos para evitar errores 500.
- `migrate.php`: Ejecuta migraciones de Laravel vía URL.

### 3. Configuración Manual en el Hosting
- **Base de Datos**: Crea la DB y el usuario en el panel (hPanel).
- **Archivo `.env`**: Crea el archivo `.env` **manualmente** en la carpeta raíz del servidor (`public_html`). *No lo subas por Git ni FTP por seguridad.*

---

## 🚀 Fase 3: El Pipeline de Despliegue

Crea el archivo `.github/workflows/deploy.yml` en tu proyecto con estos pasos clave:

1. **Build**: Instala dependencias (`npm install`, `composer install`) y compila assets (`npm run build`).
2. **Compress**: Crea un archivo `.zip` con un nombre único: `release_${{ github.run_number }}.zip`.
3. **Upload**: Sube el `.zip` y los scripts controladores vía FTP.
4. **Trigger**: Llama a las URLs de los controladores mediante `curl`:
   - `https://tu-dominio.com/extract_debug.php`
   - `https://tu-dominio.com/fix_perms.php`
   - `https://tu-dominio.com/migrate.php`

---

## 🔄 Fase 4: Flujo de Trabajo Diario

1. **Desarrolla** en tu rama personal: `git push origin tu-nombre`.
2. **Integra** a producción cuando estés listo:
```bash
git checkout main
git pull origin main
git merge tu-nombre
git push origin main # <--- Esto activa el despliegue automático
```

---

## 🧪 Verificación Post-Despliegue
Si las imágenes o archivos no cargan, regenera el enlace simbólico del storage creando un archivo `link.php`:
```php
<?php
symlink('/home/usuario/public_html/storage/app/public', '/home/usuario/public_html/public/storage');
```
*Ejecuta la URL y borra el archivo inmediatamente.*
