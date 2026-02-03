<?php

namespace App\Http\Controllers;

use App\Models\ExitOperator;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExitOperatorController extends Controller
{
    public function index(Request $request)
    {
        $query = ExitOperator::query();

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('id', 'like', "%{$search}%")
                    ->orWhere('transport_line', 'like', "%{$search}%")
                    ->orWhere('tractor_plate', 'like', "%{$search}%");
            });
        }

        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        $operators = $query->orderBy('created_at', 'desc')->paginate(10);

        return Inertia::render('Documentation/ExitOperators/Index', [
            'operators' => $operators,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Documentation/ExitOperators/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'license' => 'required|string|max:255',
            'transport_line' => 'required|string|max:255',
            'economic_number' => 'required|string|max:255',
            'real_transport_line' => 'required|string|max:255',
            'policy' => 'required|string|max:255',
            'unit_type' => 'required|string|max:255',
            'validity' => 'required|date',
            'brand_model' => 'required|string|max:255',
            'tractor_plate' => 'required|string|max:255',
            'trailer_plate' => 'nullable|string|max:255',
        ]);

        ExitOperator::create($validated);

        return redirect()->route('documentation.exit-operators.index')->with('success', 'Operador de salida registrado correctamente.');
    }

    public function edit($id)
    {
        $operator = ExitOperator::findOrFail($id);
        return Inertia::render('Documentation/ExitOperators/Edit', [
            'operator' => $operator,
        ]);
    }

    public function update(Request $request, $id)
    {
        $operator = ExitOperator::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'license' => 'required|string|max:255',
            'transport_line' => 'required|string|max:255',
            'economic_number' => 'required|string|max:255',
            'real_transport_line' => 'required|string|max:255',
            'policy' => 'required|string|max:255',
            'unit_type' => 'required|string|max:255',
            'validity' => 'required|date',
            'brand_model' => 'required|string|max:255',
            'tractor_plate' => 'required|string|max:255',
            'trailer_plate' => 'nullable|string|max:255',
        ]);

        $operator->update($validated);

        return redirect()->route('documentation.exit-operators.index')->with('success', 'Operador actualizado correctamente.');
    }

    public function toggleStatus($id)
    {
        $operator = ExitOperator::findOrFail($id);
        $operator->status = $operator->status === 'active' ? 'vetoed' : 'active';
        $operator->save();

        $message = $operator->status === 'vetoed' ? 'Operador vetado correctamente.' : 'Operador activado correctamente.';
        return back()->with('success', $message);
    }

    public function qr($id)
    {
        $operator = ExitOperator::findOrFail($id);
        return Inertia::render('Documentation/ExitOperators/Qr', [
            'operator' => $operator,
        ]);
    }
}
