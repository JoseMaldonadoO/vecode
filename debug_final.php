<?php
/**
 * Script de diagnóstico para VECODE.
 * Verifica la conexión a la base de datos y muestra los últimos errores de Laravel.
 */

// 1. Mostrar errores de PHP
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

echo "<h1>🔍 Diagnóstico VECODE</h1>";

// 2. Verificar carga de .env
echo "<h2>1. Entorno (.env)</h2>";
if (file_exists(__DIR__ . '/.env')) {
    echo "✅ Archivo .env encontrado.<br>";
    $env = parse_ini_file(__DIR__ . '/.env');
    echo "APP_URL: " . ($env['APP_URL'] ?? 'No definida') . "<br>";
    echo "DB_DATABASE: " . ($env['DB_DATABASE'] ?? 'No definida') . "<br>";
} else {
    echo "❌ Archivo .env NO encontrado en " . __DIR__ . "<br>";
}

// 3. Verificar Conexión a Base de Datos
echo "<h2>2. Base de Datos</h2>";
if (isset($env)) {
    try {
        $dsn = "mysql:host=" . ($env['DB_HOST'] ?? '127.0.0.1') . ";dbname=" . $env['DB_DATABASE'] . ";charset=utf8mb4";
        $pdo = new PDO($dsn, $env['DB_USERNAME'], $env['DB_PASSWORD'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
        ]);
        echo "✅ Conexión a la base de datos EXITOSA.<br>";
    } catch (Exception $e) {
        echo "❌ Error de conexión: " . $e->getMessage() . "<br>";
    }
}

// 4. Últimos Logs de Laravel (Buscando el mensaje Real)
echo "<h2>3. Últimos Errores (Laravel)</h2>";
$logFile = __DIR__ . '/storage/logs/laravel.log';
if (file_exists($logFile)) {
    $content = file_get_contents($logFile);
    // Buscamos los últimos bloques de error (que empiezan con [YYYY-MM-DD)
    preg_match_all('/\[\d{4}-\d{2}-\d{2}.*?\}.*?(?=\[\d{4}-\d{2}-\d{2}|$)/s', $content, $matches);
    $lastErrors = array_slice($matches[0], -3);

    if (!empty($lastErrors)) {
        foreach ($lastErrors as $err) {
            echo "<pre style='background: #ffeaea; padding: 10px; border: 1px solid #ffcccc; white-space: pre-wrap; word-wrap: break-word;'>";
            // Intentamos extraer solo el mensaje antes del stack trace si es muy largo
            if (preg_match('/^(\[.*?\] \w+\.ERROR: .*?)(?=\s+\#0)/s', $err, $msg)) {
                echo "<strong>" . htmlspecialchars($msg[1]) . "</strong>\n\n";
            }
            echo htmlspecialchars(substr($err, 0, 2000)) . "...</pre>";
        }
    } else {
        echo "No se encontraron bloques de error claros en el log.";
    }
} else {
    echo "❌ Archivo de log no encontrado.";
}

// 5. Permisos de carpetas críticas
echo "<h2>4. Permisos</h2>";
$folders = ['storage', 'bootstrap/cache', 'public/build'];
foreach ($folders as $f) {
    if (is_dir(__DIR__ . '/' . $f)) {
        echo "📁 $f: " . substr(sprintf('%o', fileperms(__DIR__ . '/' . $f)), -4) . " (" . (is_writable(__DIR__ . '/' . $f) ? 'Escribible' : 'NO escribible') . ")<br>";
    } else {
        echo "❌ Carpeta $f no encontrada.<br>";
    }
}

echo "<br><p>Elimina este archivo (debug_final.php) después de usarlo.</p>";
