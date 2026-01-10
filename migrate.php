<?php
/**
 * Script robusto para configurar la base de datos de VECODE en Hostinger.
 */

// 1. Cargamos el núcleo de Laravel (sólo consola)
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';

use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\Artisan;

// Arrancamos el entorno de comandos
$app->make(Kernel::class)->bootstrap();

echo "<h1>🚀 Configurando Base de Datos VECODE</h1>";
echo "<pre>";

try {
    echo "Paso 1: Limpiando y creando tablas...\n";
    $exit1 = Artisan::call('migrate:fresh', ['--force' => true]);
    echo Artisan::output();

    echo "\nPaso 2: Creando datos iniciales (Admin, Clientes, etc.)...\n";
    $exit2 = Artisan::call('db:seed', ['--force' => true]);
    echo Artisan::output();

    if ($exit1 === 0 && $exit2 === 0) {
        echo "\n✅ ¡PROCESO EXITOSO!";
        echo "\nYa puedes loguear con: admin@vecode.com / password";
    } else {
        echo "\n⚠️ El proceso terminó con advertencias. Revisa los mensajes de arriba.";
    }
} catch (Exception $e) {
    echo "\n❌ ERROR CRÍTICO:\n" . $e->getMessage();
}

echo "</pre>";
?>