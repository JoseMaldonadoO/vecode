<?php

namespace App\Http\Controllers;

use App\Models\ShipmentOrder;
use App\Models\LoadingOrder;
use App\Models\Vessel;
use App\Models\VesselOperator; // Import new model
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class DockController extends Controller
{
    public function index(Request $request)
    {
        // Strict filter: Only show Blue Commander and Nordorinoco
        $query = Vessel::with('product')
            ->orderBy('created_at', 'desc');

        if ($request->has('start_date') && $request->has('end_date') && $request->start_date && $request->end_date) {
            $query->whereBetween('docking_date', [$request->start_date, $request->end_date]);
        }

        return Inertia::render('Dock/Index', [
            'operators' => VesselOperator::orderBy('operator_name')->get(),
            'vessels' => $query->paginate(10)->withQueryString(),
            'filters' => $request->only(['start_date', 'end_date']),
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
            'docking_date' => 'nullable|date',
            'docking_time' => 'nullable',
            'operation_type' => 'required|string',
            'dock' => 'nullable|string', // Added validation for dock
            'stay_days' => 'required|integer',
            'etc' => 'nullable|date',
            'departure_date' => 'nullable|date',
            'observations' => 'nullable|string',

            // New Fields
            'length' => 'nullable|numeric|min:0',
            'beam' => 'nullable|numeric|min:0',
            'draft' => 'nullable|numeric|min:0',
            'nationality' => 'nullable|string|max:255',
            'imo_number' => 'nullable|string|max:255',
            'registration_number' => 'nullable|string|max:255',
            'importer' => 'nullable|string|max:255',
            'consignee_agency' => 'nullable|string|max:255',
            'customs_agency' => 'nullable|string|max:255',
            'client_id' => 'required|exists:clients,id',
            'apt_operation_type' => 'required|string|in:scale,burreo',

            // Conditional
            'product_id' => 'required_if:operation_type,Descarga,Carga|nullable|exists:products,id',
            'programmed_tonnage' => 'required_if:operation_type,Descarga,Carga|nullable|numeric|min:0',
            // Carga
            'destination_port' => 'required_if:operation_type,Carga|nullable|string|max:255',
            // Descarga
            'origin_port' => 'required_if:operation_type,Descarga,Carga|nullable|string|max:255',
            'loading_port' => 'required_if:operation_type,Descarga,Carga|nullable|string|max:255',
        ]);

        // Fix for legacy service_type column if migration didn't run
        $validated['service_type'] = $validated['operation_type'];

        // Create valid ETB Timestamp using Carbon to handle time formats
        $etb = null;
        if ($request->filled('docking_date')) {
            $timeString = $request->docking_time ?? '00:00:00';
            try {
                // Combine date and time, let Carbon parse whatever format comes in (e.g. 1:00 p.m., 13:00)
                $etb = \Carbon\Carbon::parse($request->docking_date . ' ' . $timeString);
            } catch (\Exception $e) {
                // Fallback if parsing fails
                $etb = \Carbon\Carbon::parse($request->docking_date);
            }
        }
        $validated['etb'] = $etb;
        $validated['berthal_datetime'] = $etb;

        // Validation for Dock Occupancy
        if ($validated['berthal_datetime'] && $validated['dock']) {
            $now = now();
            $occupied = Vessel::active()
                ->where('dock', $validated['dock'])
                ->where('berthal_datetime', '<=', $now)
                ->first();

            if ($occupied) {
                return back()->withErrors([
                    'error' => "El muelle {$validated['dock']} está ocupado por el buque {$occupied->name}. " .
                        "Por favor, asigne una fecha de salida al buque activo antes de asignar este muelle."
                ])->withInput();
            }
        }

        try {
            Vessel::create($validated);
            return redirect()->route('dock.index')->with('success', 'Barco registrado correctamente.');
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Vessel Create Error: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Error al guardar barco: ' . $e->getMessage()])->withInput();
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
            'docking_date' => 'nullable|date',
            'docking_time' => 'nullable',
            'operation_type' => 'required|string',
            'dock' => 'nullable|string', // Added validation for dock
            'stay_days' => 'required|integer',
            'etc' => 'nullable|date',
            'departure_date' => 'nullable|date',
            'observations' => 'nullable|string',

            // New Fields
            'length' => 'nullable|numeric|min:0',
            'beam' => 'nullable|numeric|min:0',
            'draft' => 'nullable|numeric|min:0',
            'nationality' => 'nullable|string|max:255',
            'imo_number' => 'nullable|string|max:255',
            'registration_number' => 'nullable|string|max:255',
            'importer' => 'nullable|string|max:255',
            'consignee_agency' => 'nullable|string|max:255',
            'customs_agency' => 'nullable|string|max:255',
            'client_id' => 'required|exists:clients,id',
            'apt_operation_type' => 'required|string|in:scale,burreo',

            // Conditional
            'product_id' => 'required_if:operation_type,Descarga,Carga|nullable|exists:products,id',
            'programmed_tonnage' => 'required_if:operation_type,Descarga,Carga|nullable|numeric|min:0',
            // Carga
            'destination_port' => 'required_if:operation_type,Carga|nullable|string|max:255',
            // Descarga
            'origin_port' => 'required_if:operation_type,Descarga,Carga|nullable|string|max:255',
            'loading_port' => 'required_if:operation_type,Descarga,Carga|nullable|string|max:255',
        ]);

        // Fix for legacy service_type column if migration didn't run
        $validated['service_type'] = $validated['operation_type'];

        // Create valid ETB Timestamp using Carbon to handle time formats
        $etb = null;
        if ($request->filled('docking_date')) {
            $timeString = $request->docking_time ?? '00:00:00';
            try {
                // Combine date and time, let Carbon parse whatever format comes in (e.g. 1:00 p.m., 13:00)
                $etb = \Carbon\Carbon::parse($request->docking_date . ' ' . $timeString);
            } catch (\Exception $e) {
                // Fallback if parsing fails
                $etb = \Carbon\Carbon::parse($request->docking_date);
            }
        }
        $validated['etb'] = $etb;
        $validated['berthal_datetime'] = $etb;

        if (isset($validated['stay_days']) && $validated['stay_days'] === null) {
            $validated['stay_days'] = 0;
        }

        // Validation for Dock Occupancy
        if ($validated['berthal_datetime'] && $validated['dock']) {
            $now = now();
            $occupied = Vessel::active()
                ->where('dock', $validated['dock'])
                ->where('berthal_datetime', '<=', $now)
                ->where('id', '!=', $id) // Exclude self
                ->first();

            if ($occupied) {
                return back()->withErrors([
                    'error' => "El muelle {$validated['dock']} está ocupado por el buque {$occupied->name}. " .
                        "Por favor, asigne una fecha de salida al buque activo antes de asignar este muelle."
                ])->withInput();
            }
        }

        try {
            $vessel->update($validated);
            return redirect()->route('dock.index')->with('success', 'Barco actualizado correctamente.');
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Vessel Update Error: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Error al actualizar barco: ' . $e->getMessage()])->withInput();
        }
    }
    public function status()
    {
        $now = now(); // Use Carbon::now()

        // Active Vessels (Atracados y sin zarpar) - Logic: ETB passed and no departure
        $activeQuery = Vessel::whereNotNull('berthal_datetime')
            ->where('berthal_datetime', '<=', $now)
            ->whereNull('departure_date');

        $activeVessels = $activeQuery->get();

        // Categorize by dock
        $eco = $activeVessels->firstWhere('dock', 'ECO');
        $whisky = $activeVessels->firstWhere('dock', 'WHISKY');

        // Arrivals (No atracados aún, o fondeados) - Logic: No ETB OR ETB is in future
        $arrivals = Vessel::with('product') // Eager load
            ->whereNull('departure_date')
            ->where(function ($query) use ($now) {
                $query->whereNull('berthal_datetime')
                    ->orWhere('berthal_datetime', '>', $now);
            })
            ->orderBy('eta', 'asc')
            ->get()
            ->map(function ($vessel) {
                return [
                    'name' => $vessel->name,
                    'type' => $vessel->vessel_type ?? 'M/V',
                    'eta' => $vessel->is_anchored ? 'Fondeado' : ($vessel->eta ? (is_string($vessel->eta) ? date('d/m/Y', strtotime($vessel->eta)) : $vessel->eta->format('d/m/Y')) : 'Pendiente'),
                    'etb' => $vessel->etb ? (is_string($vessel->etb) ? date('d/m/Y H:i', strtotime($vessel->etb)) : $vessel->etb->format('d/m/Y H:i')) : '-',
                    'operation_type' => $vessel->operation_type,
                    'dock' => $vessel->dock ?? 'Por Asignar',
                    'est_stay' => $vessel->stay_days,
                    'product' => $vessel->product?->name, // Nullsafe
                    'is_anchored' => (bool) $vessel->is_anchored
                ];
            });

        // Format Active Vessels
        $formatVessel = function ($v) {
            if (!$v)
                return ['name' => '-'];
            return [
                'name' => $v->name,
                'type' => $v->vessel_type ?? 'B/T',
                'operation_type' => $v->operation_type,
                'stay_days' => $v->stay_days,
                'etb' => $v->berthal_datetime ? (is_string($v->berthal_datetime) ? date('d/m/Y H:i', strtotime($v->berthal_datetime)) : $v->berthal_datetime->format('d/m/Y H:i')) : '-',
            ];
        };

        return Inertia::render('Dock/Status', [
            'active_vessels' => [
                'eco' => $formatVessel($eco),
                'whisky' => $formatVessel($whisky),
            ],
            'arrivals' => $arrivals
        ]);
    }
    public function destroy($id)
    {
        $vessel = Vessel::findOrFail($id);

        // Check for dependencies
        if (ShipmentOrder::where('vessel_id', $id)->exists()) {
            return back()->withErrors(['error' => 'No se puede eliminar: El barco tiene Órdenes de Embarque asociadas.']);
        }

        if (LoadingOrder::where('vessel_id', $id)->exists()) {
            return back()->withErrors(['error' => 'No se puede eliminar: El barco tiene Órdenes de Carga (Operativas) asociadas.']);
        }

        if (VesselOperator::where('vessel_id', $id)->exists()) {
            return back()->withErrors(['error' => 'No se puede eliminar: El barco tiene Operadores registrados.']);
        }

        // Optional: Check specific other relations if necessary, e.g., WeighTickets if they link directly to vessels not via orders
        // if (WeightTicket::where('vessel_id', $id)->exists()) { ... }

        try {
            $vessel->delete();
            return redirect()->route('dock.index')->with('success', 'Barco eliminado correctamente.');
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Vessel Delete Error: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Error al eliminar barco: ' . $e->getMessage()]);
        }
    }

    public function purge($id)
    {
        $vessel = Vessel::findOrFail($id);

        try {
            DB::transaction(function () use ($vessel, $id) {
                // Temporarily disable foreign key checks for a clean purge
                DB::statement('SET FOREIGN_KEY_CHECKS=0;');

                // 1. Get related IDs for manual cleanup (extra safety)
                $shipmentOrderIds = ShipmentOrder::where('vessel_id', $id)->pluck('id');
                $loadingOrderIds = LoadingOrder::where('vessel_id', $id)->pluck('id');
                $operatorIds = VesselOperator::where('vessel_id', $id)->pluck('id');

                // 2. Delete scans (linked to orders OR operators)
                // Note: AptScan now links to loading_order_id too
                \App\Models\AptScan::whereIn('shipment_order_id', $shipmentOrderIds)
                    ->orWhereIn('loading_order_id', $loadingOrderIds)
                    ->orWhereIn('operator_id', $operatorIds)
                    ->delete();

                // 3. Delete other order-related data
                if ($loadingOrderIds->isNotEmpty()) {
                    \App\Models\WeightTicket::whereIn('loading_order_id', $loadingOrderIds)->delete();
                    \App\Models\LoadingOperation::whereIn('loading_order_id', $loadingOrderIds)->delete();
                }

                // Legacy cleanup for ShipmentOrders
                if ($shipmentOrderIds->isNotEmpty()) {
                    \App\Models\WeightTicket::whereIn('shipment_order_id', $shipmentOrderIds)->delete(); // legacy link
                    \App\Models\ShipmentItem::whereIn('shipment_order_id', $shipmentOrderIds)->delete();
                }

                // 4. Delete Orders
                LoadingOrder::where('vessel_id', $id)->delete();
                ShipmentOrder::where('vessel_id', $id)->delete();

                // 5. Delete VesselOperators
                VesselOperator::where('vessel_id', $id)->delete();

                // 6. Delete the Vessel
                $vessel->delete();

                // Re-enable foreign key checks
                DB::statement('SET FOREIGN_KEY_CHECKS=1;');
            });

            return redirect()->route('dock.index')->with('success', 'Barco y todos sus registros asociados han sido purgados correctamente.');
        } catch (\Exception $e) {
            // Ensure checks are re-enabled even on failure
            DB::statement('SET FOREIGN_KEY_CHECKS=1;');
            \Illuminate\Support\Facades\Log::error('Vessel Purge Error: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Error al purgar barco: ' . $e->getMessage()]);
        }
    }
}
