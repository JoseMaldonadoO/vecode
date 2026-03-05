<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use App\Models\VesselOperatorTrip;

header('Content-Type: text/plain');

try {
    echo "Iniciando limpieza de viajes huérfanos (Muelle)...\n";

    // Find trips where operator or vessel no longer exists
    $orphans = VesselOperatorTrip::whereDoesntHave('operator')
        ->orWhereDoesntHave('vessel')
        ->get();

    $count = $orphans->count();
    echo "Se han encontrado {$count} registros huérfanos.\n";

    foreach ($orphans as $trip) {
        echo "Eliminando Viaje ID: {$trip->id} (Operador ID: {$trip->vessel_operator_id}, Barco ID: {$trip->vessel_id})\n";
        $trip->delete();
    }

    echo "\n✅ Limpieza completada con éxito. La página de Trips debería cargar ahora.\n";
    echo "\n[INFO] Por seguridad, borre este archivo (public/cleanup_orphaned_trips.php) después de usarlo.\n";

} catch (\Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
