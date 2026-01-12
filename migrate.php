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
echo "<p>
    <a href='?step=migrate'>[Paso 1: Ejecutar Migraciones]</a> | 
    <a href='?step=seed'>[Paso 2: Insertar Todo (Seeders)]</a> | 
    <a href='?step=seed_admin'>[Paso 3: Solo Crear Admin (Manual)]</a>
</p>";
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
    } elseif ($step === 'seed_admin') {
        echo "⏳ Creando usuario administrador manualmente...\n";
        $exists = DB::table('users')->where('email', 'admin@vecode.com')->exists();
        if ($exists) {
            echo "⚠️ El usuario admin@vecode.com ya existe.\n";
        } else {
            DB::table('users')->insert([
                'name' => 'Admin VECODE',
                'email' => 'admin@vecode.com',
                'password' => password_hash('password', PASSWORD_BCRYPT),
                'role_id' => 1,
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ]);
            echo "✅ Usuario admin@vecode.com CREADO EXITOSAMENTE.\n";
        }
    } else {
        echo "Selecciona un paso para comenzar.";
    }

    // Verificación final
    $adminCount = DB::table('users')->where('email', 'admin@vecode.com')->count();
    echo "\n\n🔍 Estado Final: " . ($adminCount > 0 ? "✅ Usuario admin@vecode.com LISTO." : "⚠️ No hay usuario administrador.");

} catch (Exception $e) {
    echo "\n❌ ERROR CRÍTICO:\n" . $e->getMessage();
    echo "\nLínea: " . $e->getLine() . " en " . $e->getFile();
}

echo "</pre>";
?>