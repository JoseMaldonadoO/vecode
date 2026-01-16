<?php

namespace App\Http\Controllers;

use App\Models\ShipmentOrder;
use App\Models\Client;
use App\Models\Product;
use App\Models\Vessel;
use App\Models\VesselOperator;
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
            'sale_order' => 'required|string',
            'date' => 'required|date',
            'client_id' => 'nullable|exists:clients,id',
            // Snapshot fields
            'client_name' => 'nullable|string',
            'rfc' => 'nullable|string',
            'address' => 'nullable|string',
            'consigned_to' => 'nullable|string',
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
            'sacks_count' => 'nullable|string',
            'programmed_tons' => 'nullable|numeric',
            'shortage_balance' => 'nullable|string',
            'documenter_name' => 'nullable|string',
            'scale_name' => 'nullable|string',
            'observations' => 'nullable|string',
        ]);

        // If client_id is present, we might want to ensure snapshot fields are filled if empty
        // logic here...

        ShipmentOrder::create($validated + ['status' => 'created']);

        return redirect()->route('documentation.index')->with('success', 'Orden de Embarque creada correctamente.');
    }

    // --- Moved Functionality from APT ---

    // QR Printing
    public function qrPrint()
    {
        return Inertia::render('Documentation/QrPrint');
    }

    // Dock Submenu
    public function dock()
    {
        return Inertia::render('Documentation/Dock');
    }

    // Operator Registration (Alta Operador)
    public function createOperator()
    {
        // Strict filter: Only allowed vessels, and UNIQUE by name
        $vessels = Vessel::with('product')
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

        $exists = VesselOperator::where('vessel_id', $validated['vessel_id'])
            ->where('operator_name', $validated['operator_name'])
            ->exists();

        if ($exists) {
            return back()->withErrors(['operator_name' => 'Este operador ya está registrado en este barco.']);
        }

        VesselOperator::create($validated);

        return back()->with('success', 'Operador registrado correctamente.');
    }

    // Search Operators (used by QR Print and potentially Form)
    public function searchOperators(Request $request)
    {
        $query = $request->input('q');
        $operators = VesselOperator::where('operator_name', 'like', "%{$query}%")
            ->orWhere('id', $query)
            ->orderBy('operator_name')
            ->limit(20)
            ->get();

        return response()->json($operators);
    }

    // --- New Methods for Operators List ---

    public function operatorsIndex(Request $request)
    {
        $query = VesselOperator::query();

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('operator_name', 'like', "%{$search}%")
                    ->orWhere('id', 'like', "%{$search}%")
                    ->orWhere('transporter_line', 'like', "%{$search}%")
                    ->orWhere('economic_number', 'like', "%{$search}%");
            });
        }

        $operators = $query->with('vessel')->orderBy('created_at', 'desc')->paginate(10);

        return Inertia::render('Documentation/Operators/Index', [
            'operators' => $operators,
            'filters' => $request->only(['search']),
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

        $operator = VesselOperator::findOrFail($id);
        $operator->update($validated);

        return redirect()->route('documentation.operators.index')->with('success', 'Operador actualizado correctamente.');
    }
}
