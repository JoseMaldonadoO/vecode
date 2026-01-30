<?php
/**
 * Script mejorado para corregir permisos en Hostinger.
 * Hostinger da error 500 si los archivos tienen permisos incorrectos.
 * Este script pone 755 a carpetas y 644 a archivos.
 */

echo "<h2>🔧 Corrigiendo permisos</h2>";
echo "<pre>";

$startTime = microtime(true);
$dirCount = 0;
$fileCount = 0;

function fixPermissions($path, &$dirCount, &$fileCount)
{
    $dir = new RecursiveDirectoryIterator($path, RecursiveDirectoryIterator::SKIP_DOTS);
    $items = new RecursiveIteratorIterator($dir, RecursiveIteratorIterator::SELF_FIRST);

    foreach ($items as $item) {
        try {
            if ($item->isDir()) {
                chmod($item, 0755);
                $dirCount++;
            } else {
                chmod($item, 0644);
                $fileCount++;
            }
        } catch (Exception $e) {
            echo "⚠️  Error en: " . $item->getPathname() . "\n";
        }
    }
}

echo "Procesando archivos...\n";
fixPermissions(__DIR__, $dirCount, $fileCount);

$elapsed = round(microtime(true) - $startTime, 2);

echo "\n✅ Permisos corregidos:\n";
echo "  - Carpetas (755): $dirCount\n";
echo "  - Archivos (644): $fileCount\n";
echo "  - Tiempo: {$elapsed}s\n";

echo "</pre>";
echo "<p><small>Script completado. Timestamp: " . date('Y-m-d H:i:s') . "</small></p>";

// Auto-eliminación comentada para debugging
// unlink(__FILE__);
