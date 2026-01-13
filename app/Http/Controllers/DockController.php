<?php

namespace App\Http\Controllers;

use App\Models\ShipmentOrder;
use App\Models\Vessel;
use App\Models\VesselOperator; // Import new model
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class DockController extends Controller
{
    public function index()
    {
        return Inertia::render('Dock/Index', [
            'operators' => VesselOperator::orderBy('operator_name')->get()
        ]);
    }

    public function createVessel()
    {
        return Inertia::render('Dock/CreateVessel', [
            'products' => \App\Models\Product::all(),
            'clients' => \App\Models\Client::all(),
        ]);
    }

    public function storeVessel(Request $request)
    {
        $validated = $request->validate([
            'vessel_type' => 'required|string',
            'name' => 'required|string|max:255',
            'eta' => 'required|date',
            'docking_date' => 'required|date',
            'docking_time' => 'required',
            'operation_type' => 'required|string',
            'stay_days' => 'required|integer',
            'etc' => 'required|date',
            'departure_date' => 'nullable|date',
            'observations' => 'nullable|string',
            // Conditional
            'product_id' => 'required_if:operation_type,Descarga|nullable|exists:products,id',
            'programmed_tonnage' => 'required_if:operation_type,Descarga|nullable|numeric|min:0',
        ]);

        Vessel::create($validated);

        return redirect()->route('dock.index')->with('success', 'Barco registrado correctamente.');
    }
}
