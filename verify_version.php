<?php
echo "<h2>Verificación de Despliegue</h2>";
echo "<p>Hora del servidor: " . date('Y-m-d H:i:s') . "</p>";

$file = __DIR__ . '/resources/js/Pages/Dock/Index.tsx';

if (file_exists($file)) {
    echo "<p>✅ El archivo Dock/Index.tsx existe.</p>";
    $content = file_get_contents($file);

    // Check for unique strings introduced in the refactor
    if (strpos($content, "viewMode") !== false) {
        echo "<p>✅ <b>CONFIRMADO:</b> El código contiene 'viewMode'. La actualización LLEGÓ al servidor.</p>";
    } else {
        echo "<p>❌ <b>ERROR:</b> El código NO contiene 'viewMode'. Estás viendo la versión ANTERIOR.</p>";
    }

    echo "<p>Primeras 20 líneas del archivo:</p>";
    echo "<pre>" . htmlspecialchars(substr($content, 0, 800)) . "</pre>";
} else {
    echo "<p>❌ El archivo no se encuentra en: $file</p>";
}

echo "<hr>";
echo "<h3>Verificación de Assets (Vite)</h3>";
$manifestPath = __DIR__ . '/public/build/manifest.json';
if (file_exists($manifestPath)) {
    echo "<p>✅ manifest.json encontrado.</p>";
    $manifest = json_decode(file_get_contents($manifestPath), true);
    echo "<pre>" . print_r($manifest, true) . "</pre>";
} else {
    echo "<p>❌ No se encuentra public/build/manifest.json</p>";
}
?>