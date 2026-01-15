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


    // QR Printing & Operator Registration moved to APT
    // Route::get('/dock/qr', [\App\Http\Controllers\DockController::class, 'qrPrint'])->name('dock.qr');
    // Route::get('/dock/operators/search', [\App\Http\Controllers\DockController::class, 'searchOperators'])->name('dock.operators.search');

    Route::get('/dock/vessel', [\App\Http\Controllers\DockController::class, 'createVessel'])->name('dock.vessel.create');
    Route::post('/dock/vessel', [\App\Http\Controllers\DockController::class, 'storeVessel'])->name('dock.vessel.store');
    Route::get('/dock/vessel/{id}/edit', [\App\Http\Controllers\DockController::class, 'editVessel'])->name('dock.vessel.edit');
    Route::put('/dock/vessel/{id}', [\App\Http\Controllers\DockController::class, 'updateVessel'])->name('dock.vessel.update');

    // Operator Registration (Moved to APT)
    // Route::get('/dock/operator', [\App\Http\Controllers\VesselOperatorController::class, 'create'])->name('dock.operator.create');
    // Route::post('/dock/operator', [\App\Http\Controllers\VesselOperatorController::class, 'store'])->name('dock.operator.store');

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

    // Scale Module
    Route::get('/scale/entry-mp', [\App\Http\Controllers\WeightTicketController::class, 'createEntry'])->name('scale.entry-mp');
    Route::get('/scale/search-qr', [\App\Http\Controllers\WeightTicketController::class, 'searchQr'])->name('scale.search-qr');
    Route::post('/scale/entry', [\App\Http\Controllers\WeightTicketController::class, 'storeEntry'])->name('scale.entry.store');
    Route::resource('scale', \App\Http\Controllers\WeightTicketController::class);

    // Documentation Module
    Route::get('/documentation/dock', [\App\Http\Controllers\DocumentationController::class, 'dock'])->name('documentation.dock');
    Route::get('/documentation/qr/print', [\App\Http\Controllers\DocumentationController::class, 'qrPrint'])->name('documentation.qr');
    Route::get('/documentation/operators/create', [\App\Http\Controllers\DocumentationController::class, 'createOperator'])->name('documentation.operators.create');
    Route::post('/documentation/operators', [\App\Http\Controllers\DocumentationController::class, 'storeOperator'])->name('documentation.operators.store');
    Route::resource('documentation', \App\Http\Controllers\DocumentationController::class);

    // APT Module
    Route::get('/apt/qr', [\App\Http\Controllers\AptController::class, 'qrPrint'])->name('apt.qr');
    Route::get('/apt/scanner', [\App\Http\Controllers\AptController::class, 'scanner'])->name('apt.scanner.index');
    Route::post('/apt/scanner', [\App\Http\Controllers\AptController::class, 'storeScan'])->name('apt.scanner.store');
    Route::get('/apt/operators/search', [\App\Http\Controllers\AptController::class, 'searchOperators'])->name('apt.operators.search');
    Route::get('/apt/operator', [\App\Http\Controllers\AptController::class, 'createOperator'])->name('apt.operators.create');
    Route::post('/apt/operator', [\App\Http\Controllers\AptController::class, 'storeOperator'])->name('apt.operators.store');
    // Admin Module
    Route::middleware(['role:Admin'])->prefix('admin')->name('admin.')->group(function () {
        Route::resource('users', \App\Http\Controllers\Admin\AdminController::class);
        Route::resource('roles', \App\Http\Controllers\Admin\RoleController::class);
    });

    Route::resource('apt', \App\Http\Controllers\AptController::class)->only(['index']);
});

require __DIR__ . '/auth.php';
