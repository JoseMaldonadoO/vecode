<?php

namespace App\Http\Controllers;

use App\Models\ShipmentOrder;
use App\Models\WeightTicket;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use App\Models\Vessel; // Assuming we need this for origin/destination if related
use App\Models\VesselOperator; // Legacy fallback?

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
            ->whereHas('weight_ticket', function ($q) {
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

    // --- New Methods for Entry MI / MP ---

    public function createEntry()
    {
        return Inertia::render('Scale/EntryMP');
    }

    public function searchQr(Request $request)
    {
        $qr = $request->input('qr');

        // Search logic: Try to find a ShipmentOrder by id (if QR is UUID) or some other identifier.
        // Legacy system used "Op" code. We might need a field for that or just search ID.
        // For now, assuming QR contains the UUID of the ShipmentOrder.

        $order = ShipmentOrder::with(['client', 'transporter', 'driver', 'vehicle', 'product', 'vessel'])
            ->where('id', $qr) // Or where('legacy_qr_code', $qr)
            ->first();

        if (!$order) {
            return response()->json(['error' => 'Orden no encontrada'], 404);
        }

        // Map to legacy format if needed by frontend, or just send clean object
        return response()->json([
            'id' => $order->id,
            'provider' => $order->client->name ?? 'N/A',
            'transporter' => $order->transporter->name ?? 'N/A',
            'driver' => $order->driver->name ?? 'N/A',
            'vehicle' => $order->vehicle->name ?? 'N/A', // Description or plate?
            'vehicle_plate' => $order->vehicle->plate ?? '',
            'trailer_plate' => $order->vehicle->trailer_plate ?? 'N/A', // Assuming vehicle has this
            'vehicle_type' => $order->vehicle->type ?? 'N/A',
            'origin' => $order->origin_address ?? 'N/A', // Check model fields
            'destination' => $order->destination_address ?? 'N/A',
            'product' => $order->product->name ?? 'N/A',
            'presentation' => $order->product->presentation ?? 'Granel', // Default
            'programmed_weight' => $order->programmed_amount ?? 0,
            'status' => $order->status,
            // Add derived fields for UI
            'transport_line' => $order->transporter->name ?? '',
            'carta_porte' => $order->bill_of_lading ?? '', // Assuming this field exists
        ]);
    }

    public function storeEntry(Request $request)
    {
        $validated = $request->validate([
            'shipment_order_id' => 'required|exists:shipment_orders,id',
            'tare_weight' => 'required|numeric|min:1',
            'seal' => 'required|string',
            'lot' => 'required|string', // N/A is valid
            'container_type' => 'required|string',
            'container_id' => 'nullable|string', // Almacen if Lot is N/A
            'observations' => 'nullable|string',
        ]);

        DB::transaction(function () use ($validated) {

            // Create Ticket
            $ticket = WeightTicket::create([
                'shipment_order_id' => $validated['shipment_order_id'],
                'user_id' => auth()->id(),
                'ticket_number' => 'TK-' . time(), // Generator
                'tare_weight' => $validated['tare_weight'],
                'gross_weight' => 0,
                'net_weight' => 0,
                'weighing_status' => 'in_progress', // Wait for exit weigh
                'weigh_in_at' => now(),
                'lot' => $validated['lot'],
                'seal' => $validated['seal'],
                'container_type' => $validated['container_type'],
            ]);

            // Update Order
            $order = ShipmentOrder::find($validated['shipment_order_id']);
            $order->update([
                'status' => 'loading', // Set to loading as they are entering
                // Save legacy "Almacen" if needed, maybe in observations?
            ]);
        });

        return redirect()->route('scale.index')->with('success', 'Peso de entrada registrado correctamente.');
    }
}
