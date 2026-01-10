<?php
/**
 * Script para ejecutar migraciones de Laravel en Hostinger (sin SSH).
 */

use Illuminate\Support\Facades\Artisan;

// 1. Cargar el núcleo de Laravel
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$kernel->handle(Illuminate\Http\Request::capture());

echo "<h1>🚀 Ejecutando Migraciones y Seeders...</h1>";
echo "<pre>";

try {
    // IMPORTANTE: Esto borrará los datos actuales y creará las tablas de cero con el usuario admin.
    Artisan::call('migrate:fresh', [
        '--seed' => true,
        '--force' => true
    ]);

    echo "✅ Resultado:\n" . Artisan::output();
    echo "\n\n✨ ¡Proceso completado con éxito!";
    echo "\nAhora puedes intentar loguear con admin@vecode.com / password";
} catch (Exception $e) {
    echo "❌ ERROR:\n" . $e->getMessage();
}

echo "</pre>";
?>