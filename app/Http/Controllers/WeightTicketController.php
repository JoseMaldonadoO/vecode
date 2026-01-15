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

        // Check for Vessel Operator QR format: OP:{id}|{name}
        if (str_starts_with($qr, 'OP:')) {
            $parts = explode('|', substr($qr, 3));
            $operatorId = $parts[0] ?? null;

            if ($operatorId) {
                // Fetch Operator with Vessel and derived data
                $operator = VesselOperator::with(['vessel.client', 'vessel.product'])->find($operatorId);

                if ($operator) {
                    // Suggest Withdrawal Letter ID logic
                    $lastOrder = ShipmentOrder::latest()->first();
                    $nextFolio = 1;
                    if ($lastOrder && $lastOrder->withdrawal_letter) {
                        $nums = preg_replace('/[^0-9]/', '', $lastOrder->withdrawal_letter);
                        if (is_numeric($nums)) {
                            $nextFolio = intval($nums) + 1;
                        }
                    }
                    $suggestedWithdrawal = str_pad($nextFolio, 5, '0', STR_PAD_LEFT);

                    return response()->json([
                        'type' => 'vessel_operator',
                        'id' => null, // No Order ID yet
                        'vessel_operator_id' => $operator->id,
                        'vessel_id' => $operator->vessel_id,
                        'provider' => $operator->vessel->client->business_name ?? ($operator->vessel->client->name ?? 'N/A'),
                        'client_id' => $operator->vessel->client_id ?? null,
                        'product' => $operator->vessel->product->name ?? 'N/A',
                        'product_id' => $operator->vessel->product_id ?? null,
                        'reference' => 'Barco: ' . $operator->vessel->name,
                        'transport_line' => $operator->transporter_line,
                        'driver' => $operator->operator_name,
                        'vehicle_type' => $operator->unit_type,
                        'vehicle_plate' => $operator->tractor_plate,
                        'trailer_plate' => $operator->trailer_plate,
                        'economic_number' => $operator->economic_number,
                        'origin' => $operator->vessel->origin ?? 'Puerto',
                        'suggested_withdrawal_letter' => $suggestedWithdrawal,
                        'status' => 'new_entry',
                    ]);
                }
            }
        }

        // Fallback: Standard ShipmentOrder Search
        $order = ShipmentOrder::with(['client', 'transporter', 'driver', 'vehicle', 'product', 'vessel'])
            ->where('id', $qr)
            ->first();

        if (!$order) {
            return response()->json(['error' => 'Orden no encontrada'], 404);
        }

        return response()->json([
            'type' => 'shipment_order',
            'id' => $order->id,
            'provider' => $order->client->name ?? 'N/A',
            'transporter' => $order->transporter->name ?? '',
            'carta_porte' => $order->bill_of_lading ?? '',
            'driver' => $order->driver->name ?? 'N/A',
            'vehicle_type' => $order->vehicle->type ?? 'N/A',
            'vehicle_plate' => $order->vehicle->plate ?? '',
            'trailer_plate' => $order->vehicle->trailer_plate ?? 'N/A',
            'origin' => $order->origin_address ?? 'N/A',
            'destination' => $order->destination_address ?? 'N/A',
            'product' => $order->product->name ?? 'N/A',
            'presentation' => $order->product->presentation ?? 'Granel',
            'programmed_weight' => $order->programmed_amount ?? 0,
            'status' => $order->status,
            // Mapped for UI consistency
            'transport_line' => $order->transporter->name ?? '',
            'withdrawal_letter' => $order->withdrawal_letter ?? '',
            'reference' => $order->sale_order ?? '', // Use OV as reference? Or new field
            'consignee' => $order->consignee ?? '',
        ]);
    }

    public function storeEntry(Request $request)
    {
        $validated = $request->validate([
            'shipment_order_id' => 'nullable|uuid', // Nullable for new Vessel entries
            'vessel_id' => 'nullable|exists:vessels,id',
            // Manual / Derived Fields
            'client_id' => 'nullable|exists:clients,id',
            'product_id' => 'nullable|exists:products,id',

            // Text Fallbacks for Snapshot
            'provider' => 'nullable|string',
            'product' => 'nullable|string',

            'withdrawal_letter' => 'nullable|string',
            'reference' => 'nullable|string',
            'consignee' => 'nullable|string',
            'destination' => 'nullable|string',
            'origin' => 'nullable|string',
            'bill_of_lading' => 'nullable|string', // Carta Porte

            // Transport info (Snapshot)
            'driver' => 'required|string',
            'vehicle_plate' => 'required|string',
            'trailer_plate' => 'nullable|string',
            'vehicle_type' => 'required|string',
            'transport_line' => 'required|string',
            'economic_number' => 'nullable|string',

            // Scale info
            'tare_weight' => 'required|numeric|min:1',
            'seal' => 'required|string',
            'lot' => 'required|string',
            'container_type' => 'required|string',
            'container_id' => 'nullable|string',
            'observations' => 'nullable|string',
        ]);

        DB::transaction(function () use ($validated) {
            $orderId = $validated['shipment_order_id'] ?? null;

            // If no existing Order, create one (Vessel Entry Scenario)
            if (!$orderId) {
                // Generate Folio
                $count = ShipmentOrder::count() + 1;
                $folio = 'EMP-' . date('Ymd') . '-' . str_pad($count, 4, '0', STR_PAD_LEFT);

                // Determine Client ID
                $clientId = $validated['client_id'] ?? 1; // Fallback or assume validation handled it

                $order = ShipmentOrder::create([
                    'id' => (string) \Illuminate\Support\Str::uuid(),
                    'folio' => $folio,
                    'client_id' => $clientId,
                    'product_id' => $validated['product_id'] ?? null,
                    'vessel_id' => $validated['vessel_id'] ?? null,
                    'status' => 'loading',
                    'entry_at' => now(),

                    // Snapshot Fields
                    'operator_name' => $validated['driver'],
                    'tractor_plate' => $validated['vehicle_plate'],
                    'trailer_plate' => $validated['trailer_plate'],
                    'unit_type' => $validated['vehicle_type'],
                    'transport_company' => $validated['transport_line'],
                    'economic_number' => $validated['economic_number'] ?? null,

                    // New Fields
                    'bill_of_lading' => $validated['bill_of_lading'],
                    'withdrawal_letter' => $validated['withdrawal_letter'],
                    'reference' => $validated['reference'],
                    'consignee' => $validated['consignee'],
                    'destination' => $validated['destination'],
                    'origin' => $validated['origin'],

                    // Legacy text fallbacks if no ID
                    'product' => $validated['product'] ?? null,
                ]);

                $orderId = $order->id;
            } else {
                // Update existing order
                $order = ShipmentOrder::find($orderId);
                $order->update([
                    'status' => 'loading',
                    'entry_at' => $order->entry_at ?? now(),
                    'withdrawal_letter' => $validated['withdrawal_letter'] ?? $order->withdrawal_letter,
                    'reference' => $validated['reference'] ?? $order->reference,
                ]);
            }

            // Create Ticket
            WeightTicket::create([
                'shipment_order_id' => $orderId,
                'user_id' => auth()->id(),
                'ticket_number' => 'TK-' . time(),
                'tare_weight' => $validated['tare_weight'],
                'gross_weight' => 0,
                'net_weight' => 0,
                'weighing_status' => 'in_progress',
                'weigh_in_at' => now(),
                'lot' => $validated['lot'],
                'seal' => $validated['seal'],
                'container_type' => $validated['container_type'],
            ]);
        });

        return redirect()->route('scale.index')->with('success', 'Peso de entrada registrado correctamente.');
    }
}
