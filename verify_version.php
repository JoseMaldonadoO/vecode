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
$buildDir = __DIR__ . '/public/build';

if (is_dir($buildDir)) {
    echo "<p>✅ Directorio public/build encontrado.</p>";
    $files = scandir($buildDir);
    echo "<ul>";
    foreach ($files as $f) {
        if ($f != "." && $f != "..") {
            echo "<li>$f (" . filesize($buildDir . '/' . $f) . " bytes)</li>";
        }
    }
    echo "</ul>";
} else {
    echo "<p>❌ No se encuentra el directorio public/build</p>";
}
?>