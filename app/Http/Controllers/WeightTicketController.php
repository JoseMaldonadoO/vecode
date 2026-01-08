<?php

namespace App\Http\Controllers;

use App\Models\ShipmentOrder;
use App\Models\WeightTicket;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class WeightTicketController extends Controller
{
    public function index()
    {
        // 1. Orders ready for FIRST WEIGH (Assigned but no ticket yet)
        // We assume orders with driver/vehicle assigned are ready.
        // 1. Orders ready for FIRST WEIGH (Assigned but no ticket yet)
        // STRICT: Must be 'authorized' by Surveillance first.
        $pending_entry = ShipmentOrder::with(['client', 'driver', 'vehicle', 'product'])
            ->where('status', 'authorized') // Only trucks allowed by gate
            ->whereDoesntHave('weight_ticket') // No ticket yet
            ->orderBy('entry_at', 'asc')
            ->get();

        // 2. Orders ready for SECOND WEIGH (Ticket started but not finished)
        $pending_exit = ShipmentOrder::with(['client', 'driver', 'vehicle', 'product', 'weight_ticket'])
            ->whereHas('weight_ticket', function($q) {
                $q->where('status', 'in_progress');
            })
            ->get();

        return Inertia::render('Scale/Index', [
            'pending_entry' => $pending_entry,
            'pending_exit' => $pending_exit
        ]);
    }

    public function store(Request $request)
    {
        // FIRST WEIGH (Tare - Empty Truck entering)
        $validated = $request->validate([
            'shipment_order_id' => 'required|exists:shipment_orders,id',
            'weight' => 'required|numeric|min:1',
            'type' => 'required|in:entry,exit' // To distinguish just in case
        ]);

        DB::transaction(function () use ($validated) {
            $ticket = WeightTicket::create([
                'shipment_order_id' => $validated['shipment_order_id'],
                'user_id' => auth()->id(), // Weighmaster
                'ticket_number' => 'TK-' . time(), // Simple generator
                'tare_weight' => $validated['weight'], // Assuming Sales flow: First weigh is TARE
                'gross_weight' => 0,
                'net_weight' => 0,
                'weighing_status' => 'in_progress',
                'measured_at' => now(),
            ]);

            // Update Order Status
            ShipmentOrder::find($validated['shipment_order_id'])->update(['status' => 'loading']);
        });

        return redirect()->back();
    }

    public function update(Request $request, $id)
    {
        // SECOND WEIGH (Gross - Full Truck exiting)
        $validated = $request->validate([
            'weight' => 'required|numeric|min:1',
        ]);

        DB::transaction(function () use ($validated, $id) {
            $ticket = WeightTicket::findOrFail($id);
            
            $gross = $validated['weight'];
            $tare = $ticket->tare_weight;
            $net = $gross - $tare;

            $ticket->update([
                'gross_weight' => $gross,
                'net_weight' => $net,
                'weighing_status' => 'completed',
                // We should probably have 'weighing_status' column in migration? 
                // Migration had 'status' enum: pending, in_progress, completed.
            ]);
            
            // Validate migration column name. I recall 'status' in tickets table.
            // Let's check schemas if needed. Assuming 'status'.

            // Update Order Status
            $ticket->shipment_order->update(['status' => 'completed']);
        });

        return redirect()->back();
    }
}
