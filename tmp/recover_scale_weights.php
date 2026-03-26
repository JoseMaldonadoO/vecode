<?php
// Correct paths from the tmp directory
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\VesselOperatorTrip;

echo "Iniciando recuperación de pesos para procesos de Báscula...\n";

$trips = VesselOperatorTrip::whereHas('loading_order', function($q) {
    $q->where('operation_type', 'scale');
})->get();

$recoveredCount = 0;
foreach($trips as $trip) {
    $ticket = $trip->loading_order->weight_ticket;
    if ($ticket && $ticket->net_weight > 0) {
        $originalWeight = $ticket->net_weight / 1000;
        
        if ($trip->weight != $originalWeight) {
             $trip->update(['weight' => $originalWeight]);
             $recoveredCount++;
             echo "Trip #{$trip->id}: Restaurado a {$originalWeight} TM (Antes: {$trip->weight} TM)\n";
        }
    }
}

echo "\nRecuperación finalizada: $recoveredCount registros restaurados.\n";
