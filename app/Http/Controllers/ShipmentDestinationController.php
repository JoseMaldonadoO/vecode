<?php

namespace App\Http\Controllers;

use App\Models\ShipmentDestination;
use Illuminate\Http\Request;

class ShipmentDestinationController extends Controller
{
    public function index()
    {
        return response()->json(ShipmentDestination::orderBy('name')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:shipment_destinations,name|max:255',
        ]);

        $destination = ShipmentDestination::create([
            'name' => strtoupper(trim($validated['name'])),
        ]);

        return response()->json($destination, 201);
    }

    public function update(Request $request, ShipmentDestination $destination)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:shipment_destinations,name,' . $destination->id . '|max:255',
        ]);

        $destination->update([
            'name' => strtoupper(trim($validated['name'])),
        ]);

        return response()->json($destination);
    }

    public function destroy(ShipmentDestination $destination)
    {
        $destination->delete();
        return response()->json(null, 204);
    }
}
