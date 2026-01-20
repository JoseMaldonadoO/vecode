<?php
/**
 * Script de Extracción con Debugging
 * Escribe en deploy_debug_log.txt
 */

$logFile = 'deploy_debug_log.txt';

function logMsg($msg) {
    global $logFile;
    $date = date('Y-m-d H:i:s');
    file_put_contents($logFile, "[$date] $msg" . PHP_EOL, FILE_APPEND);
    echo "$msg<br>";
}

// Limpiar log anterior
file_put_contents($logFile, "--- INICIO DEL DESPLIEGUE ---" . PHP_EOL);

// 2. Verificar ZIP (Buscar en el directorio PADRE porque estamos en public/)
// El script ahora corre en /public/extract_debug.php, pero el zip está en / (root)
$zipFiles = glob(__DIR__ . '/../release_*.zip');

if (empty($zipFiles)) {
    // Fallback checking current dir just in case
    $zipFiles = glob(__DIR__ . '/release_*.zip');
}

if (empty($zipFiles)) {
    // Fallback hardcoded
    if (file_exists(__DIR__ . '/../release.zip')) {
        $zipFile = __DIR__ . '/../release.zip';
    } else {
        logMsg("ERROR CRITICO: No se encontró ningún archivo release_*.zip en ../ ni en ./");
        logMsg("Contenido de ../ : " . implode(", ", scandir(__DIR__ . '/../')));
        die("Error: No zip found. Files in root: " . implode(", ", scandir(__DIR__ . '/../')));
    }
} else {
    $zipFile = $zipFiles[0];
}

logMsg("Archivo ZIP detectado: $zipFile. Tamaño: " . filesize($zipFile) . " bytes");

// 3. Verificar Extensión Zip
if (!class_exists('ZipArchive')) {
    logMsg("ERROR CRITICO: Clase ZipArchive no disponible en PHP.");
    die("Error: No ZipArchive.");
}

// 3.5 Limpieza Previa
if (function_exists('opcache_reset')) {
    opcache_reset();
    logMsg("Opcache reseteado.");
}

if (file_exists(__DIR__ . '/build/manifest.json')) {
    unlink(__DIR__ . '/build/manifest.json');
    logMsg("Manifest anterior eliminado.");
}

// 4. Intentar Extracción
$zip = new ZipArchive;
$res = $zip->open($zipFile);

if ($res === TRUE) {
    logMsg("ZIP abierto correctamente.");
    
    // Intentar extraer al directorio PADRE (ROOT)
    try {
        $targetDir = dirname(__DIR__); // Sube un nivel
        logMsg("Extrayendo en: $targetDir");
        $extracted = $zip->extractTo($targetDir);
        if ($extracted) {
            logMsg("Extracción reportada como EXITOSA.");
        } else {
            logMsg("ERROR: $zip->extractTo devolvió FALSE.");
        }
    } catch (Exception $e) {
        logMsg("EXCEPCION al extraer: " . $e->getMessage());
    }
    
    $zip->close();
    
    // 5. Post-Verificación (Checar si un archivo clave se actualizó)
    // Ejemplo: Sidebar.tsx fecha de modificación
    // Como es JS compilado, checamos public/build/manifest.webmanifest
    if(file_exists('public/build/manifest.webmanifest')) {
       logMsg("Manifest timestamp: " . date("Y-m-d H:i:s", filemtime('public/build/manifest.webmanifest')));
    }

    // 6. LIMPIEZA DE CACHÉ LARAVEL (CRITICO PARA ACTUALIZACION UI)
    logMsg("Intentando limpiar caché de Laravel...");
    try {
        // NUKE MANUAL DE CACHÉ DE BOOTSTRAP (Vital si config.php tiene rutas viejas)
        $bootstrapCache = glob(__DIR__ . '/bootstrap/cache/*.php');
        foreach ($bootstrapCache as $file) {
            if(is_file($file)) {
                unlink($file);
                logMsg("🗑️ Cache eliminado: " . basename($file));
            }
        }

        if (file_exists(__DIR__ . '/vendor/autoload.php')) {
            require __DIR__ . '/vendor/autoload.php';
            $app = require_once __DIR__ . '/bootstrap/app.php';
            $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
            $kernel->bootstrap();

            // REPARAR ESTRUCTURA DE DIRECTORIOS (Prevent 'View path not found')
            $storagePaths = [
                __DIR__ . '/storage/framework/views',
                __DIR__ . '/storage/framework/cache',
                __DIR__ . '/storage/framework/sessions',
                __DIR__ . '/storage/logs',
                __DIR__ . '/bootstrap/cache',
            ];

            foreach ($storagePaths as $path) {
                if (!file_exists($path)) {
                    mkdir($path, 0755, true);
                    logMsg("Directorio creado: $path");
                }
                chmod($path, 0755); // Asegurar permisos escribibles
            }

            \Illuminate\Support\Facades\Artisan::call('view:clear');
            logMsg("✅ View Clear: " . trim(\Illuminate\Support\Facades\Artisan::output()));
            
            \Illuminate\Support\Facades\Artisan::call('optimize:clear');
            logMsg("✅ Optimize Clear: " . trim(\Illuminate\Support\Facades\Artisan::output()));
        } else {
            logMsg("⚠️ No se encontró vendor/autoload.php. Omitiendo limpieza de caché.");
        }
    } catch (Exception $e) {
        logMsg("❌ Error al limpiar caché: " . $e->getMessage());
    }

    logMsg("Auto-eliminando ZIP...");
    if(unlink($zipFile)) {
        logMsg("ZIP eliminado.");
    } else {
        logMsg("No se pudo eliminar el ZIP.");
    }

} else {
    logMsg("ERROR al abrir ZIP. Código: $res");
}

logMsg("--- FIN DEL PROCESO ---");
?>
