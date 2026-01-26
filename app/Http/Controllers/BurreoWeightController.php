<?php

namespace App\Http\Controllers;

use App\Models\Vessel;
use App\Models\WeightTicket;
use App\Models\ShipmentOrder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class BurreoWeightController extends Controller
{
    public function index()
    {
        $vessels = Vessel::with(['client', 'product'])
            ->where('status', 'active')
            ->orWhereNotNull('provisional_burreo_weight')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Traffic/BurreoWeightManager', [
            'vessels' => $vessels
        ]);
    }

    public function updateProvisional(Request $request, Vessel $vessel)
    {
        $validated = $request->validate([
            'provisional_burreo_weight' => 'required|numeric|min:0',
        ]);

        $weightKg = $validated['provisional_burreo_weight'] * 1000;

        try {
            DB::transaction(function () use ($vessel, $weightKg) {
                // 1. Update vessel
                $vessel->update([
                    'provisional_burreo_weight' => $weightKg
                ]);

                // 2. Update all associated Burreo tickets that are NOT finalized by a draft
                // (If draft_weight is null, we are still in provisional phase)
                if ($vessel->draft_weight === null) {
                    $tickets = WeightTicket::whereHas('shipmentOrder', function ($q) use ($vessel) {
                        $q->where('vessel_id', $vessel->id)
                            ->where('operation_type', 'burreo');
                    })
                        ->where('is_burreo', true)
                        ->update([
                            'tare_weight' => $weightKg,
                            'net_weight' => $weightKg
                        ]);
                }
            });

            return back()->with('success', 'Peso provisional actualizado y aplicado a todos los tickets.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Error al actualizar peso provisional: ' . $e->getMessage()]);
        }
    }

    public function applyDraft(Request $request, Vessel $vessel)
    {
        $validated = $request->validate([
            'draft_weight' => 'required|numeric|min:0',
        ]);

        $weightKg = $validated['draft_weight'] * 1000;

        try {
            DB::transaction(function () use ($vessel, $weightKg) {
                // 1. Update the vessel with the draft weight (stored in KG)
                $vessel->update([
                    'draft_weight' => $weightKg
                ]);

                // 2. Find all "Burreo" tickets for this vessel
                $orders = ShipmentOrder::where('vessel_id', $vessel->id)
                    ->where('operation_type', 'burreo')
                    ->whereHas('weight_ticket', function ($q) {
                        $q->where('is_burreo', true);
                    })
                    ->get();

                $burreoCount = $orders->count();

                if ($burreoCount > 0) {
                    $realAverageWeight = $weightKg / $burreoCount;

                    // 3. Update all these tickets with the real average weight
                    foreach ($orders as $order) {
                        $ticket = $order->weight_ticket;
                        $ticket->update([
                            'net_weight' => $realAverageWeight,
                            // Note: we don't strictly update tare_weight here as per business logic 
                            // but net_weight is what counts for Dashboard.
                        ]);
                    }
                }
            });

            return back()->with('success', 'Peso real (Draft) recalculado y tickets actualizados.');

        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Error al aplicar peso de calado: ' . $e->getMessage()]);
        }
    }
}
