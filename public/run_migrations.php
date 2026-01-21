<?php

use Illuminate\Contracts\Console\Kernel;

require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';

$kernel = $app->make(Kernel::class);

echo "<html><body style='font-family: monospace; background: #1e1e1e; color: #d4d4d4; padding: 20px;'>";
echo "<h1>🚀 Database Migration Runner</h1>";
echo "<pre>";

try {
    $kernel->call('migrate', ['--force' => true]);
    echo $kernel->output();
    echo "\n<span style='color: #4ade80;'>SUCCESS: Migrations executed successfully.</span>";
} catch (\Exception $e) {
    echo "<span style='color: #ef4444;'>ERROR: " . $e->getMessage() . "</span>";
    echo "\n" . $e->getTraceAsString();
}

echo "</pre>";
echo "<p>⚠️ Please delete this file after use for security.</p>";
echo "</body></html>";
