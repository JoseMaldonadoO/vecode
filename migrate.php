<?php
/**
 * Script robusto de configuración de VECODE para Hostinger.
 */

// Aumentar límites para evitar timeouts
ini_set('memory_limit', '512M');
set_time_limit(300);

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';

use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;

$app->make(Kernel::class)->bootstrap();

echo "<h1>🛠️ VECODE: Configuración de Servidor</h1>";
echo "<p><a href='?step=migrate'>[Paso 1: Ejecutar Migraciones]</a> | <a href='?step=seed'>[Paso 2: Insertar Datos / Admin]</a></p>";
echo "<hr><pre>";

$step = $_GET['step'] ?? null;

try {
    if ($step === 'migrate') {
        echo "⏳ Ejecutando: php artisan migrate:fresh --force\n";
        $exit = Artisan::call('migrate:fresh', ['--force' => true]);
        echo Artisan::output();
        echo "\n" . ($exit === 0 ? "✅ Migración completada." : "❌ Error en migración ($exit)");
    } elseif ($step === 'seed') {
        echo "⏳ Ejecutando: php artisan db:seed --force\n";
        $exit = Artisan::call('db:seed', ['--force' => true]);
        echo Artisan::output();
        echo "\n" . ($exit === 0 ? "✅ Datos insertados correctamente." : "❌ Error en seeders ($exit)");

        // Verificar admin
        $adminCount = DB::table('users')->where('email', 'admin@vecode.com')->count();
        echo "\n\n🔍 Verificación: " . ($adminCount > 0 ? "✅ Usuario admin@vecode.com LISTO." : "⚠️ El usuario admin no se creó.");
    } else {
        echo "Selecciona un paso para comenzar.";
    }
} catch (Exception $e) {
    echo "\n❌ ERROR CRÍTICO:\n" . $e->getMessage();
}

echo "</pre>";
?>