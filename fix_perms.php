<?php
/**
 * Script para corregir permisos en Hostinger.
 * Hostinger da error 500 si los archivos tienen permisos 777.
 * Este script pone 755 a carpetas y 644 a archivos.
 */

function fixPermissions($path)
{
    $dir = new RecursiveDirectoryIterator($path, RecursiveDirectoryIterator::SKIP_DOTS);
    $items = new RecursiveIteratorIterator($dir, RecursiveIteratorIterator::SELF_FIRST);

    foreach ($items as $item) {
        if ($item->isDir()) {
            chmod($item, 0755);
        } else {
            chmod($item, 0644);
        }
    }
}

fixPermissions(__DIR__);
echo "Permisos corregidos: Carpetas 755, Archivos 644.";
unlink(__FILE__); // Auto-eliminación por seguridad
