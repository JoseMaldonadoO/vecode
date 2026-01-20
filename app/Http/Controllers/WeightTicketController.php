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
        // 1. Pending Entry (Authorized but no Ticket)
        $pending_entry = ShipmentOrder::with(['client', 'driver', 'vehicle', 'product'])
            ->where('status', 'authorized')
            ->whereDoesntHave('weight_ticket')
            ->orderBy('entry_at', 'asc')
            ->get();

        // 2. Pending Exit (Ticket In Progress OR Status Loading)
        // User said: "Después regresa a báscula al destare aquí necesitamos un status de las que están pendientes de destarar"
        // Valid for Exit: Has Ticket AND Ticket Status is 'in_progress'
        // And maybe Order Status 'loading' (which is set on Entry).
        // Also include Warehouse/Cubicle info if available.
        $pending_exit = ShipmentOrder::with(['client', 'driver', 'vehicle', 'product', 'weight_ticket'])
            ->whereHas('weight_ticket', function ($q) {
                $q->where('weighing_status', 'in_progress');
            })
            // Filter by operation type if needed (scale vs burreo)?
            // Assuming Burreo doesn't have a weight ticket in progress in the same way, or handled differently.
            ->orderBy('entry_at', 'asc')
            ->get()
            ->map(function ($order) {
                // Flatten for easier frontend consumption
                return [
                    'id' => $order->id,
                    'folio' => $order->folio,
                    'provider' => $order->client->name ?? 'N/A',
                    'product' => $order->product->name ?? 'N/A',
                    'driver' => $order->operator_name ?? $order->driver->name ?? 'N/A',
                    'plate' => $order->tractor_plate ?? $order->vehicle->plate ?? 'N/A',
                    'tare_weight' => $order->weight_ticket->tare_weight ?? 0,
                    'warehouse' => $order->warehouse ?? 'N/A',
                    'cubicle' => $order->cubicle ?? 'N/A',
                    'entry_at' => $order->entry_at,
                ];
            });

        return Inertia::render('Scale/Index', [
            'pending_entry' => $pending_entry,
            'pending_exit' => $pending_exit
        ]);
    }

    // ... (keep store and update methods for legacy or refactor later) ...
    public function store(Request $request)
    {
        return redirect()->back();
    } // Stub legacy
    public function update(Request $request, $id)
    {
        return redirect()->back();
    } // Stub legacy

    // --- New Methods for Entry MI / MP ---

    public function createEntry(Request $request)
    {
        $scaleId = $request->query('scale_id', 1); // Default to 1 if not provided
        return Inertia::render('Scale/EntryMP', [
            'active_scale_id' => (int) $scaleId
        ]);
    }

    public function createEntrySale(Request $request)
    {
        $scaleId = $request->query('scale_id', 1);
        return Inertia::render('Scale/EntrySale', [
            'active_scale_id' => (int) $scaleId
        ]);
    }

    public function createExit(Request $request, $id = null)
    {
        $orderData = null;

        if ($id) {
            $order = ShipmentOrder::with(['client', 'product', 'driver', 'vehicle', 'transporter', 'weight_ticket'])
                ->findOrFail($id);

            $orderData = [
                'id' => $order->id,
                'folio' => $order->folio,
                'provider' => $order->client_name ?? ($order->client->name ?? ($order->vessel->client->name ?? 'N/A')),
                'product' => is_string($order->product) ? $order->product : ($order->product->name ?? 'N/A'),
                'driver' => $order->operator_name ?? $order->driver->name ?? 'N/A',
                'vehicle_plate' => $order->tractor_plate ?? $order->vehicle->plate ?? 'N/A',
                'trailer_plate' => $order->trailer_plate ?? $order->vehicle->trailer_plate ?? 'N/A',
                'transport_line' => $order->transport_company ?? $order->transporter->name ?? 'N/A',
                'entry_weight' => $order->weight_ticket->tare_weight ?? 0, // Actually Gross Weight in "Full -> Empty" flow, but stored as tare_weight for now
                'warehouse' => $order->warehouse ?? 'N/A',
                'cubicle' => $order->cubicle ?? 'N/A',
                'reference' => $order->reference ?? '',
                'consignee' => $order->consignee ?? '',
            ];
        }

        return Inertia::render('Scale/ExitMP', [
            'order' => $orderData,
            'active_scale_id' => (int) $request->input('scale_id', 1)
        ]);
    }

    public function searchQr(Request $request)
    {
        $qr = $request->input('qr');

        // Check for Vessel Operator QR format: OP:{id}|{name}
        if (str_starts_with($qr, 'OP ')) {
            $parts = explode('|', substr($qr, 3));
            $operatorId = $parts[0] ?? null;

            if ($operatorId) {
                // Fetch Operator with Vessel and derived data
                $operator = VesselOperator::with(['vessel.client', 'vessel.product'])->find($operatorId);

                if ($operator) {
                    // BEFORE suggesting a new entry, check if this operator already has an active order "In Plant"
                    $activeOrder = ShipmentOrder::where('status', 'loading')
                        ->where('tractor_plate', $operator->tractor_plate)
                        ->orderBy('created_at', 'desc')
                        ->first();

                    if ($activeOrder) {
                        return response()->json([
                            'type' => 'shipment_order',
                            'id' => $activeOrder->id,
                            'provider' => $activeOrder->client_name ?? ($activeOrder->client->name ?? 'N/A'),
                            'driver' => $activeOrder->operator_name ?? 'N/A',
                            'vehicle_plate' => $activeOrder->tractor_plate ?? 'N/A',
                            'product' => $activeOrder->product ?? ($activeOrder->product_relationship->name ?? 'N/A'),
                            'origin' => $activeOrder->origin ?? 'N/A',
                            'status' => $activeOrder->status,
                            'warehouse' => $activeOrder->warehouse,
                            'cubicle' => $activeOrder->cubicle,
                            'vessel_etb' => $operator->vessel->etb,
                            'force_burreo' => !empty($operator->vessel->etb),
                        ]);
                    }

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
                        'vessel_etb' => $operator->vessel->etb,
                        'force_burreo' => !empty($operator->vessel->etb),
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
            'provider' => $order->client_name ?? ($order->client->name ?? 'N/A'),
            'product' => $order->product ?? ($order->product_relationship->name ?? 'N/A'),
            'transporter' => $order->transport_company ?? ($order->transporter->name ?? ''),
            'carta_porte' => $order->bill_of_lading ?? '',
            'driver' => $order->operator_name ?? ($order->driver->name ?? 'N/A'),
            'vehicle_type' => $order->unit_type ?? ($order->vehicle->type ?? 'N/A'),
            'vehicle_plate' => $order->tractor_plate ?? ($order->vehicle->plate ?? ''),
            'trailer_plate' => $order->trailer_plate ?? ($order->vehicle->trailer_plate ?? 'N/A'),
            'origin' => $order->origin ?? ($order->origin_address ?? 'N/A'),
            'destination' => $order->destination_address ?? 'N/A',
            'product' => $order->product->name ?? 'N/A',
            'presentation' => $order->product->presentation ?? 'Granel',
            'programmed_weight' => $order->programmed_amount ?? 0,
            'status' => $order->status,
            // Mapped for UI consistency
            'transport_line' => $order->transporter->name ?? ($order->transport_company ?? ''),
            'withdrawal_letter' => $order->withdrawal_letter ?? '',
            'reference' => $order->sale_order ?? '',
            'consignee' => $order->consignee ?? '',
            'vessel_etb' => $order->vessel->etb ?? null,
            'force_burreo' => !empty($order->vessel->etb ?? null),
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
            'container_type' => 'nullable|string', // Optional now
            'container_id' => 'nullable|string',
            'observations' => 'nullable|string',
            'scale_id' => 'nullable|integer', // 1, 2, 3
        ]);

        try {
            DB::transaction(function () use ($validated) {
                $orderId = !empty($validated['shipment_order_id']) ? $validated['shipment_order_id'] : null;

                // Ensure nullable integer fields are strictly NULL if empty
                $vesselId = !empty($validated['vessel_id']) ? $validated['vessel_id'] : null;
                $productId = !empty($validated['product_id']) ? $validated['product_id'] : null;
                $clientId = !empty($validated['client_id']) ? $validated['client_id'] : 1; // Default to 1 (General Public) if missing
                $scaleId = !empty($validated['scale_id']) ? $validated['scale_id'] : null;

                // If no existing Order, create one (Vessel Entry Scenario)
                if (!$orderId) {
                    // Generate Folio
                    // Generate Folio (Reset sequence to numeric only starting at 0000)
                    $numericCount = ShipmentOrder::where('folio', 'REGEXP', '^[0-9]+$')->count();
                    $folio = str_pad($numericCount, 4, '0', STR_PAD_LEFT);

                    $order = ShipmentOrder::create([
                        'id' => (string) \Illuminate\Support\Str::uuid(),
                        'folio' => $folio,
                        'client_id' => $clientId,
                        'client_name' => $validated['provider'] ?? null,
                        'product_id' => $productId,
                        'vessel_id' => $vesselId,
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
                    if ($order) {
                        $order->update([
                            'status' => 'loading',
                            'entry_at' => $order->entry_at ?? now(),
                            'withdrawal_letter' => $validated['withdrawal_letter'] ?? $order->withdrawal_letter,
                            'reference' => $validated['reference'] ?? $order->reference,
                        ]);
                    }
                }

                // Create Ticket
                WeightTicket::create([
                    'shipment_order_id' => $orderId,
                    'weighmaster_id' => auth()->id(),
                    'ticket_number' => 'TK-' . time(),
                    'tare_weight' => $validated['tare_weight'],
                    'gross_weight' => 0,
                    'net_weight' => 0,
                    'weighing_status' => 'in_progress',
                    'weigh_in_at' => now(),
                    'container_type' => $validated['container_type'] ?? 'N/A',
                    'scale_id' => $scaleId,
                ]);
            });

            return redirect()->route('scale.index')->with('success', 'Entrada registrada correctamente.');

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Scale Entry Error: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Error al registrar entrada: ' . $e->getMessage()]);
        }
    }

    public function storeExit(Request $request)
    {
        $validated = $request->validate([
            'shipment_order_id' => 'required|exists:shipment_orders,id',
            'weight' => 'required|numeric|min:0', // Exit weight (Gross or Second weight)
        ]);

        try {
            DB::transaction(function () use ($validated) {
                $order = ShipmentOrder::with('weight_ticket')->findOrFail($validated['shipment_order_id']);
                $ticket = $order->weight_ticket;

                if (!$ticket) {
                    throw new \Exception("Esta orden no tiene ticket de entrada.");
                }

                if (empty($order->warehouse)) {
                    throw new \Exception("ALERTA: No se puede destarar sin haber asignado Almacén en el módulo APT.");
                }

                // Calculate Net Weight (Always Positive)
                // Typically: Net = Gross - Tare. 
                // Here: Input 'weight' is the *current* weight.
                // If truck came in Empty (Tare) and leaves Full (Gross): Net = Current - Tare.
                // If truck came in Full (Gross) and leaves Empty (Tare): Net = Gross - Current.
                // We use ABS to handle both logic without complex flags, assuming Process is valid.
                // "El sistema debe dar siempre el peso neto en positivo".

                $firstWeight = $ticket->tare_weight; // Named 'tare_weight' in DB but represents First Weight
                $secondWeight = $validated['weight'];
                $net = abs($secondWeight - $firstWeight);

                // Update Ticket
                $ticket->update([
                    'gross_weight' => $secondWeight, // Store second weight here
                    'net_weight' => $net,
                    'weighing_status' => 'completed',
                    'weigh_out_at' => now(),
                ]);

                // Update Order
                $order->update([
                    'status' => 'completed',
                    'destare_status' => 'completed', // Explicitly marked as destared
                ]);
            });


            return redirect()->route('scale.ticket.print', ['id' => $validated['shipment_order_id']])->with('success', 'Salida registrada correctamente.');

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Scale Exit Error: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Error al registrar salida: ' . $e->getMessage()]);
        }
    }

    public function printTicket($id)
    {
        $order = ShipmentOrder::with(['client', 'product', 'driver', 'vehicle', 'transporter', 'weight_ticket', 'vessel'])
            ->findOrFail($id);

        $ticket = $order->weight_ticket;

        if (!$ticket) {
            return redirect()->route('scale.index')->withErrors(['error' => 'Esta orden no tiene ticket generado.']);
        }

        // Format dates
        $entryDate = $transactionEntryDate = \Carbon\Carbon::parse($ticket->weigh_in_at ?? $order->entry_at);
        $exitDate = \Carbon\Carbon::parse($ticket->weigh_out_at ?? now());

        $data = [
            'folio' => $order->folio,
            'ticket_number' => $ticket->ticket_number,
            'date' => $exitDate->format('d/m/Y'),
            'time' => $exitDate->format('H:i:s'),

            'reference' => $order->reference ?? 'N/A',
            'operation' => 'SALIDA', // Assuming always exit for generated ticket
            'scale_number' => $ticket->scale_id ?? 2, // Default or fetch

            'product' => is_string($order->product) ? $order->product : ($order->product->name ?? 'N/A'),
            'presentation' => $order->presentation ?? ($order->product->presentation ?? 'GRANEL'),

            // Weights
            'entry_weight' => $ticket->tare_weight, // stored as tare (1st weight)
            'exit_weight' => $ticket->gross_weight, // stored as gross (2nd weight)
            'gross_weight' => max($ticket->tare_weight, $ticket->gross_weight), // Real Bruto is the biggest
            'tare_weight' => min($ticket->tare_weight, $ticket->gross_weight),  // Real Tara is the smallest
            'net_weight' => $ticket->net_weight,

            'client' => $order->client_name ?? ($order->client->name ?? ($order->vessel->client->name ?? 'N/A')),
            'sale_order' => 'N/A',
            'withdrawal_letter' => $order->bill_of_lading ?? ($order->withdrawal_letter ?? 'N/A'),

            'driver' => $order->operator_name ?? 'N/A',
            'tractor_plate' => $order->tractor_plate ?? 'N/A',
            'trailer_plate' => $order->trailer_plate ?? 'N/A',
            'economic_number' => $order->economic_number ?? 'N/A',

            'destination' => trim(($order->warehouse ?? '') . ($order->cubicle && $order->cubicle !== 'N/A' ? " - Cubículo {$order->cubicle}" : '')) ?: 'N/A',
            'transporter' => $order->transport_company ?? ($order->transporter->name ?? 'N/A'),
            'consignee' => 'N/A',

            'observations' => trim('DESCARGA DE BARCO ' . ($order->vessel->name ?? '') . ' ' . ($order->observation ?? '')),

            'entry_at' => $entryDate->format('d/m/Y H:i'),
            'exit_at' => $exitDate->format('d/m/Y H:i'),

            'weighmaster' => auth()->user()->name ?? 'BASCULA',
            'documenter' => 'DOCUMENTACIÓN', // Placeholder
        ];

        return Inertia::render('Scale/Ticket', [
            'ticket' => $data
        ]);
    }
}
