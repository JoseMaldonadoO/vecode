<?php

namespace App\Http\Controllers;

use App\Models\ShipmentOrigin;
use Illuminate\Http\Request;

class ShipmentOriginController extends Controller
{
    public function index()
    {
        return response()->json(ShipmentOrigin::orderBy('name')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:shipment_origins,name|max:255',
        ]);

        $origin = ShipmentOrigin::create([
            'name' => strtoupper($validated['name']),
        ]);

        return response()->json($origin, 201);
    }

    public function update(Request $request, ShipmentOrigin $origin)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:shipment_origins,name,' . $origin->id . '|max:255',
        ]);

        $origin->update([
            'name' => strtoupper($validated['name']),
        ]);

        return response()->json($origin);
    }

    public function destroy(ShipmentOrigin $origin)
    {
        // Don't delete "PLANTA" if it's considered system default, 
        // but user asked for "option to delete" generally.
        $origin->delete();
        return response()->json(null, 204);
    }
}
