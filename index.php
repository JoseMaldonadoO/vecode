<?php
/**
 * Laravel - Subfolder entry point proxy for Hostinger.
 */

// Fix path variables for subfolder hosting
$_SERVER['SCRIPT_NAME'] = '/VECODE/index.php';
$_SERVER['PHP_SELF'] = '/VECODE/index.php';

require_once __DIR__ . '/public/index.php';
