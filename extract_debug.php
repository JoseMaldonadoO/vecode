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

// 1. Verificar Entorno
logMsg("Iniciando script extract_debug.php");
logMsg("Directorio actual: " . __DIR__);
logMsg("Usuario: " . get_current_user());
logMsg("Permisos de directorio: " . substr(sprintf('%o', fileperms(__DIR__)), -4));

// 2. Verificar ZIP
$zipFile = 'release.zip';
if (!file_exists($zipFile)) {
    logMsg("ERROR CRITICO: No existe $zipFile en " . __DIR__);
    die("Error: No zip found.");
}
logMsg("Archivo $zipFile encontrado. Tamaño: " . filesize($zipFile) . " bytes");

// 3. Verificar Extensión Zip
if (!class_exists('ZipArchive')) {
    logMsg("ERROR CRITICO: Clase ZipArchive no disponible en PHP.");
    die("Error: No ZipArchive.");
}

// 4. Intentar Extracción
$zip = new ZipArchive;
$res = $zip->open($zipFile);

if ($res === TRUE) {
    logMsg("ZIP abierto correctamente.");
    
    // Intentar extraer
    try {
        $extracted = $zip->extractTo(__DIR__);
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
        if (file_exists(__DIR__ . '/vendor/autoload.php')) {
            require __DIR__ . '/vendor/autoload.php';
            $app = require_once __DIR__ . '/bootstrap/app.php';
            $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
            $kernel->bootstrap();

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
