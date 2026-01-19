<?php
echo "<h2>🧹 Limpieza Manual de Caché</h2>";

function clearFolder($path)
{
    if (!is_dir($path)) {
        echo "❌ Carpeta no encontrada: $path<br>";
        return;
    }

    $files = glob($path . '/*');
    $count = 0;
    foreach ($files as $file) {
        if (is_file($file) && basename($file) !== '.gitignore') {
            unlink($file);
            $count++;
        }
    }
    echo "✅ Limpiados $count archivos en: $path<br>";
}

$baseDir = __DIR__;

// 1. Limpiar View Cache (CRÍTICO para ver cambios de Vite)
clearFolder($baseDir . '/storage/framework/views');

// 2. Limpiar Config Cache (Importante para cambios de .env o config)
clearFolder($baseDir . '/bootstrap/cache');

// 3. Intentar artisan vía exec como respaldo
echo "<hr>";
echo "Intentando 'php artisan optimize:clear' via exec...<br>";
try {
    $output = shell_exec('php artisan optimize:clear 2>&1');
    echo "<pre>$output</pre>";
} catch (Exception $e) {
    echo "Exec falló: " . $e->getMessage();
}

echo "<h3>🎉 Proceso finalizado. Por favor recarga tu aplicación ahora.</h3>";
?>