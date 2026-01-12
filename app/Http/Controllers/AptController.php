<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use Inertia\Inertia;

class AptController extends Controller
{
    public function index()
    {
        return Inertia::render('APT/Index');
    }

    public function createOperator()
    {
        return Inertia::render('APT/RegisterOperator', [
            'vessels' => \App\Models\Vessel::orderBy('created_at', 'desc')->get()
        ]);
    }

    public function storeOperator(Request $request)
    {
        $validated = $request->validate([
            'vessel_id' => 'required|exists:vessels,id',
            'operator_name' => 'required|string|max:255',
            'unit_type' => 'required|string',
            'economic_number' => 'required|string',
            'tractor_plate' => 'required|string',
            'trailer_plate' => 'nullable|required_unless:unit_type,Volteo|string',
            'transporter_line' => 'required|string',
        ]);

        $exists = \App\Models\VesselOperator::where('vessel_id', $validated['vessel_id'])
            ->where('operator_name', $validated['operator_name'])
            ->exists();

        if ($exists) {
            return back()->withErrors(['operator_name' => 'Este operador ya está registrado en este barco.']);
        }

        \App\Models\VesselOperator::create($validated);

        return back()->with('success', 'Operador registrado correctamente.');
    }

    public function qrPrint()
    {
        return Inertia::render('APT/QrPrint');
    }

    public function searchOperators(Request $request)
    {
        $query = $request->input('q');
        $operators = \App\Models\VesselOperator::where('operator_name', 'like', "%{$query}%")
            ->orderBy('operator_name')
            ->limit(20)
            ->get();

        return response()->json($operators);
    }
}
