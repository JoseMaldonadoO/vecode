<?php

use App\Models\ShipmentOrder;
use App\Models\Product;

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "--- Recent Orders (Top 10) ---\n";
$orders = ShipmentOrder::orderBy('created_at', 'desc')->limit(10)->get();
foreach ($orders as $o) {
    echo "Folio: {$o->folio}, Product: '{$o->product}', Consigned: '{$o->consigned_to}'\n";
}

echo "\n--- Recent Products (Top 10) ---\n";
$products = Product::orderBy('created_at', 'desc')->limit(10)->get();
foreach ($products as $p) {
    echo "ID: {$p->id}, Name: '{$p->name}'\n";
}
