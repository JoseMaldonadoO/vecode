<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::get('/dashboard', [\App\Http\Controllers\DashboardController::class , 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::get('/dashboard/export', [\App\Http\Controllers\DashboardController::class , 'export'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard.export');


Route::get('/dashboard/drill-down/warehouses', [\App\Http\Controllers\DashboardController::class , 'drillDownWarehouses'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard.drilldown.warehouses');

Route::get('/dashboard/drill-down/units', [\App\Http\Controllers\DashboardController::class , 'drillDownUnits'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard.drilldown.units');

Route::get('/dashboard/drill-down/unit-trips', [\App\Http\Controllers\DashboardController::class , 'drillDownUnitTrips'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard.drilldown.unit-trips');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class , 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class , 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class , 'destroy'])->name('profile.destroy');


    // QR Printing & Operator Registration moved to APT
    // Route::get('/dock/qr', [\App\Http\Controllers\DockController::class, 'qrPrint'])->name('dock.qr');
    // Route::get('/dock/operators/search', [\App\Http\Controllers\DockController::class, 'searchOperators'])->name('dock.operators.search');

    Route::get('/dock/status', [\App\Http\Controllers\DockController::class , 'status'])->name('dock.status');
    Route::get('/dock/vessel', [\App\Http\Controllers\DockController::class , 'createVessel'])->name('dock.vessel.create');
    Route::post('/dock/vessel', [\App\Http\Controllers\DockController::class , 'storeVessel'])->name('dock.vessel.store');
    Route::get('/dock/vessel/{id}/edit', [\App\Http\Controllers\DockController::class , 'editVessel'])->name('dock.vessel.edit');
    Route::put('/dock/vessel/{id}', [\App\Http\Controllers\DockController::class , 'updateVessel'])->name('dock.vessel.update');
    Route::post('/dock/vessel/{id}/mark-arrival', [\App\Http\Controllers\DockController::class , 'markArrival'])->name('dock.vessel.mark-arrival');
    Route::post('/dock/vessel/{id}/mark-departure', [\App\Http\Controllers\DockController::class , 'markDeparture'])->name('dock.vessel.mark-departure');
    Route::get('/dock/vessel/{vessel}/export', [\App\Http\Controllers\DockController::class , 'exportVessel'])->name('dock.vessel.export');
    Route::delete('/dock/vessel/{id}/purge', [\App\Http\Controllers\DockController::class , 'purge'])->name('dock.vessel.purge');
    Route::delete('/dock/vessel/{id}', [\App\Http\Controllers\DockController::class , 'destroy'])->name('dock.vessel.destroy');

    // Vessel Load/Unload (Trips)
    Route::get('/dock/trips', [\App\Http\Controllers\DockTripController::class , 'index'])->name('dock.trips.index');
    Route::get('/dock/trips/search', [\App\Http\Controllers\DockTripController::class , 'searchOperator'])->name('dock.trips.search');
    Route::post('/dock/trips', [\App\Http\Controllers\DockTripController::class , 'store'])->name('dock.trips.store');
    Route::delete('/dock/trips/{id}', [\App\Http\Controllers\DockTripController::class , 'destroy'])->name('dock.trips.destroy');

    // Operator Registration (Moved to APT)
    // Route::get('/dock/operator', [\App\Http\Controllers\VesselOperatorController::class, 'create'])->name('dock.operator.create');
    // Route::post('/dock/operator', [\App\Http\Controllers\VesselOperatorController::class, 'store'])->name('dock.operator.store');

    Route::resource('dock', \App\Http\Controllers\DockController::class)->only(['index']);

    // Documents / Printing
    Route::get('/documents/ticket/{id}', [\App\Http\Controllers\DocumentsController::class , 'printTicket'])->name('documents.ticket');
    Route::get('/documents/cp/{id}', [\App\Http\Controllers\DocumentsController::class , 'printBillOfLading'])->name('documents.cp');

    Route::get('/sales/{id}/print', [\App\Http\Controllers\SalesController::class , 'print'])->name('sales.print');

    // Sales Orders History — accessible by Comercializacion AND Documentador (read-only for the latter)
    Route::middleware(['permission:view sales orders'])->group(function () {
            Route::get('/sales/orders', [\App\Http\Controllers\SalesController::class , 'ordersIndex'])->name('sales.orders.index');
            Route::get('/sales/orders/{id}/breakdown', [\App\Http\Controllers\SalesController::class , 'breakdown'])->name('sales.orders.breakdown');
        }
        );

        // Protected Sales routes (Write operations)
        Route::middleware(['role:Admin|Comercializacion'])->group(function () {
            Route::patch('/sales/{id}/toggle-status', [\App\Http\Controllers\SalesController::class , 'toggleStatus'])->name('sales.toggle-status');
            Route::resource('sales', \App\Http\Controllers\SalesController::class)->only(['create', 'store', 'edit', 'update', 'destroy']);
        }
        );

        // Public/Read Sales routes
        Route::get('/sales', [\App\Http\Controllers\SalesController::class , 'index'])->name('sales.index');
        Route::get('/sales/{sales}', [\App\Http\Controllers\SalesController::class , 'show'])->name('sales.show');
        Route::get('/clients', [\App\Http\Controllers\ClientController::class , 'index'])->name('clients.index');
        Route::get('/clients/create', [\App\Http\Controllers\ClientController::class , 'create'])->name('clients.create');
        Route::post('/clients', [\App\Http\Controllers\ClientController::class , 'store'])->name('clients.store');
        Route::get('/clients/{client}/edit', [\App\Http\Controllers\ClientController::class , 'edit'])->name('clients.edit');
        Route::put('/clients/{client}', [\App\Http\Controllers\ClientController::class , 'update'])->name('clients.update');
        Route::get('/traffic/burreo-weights', [\App\Http\Controllers\BurreoWeightController::class , 'index'])->name('traffic.burreo.index');
        Route::post('/traffic/burreo-weights/{vessel}/provisional', [\App\Http\Controllers\BurreoWeightController::class , 'updateProvisional'])->name('traffic.burreo.provisional');
        Route::post('/traffic/burreo-weights/{vessel}/draft', [\App\Http\Controllers\BurreoWeightController::class , 'applyDraft'])->name('traffic.burreo.draft');

        // User Registration in Traffic
        Route::get('/traffic/users/create', [\App\Http\Controllers\TrafficController::class , 'createUser'])->name('traffic.users.create');
        Route::post('/traffic/users', [\App\Http\Controllers\TrafficController::class , 'storeUser'])->name('traffic.users.store');

        // Product Management in Traffic
        Route::get('/traffic/products', [\App\Http\Controllers\TrafficController::class , 'productsIndex'])->name('traffic.products.index');
        Route::get('/traffic/products/create', [\App\Http\Controllers\TrafficController::class , 'productsCreate'])->name('traffic.products.create');
        Route::post('/traffic/products', [\App\Http\Controllers\TrafficController::class , 'productsStore'])->name('traffic.products.store');
        Route::get('/traffic/products/{id}/edit', [\App\Http\Controllers\TrafficController::class , 'productsEdit'])->name('traffic.products.edit');
        Route::put('/traffic/products/{id}', [\App\Http\Controllers\TrafficController::class , 'productsUpdate'])->name('traffic.products.update');
        Route::delete('/traffic/products/{id}', [\App\Http\Controllers\TrafficController::class , 'productsDestroy'])->name('traffic.products.destroy');

        Route::resource('traffic', \App\Http\Controllers\TrafficController::class);

        Route::resource('surveillance', \App\Http\Controllers\SurveillanceController::class)->only(['index', 'store']);
        Route::post('/surveillance/scan', [\App\Http\Controllers\SurveillanceController::class , 'scan'])->name('surveillance.scan');
        Route::put('/surveillance/{id}', [\App\Http\Controllers\SurveillanceController::class , 'update'])->name('surveillance.update');

        Route::get('/surveillance/veto', [\App\Http\Controllers\SurveillanceController::class , 'vetoIndex'])->name('surveillance.veto');
        Route::get('/surveillance/operators/search', [\App\Http\Controllers\SurveillanceController::class , 'searchOperators'])->name('surveillance.operators.search');
        Route::post('/surveillance/operators/{id}/veto', [\App\Http\Controllers\SurveillanceController::class , 'vetoOperator'])->name('surveillance.operators.veto');

        // Scale Module
        Route::get('/scale/entry-mp', [\App\Http\Controllers\WeightTicketController::class , 'createEntry'])->name('scale.entry-mp');
        Route::get('/scale/entry-sale', [\App\Http\Controllers\WeightTicketController::class , 'createEntrySale'])->name('scale.entry-sale');
        Route::get('/scale/exit/{id?}', [\App\Http\Controllers\WeightTicketController::class , 'createExit'])->name('scale.exit');
        Route::get('/scale/search-qr', [\App\Http\Controllers\WeightTicketController::class , 'searchQr'])->name('scale.search-qr');
        Route::get('/scale/search-folio', [\App\Http\Controllers\WeightTicketController::class , 'searchFolio'])->name('scale.search-folio');
        Route::post('/scale/entry', [\App\Http\Controllers\WeightTicketController::class , 'storeEntry'])->name('scale.entry.store');
        Route::post('/scale/exit', [\App\Http\Controllers\WeightTicketController::class , 'storeExit'])->name('scale.exit.store');
        Route::get('/scale/ticket/{id}', [\App\Http\Controllers\WeightTicketController::class , 'printTicket'])->name('scale.ticket.print');

        // Ticket Management
        Route::get('/scale/tickets', [\App\Http\Controllers\WeightTicketController::class , 'tickets'])->name('scale.tickets.index');
        Route::get('/scale/tickets/{id}/edit', [\App\Http\Controllers\WeightTicketController::class , 'editTicket'])->name('scale.tickets.edit');
        Route::put('/scale/tickets/{id}', [\App\Http\Controllers\WeightTicketController::class , 'updateTicket'])->name('scale.tickets.update');
        Route::delete('/scale/tickets/{id}', [\App\Http\Controllers\WeightTicketController::class , 'destroyTicket'])->name('scale.tickets.destroy');
        Route::patch('/scale/tickets/{id}/cancel', [\App\Http\Controllers\WeightTicketController::class , 'cancelTicket'])->name('scale.tickets.cancel');
        Route::patch('/scale/tickets/{id}/reopen', [\App\Http\Controllers\WeightTicketController::class , 'reopenTicket'])->name('scale.tickets.reopen');

        Route::resource('scale', \App\Http\Controllers\WeightTicketController::class);

        // Documentation Module
        Route::get('/documentation/dock', [\App\Http\Controllers\DocumentationController::class , 'dock'])->name('documentation.dock');
        Route::get('/documentation/qr/print', [\App\Http\Controllers\DocumentationController::class , 'qrPrint'])->name('documentation.qr');
        Route::get('/documentation/operators/search', [\App\Http\Controllers\DocumentationController::class , 'searchOperators'])->name('documentation.operators.search');
        Route::get('/documentation/check-carta-porte', [\App\Http\Controllers\DocumentationController::class , 'checkCartaPorte'])->name('documentation.check-carta-porte');
        Route::get('/documentation/operators/create', [\App\Http\Controllers\DocumentationController::class , 'createOperator'])->name('documentation.operators.create');
        Route::post('/documentation/operators', [\App\Http\Controllers\DocumentationController::class , 'storeOperator'])->name('documentation.operators.store');
        // New Operator List & Edit Routes
        Route::get('/documentation/operators', [\App\Http\Controllers\DocumentationController::class , 'operatorsIndex'])->name('documentation.operators.index');
        Route::get('/documentation/operators/{id}/edit', [\App\Http\Controllers\DocumentationController::class , 'editOperator'])->name('documentation.operators.edit');
        Route::put('/documentation/operators/{id}', [\App\Http\Controllers\DocumentationController::class , 'updateOperator'])->name('documentation.operators.update');
        Route::delete('/documentation/operators/{id}', [\App\Http\Controllers\DocumentationController::class , 'destroyOperator'])->name('documentation.operators.destroy');

        // Exit Operators (Operadores de Salida)
        Route::get('/documentation/exit-operators', [\App\Http\Controllers\ExitOperatorController::class , 'index'])->name('documentation.exit-operators.index');
        Route::get('/documentation/exit-operators/create', [\App\Http\Controllers\ExitOperatorController::class , 'create'])->name('documentation.exit-operators.create');
        Route::post('/documentation/exit-operators', [\App\Http\Controllers\ExitOperatorController::class , 'store'])->name('documentation.exit-operators.store');
        Route::get('/documentation/exit-operators/{id}/edit', [\App\Http\Controllers\ExitOperatorController::class , 'edit'])->name('documentation.exit-operators.edit');
        // For update, I'll use put for consistency or patch
        Route::put('/documentation/exit-operators/{id}', [\App\Http\Controllers\ExitOperatorController::class , 'update'])->name('documentation.exit-operators.update');
        Route::patch('/documentation/exit-operators/{id}/toggle', [\App\Http\Controllers\ExitOperatorController::class , 'toggleStatus'])->name('documentation.exit-operators.toggle');
        Route::delete('/documentation/exit-operators/{id}', [\App\Http\Controllers\ExitOperatorController::class , 'destroy'])->name('documentation.exit-operators.destroy');
        Route::get('/documentation/exit-operators/{id}/qr', [\App\Http\Controllers\ExitOperatorController::class , 'qr'])->name('documentation.exit-operators.qr');

        // New Shipment Orders Report Route
        Route::get('/documentation/shipment-orders', [\App\Http\Controllers\DocumentationController::class , 'shipmentOrdersIndex'])->name('documentation.orders.index');
        // Print Routes
        Route::get('/documentation/shipment-orders/{id}/print', [\App\Http\Controllers\DocumentationController::class , 'printOrder'])->name('documentation.orders.print');
        Route::get('/documentation/shipment-orders/{id}/print-instruction', [\App\Http\Controllers\DocumentationController::class , 'printInstruction'])->name('documentation.orders.print-instruction');

        // APT Module
        Route::get('/apt/qr', [\App\Http\Controllers\AptController::class , 'qrPrint'])->name('apt.qr');
        Route::get('/apt/status', [\App\Http\Controllers\AptController::class , 'status'])->name('apt.status'); // Dashboard Status
        Route::get('/apt/status-unidades', [\App\Http\Controllers\AptController::class , 'unitStatus'])->name('apt.unit-status');
        Route::get('/apt/scanner', [\App\Http\Controllers\AptController::class , 'scanner'])->name('apt.scanner');
        Route::post('/apt/scanner', [\App\Http\Controllers\AptController::class , 'storeScan'])->name('apt.scanner.store');
        Route::put('/apt/scanner/{id}', [\App\Http\Controllers\AptController::class , 'updateScan'])->name('apt.scanner.update');
        Route::delete('/apt/scanner/{id}', [\App\Http\Controllers\AptController::class , 'destroyScan'])->name('apt.scanner.destroy');
        // Lots Management
        Route::get('/apt/lots', [\App\Http\Controllers\LotController::class , 'index'])->name('apt.lots.index');
        Route::get('/apt/lots/create', [\App\Http\Controllers\LotController::class , 'create'])->name('apt.lots.create');
        Route::post('/apt/lots', [\App\Http\Controllers\LotController::class , 'store'])->name('apt.lots.store');
        Route::get('/apt/lots/{lot}/edit', [\App\Http\Controllers\LotController::class , 'edit'])->name('apt.lots.edit');
        Route::put('/apt/lots/{lot}', [\App\Http\Controllers\LotController::class , 'update'])->name('apt.lots.update');
        Route::patch('/apt/lots/{lot}/toggle', [\App\Http\Controllers\LotController::class , 'toggleStatus'])->name('apt.lots.toggle');
        Route::delete('/apt/lots/{lot}', [\App\Http\Controllers\LotController::class , 'destroy'])->name('apt.lots.destroy');

        Route::get('/apt/operators/search', [\App\Http\Controllers\AptController::class , 'searchOperators'])->name('apt.operators.search');
        Route::get('/apt/operator', [\App\Http\Controllers\AptController::class , 'createOperator'])->name('apt.operators.create');
        Route::post('/apt/operator', [\App\Http\Controllers\AptController::class , 'storeOperator'])->name('apt.operators.store');
        Route::get('/apt/oe-tracker', [\App\Http\Controllers\DocumentationController::class , 'oeTrackerIndex'])->name('apt.oe-tracker');
        // Admin Module
        Route::middleware(['role:Admin'])->prefix('admin')->name('admin.')->group(function () {
            Route::patch('users/{user}/toggle-block', [\App\Http\Controllers\Admin\AdminController::class , 'toggleBlock'])->name('users.toggle-block');
            Route::resource('users', \App\Http\Controllers\Admin\AdminController::class);
            Route::resource('roles', \App\Http\Controllers\Admin\RoleController::class);
        }
        );

        // Shipment Orders (Documentation)
        Route::controller(\App\Http\Controllers\DocumentationController::class)->group(function () {
            Route::get('/documentation/shipment-orders', 'shipmentOrdersIndex')->name('documentation.orders.index');
            Route::get('/documentation/shipment-orders/export-standard', 'exportStandard')->name('documentation.orders.export-standard');
            Route::get('/documentation/shipment-orders/export-sader', 'exportSader')->name('documentation.orders.export-sader');
            Route::get('/documentation/shipment-orders/create', 'createOrder')->name('documentation.create');
            Route::post('/documentation/shipment-orders', 'storeOrder')->name('documentation.store');
            Route::get('/documentation/shipment-orders/{id}/edit', 'editOrder')->name('documentation.edit');
            Route::put('/documentation/shipment-orders/{id}', 'updateOrder')->name('documentation.update');
            Route::patch('/documentation/shipment-orders/{id}/cancel', 'cancelOrder')->name('documentation.cancel');
            Route::patch('/documentation/shipment-orders/{id}/reopen', 'reopenOrder')->name('documentation.reopen');

            // Other methods
            Route::get('/documentation/oe-tracker', 'oeTrackerIndex')->name('documentation.oe-tracker');
            Route::get('/documentation', 'index')->name('documentation.index'); // Dashboard
            Route::get('/documentation/qr-print', 'qrPrint')->name('documentation.qr-print');
            Route::get('/documentation/dock', 'dock')->name('documentation.dock');
            Route::get('/documentation/register-operator', 'createOperator')->name('documentation.register-operator');
            Route::post('/documentation/store-operator', 'storeOperator')->name('documentation.store-operator');
            Route::get('/documentation/print-order/{id}', 'printOrder')->name('documentation.print-order');
        }
        );

        // Shipment Origins (Manageable Origins)
        Route::get('/shipment-origins', [\App\Http\Controllers\ShipmentOriginController::class , 'index'])->name('shipment-origins.index');
        Route::post('/shipment-origins', [\App\Http\Controllers\ShipmentOriginController::class , 'store'])->name('shipment-origins.store');
        Route::put('/shipment-origins/{origin}', [\App\Http\Controllers\ShipmentOriginController::class , 'update'])->name('shipment-origins.update');
        Route::delete('/shipment-origins/{origin}', [\App\Http\Controllers\ShipmentOriginController::class , 'destroy'])->name('shipment-origins.destroy');

        Route::resource('apt', \App\Http\Controllers\AptController::class)->only(['index']);

        // System Maintenance (Temporary)
        Route::get('/system/deploy', [\App\Http\Controllers\SystemController::class , 'deployUpdates'])->name('system.deploy');

        // MOCKUP TEMPORAL (Solo para visualización)
        Route::get('/mockup/dock-scanner', function () {
            return Inertia::render('Prototypes/DockScannerMockup');
        }
        )->name('mockup.dock-scanner');

        // Sandbox Environment
        require __DIR__ . '/sandbox.php';

    });

require __DIR__ . '/auth.php';
