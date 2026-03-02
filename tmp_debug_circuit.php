<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Vessel;
use App\Models\LoadingOrder;

$vessel = Vessel::where('name', 'like', '%FSD%')->first();
if (!$vessel) {
    echo "Buque FSD no encontrado\n";
    exit;
}

echo "Vessel: {$vessel->name} (ID: {$vessel->id})\n";

// Scale
$scaleItems = LoadingOrder::where('vessel_id', $vessel->id)
    ->where(function ($q) {
        $q->whereNull('operation_type')->orWhere('operation_type', 'scale');
    })
    ->whereIn('status', ['authorized', 'weighing_in', 'loading', 'weighing_out'])
    ->get(['id', 'folio', 'status', 'economic_number', 'operator_name']);

echo "Standard Scale Items in Circuit:\n";
foreach ($scaleItems as $item) {
    echo "- Folio: {$item->folio}, Status: {$item->status}, Unit: {$item->economic_number}, Op: {$item->operator_name}\n";
}

// Burreo
$burreoUnits = LoadingOrder::where('vessel_id', $vessel->id)
    ->where('operation_type', 'burreo')
    ->whereNotNull('economic_number')
    ->where('economic_number', '!=', '')
    ->whereIn('status', ['weighing_in', 'loading', 'weighing_out', 'completed'])
    ->distinct()
    ->pluck('economic_number');

echo "\nBurreo Units in Circuit:\n";
foreach ($burreoUnits as $unit) {
    echo "- Unit: $unit\n";
}
