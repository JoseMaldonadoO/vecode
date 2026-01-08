<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', [\App\Http\Controllers\DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('/dock/scan', [\App\Http\Controllers\DockController::class, 'scanQr'])->name('dock.scan');
    Route::post('/dock/scan', [\App\Http\Controllers\DockController::class, 'processQr'])->name('dock.process');
    Route::get('/dock/vessel', [\App\Http\Controllers\DockController::class, 'createVessel'])->name('dock.vessel.create');
    Route::post('/dock/vessel', [\App\Http\Controllers\DockController::class, 'storeVessel'])->name('dock.vessel.store');
    Route::resource('dock', \App\Http\Controllers\DockController::class)->only(['index']);

    // Documents / Printing
    Route::get('/documents/ticket/{id}', [\App\Http\Controllers\DocumentsController::class, 'printTicket'])->name('documents.ticket');
    Route::get('/documents/cp/{id}', [\App\Http\Controllers\DocumentsController::class, 'printBillOfLading'])->name('documents.cp');

    Route::resource('sales', \App\Http\Controllers\SalesController::class);
    Route::resource('traffic', \App\Http\Controllers\TrafficController::class);
    Route::resource('surveillance', \App\Http\Controllers\SurveillanceController::class)->only(['index', 'store']);
    Route::resource('scale', \App\Http\Controllers\WeightTicketController::class);
});

require __DIR__.'/auth.php';
