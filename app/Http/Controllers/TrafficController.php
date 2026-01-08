<?php

namespace App\Http\Controllers;

use App\Models\ShipmentOrder;
use App\Models\Transporter;
use App\Models\Driver;
use App\Models\Vehicle;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TrafficController extends Controller
{
    public function index()
    {
        // Fetch orders that need traffic assignment (e.g., status 'created' or 'confirmed' but missing traffic info)
        // For now, we show all 'created' orders as they enter the system here first.
        $orders = ShipmentOrder::with('client', 'transporter', 'driver', 'vehicle')
            ->whereIn('status', ['created'])
            ->orderBy('created_at', 'asc')
            ->get();

        return Inertia::render('Traffic/Index', [
            'orders' => $orders,
            'transporters' => Transporter::with(['drivers', 'vehicles'])->get()
        ]);
    }

    public function update(Request $request, ShipmentOrder $traffic)
    {
        $validated = $request->validate([
            'transporter_id' => 'required|exists:transporters,id',
            'driver_id' => 'required|exists:drivers,id',
            'vehicle_id' => 'required|exists:vehicles,id',
        ]);

        $traffic->update([
            'transporter_id' => $validated['transporter_id'],
            'driver_id' => $validated['driver_id'],
            'vehicle_id' => $validated['vehicle_id'],
            'status' => 'weighing_in' // Move to next stage automatically? Or keep as created/assigned?
            // Let's keep it simple: assigning traffic moves it to "Ready for Weigh-in" effectively.
            // But strict status flow might be: created -> assigned -> weighing_in. 
            // The enum includes 'weighing_in'. Let's trigger that or maybe just update the fields.
            // For this flow, let's keep status as 'created' until they physically arrive at scale?
            // Or maybe update to 'assigned'? enum didn't have 'assigned'.
            // Let's keep 'created' but now it has data. Or upgrade to 'weighing_in' if that implies "Ready".
            // Actually, "weighing_in" typically means ON THE SCALE.
            // Let's leave status as is, just save the data. The Scale module will pick it up.
        ]);

        return redirect()->back();
    }
}
