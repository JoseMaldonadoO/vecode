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
            'operators' => VesselOperator::orderBy('operator_name')->get(),
            'vessels' => Vessel::with('product')->orderBy('created_at', 'desc')->get()
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
            'etc' => 'nullable|date',
            'departure_date' => 'nullable|date',
            'observations' => 'nullable|string',
            // Conditional
            'product_id' => 'required_if:operation_type,Descarga|nullable|exists:products,id',
            'programmed_tonnage' => 'required_if:operation_type,Descarga|nullable|numeric|min:0',
        ]);

        // Fix for legacy service_type column if migration didn't run
        $validated['service_type'] = $validated['operation_type'];

        try {
            Vessel::create($validated);
            return redirect()->route('dock.index')->with('success', 'Barco registrado correctamente.');
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Vessel Create Error: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Error al guardar barco: ' . $e->getMessage()]);
        }
    }

    public function editVessel($id)
    {
        $vessel = Vessel::findOrFail($id);
        return Inertia::render('Dock/EditVessel', [
            'vessel' => $vessel,
            'products' => \App\Models\Product::all(),
            'clients' => \App\Models\Client::all(),
        ]);
    }

    public function updateVessel(Request $request, $id)
    {
        $vessel = Vessel::findOrFail($id);

        $validated = $request->validate([
            'vessel_type' => 'required|string',
            'name' => 'required|string|max:255',
            'eta' => 'required|date',
            'docking_date' => 'required|date',
            'docking_time' => 'required',
            'operation_type' => 'required|string',
            'stay_days' => 'required|integer',
            'etc' => 'nullable|date',
            'departure_date' => 'nullable|date',
            'observations' => 'nullable|string',
            // Conditional
            'product_id' => 'required_if:operation_type,Descarga|nullable|exists:products,id',
            'programmed_tonnage' => 'required_if:operation_type,Descarga|nullable|numeric|min:0',
        ]);

        // Fix for legacy service_type column if migration didn't run
        $validated['service_type'] = $validated['operation_type'];

        try {
            $vessel->update($validated);
            return redirect()->route('dock.index')->with('success', 'Barco actualizado correctamente.');
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Vessel Update Error: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Error al actualizar barco: ' . $e->getMessage()]);
        }
    }
}
