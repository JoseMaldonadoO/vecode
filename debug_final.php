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

        // Verificar tablas y usuarios
        $stmt = $pdo->query("SHOW TABLES LIKE 'users'");
        if ($stmt->rowCount() > 0) {
            $userCount = $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
            echo "✅ Tabla 'users' encontrada ($userCount usuarios).<br>";
            if ($userCount > 0) {
                $admin = $pdo->query("SELECT email FROM users WHERE email = 'admin@vecode.com'")->fetch();
                echo ($admin ? "👤 Usuario 'admin@vecode.com' existe." : "⚠️ Usuario admin NO encontrado.") . "<br>";
            }
        } else {
            echo "❌ Tabla 'users' NO encontrada. ¡Faltan las migraciones!<br>";
            echo "<h1>🚀 Ejecutando Migraciones...</h1>";
            echo "<pre>";

            // Forzar errores visibles
            ini_set('display_errors', 1);
            error_reporting(E_ALL);
            // config(['app.debug' => true]); // This line requires Laravel's config() helper, which is not available in a standalone PHP script.

            try {
                echo "Iniciando comando...\n";
                // Intentamos migrar sin borrar (por si ya hay tablas)
                // Artisan::call() requires Laravel's Artisan facade, which is not available in a standalone PHP script.
                // This section would need to be run within a Laravel context.
                echo "⚠️ Esta sección requiere el entorno de Laravel para ejecutar Artisan::call().\n";
                echo "Si estás en un entorno Laravel, asegúrate de que este script se ejecute dentro de él.\n";

                // Example of what would happen if Artisan was available:
                // $exitCode = Artisan::call('migrate', [
                //     '--force' => true
                // ]);
                // echo "📌 Migración básica: " . ($exitCode == 0 ? "OK" : "Error $exitCode") . "\n";
                // echo Artisan::output() . "\n";

                // echo "Intentando Seeders...\n";
                // $exitCodeSeed = Artisan::call('db:seed', [
                //     '--force' => true
                // ]);
                // echo "📌 Seeders: " . ($exitCodeSeed == 0 ? "OK" : "Error $exitCodeSeed") . "\n";
                // echo Artisan::output() . "\n";

                echo "\n✨ Proceso finalizado (simulado si no hay Laravel).";
            } catch (Exception $e) {
                echo "❌ ERROR FATAL:\n" . $e->getMessage() . "\n";
                echo "En archivo: " . $e->getFile() . " (Línea " . $e->getLine() . ")\n";
                echo "\nTrace:\n" . substr($e->getTraceAsString(), 0, 500) . "...";
            }
            echo "</pre>";
        }
    } catch (Exception $e) {
        echo "❌ Error de conexión: " . $e->getMessage() . "<br>";
    }
}

// 4. Últimos Logs de Laravel (Súper Debugger)
echo "<h2>3. Últimos Errores (Laravel)</h2>";
$logFile = __DIR__ . '/storage/logs/laravel.log';
if (file_exists($logFile)) {
    $logContent = file_get_contents($logFile);
    // Buscamos el último objeto JSON en el log (desde el último { hasta el final del archivo o el siguiente { )
    $lastBrace = strrpos($logContent, '{');
    if ($lastBrace !== false) {
        $jsonCandidate = substr($logContent, $lastBrace);
        // Intentamos cerrar el JSON si está truncado
        if (substr($jsonCandidate, -1) !== '}') {
            $jsonCandidate .= '"}';
        }

        $data = json_decode($jsonCandidate, true);
        if ($data) {
            echo "<pre style='background: #ffeaea; padding: 15px; border: 2px solid #ff0000; white-space: pre-wrap;'>";
            echo "<h3 style='margin-top:0;'>🚨 ERROR DETECTADO:</h3>";
            echo "<strong>MENSAJE: " . htmlspecialchars($data['message'] ?? 'Sin mensaje') . "</strong>\n";
            echo "EXCEPCIÓN: " . htmlspecialchars($data['exception'] ?? 'N/A') . "\n";
            echo "ARCHIVO: " . htmlspecialchars($data['file'] ?? 'N/A') . " (Línea " . ($data['line'] ?? '?') . ")\n";
            echo "\n--- STACK TRACE RESUMIDO ---\n";
            echo htmlspecialchars(substr($data['trace_string'] ?? 'N/A', 0, 1000)) . "...";
            echo "</pre>";
        } else {
            echo "Se encontró contenido JSON pero no se pudo decodificar. Mostrando final del log:<br>";
            echo "<pre>" . htmlspecialchars(substr($logContent, -1000)) . "</pre>";
        }
    } else {
        echo "No se encontró rastro de errores JSON. Mostrando final del log:<br>";
        echo "<pre>" . htmlspecialchars(substr($logContent, -1000)) . "</pre>";
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
