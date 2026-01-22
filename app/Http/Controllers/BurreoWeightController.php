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

        $vessel->update([
            'provisional_burreo_weight' => $validated['provisional_burreo_weight']
        ]);

        return back()->with('success', 'Peso provisional actualizado correctamente.');
    }

    public function applyDraft(Request $request, Vessel $vessel)
    {
        $validated = $request->validate([
            'draft_weight' => 'required|numeric|min:0',
        ]);

        try {
            DB::transaction(function () use ($vessel, $validated) {
                // 1. Update the vessel with the draft weight
                $vessel->update([
                    'draft_weight' => $validated['draft_weight']
                ]);

                // 2. Find all completed "Burreo" tickets for this vessel
                $orders = ShipmentOrder::where('vessel_id', $vessel->id)
                    ->where('status', 'completed')
                    ->whereHas('weight_ticket', function ($q) {
                        $q->where('weighing_status', 'completed')
                            ->where('is_burreo', true);
                    })
                    ->get();

                $burreoCount = $orders->count();

                if ($burreoCount > 0) {
                    $realAverageWeight = $validated['draft_weight'] / $burreoCount;

                    // 3. Update all these tickets with the real average weight
                    foreach ($orders as $order) {
                        $ticket = $order->weight_ticket;
                        $ticket->update([
                            'net_weight' => $realAverageWeight,
                        ]);
                    }
                }
            });

            return back()->with('success', 'Peso real recalculado y tickets actualizados.');

        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Error al aplicar peso de calado: ' . $e->getMessage()]);
        }
    }
}
