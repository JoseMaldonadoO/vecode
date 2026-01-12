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
            'name' => 'required|string|max:255',
            'product_id' => 'required|exists:products,id',
            'client_id' => 'required|exists:clients,id',
            'docking_date' => 'required|date',
            'docking_time' => 'required',
            'origin' => 'required|string',
            'sub_origin' => 'nullable|string',
            'destination' => 'required|string',
            'agency' => 'required|string',
            'programmed_tonnage' => 'required|numeric|min:0',
            // 'service_type' => 'nullable|string', // Keeping optional or removing if input removed
        ]);

        $validated['service_type'] = 'Importación';
        Vessel::create($validated);

        return redirect()->route('dock.index');
    }
}
