<?php

namespace App\Http\Controllers;

use App\Models\ShipmentOrder;
use App\Models\Client;
use App\Models\Product;
use App\Models\Vessel;
use App\Models\VesselOperator;
use App\Models\SalesOrder;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class DocumentationController extends Controller
{
    /**
     * Display the main module menu.
     */
    public function index()
    {
        return Inertia::render('Documentation/Index');
    }

    /**
     * Show the form for creating a new Shipment Order (Orden de Embarque).
     */

    public function createOrder()
    {
        return Inertia::render('Documentation/Create', [
            'clients' => Client::orderBy('business_name')->get()->map(function ($client) {
                return [
                    'id' => $client->id,
                    'business_name' => $client->business_name,
                    'rfc' => $client->rfc ?? '',
                    'address' => $client->address ?? '',
                    // Add other fields needed for auto-fill if available in Client model
                ];
            }),
            'products' => Product::all(),
            'sales_orders' => SalesOrder::with(['client', 'product'])
                ->whereIn('status', ['created', 'open'])
                ->get(),
            'scale_operators' => User::role('Bascula')->where('is_blocked', false)->get()->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                ];
            }),
            'default_folio' => function () {
                $maxFolio = ShipmentOrder::where('folio', 'like', 'PA' . date('Y') . '-%')
                    ->get()
                    ->map(function ($order) {
                        $parts = explode('-', $order->folio);
                        return (count($parts) === 2 && is_numeric($parts[1])) ? (int) $parts[1] : 0;
                    })
                    ->max();

                $nextNumber = ($maxFolio ?? 0) + 1;

                return 'PA' . date('Y') . '-' . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
            },
        ]);
    }

    /**
     * Store a newly created Shipment Order.
     */
    public function storeOrder(Request $request)
    {
        \Log::info('Store Order Request Data:', $request->all());
        $validated = $request->validate([
            'folio' => 'required|unique:shipment_orders,folio',
            'date' => 'required|date',
            'client_id' => 'required|exists:clients,id',
            'sales_order_id' => 'required|exists:sales_orders,id',
            // Snapshot fields
            'client_name' => 'nullable|string', // Re-enabled for snapshot
            'rfc' => 'nullable|string',
            'address' => 'nullable|string',
            'consigned_to' => 'required|string',
            // Transport
            'transport_company' => 'nullable|string',
            'operator_name' => 'nullable|string',
            'unit_number' => 'nullable|string',
            'tractor_plate' => 'nullable|string',
            'trailer_plate' => 'nullable|string',
            'carta_porte' => 'nullable|string',
            'license_number' => 'nullable|string',
            'unit_type' => 'nullable|string',
            'economic_number' => 'nullable|string',
            'qr_code' => 'nullable|string',
            // Shipment
            'origin_id' => 'nullable|exists:shipment_origins,id',
            'destination' => 'nullable|string',
            'product' => 'nullable|string', // Text snapshot or ID? Form implies text/select
            'presentation' => 'required|string',
            'sack_type' => 'nullable|string', // Frontend supplemental field
            'sacks_count' => 'nullable|string',
            'programmed_tons' => 'required|numeric|gt:0',
            'balance' => 'nullable', // Frontend field for shortage_balance
            'shortage_balance' => 'nullable|string',
            'documenter_name' => 'nullable|string',
            'scale_name' => 'nullable|string',
            'observations' => 'nullable|string',
            'state' => 'nullable|string',
            'scale_operator_id' => 'nullable|exists:users,id',
        ]);

        // 1. Validation: Programmed Tons <= OV Balance
        $salesOrder = SalesOrder::findOrFail($validated['sales_order_id']);
        if ($validated['programmed_tons'] > $salesOrder->balance) {
            return back()->withErrors([
                'programmed_tons' => 'El tonelaje programado (' . $validated['programmed_tons'] . ' TM) excede el saldo disponible de la Orden de Venta (' . $salesOrder->balance . ' TM).'
            ])->withInput();
        }

        // 2. Validation: Unique Carta Porte per Transport Line (Exclude cancelled orders)
        $exists = ShipmentOrder::where('transport_company', $validated['transport_company'])
            ->where('carta_porte', $validated['carta_porte'])
            ->where('status', '!=', 'cancelled')
            ->exists();

        if ($exists) {
            return back()->withErrors([
                'carta_porte' => 'La Carta Porte "' . $validated['carta_porte'] . '" ya está en uso activo para la línea "' . $validated['transport_company'] . '".'
            ])->withInput();
        }

        // Map frontend fields to DB columns
        $validated['shortage_balance'] = $request->input('balance');

        if ($validated['presentation'] === 'ENVASADO' && $request->has('sack_type')) {
            $validated['sacks_count'] = $request->input('sack_type') . ' KG';
        }

        // Remove auxiliary fields not in DB
        unset($validated['sack_type']);
        unset($validated['balance']);

        // Populate scale_name if scale_operator_id is provided
        if (!empty($validated['scale_operator_id'])) {
            $operator = User::find($validated['scale_operator_id']);
            if ($operator) {
                $validated['scale_name'] = $operator->name;
            }
        }

        $order = ShipmentOrder::create($validated + ['status' => 'created']);

        // Sync Sales Order for pre-calculated totals (especially for ENVASADO)
        $salesOrder->syncLoadedQuantity();

        return redirect()->route('documentation.orders.index')->with('success', 'Orden de Embarque creada correctamente.');
    }

    // --- Moved Functionality from APT ---

    // QR Printing
    public function qrPrint(Request $request)
    {
        $operator = null;
        if ($request->has('qr')) {
            $qr = $request->input('qr');
            // Assuming format "OP <id>"
            if (str_starts_with($qr, 'OP ')) {
                $id = (int) substr($qr, 3);
                $operator = VesselOperator::with('vessel')->find($id);
            }
        }

        return Inertia::render('Documentation/QrPrint', [
            'operator' => $operator,
        ]);
    }

    // Dock Submenu
    public function dock()
    {
        return Inertia::render('Documentation/Dock');
    }

    // Operator Registration (Alta Operador)
    public function createOperator()
    {
        // Strict filter: Only active vessels
        $vessels = Vessel::with('product')
            ->active()
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Documentation/RegisterOperator', [
            'vessels' => $vessels
        ]);
    }

    public function storeOperator(Request $request)
    {
        // ... Logic from AptController::storeOperator ...
        $validated = $request->validate([
            'vessel_id' => 'required|exists:vessels,id',
            'operator_name' => 'required|string|max:255',
            'unit_type' => 'required|string',
            'economic_number' => 'required|string',
            'tractor_plate' => 'required|string',
            'trailer_plate' => 'nullable|required_unless:unit_type,Volteo|string',
            'transporter_line' => 'required|string',
            'brand_model' => 'nullable|string',
        ]);

        $query = VesselOperator::where('vessel_id', $validated['vessel_id'])
            ->where('operator_name', $validated['operator_name'])
            ->where('economic_number', $validated['economic_number'])
            ->where('tractor_plate', $validated['tractor_plate'])
            ->where('unit_type', $validated['unit_type'])
            ->where('transporter_line', $validated['transporter_line']);

        if (!empty($validated['trailer_plate'])) {
            $query->where('trailer_plate', $validated['trailer_plate']);
        }

        if (!empty($validated['brand_model'])) {
            $query->where('brand_model', $validated['brand_model']);
        }

        $exists = $query->exists();

        if ($exists) {
            return back()->withErrors(['operator_name' => 'Este operador ya está registrado con exactamente los mismos datos (Unidad, Placas, Línea).']);
        }

        VesselOperator::create($validated);

        return back()->with('success', 'Operador registrado correctamente.');
    }

    // Search Operators (used by Form)
    public function searchOperators(Request $request)
    {
        $query = $request->input('q');

        // El usuario se refiere a "Operadores de Salida" gestionados en ExitOperatorController
        $operators = \App\Models\ExitOperator::where(function ($q) use ($query) {
            $q->where('name', 'like', "%{$query}%")
                ->orWhere('id', $query);
        })
            ->active()
            ->orderBy('name')
            ->limit(20)
            ->get()
            ->map(function ($op) {
                return [
                    'id' => $op->id,
                    'operator_name' => $op->name,
                    'transporter_line' => $op->transport_line,
                    'unit_type' => $op->unit_type,
                    'tractor_plate' => $op->tractor_plate,
                    'trailer_plate' => $op->trailer_plate,
                    'economic_number' => $op->economic_number,
                    'license' => $op->license,
                    'brand_model' => $op->brand_model,
                ];
            });

        return response()->json($operators);
    }

    // --- New Methods for Operators List ---

    public function operatorsIndex(Request $request)
    {
        $query = VesselOperator::query()->with('vessel');

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('operator_name', 'like', "%{$search}%")
                    ->orWhere('id', 'like', "%{$search}%")
                    ->orWhere('transporter_line', 'like', "%{$search}%")
                    ->orWhere('economic_number', 'like', "%{$search}%");
            });
        }

        if ($request->has('vessel_id')) {
            $query->where('vessel_id', $request->input('vessel_id'));
        }

        $status = $request->input('status', 'active');
        if ($status === 'active') {
            $query->whereHas('vessel', function ($q) {
                $q->active();
            });
        } elseif ($status === 'archived') {
            $query->whereHas('vessel', function ($q) {
                $q->inactive();
            });
        }

        $operators = $query->orderBy('created_at', 'desc')->paginate(10)->withQueryString();

        // Append is_active to each operator
        $operators->getCollection()->transform(function ($operator) {
            $operator->is_active = $operator->vessel ? $operator->vessel->is_active : false;
            return $operator;
        });

        return Inertia::render('Documentation/Operators/Index', [
            'operators' => $operators,
            'vessels' => Vessel::orderBy('created_at', 'desc')->get(),
            'filters' => $request->only(['search', 'vessel_id', 'status']),
        ]);
    }

    public function editOperator($id)
    {
        $operator = VesselOperator::with('vessel')->findOrFail($id);

        $vessels = Vessel::with('product')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Documentation/Operators/Edit', [
            'operator' => $operator,
            'vessels' => $vessels
        ]);
    }

    public function updateOperator(Request $request, $id)
    {
        $operator = VesselOperator::with('vessel')->findOrFail($id);

        if ($operator->vessel && !$operator->vessel->is_active) {
            return back()->withErrors(['error' => 'No se puede editar un operador de un barco que ya ha zarpado (Archivado).']);
        }

        $validated = $request->validate([
            'vessel_id' => 'required|exists:vessels,id',
            'operator_name' => 'required|string|max:255',
            'unit_type' => 'required|string',
            'economic_number' => 'required|string',
            'tractor_plate' => 'required|string',
            'trailer_plate' => 'nullable|required_unless:unit_type,Volteo|string',
            'transporter_line' => 'required|string',
            'brand_model' => 'nullable|string',
        ]);

        $operator->update($validated);

        return redirect()->route('documentation.operators.index')->with('success', 'Operador actualizado correctamente.');
    }

    public function destroyOperator($id)
    {
        $operator = VesselOperator::findOrFail($id);
        $operator->delete();

        return redirect()->route('documentation.operators.index')->with('success', 'Operador eliminado correctamente.');
    }

    /**
     * Display a report of shipment orders (OB).
     */
    public function shipmentOrdersIndex(Request $request)
    {
        $query = ShipmentOrder::query()
            ->with(['client', 'vessel', 'sales_order', 'driver', 'origin', 'weight_ticket', 'loadingOrders.weight_ticket'])
            ->whereIn('operation_type', ['scale', 'burreo']);

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('folio', 'like', "%{$search}%")
                    ->orWhere('origin', 'like', "%{$search}%") // Legacy string search
                    ->orWhere('destination', 'like', "%{$search}%")
                    ->orWhere('operator_name', 'like', "%{$search}%")
                    ->orWhereHas('origin', function ($q2) use ($search) {
                        $q2->where('name', 'like', "%{$search}%");
                    })
                    ->orWhereHas('client', function ($q2) use ($search) {
                        $q2->where('business_name', 'like', "%{$search}%");
                    })
                    ->orWhereHas('sales_order', function ($q2) use ($search) {
                        $q2->where('folio', 'like', "%{$search}%")
                            ->orWhere('sale_order', 'like', "%{$search}%");
                    });
            });
        }

        // Filter by Status: 'active' (default) vs 'cancelled'
        $statusFilter = $request->input('status', 'active'); // active | cancelled

        if ($statusFilter === 'cancelled') {
            $query->where('status', 'cancelled');
        } else {
            // Active: created, loading, closed, completed
            $query->whereIn('status', ['created', 'loading', 'closed', 'completed']);
        }

        $orders = $query->orderBy('created_at', 'desc')->paginate(10)->withQueryString();

        return Inertia::render('Documentation/Orders/Index', [
            'orders' => $orders,
            'filters' => $request->only(['search', 'status']),
            'sales_orders' => SalesOrder::where('status', 'created')->orWhere('status', 'open')->get(),
            'default_folio' => 'PA' . date('Y') . '-' . str_pad(ShipmentOrder::count() + 1, 4, '0', STR_PAD_LEFT),
        ]);
    }

    /**
     * Export Standard Shipment Orders (Not SADER)
     */
    public function exportStandard(Request $request)
    {
        $filters = $request->all();
        $filters['is_sader'] = false;
        return \Maatwebsite\Excel\Facades\Excel::download(
            new \App\Exports\ShipmentOrdersExport($filters),
            'OE_General_' . date('Ymd_His') . '.xlsx'
        );
    }

    /**
     * Export SADER Shipment Orders
     */
    public function exportSader(Request $request)
    {
        $filters = $request->all();
        $filters['is_sader'] = true;
        return \Maatwebsite\Excel\Facades\Excel::download(
            new \App\Exports\ShipmentOrdersExport($filters),
            'OE_SADER_' . date('Ymd_His') . '.xlsx'
        );
    }

    /**
     * Print the Shipment Order (Orden de Embarque) in legacy format.
     */
    public function printOrder($id)
    {
        $order = ShipmentOrder::with(['client', 'sales_order.client', 'product', 'vessel', 'transporter', 'driver', 'vehicle', 'origin'])
            ->findOrFail($id);

        // Patch: If plates are missing, try to find them from the Operator registry (ExitOperator)
        // Check ExitOperator first as per searchOperators method
        if (empty($order->tractor_plate) || empty($order->trailer_plate) || $order->tractor_plate === 'N/A') {
            $operator = \App\Models\ExitOperator::where('name', $order->operator_name)->first();

            if ($operator) {
                if (empty($order->tractor_plate) || $order->tractor_plate === 'N/A') {
                    $order->tractor_plate = $operator->tractor_plate;
                }
                if (empty($order->trailer_plate) || $order->trailer_plate === 'N/A') {
                    $order->trailer_plate = $operator->trailer_plate;
                }
                // Optional: Unit Type
                if (empty($order->unit_type)) {
                    $order->unit_type = $operator->unit_type;
                }
                // Optional: License
                if (empty($order->license_number)) {
                    $order->license_number = $operator->license;
                }
                // Optional: Economic
                if (empty($order->economic_number)) {
                    $order->economic_number = $operator->economic_number;
                }
            }
        }

        // Lookup Product Code if relation is missing
        $productCode = 'N/A';
        $productText = $order->getAttributes()['product'] ?? '';

        if (is_object($order->product) && $order->product instanceof \App\Models\Product) {
            $productCode = $order->product->code;
            $productText = $order->product->name;
        } elseif ($productText) {
            $p = \App\Models\Product::where('name', $productText)->first();
            if ($p) {
                $productCode = $p->code;
            }
        }

        return Inertia::render('Documentation/Orders/Print', [
            'order' => $order->toArray() + [
                'product_code' => $productCode,
                'product_text' => $productText,
            ]
        ]);
    }

    /**
     * Print the Shipment Order (Instrucción de Carga - GLS-AP-FO-001).
     */
    public function printInstruction($id)
    {
        $order = ShipmentOrder::with(['client', 'sales_order.client', 'product', 'vessel', 'transporter', 'driver', 'vehicle', 'origin'])
            ->findOrFail($id);

        // Patch: If plates are missing, try to find them from the Operator registry (ExitOperator)
        if (empty($order->tractor_plate) || empty($order->trailer_plate) || $order->tractor_plate === 'N/A') {
            $operator = \App\Models\ExitOperator::where('name', $order->operator_name)->first();

            if ($operator) {
                if (empty($order->tractor_plate) || $order->tractor_plate === 'N/A') {
                    $order->tractor_plate = $operator->tractor_plate;
                }
                if (empty($order->trailer_plate) || $order->trailer_plate === 'N/A') {
                    $order->trailer_plate = $operator->trailer_plate;
                }
                // Optional: Unit Type
                if (empty($order->unit_type)) {
                    $order->unit_type = $operator->unit_type;
                }
                // Optional: License
                if (empty($order->license_number)) {
                    $order->license_number = $operator->license;
                }
                // Optional: Economic
                if (empty($order->economic_number)) {
                    $order->economic_number = $operator->economic_number;
                }
            }
        }

        // Lookup Product Code if relation is missing
        $productCode = 'N/A';
        $productText = $order->getAttributes()['product'] ?? '';

        if (is_object($order->product) && $order->product instanceof \App\Models\Product) {
            $productCode = $order->product->code;
            $productText = $order->product->name;
        } elseif ($productText) {
            $p = \App\Models\Product::where('name', $productText)->first();
            if ($p) {
                $productCode = $p->code;
            }
        }

        return Inertia::render('Documentation/Orders/PrintInstruction', [
            'order' => $order->toArray() + [
                'product_code' => $productCode,
                'product_text' => $productText,
            ]
        ]);

    }

    /**
     * Show the form for editing the specified Shipment Order.
     */
    public function editOrder(Request $request, $id)
    {
        $order = ShipmentOrder::with(['client', 'sales_order.client', 'product'])->findOrFail($id);

        // Prevent editing if closed/completed? Usually allowed but with caution.
        // For now, allow edit unless cancelled maybe.
        if ($order->status === 'cancelled') {
            return redirect()->route('documentation.orders.index')->withErrors(['error' => 'No se puede editar una orden cancelada.']);
        }

        return Inertia::render('Documentation/Orders/Edit', [
            'order' => $order->toArray() + [
                'product_text' => $order->getAttributes()['product'] ?? null,
                'sacks_count_raw' => $order->getAttributes()['sacks_count'] ?? null,
            ],
            'queryParams' => $request->only(['search', 'status', 'page']),
            'clients' => Client::orderBy('business_name')->get()->map(function ($client) {
                return [
                    'id' => $client->id,
                    'business_name' => $client->business_name,
                    'rfc' => $client->rfc ?? '',
                    'address' => $client->address ?? '',
                ];
            }),
            'products' => Product::all(),
            'sales_orders' => SalesOrder::whereIn('status', ['created', 'open'])
                ->orWhere('id', $order->sales_order_id)
                ->with(['client', 'product'])
                ->get(),
            'scale_operators' => User::role('Bascula')->where('is_blocked', false)->get()->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                ];
            }),
        ]);
    }

    /**
     * Update the specified Shipment Order in storage.
     */
    public function updateOrder(Request $request, $id)
    {
        $order = ShipmentOrder::findOrFail($id);

        $validated = $request->validate([
            'folio' => 'required|unique:shipment_orders,folio,' . $id,
            'date' => 'required|date',
            'client_id' => 'required|exists:clients,id',
            'sales_order_id' => 'required|exists:sales_orders,id',
            'consigned_to' => 'required|string',
            // Transport
            'transport_company' => 'nullable|string',
            'operator_name' => 'nullable|string',
            'unit_number' => 'nullable|string',
            'tractor_plate' => 'nullable|string',
            'trailer_plate' => 'nullable|string',
            'carta_porte' => 'nullable|string',
            'license_number' => 'nullable|string',
            'unit_type' => 'nullable|string',
            'economic_number' => 'nullable|string',
            // Shipment
            'destination' => 'nullable|string',
            'product' => 'nullable|string',
            'presentation' => 'required|string',
            'sack_type' => 'nullable|string',
            'sacks_count' => 'nullable|string',
            'programmed_tons' => 'required|numeric|gt:0',
            'origin_id' => 'required',
            'balance' => 'nullable',
            'shortage_balance' => 'nullable|string',
            'observations' => 'nullable|string',
            'state' => 'nullable|string',
            // Allow Operator/Unit IDs to be updated if re-selected
            'operator_id' => 'nullable',
            'scale_operator_id' => 'nullable|exists:users,id',
        ]);

        // Validate Balance again if programmed tons changed
        if ($validated['sales_order_id'] != $order->sales_order_id || $validated['programmed_tons'] != $order->programmed_tons) {
            $salesOrder = SalesOrder::findOrFail($validated['sales_order_id']);
            // Re-calculate available balance logic if needed, simplify for update:
            // If changing amount, check against current balance + previous amount (to not double count)
            $currentAvailable = $salesOrder->balance + ($order->sales_order_id == $salesOrder->id ? $order->programmed_tons : 0);

            if ($validated['programmed_tons'] > $currentAvailable) {
                return back()->withErrors([
                    'programmed_tons' => 'El tonelaje programado excede el saldo disponible de la OV.'
                ])->withInput();
            }
        }

        // Logic for Sacks
        $validated['shortage_balance'] = $request->input('balance');
        if ($validated['presentation'] === 'ENVASADO' && $request->has('sack_type')) {
            $validated['sacks_count'] = $request->input('sack_type') . ' KG';
        }
        unset($validated['sack_type']);
        unset($validated['balance']);
        if (!empty($validated['scale_operator_id'])) {
            $operator = User::find($validated['scale_operator_id']);
            if ($operator) {
                $validated['scale_name'] = $operator->name;
            }
        }
        unset($validated['operator_id']); // Not a column in DB, used for UI search only

        $order->update($validated);

        // Sync Sales Order (especially if programmed_tons or sales_order_id changed)
        $order->sales_order?->syncLoadedQuantity();
        if ($validated['sales_order_id'] != $order->getOriginal('sales_order_id')) {
            // Also sync the old sales order if it was changed
            $oldSalesOrder = SalesOrder::find($order->getOriginal('sales_order_id'));
            $oldSalesOrder?->syncLoadedQuantity();
        }

        $queryParams = $request->input('queryParams', []);

        return redirect()->route('documentation.orders.index', $queryParams)->with('success', 'Orden de Embarque actualizada correctamente.');
    }

    /**
     * Cancel the specified Shipment Order.
     */
    public function cancelOrder($id)
    {
        $order = ShipmentOrder::with(['weight_ticket', 'loadingOrders.weight_ticket'])->findOrFail($id);

        if ($order->status === 'cancelled') {
            return back()->with('error', 'La orden ya está cancelada.');
        }

        // --- VALIDATION: Check for active tickets ---
        // 1. Direct ticket
        if ($order->weight_ticket && $order->weight_ticket->weighing_status !== 'cancelled') {
            return back()->with('error', 'Fallo de Cancelación: Esta Orden tiene un TICKET ACTIVO en Báscula. Debe CANCELAR PRIMERO EL TICKET en el módulo de Báscula (Historial) antes de cancelar la OE.');
        }

        // 2. Continuous tickets (via loading orders)
        foreach ($order->loadingOrders as $lo) {
            if ($lo->weight_ticket && $lo->weight_ticket->weighing_status !== 'cancelled') {
                return back()->with('error', 'Fallo de Cancelación: Esta Orden tiene un TICKET ACTIVO (Orden de Carga) en Báscula. Debe CANCELAR PRIMERO EL TICKET en el módulo de Báscula (Historial) antes de cancelar la OE.');
            }
        }

        $order->update([
            'status' => 'cancelled',
            'cancelled_at' => now()
        ]);

        // Sync Sales Order
        $order->sales_order?->syncLoadedQuantity();

        return back()->with('success', 'Orden de Embarque cancelada correctamente.');
    }

    /**
     * Re-open the specified Shipment Order.
     */
    public function reopenOrder($id)
    {
        $order = ShipmentOrder::findOrFail($id);

        if ($order->status !== 'cancelled') {
            return back()->with('error', 'Solo las órdenes canceladas pueden ser re-abiertas.');
        }

        // 1. Rule: Cannot reopen after 24 hours
        if ($order->cancelled_at && $order->cancelled_at->diffInHours(now()) >= 24) {
            return back()->withErrors(['error' => 'No se puede re-abrir esta orden porque han pasado más de 24 horas desde su cancelación.']);
        }

        // 2. Rule: Validate Carta Porte isn't taken by a new order
        $duplicateExists = ShipmentOrder::where('transport_company', $order->transport_company)
            ->where('carta_porte', $order->carta_porte)
            ->where('status', '!=', 'cancelled')
            ->where('id', '!=', $order->id)
            ->exists();

        if ($duplicateExists) {
            return back()->withErrors(['error' => 'No se puede re-abrir esta orden porque su Carta Porte ya está siendo utilizada en otra orden activa.']);
        }

        // Validate Balance before reopening
        $salesOrder = SalesOrder::findOrFail($order->sales_order_id);

        // Calculate tons needed (Envasado = programmed, Granel = programmed / 1000)
        // Wait, current logic for Envasado uses programmed_tons directly (stored as tons presumably? Or KG?)
        // Let's check how it's stored. In SalesOrder.php:
        // Envasado -> sum('programmed_tons')
        // Granel -> sum('programmed_tons') / 1000

        // So we need to match that logic here.
        $neededTons = 0;
        if ($order->presentation === 'GRANEL') {
            $neededTons = ($order->programmed_tons ?: 0) / 1000;
        } else {
            // For Envasado, programmed_tons is typically stored in Tons if entered as Tons in UI?
            // Checking Create.tsx/Controller: 'programmed_tons' => 'nullable|numeric'
            // If user entering 4000 for Granel implies KG, does user enter 4000 for Envasado implying KG too?
            // Looking at SalesOrder.php line 46: ->sum('programmed_tons'). It adds it DIRECTLY.
            // But for Granel line 65: ->programmed_tons / 1000.
            // This implies Envasado is stored under different unit convention or logic?
            // Let's assume consistent with SalesOrder logic:
            $neededTons = $order->programmed_tons;
        }

        // Wait, if Envasado is adding directly, and Balance = Total - Loaded.
        // If Total is 5000 (Tons) and Envasado programmed is 10 (Sacks? Tons?).
        // If Envasado programmed_tons is entered as 1 (Ton), then 5000 - 1 = 4999. Correct.
        // If Granel programmed_tons is entered as 1000 (KG), then 1000 / 1000 = 1 Ton. Correct.

        if ($salesOrder->balance < $neededTons) {
            return back()->withErrors(['error' => 'Saldo insuficiente en la Orden de Venta para re-abrir esta orden. Requerido: ' . $neededTons . ' Toneladas. Disponible: ' . $salesOrder->balance]);
        }

        $order->update(['status' => 'created']);

        // Sync Sales Order
        $salesOrder->syncLoadedQuantity();

        return redirect()->route('documentation.orders.index')->with('success', 'Orden de Embarque re-abierta correctamente.');
    }

    public function checkCartaPorte(Request $request)
    {
        $cartaPorte = $request->input('carta_porte');
        $transportCompany = $request->input('transport_company');

        if (!$cartaPorte || !$transportCompany) {
            return response()->json(['exists' => false]);
        }

        $exists = ShipmentOrder::where('carta_porte', $cartaPorte)
            ->where('transport_company', $transportCompany)
            ->where('status', '!=', 'cancelled')
            ->exists();

        return response()->json(['exists' => $exists]);
    }

    /**
     * OE Tracker: Show all OE from the current operational cut (07:00 AM to 06:59 AM).
     * Separated by presentation type: Envasado, Granel, Envasado SADER.
     */
    public function oeTrackerIndex(\Illuminate\Http\Request $request)
    {
        $date = $request->input('date', \Carbon\Carbon::today()->toDateString());
        $search = $request->input('search', '');
        $range = \App\Helpers\OperationalTimeHelper::getOperationalRange($date);

        $baseQuery = \App\Models\ShipmentOrder::query()
            ->with(['client', 'sales_order', 'items.product', 'weight_ticket', 'loadingOrders.weight_ticket'])
            ->whereNotIn('status', ['cancelled'])
            ->whereBetween('created_at', $range);

        if (!empty($search)) {
            $baseQuery->where(function ($q) use ($search) {
                $q->where('folio', 'like', "%{$search}%")
                    ->orWhere('operator_name', 'like', "%{$search}%")
                    ->orWhere('tractor_plate', 'like', "%{$search}%")
                    ->orWhere('transport_company', 'like', "%{$search}%")
                    ->orWhereHas('client', function ($q2) use ($search) {
                        $q2->where('business_name', 'like', "%{$search}%");
                    });
            });
        }

        $resolveProduct = function (\App\Models\ShipmentOrder $o): string {
            $name = $o->product ?? ($o->items->first()?->product?->name ?? 'N/A');
            $pres = strtoupper($o->presentation ?? '');
            if (strpos($pres, 'ENVASADO') !== false && !empty($o->sacks_count)) {
                return $name . ' - ' . $o->sacks_count;
            }
            return $name;
        };

        $resolveTicket = function (\App\Models\ShipmentOrder $o) {
            if ($o->weight_ticket) return $o->weight_ticket;
            foreach ($o->loadingOrders as $lo) {
                if ($lo->weight_ticket) return $lo->weight_ticket;
            }
            return null;
        };

        $resolveWarehouse = function (\App\Models\ShipmentOrder $o): string {
            foreach ($o->loadingOrders as $lo) {
                if (!empty($lo->warehouse)) return $lo->warehouse;
            }
            return $o->warehouse ?? 'N/A';
        };

        $computeStatus = function (\App\Models\ShipmentOrder $o) use ($resolveTicket) {
            $ticket = $resolveTicket($o);
            $isPending = in_array($o->status, ['created', 'loading']) || !$ticket || is_null($ticket->weigh_out_at);
            $completedAt = null;
            if (!$isPending && $ticket?->weigh_out_at) {
                $completedAt = \Carbon\Carbon::parse($ticket->weigh_out_at)->toIso8601String();
            }
            return ['is_pending' => $isPending, 'created_at' => $o->created_at?->toIso8601String(), 'completed_at' => $completedAt];
        };

        $mapOrder = function (\App\Models\ShipmentOrder $o, int $i) use ($resolveProduct, $resolveWarehouse, $computeStatus) {
            $t = $computeStatus($o);
            return [
                'id' => $o->id, 'num' => $i + 1, 'folio' => $o->folio,
                'tractor_plate' => $o->tractor_plate ?? 'N/A',
                'operator_name' => $o->operator_name ?? 'N/A',
                'unit_type' => $o->unit_type ?? 'N/A',
                'transport_company' => $o->transport_company ?? 'N/A',
                'client' => $o->client?->business_name ?? 'N/A',
                'warehouse' => $resolveWarehouse($o),
                'product' => $resolveProduct($o),
                'presentation' => $o->presentation ?? 'N/A',
                'programmed_tons' => (float)($o->programmed_tons ?? 0),
                'is_pending' => $t['is_pending'],
                'created_at' => $t['created_at'],
                'completed_at' => $t['completed_at'],
                'status' => $o->status,
            ];
        };

        $all = (clone $baseQuery)->orderBy('created_at', 'asc')->get();

        $envasado = $all->filter(fn($o) => strtoupper($o->presentation ?? '') === 'ENVASADO' && strtoupper(trim($o->consigned_to ?? '')) !== 'SADER')->values();
        $granel   = $all->filter(fn($o) => strtoupper($o->presentation ?? '') === 'GRANEL')->values();
        $sader    = $all->filter(fn($o) => strtoupper($o->presentation ?? '') === 'ENVASADO' && strtoupper(trim($o->consigned_to ?? '')) === 'SADER')->values();

        $mapGroup = fn($col) => $col->map(fn($o, $i) => $mapOrder($o, $i))->values();

        return \Inertia\Inertia::render('Documentation/OeTracker/Index', [
            'envasado' => $mapGroup($envasado),
            'granel'   => $mapGroup($granel),
            'sader'    => $mapGroup($sader),
            'filters'  => ['date' => $date, 'search' => $search],
        ]);
    }
}