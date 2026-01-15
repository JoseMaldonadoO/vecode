<?php
/**
 * Script de extracción para despliegue rápido.
 * Este script descomprime un archivo .zip en el directorio actual.
 */

// Seguridad básica: Solo permitir si existe el archivo release.zip
$zipFile = 'release.zip';

if (!file_exists($zipFile)) {
    die("Error: No se encontró el archivo $zipFile para extraer.");
}

$zip = new ZipArchive;
if ($zip->open($zipFile) === TRUE) {
    $zip->extractTo(__DIR__);
    // ... (After extraction loop)
    $zip->close();
    echo "Extracción completada. <br>";

    // Auto-migrate Logic
    echo "Ejecutando migraciones automáticas...<br>";
    try {
        // Bootstrap Laravel
        require __DIR__ . '/vendor/autoload.php';
        $app = require_once __DIR__ . '/bootstrap/app.php';
        $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
        $kernel->bootstrap();

        // Run Migration
        \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
        echo nl2br(\Illuminate\Support\Facades\Artisan::output());

        // Optional: Run specific seeders if critical
        // \Illuminate\Support\Facades\Artisan::call('db:seed', ['--class' => 'RolesAndPermissionsSeeder', '--force' => true]);

        echo "<br><b>Migraciones finalizadas correctamente.</b><br>";
    } catch (\Exception $e) {
        echo "<br><b>Error en migraciones:</b> " . $e->getMessage() . "<br>";
    }

    // Auto-limpieza
    unlink($zipFile);
    echo "Archivo $zipFile eliminado por seguridad.";

} else {
    echo "Error: No se pudo abrir el archivo $zipFile.";
}
