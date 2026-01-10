<?php
/**
 * Laravel - A PHP Framework For Web Artisans
 *
 * @package  Laravel
 * @author   Taylor Otwell <taylor@laravel.com>
 * 
 * Proxy para despliegue en subcarpetas de Hostinger.
 */

$uri = urldecode(
    parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH)
);

// Quitamos el prefijo de la subcarpeta si existe para que file_exists funcione bien
$publicUri = str_replace('/VECODE', '', $uri);

if ($publicUri !== '/' && file_exists(__DIR__ . '/public' . $publicUri)) {
    return false;
}

require_once __DIR__ . '/public/index.php';
