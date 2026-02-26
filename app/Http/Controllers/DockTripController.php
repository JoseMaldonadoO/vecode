<?php

namespace App\Http\Controllers;

use App\Models\Vessel;
use App\Models\VesselOperator;
use App\Models\VesselOperatorTrip;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class DockTripController extends Controller
{
    public function index(Request $request)
    {
        $vessels = Vessel::active()->get();

        $recentTrips = VesselOperatorTrip::with(['operator', 'vessel', 'registrar'])
            ->orderBy('created_at', 'desc')
            ->paginate(50)
            ->withQueryString();

        return Inertia::render('Dock/Trips', [
            'vessels' => $vessels,
            'recentTrips' => $recentTrips,
            'filters' => $request->only(['date', 'vessel_id']),
        ]);
    }

    public function searchOperator(Request $request)
    {
        $request->validate([
            'qr' => 'required|string',
        ]);

        // QR Format: "OP {id}|{name}"
        $qr = $request->qr;
        if (!str_contains($qr, 'OP')) {
            return response()->json(['error' => 'Formato de QR no válido para Muelle.'], 422);
        }

        $parts = explode('|', $qr);
        $idPart = trim(str_replace('OP', '', $parts[0]));

        $operator = VesselOperator::with(['vessel'])->find($idPart);

        if (!$operator) {
            return response()->json(['error' => 'Operador no encontrado.'], 404);
        }

        // Check if vessel is active
        if (!$operator->vessel->is_active) {
            return response()->json(['error' => 'El barco vinculado a este operador ya no está activo.'], 422);
        }

        return response()->json([
            'id' => $operator->id,
            'name' => $operator->operator_name,
            'economic_number' => $operator->economic_number,
            'tractor_plate' => $operator->tractor_plate,
            'transporter_line' => $operator->transporter_line,
            'vessel' => [
                'id' => $operator->vessel->id,
                'name' => $operator->vessel->name,
                'holds' => $operator->vessel->holds,
                'operation_type' => $operator->vessel->apt_operation_type, // General operation type (scale/burreo)
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'vessel_id' => 'required|exists:vessels,id',
            'vessel_operator_id' => 'required|exists:vessel_operators,id',
            'hold_number' => 'required|integer',
            'operation_type' => 'required|in:Carga,Descarga',
            'notes' => 'nullable|string',
        ]);

        $vessel = Vessel::findOrFail($validated['vessel_id']);

        // STRICT CHECK 1: Only allow dock trips for vessels in 'burreo' mode
        if ($vessel->apt_operation_type !== 'burreo') {
            return back()->withErrors(['vessel_id' => 'ALERTA: Este barco no está configurado para "Burreo". Los barcos de Báscula no deben registrar vueltas en este panel.']);
        }

        // STRICT CHECK 2: Prevent "Double Trip" without APT download
        $pendingTrip = VesselOperatorTrip::where('vessel_operator_id', $validated['vessel_operator_id'])
            ->where('vessel_id', $validated['vessel_id'])
            ->whereDoesntHave('loading_order')
            ->first();

        if ($pendingTrip) {
            return back()->withErrors([
                'vessel_operator_id' => 'OPERACIÓN BLOQUEADA: El operador ya tiene un viaje activo registrado en muelle. Debe completar la descarga en APT antes de iniciar una nueva vuelta.'
            ]);
        }

        // Priority: Draft Weight > Provisional Burreo Weight
        $automaticWeight = $vessel->draft_weight ?? $vessel->provisional_burreo_weight;

        $trip = VesselOperatorTrip::create([
            ...$validated,
            'registered_by' => Auth::id(),
            'start_time' => now(),
            'weight' => $automaticWeight ? ($automaticWeight / 1000) : null,
            'status' => $automaticWeight ? 'completed' : 'pending',
        ]);

        return redirect()->back()->with('success', 'Viaje registrado correctamente.');
    }

    public function destroy($id)
    {
        $trip = VesselOperatorTrip::findOrFail($id);
        $trip->delete();

        return redirect()->back()->with('success', 'Registro eliminado.');
    }
}
