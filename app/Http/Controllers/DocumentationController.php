<?php

namespace App\Http\Controllers;

use App\Models\ShipmentOrder;
use App\Models\Client;
use App\Models\Product;
use App\Models\Vessel;
use App\Models\VesselOperator;
use App\Models\SalesOrder;
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
    public function create()
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
            'default_folio' => 'PA' . date('Y') . '-' . str_pad(ShipmentOrder::count() + 1, 4, '0', STR_PAD_LEFT),
        ]);
    }

    /**
     * Store a newly created Shipment Order.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'folio' => 'required|unique:shipment_orders,folio',
            'date' => 'required|date',
            'client_id' => 'required|exists:clients,id',
            'sales_order_id' => 'required|exists:sales_orders,id',
            // Snapshot fields
            // 'client_name' => 'nullable|string', // Removed: Relation based
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
            'origin' => 'nullable|string',
            'destination' => 'nullable|string',
            'product' => 'nullable|string', // Text snapshot or ID? Form implies text/select
            'presentation' => 'nullable|string',
            'sack_type' => 'nullable|string', // Frontend supplemental field
            'sacks_count' => 'nullable|string',
            'programmed_tons' => 'nullable|numeric',
            'balance' => 'nullable', // Frontend field for shortage_balance
            'shortage_balance' => 'nullable|string',
            'documenter_name' => 'nullable|string',
            'scale_name' => 'nullable|string',
            'observations' => 'nullable|string',
        ]);

        // Map frontend fields to DB columns
        $validated['shortage_balance'] = $request->input('balance');

        if ($validated['presentation'] === 'ENVASADO' && $request->has('sack_type')) {
            $validated['sacks_count'] = $request->input('sack_type') . ' KG';
        }

        // Remove auxiliary fields not in DB
        unset($validated['sack_type']);
        unset($validated['balance']);

        // If client_id is present, we might want to ensure snapshot fields are filled if empty
        // logic here...

        ShipmentOrder::create($validated + ['status' => 'created']);

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

    // Search Operators (used by QR Print and potentially Form)
    public function searchOperators(Request $request)
    {
        $query = $request->input('q');
        $operators = VesselOperator::where(function ($q) use ($query) {
            $q->where('operator_name', 'like', "%{$query}%")
                ->orWhere('id', $query);
        })
            ->whereHas('vessel', function ($q) {
                $q->active();
            })
            ->orderBy('operator_name')
            ->limit(20)
            ->get();

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

        $operators = $query->orderBy('created_at', 'desc')->paginate(10);

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

    /**
     * Display a report of shipment orders (OB).
     */
    public function shipmentOrdersIndex(Request $request)
    {
        $query = ShipmentOrder::query()
            ->with(['client', 'vessel', 'sales_order'])
            ->whereIn('operation_type', ['scale', 'burreo']);

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('folio', 'like', "%{$search}%")
                    ->orWhereHas('sales_order', function ($sq) use ($search) {
                        $sq->where('folio', 'like', "%{$search}%");
                    })
                    ->orWhereHas('client', function ($cq) use ($search) {
                        $cq->where('business_name', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->has('type') && in_array($request->input('type'), ['scale', 'burreo'])) {
            $query->where('operation_type', $request->input('type'));
        }

        $orders = $query->orderBy('created_at', 'desc')->paginate(10);

        return Inertia::render('Documentation/Orders/Index', [
            'orders' => $orders,
            'filters' => $request->only(['search', 'type']),
            'clients' => Client::orderBy('business_name')->get()->map(function ($client) {
                return [
                    'id' => $client->id,
                    'business_name' => $client->business_name,
                    'rfc' => $client->rfc ?? '',
                    'address' => $client->address ?? '',
                ];
            }),
            'products' => Product::all(),
            'sales_orders' => SalesOrder::where('status', 'created')->orWhere('status', 'open')->get(),
            'default_folio' => 'PA' . date('Y') . '-' . str_pad(ShipmentOrder::count() + 1, 4, '0', STR_PAD_LEFT),
        ]);
    }

    /**
     * Print the Shipment Order (Orden de Embarque) in legacy format.
     */
    public function printOrder($id)
    {
        $order = ShipmentOrder::with(['client', 'sales_order.client', 'product', 'vessel', 'transporter', 'driver', 'vehicle'])
            ->findOrFail($id);

        return Inertia::render('Documentation/Orders/Print', [
            'order' => $order
        ]);
    }
}
