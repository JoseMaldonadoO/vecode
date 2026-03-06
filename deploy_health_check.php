<?php
/**
 * Simple Deployment Health Check
 * Returns 200 OK if the app skeleton and database are responding.
 */

define("LARAVEL_START", microtime(true));

try {
    require __DIR__ . '/vendor/autoload.php';
    $app = require_once __DIR__ . '/bootstrap/app.php';

    $kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

    // Check DB connection
    \Illuminate\Support\Facades\DB::connection()->getPdo();

    header("Content-Type: application/json");
    echo json_encode([
        "status" => "success",
        "message" => "Deployment successful. System is healthy.",
        "timestamp" => date("Y-m-d H:i:s")
    ]);
} catch (Exception $e) {
    header("HTTP/1.1 500 Internal Server Error");
    header("Content-Type: application/json");
    echo json_encode([
        "status" => "error",
        "message" => "Health check failed: " . $e->getMessage()
    ]);
}
