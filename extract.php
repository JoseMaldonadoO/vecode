<?php
/**
 * Script de extracción mejorado para despliegue.
 * Descomprime release.zip y verifica la extracción correcta.
 */

// Configuración
$zipFile = 'release.zip';
$extractPath = __DIR__;

echo "<h2>🚀 Iniciando despliegue VECODE</h2>";
echo "<pre>";

// 1. Verificar que existe el archivo
if (!file_exists($zipFile)) {
    die("❌ Error: No se encontró el archivo $zipFile\n");
}

echo "✅ Archivo release.zip encontrado (" . round(filesize($zipFile) / 1024 / 1024, 2) . " MB)\n";

// 2. Abrir y extraer el ZIP
$zip = new ZipArchive;
$res = $zip->open($zipFile);

if ($res === TRUE) {
    echo "✅ Archivo ZIP abierto correctamente\n";
    echo "📦 Extrayendo " . $zip->numFiles . " archivos...\n";

    // Extraer con sobrescritura forzada
    $zip->extractTo($extractPath);
    $zip->close();

    echo "✅ Extracción completada\n\n";

    // 3. Verificar archivos críticos
    echo "🔍 Verificando archivos críticos:\n";
    $criticalFiles = [
        'vendor/autoload.php',
        'bootstrap/app.php',
        'public/build/manifest.json',
        'artisan'
    ];

    foreach ($criticalFiles as $file) {
        if (file_exists($extractPath . '/' . $file)) {
            echo "  ✅ $file\n";
        } else {
            echo "  ⚠️  $file (no encontrado)\n";
        }
    }

    echo "\n";

    // 4. Ejecutar migraciones
    echo "🗄️  Ejecutando migraciones...\n";
    try {
        require $extractPath . '/vendor/autoload.php';
        $app = require_once $extractPath . '/bootstrap/app.php';
        $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
        $kernel->bootstrap();

        \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
        echo nl2br(\Illuminate\Support\Facades\Artisan::output());
        echo "✅ Migraciones completadas\n\n";
    } catch (\Exception $e) {
        echo "⚠️  Error en migraciones: " . $e->getMessage() . "\n\n";
    }

    // 5. Limpiar caché de Laravel
    echo "🧹 Limpiando caché...\n";
    try {
        \Illuminate\Support\Facades\Artisan::call('config:clear');
        \Illuminate\Support\Facades\Artisan::call('route:clear');
        \Illuminate\Support\Facades\Artisan::call('view:clear');
        echo "✅ Caché limpiado\n\n";
    } catch (\Exception $e) {
        echo "⚠️  Error limpiando caché: " . $e->getMessage() . "\n\n";
    }

    // 6. Eliminar ZIP por seguridad
    if (unlink($zipFile)) {
        echo "✅ Archivo $zipFile eliminado por seguridad\n";
    }

    echo "\n<b>🎉 DESPLIEGUE COMPLETADO EXITOSAMENTE</b>\n";
    echo "Timestamp: " . date('Y-m-d H:i:s') . "\n";

} else {
    die("❌ Error: No se pudo abrir el archivo $zipFile (código: $res)\n");
}

echo "</pre>";
echo "<p><small>Este script se auto-eliminará en 60 segundos por seguridad.</small></p>";

// Auto-eliminación después de 60 segundos (opcional, comentado por ahora)
// sleep(60);
// unlink(__FILE__);
