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
    $zip->close();

    // Auto-limpieza (Opcional, pero recomendado por seguridad)
    unlink($zipFile);

    echo "Extracción completada con éxito. El archivo $zipFile ha sido procesado.";
} else {
    echo "Error: No se pudo abrir el archivo $zipFile.";
}
