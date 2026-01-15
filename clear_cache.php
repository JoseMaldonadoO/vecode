<?php
// clear_cache.php - Clear Laravel caches via web request

define('LARAVEL_START', microtime(true));

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

$kernel->bootstrap();

echo "<h1>Clearing Application Cache...</h1>";

echo "<pre>";

try {
    echo "Running optimize:clear...\n";
    \Illuminate\Support\Facades\Artisan::call('optimize:clear');
    echo \Illuminate\Support\Facades\Artisan::output();

    echo "\nRunning config:clear...\n";
    \Illuminate\Support\Facades\Artisan::call('config:clear');
    echo \Illuminate\Support\Facades\Artisan::output();

    echo "\nRunning cache:clear...\n";
    \Illuminate\Support\Facades\Artisan::call('cache:clear');
    echo \Illuminate\Support\Facades\Artisan::output();

    echo "</pre>";
    echo "<h2 style='color: green;'>Cache Cleared Successfully!</h2>";

} catch (\Exception $e) {
    echo "</pre>";
    echo "<h2 style='color: red;'>Error: " . $e->getMessage() . "</h2>";
}
