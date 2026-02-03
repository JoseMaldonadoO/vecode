<?php

namespace App\Http\Controllers;

use App\Models\ShipmentOrder;
use App\Models\ExitOperator;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class SurveillanceController extends Controller
{
    public function index()
    {
        // 1. Expected Units: Status 'created' AND has driver/vehicle assigned
        // These are units that Traffic has processed but haven't arrived at the gate yet.
        $expected = ShipmentOrder::with(['client', 'transporter', 'driver', 'vehicle'])
            ->where('status', 'created')
            ->whereNotNull('driver_id')
            ->whereNotNull('vehicle_id')
            ->orderBy('created_at', 'asc')
            ->get();

        // 2. On-Site Units: Status 'authorized' or 'weighing_in' or 'loading' or 'weighing_out'
        // Basically anything inside the plant but not yet completed.
        $in_plant = ShipmentOrder::with(['client', 'transporter', 'driver', 'vehicle'])
            ->whereIn('status', ['authorized', 'weighing_in', 'loading', 'weighing_out'])
            ->orderBy('entry_at', 'desc')
            ->get();

        return Inertia::render('Surveillance/Index', [
            'expected' => $expected,
            'in_plant' => $in_plant
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'shipment_order_id' => 'required|exists:shipment_orders,id'
        ]);

        $order = ShipmentOrder::findOrFail($request->shipment_order_id);

        if ($order->status !== 'created') {
            return redirect()->back()->withErrors(['message' => 'Esta orden ya fue procesada.']);
        }

        $order->update([
            'status' => 'authorized',
            'entry_at' => Carbon::now()
        ]);

        return redirect()->back();
    }

    public function vetoIndex()
    {
        return Inertia::render('Surveillance/VetoOperator');
    }

    public function searchOperators(Request $request)
    {
        $queryText = $request->input('q');

        if (empty($queryText)) {
            return response()->json([]);
        }

        // Normalize input for common scanner keyboard layout issues
        // Replace '?' with '_' and ']' with '|'
        $normalizedText = str_replace(['?', ']'], ['_', '|'], $queryText);

        // Logic for QR code format: OP_EXIT {id}|{name}|{plate}
        if (str_starts_with($normalizedText, 'OP_EXIT ')) {
            $parts = explode(' ', $normalizedText);
            if (count($parts) > 1) {
                $details = explode('|', $parts[1]);
                $id = $details[0];
                $operator = ExitOperator::find($id);
                return response()->json($operator ? [$operator] : []);
            }
        }

        // Normal search by ID or Name or Plate - using normalized text just in case
        $operators = ExitOperator::where('id', $normalizedText)
            ->orWhere('name', 'like', "%{$normalizedText}%")
            ->orWhere('tractor_plate', 'like', "%{$normalizedText}%")
            ->limit(5)
            ->get();

        return response()->json($operators);
    }

    public function vetoOperator($id)
    {
        $operator = ExitOperator::findOrFail($id);

        if ($operator->status === 'vetoed') {
            return back()->with('error', 'El operador ya se encuentra vetado.');
        }

        $operator->status = 'vetoed';
        $operator->save();

        return back()->with('success', 'Operador vetado correctamente.');
    }
}
