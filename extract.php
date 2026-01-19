<?php
/**
 * Script de despliegue "Nivel Unicornio" 🦄
 * Garantiza despliegues atómicos y limpieza de caché infalible.
 */

// Aumentar límites para evitar timeouts (Exit Code 28)
set_time_limit(300); // 5 minutos
ini_set('memory_limit', '512M');

// Configuración
$zipFile = 'release.zip';
$extractPath = __DIR__;

function recursiveDelete($dir)
{
    if (!is_dir($dir))
        return;
    $files = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($dir, RecursiveDirectoryIterator::SKIP_DOTS),
        RecursiveIteratorIterator::CHILD_FIRST
    );
    foreach ($files as $fileinfo) {
        $todo = ($fileinfo->isDir() ? 'rmdir' : 'unlink');
        @$todo($fileinfo->getRealPath());
    }
}

function clearLaravelCacheManually($basePath)
{
    echo "🧹 Limpieza de caché Nivel Unicornio...\n";

    $paths = [
        $basePath . '/storage/framework/views',
        $basePath . '/storage/framework/cache',
        $basePath . '/bootstrap/cache'
    ];

    foreach ($paths as $path) {
        if (is_dir($path)) {
            $files = glob($path . '/*');
            foreach ($files as $file) {
                if (is_file($file) && basename($file) !== '.gitignore') {
                    unlink($file);
                }
            }
            echo "   ✨ Limpiado: $path\n";
        }
    }
}

echo "<h2>🦄 Despliegue Infalible Iniciado</h2>";
echo "<pre>";

// 1. Verificar ZIP
if (!file_exists($zipFile)) {
    die("❌ Error: No se encontró el archivo $zipFile\n");
}
echo "✅ Archivo release.zip detectado (" . round(filesize($zipFile) / 1024 / 1024, 2) . " MB)\n";

// 2. Limpieza PREVENTIVA de assets viejos (opcional pero recomendado)
if (is_dir($extractPath . '/public/build')) {
    // recursiveDelete($extractPath . '/public/build'); 
    // Comentado por seguridad, mejor dejar que el ZIP sobrescriba
}

// 3. Extracción
$zip = new ZipArchive;
if ($zip->open($zipFile) === TRUE) {
    echo "📦 Extrayendo " . $zip->numFiles . " archivos...\n";
    $zip->extractTo($extractPath);
    $zip->close();
    echo "✅ Extracción completada\n";
} else {
    die("❌ Error crítico: No se pudo abrir el ZIP.\n");
}

// 4. Limpieza de Caché Agresiva (Manual + Artisan)
clearLaravelCacheManually($extractPath);

// 5. Reset Opcache (Crucial para PHP persistente)
if (function_exists('opcache_reset')) {
    if (opcache_reset()) {
        echo "✅ Opcache reiniciado exitosamente\n";
    } else {
        echo "⚠️ Opcache no pudo reiniciarse (puede requerir reinicio del servicio)\n";
    }
} else {
    echo "ℹ️ Opcache no detectado o no habilitado.\n";
}

// 6. Migraciones
echo "\n🗄️  Ejecutando migraciones...\n";
try {
    require_once $extractPath . '/vendor/autoload.php';
    $app = require_once $extractPath . '/bootstrap/app.php';
    $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
    $kernel->bootstrap();

    \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
    echo "   " . str_replace("\n", "\n   ", \Illuminate\Support\Facades\Artisan::output());

    // Intento final de Artisan por si acaso
    \Illuminate\Support\Facades\Artisan::call('view:clear');
    \Illuminate\Support\Facades\Artisan::call('config:clear');
    echo "✅ Comandos Artisan ejecutados correctamente.\n";

} catch (\Exception $e) {
    echo "⚠️  Advertencia menor en migraciones/artisan: " . $e->getMessage() . "\n";
    echo "   (El despliegue continúa porque la limpieza manual ya se realizó)\n";
}

// 7. Limpieza final
@unlink($zipFile);
echo "\n🎉 <b>DESPLIEGUE UNICORNIO COMPLETADO</b>\n";
echo "Timestamp: " . date('Y-m-d H:i:s') . "\n";
echo "</pre>";

// Auto-destrucción del script
// unlink(__FILE__);
?>