<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\Schema;

$tables = ['loading_orders', 'weight_tickets'];
foreach ($tables as $table) {
    echo "Table: $table\n";
    print_r(Schema::getColumnListing($table));
    echo "\n";
}
