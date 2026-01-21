# 🚀 Guía de Despliegue "Unicorn Level" - VECODE (Root Domain)

Esta guía detalla los pasos para el despliegue de la aplicación en Hostinger directamente en el dominio raíz `pro-agroindustria.com`.

## 1. Configuración de Base de Datos en Hostinger

1. Accede a tu **hPanel** de Hostinger.
2. Ve a **Bases de Datos** -> **Bases de Datos MySQL**.
3. Asegúrate de que la base de datos de producción esté configurada.
   - **Nombre de BD:** `u174025152_vecode` (Corroborar con credenciales reales).
   - **Usuario:** `u174025152_admin`.
   - **Collation:** `utf8mb4_unicode_ci`.

## 2. Secretos de GitHub (CI/CD)

Configura estos secretos en tu repositorio (**Settings > Secrets and variables > Actions**):

| Secreto | Descripción | Valor |
|---------|-------------|-------|
| `FTP_SERVER` | IP del Servidor | `31.170.167.107` |
| `FTP_USERNAME` | Usuario FTP | `u174025152` |
| `FTP_PASSWORD` | Contraseña FTP | *(Tu contraseña)* |

## 3. Variables de Entorno (.env)

El archivo `.env` en la raíz de `public_html` debe tener:

```env
APP_NAME=VECODE
APP_ENV=production
APP_KEY=base64:SEzSW3CwwpjDsRj2HaxgkRSzk/AjCx29dxUrSbCpTmU=
APP_DEBUG=false
APP_URL=https://pro-agroindustria.com
ASSET_URL=https://pro-agroindustria.com

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

## 4. Estrategia de Despliegue (Anti-Cache)

Para evitar problemas de caché agresivo en Hostinger/LiteSpeed, usamos una estrategia de **Artefactos Únicos**:

1.  **GitHub Actions:** Genera un zip con nombre único (`release_${run_number}.zip`) y lo sube.
2.  **Extractor Automático (`extract_debug.php`):**
    -   Este script reside en el servidor.
    -   Detecta el último zip subido.
    -   Descomprime y sobrescribe los archivos y assets.
    -   Limpia `opcache` y cachés de Laravel.

## 5. Mantenimiento y Enlaces

### Enlace Simbólico de Storage
Si las imágenes no cargan, regenera el symlink en la raíz:
1. Crea `link.php` en `public_html/public/link.php`:
   ```php
   <?php
   symlink('/home/u174025152/public_html/storage/app/public', '/home/u174025152/public_html/public/storage');
   echo "Enlace creado";
   ```
2. Ejecuta: `https://pro-agroindustria.com/public/link.php`
3. Borra el archivo.

---

## 🧪 Verificación
El sistema corre nativamente en `https://pro-agroindustria.com`.
Cualquier cambio a `main` dispara el proceso automático.
