<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::get('/dashboard', [\App\Http\Controllers\DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');


    Route::get('/dock/vessel', [\App\Http\Controllers\DockController::class, 'createVessel'])->name('dock.vessel.create');
    Route::post('/dock/vessel', [\App\Http\Controllers\DockController::class, 'storeVessel'])->name('dock.vessel.store');

    Route::resource('dock', \App\Http\Controllers\DockController::class)->only(['index']);

    // Documents / Printing
    Route::get('/documents/ticket/{id}', [\App\Http\Controllers\DocumentsController::class, 'printTicket'])->name('documents.ticket');
    Route::get('/documents/cp/{id}', [\App\Http\Controllers\DocumentsController::class, 'printBillOfLading'])->name('documents.cp');

    Route::get('/sales/{id}/print', [\App\Http\Controllers\SalesController::class, 'print'])->name('sales.print');
    Route::patch('/sales/{id}/toggle-status', [\App\Http\Controllers\SalesController::class, 'toggleStatus'])->name('sales.toggle-status');
    Route::resource('sales', \App\Http\Controllers\SalesController::class);
    Route::post('/clients', [\App\Http\Controllers\ClientController::class, 'store'])->name('clients.store');
    Route::put('/clients/{client}', [\App\Http\Controllers\ClientController::class, 'update'])->name('clients.update');
    Route::resource('traffic', \App\Http\Controllers\TrafficController::class);
    // User Registration in Traffic
    Route::get('/traffic/users/create', [\App\Http\Controllers\TrafficController::class, 'createUser'])->name('traffic.users.create');
    Route::post('/traffic/users', [\App\Http\Controllers\TrafficController::class, 'storeUser'])->name('traffic.users.store');

    Route::resource('surveillance', \App\Http\Controllers\SurveillanceController::class)->only(['index', 'store']);
    Route::resource('surveillance', \App\Http\Controllers\SurveillanceController::class)->only(['index', 'store']);
    Route::resource('scale', \App\Http\Controllers\WeightTicketController::class);

    // APT Module
    Route::get('/apt/qr', [\App\Http\Controllers\AptController::class, 'qrPrint'])->name('apt.qr');
    Route::get('/apt/operators/search', [\App\Http\Controllers\AptController::class, 'searchOperators'])->name('apt.operators.search');
    Route::get('/apt/operator', [\App\Http\Controllers\AptController::class, 'createOperator'])->name('apt.operator.create');
    Route::post('/apt/operator', [\App\Http\Controllers\AptController::class, 'storeOperator'])->name('apt.operator.store');
    Route::resource('apt', \App\Http\Controllers\AptController::class)->only(['index']);
});

require __DIR__ . '/auth.php';
