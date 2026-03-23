<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class SandboxController extends Controller
{
    /**
     * Display the sandbox index page.
     */
    public function index(Request $request)
    {
        return Inertia::render('Sandbox/Index', [
            'message' => '¡Bienvenido al entorno de pruebas (Sandbox)!'
        ]);
    }

    // Add more test methods here...
}
