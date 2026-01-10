# 🚀 Guía de Despliegue "Unicorn Level" - VECODE

Esta guía detalla los pasos necesarios para desplegar la aplicación en Hostinger bajo el subdirectorio `/vecode`.

## 1. Configuración de Base de Datos en Hostinger

1. Accede a tu **hPanel** de Hostinger.
2. Ve a **Bases de Datos** -> **Bases de Datos MySQL**.
3. Crea una nueva base de datos y un usuario:
   - **Nombre de BD:** `u174025152_vecode_v2` (o el que prefieras).
   - **Usuario:** `u174025152_admin_v2`.
   - **Contraseña:** la de hostinger.
4. Asegúrate de usar la **Collation:** `utf8mb4_unicode_ci` para compatibilidad total con Laravel.

## 2. Secretos de GitHub (CI/CD)

Para que el despliegue automático funcione, debes configurar los siguientes secretos en tu repositorio de GitHub (**Settings > Secrets and variables > Actions > New repository secret**):

| Secreto | Descripción | Ejemplo (según tu panel) |
|---------|-------------|---------|
| `FTP_SERVER` | Servidor FTP (Sin prefijos) | `31.170.167.107` (NO pongas `ftp://`) |
| `FTP_USERNAME` | Tu usuario FTP | `u174025152` |
| `FTP_PASSWORD` | Tu contraseña FTP | *(La que definas en Hostinger)* |

## 3. Variables de Entorno (.env)

Crea un archivo `.env` en la carpeta `/vecode` de tu servidor (puedes usar el Administrador de Archivos de Hostinger). Debe contener como mínimo:

```env
APP_NAME=VECODE
APP_ENV=production
APP_KEY=base64:SEzSW3CwwpjDsRj2HaxgkRSzk/AjCx29dxUrSbCpTmU=
APP_DEBUG=false
APP_URL=https://ceetpower.com/vecode
ASSET_URL=https://ceetpower.com/vecode

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=u174025152_vecode
DB_USERNAME=u174025152_admin
DB_PASSWORD=tu_contraseña_aqui

SESSION_DRIVER=file
CACHE_STORE=file
QUEUE_CONNECTION=sync
```

> [!IMPORTANT]
> Asegúrate de que `APP_URL` y `ASSET_URL` **no** terminen en barra diagonal `/`.

## 4. Enlace Simbólico de Storage

Como Hostinger compartido a veces no permite SSH, puedes crear el enlace simbólico usando un archivo PHP temporal:

1. Crea un archivo llamado `link.php` en `public_html/vecode/public/link.php`.
2. Pega el siguiente código:
   ```php
   <?php
   symlink('/home/u174025152/public_html/vecode/storage/app/public', '/home/u174025152/public_html/vecode/public/storage');
   echo "Enlace creado con éxito";
   ```
3. Ejecútalo visitando `https://ceetpower.com/vecode/public/link.php`.
4. **Borra el archivo** inmediatamente después.

## 5. Consideraciones Finales

- Los archivos `.htaccess` ya están configurados para que la aplicación funcione desde `/vecode`.
- Cada vez que hagas `push` a la rama `main`, GitHub Actions compilará los assets de Vite y subirá los cambios automáticamente. 
