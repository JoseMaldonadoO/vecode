<?php
/**
 * Script de verificación de despliegue
 * Timestamp: <?php echo date('Y-m-d H:i:s'); ?>
 */

echo "<!DOCTYPE html>";
echo "<html><head><title>Verificación de Despliegue</title></head><body>";
echo "<h1>✅ Despliegue Verificado</h1>";
echo "<p><strong>Timestamp:</strong> " . date('Y-m-d H:i:s') . "</p>";
echo "<p><strong>Archivo:</strong> deployment_verification.php</p>";
echo "<p>Si puedes ver este mensaje, significa que los archivos PHP se están desplegando correctamente.</p>";
echo "</body></html>";
