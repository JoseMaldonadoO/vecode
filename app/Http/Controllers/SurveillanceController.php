<?php

namespace App\Http\Controllers;

use App\Models\ShipmentOrder;
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
}
