<?php

namespace App\Http\Controllers;

use App\Models\LoadingOrder;
use App\Models\WeightTicket;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use App\Models\Vessel; // Assuming we need this for origin/destination if related
use App\Models\VesselOperator; // Legacy fallback?
use App\Models\ShipmentOrder;

class WeightTicketController extends Controller
{
    public function index()
    {
        // 1. Pending Entry (Authorized but no Ticket)
        $pending_entry = LoadingOrder::with(['client', 'driver', 'vehicle', 'product'])
            ->where('status', 'authorized')
            ->whereDoesntHave('weight_ticket')
            ->orderBy('entry_at', 'asc')
            ->get();

        // 2. Pending Exit (Ticket In Progress OR Status Loading)
        // Since we now UNIFIED the flow, ALL active tickets are attached to a LoadingOrder.
        // So we only need to query LoadingOrder.

        $pending_exit = LoadingOrder::with(['client', 'driver', 'vehicle', 'product', 'weight_ticket'])
            ->whereHas('weight_ticket', function ($q) {
                $q->where('weighing_status', 'in_progress')
                    ->where('is_burreo', false);
            })
            ->orderBy('entry_at', 'asc')
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'folio' => $order->folio,
                    'provider' => $order->client_name ?? ($order->client->name ?? 'N/A'),
                    'product' => $order->product_name ?? ($order->product->name ?? 'N/A'),
                    'driver' => $order->operator_name ?? $order->driver->name ?? 'N/A',
                    'plate' => $order->tractor_plate ?? $order->vehicle->plate ?? 'N/A',
                    'tare_weight' => $order->weight_ticket->tare_weight ?? 0,
                    'warehouse' => $order->warehouse ?? 'N/A',
                    'cubicle' => $order->cubicle ?? 'N/A',
                    'entry_at' => $order->entry_at,
                    'type' => $order->shipment_order_id ? 'sale' : 'vessel',
                ];
            });

        return Inertia::render('Scale/Index', [
            'pending_entry' => $pending_entry,
            'pending_exit' => $pending_exit
        ]);
    }

    // --- Ticket Management Section ---

    public function tickets(Request $request)
    {
        $filters = $request->only(['search', 'date']);

        $query = WeightTicket::with([
            'loadingOrder' => function ($q) {
                // Vessel / Import
                $q->with(['client', 'product', 'driver', 'vehicle', 'vessel.client']);
            },
            'shipmentOrder' => function ($q) {
                // Sales / Export
                $q->with(['client', 'product', 'driver', 'vehicle', 'sales_order']);
            }
        ])
            ->where('is_burreo', false) // EXCLUDE BURREO
            ->orderBy('created_at', 'desc');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('ticket_number', 'like', "%{$search}%")
                    ->orWhereHas('loadingOrder', function ($lo) use ($search) {
                        $lo->where('folio', 'like', "%{$search}%")
                            ->orWhere('operator_name', 'like', "%{$search}%")
                            ->orWhere('tractor_plate', 'like', "%{$search}%");
                    })
                    ->orWhereHas('shipmentOrder', function ($so) use ($search) {
                        $so->where('folio', 'like', "%{$search}%")
                            ->orWhere('operator_name', 'like', "%{$search}%")
                            ->orWhere('tractor_plate', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->filled('date')) {
            $query->whereDate('created_at', $request->date);
        }

        $tickets = $query->paginate(10)
            ->withQueryString()
            ->through(function ($ticket) {
                // Determine source (LoadingOrder vs ShipmentOrder)
                $order = $ticket->loadingOrder ?? $ticket->shipmentOrder;

                // Common fields mapping
                // Note: ShipmentOrder uses 'client' relation too.
                // Product might be relation or string.
    
                // Fallbacks if orphaned ticket (shouldn't happen but safe to handle)
                $folio = $order->folio ?? $ticket->folio ?? 'N/A';
                $driver = $order->operator_name ?? ($order->driver->name ?? 'N/A');
                $plate = $order->tractor_plate ?? ($order->vehicle->plate ?? 'N/A');

                // Product
                // LoadingOrder: product (text) or relation
                // ShipmentOrder: product (relation or text?)
                $productName = 'N/A';
                if ($order) {
                    $productName = is_string($order->product) ? $order->product : ($order->product->name ?? 'N/A');
                    if ($productName === 'N/A' && isset($order->product_name))
                        $productName = $order->product_name;
                }

                $saleOrder = 'S/A';
                if ($ticket->loadingOrder) {
                    $saleOrder = $ticket->loadingOrder->sales_order->folio ?? 'S/A';
                } elseif ($ticket->shipmentOrder) {
                    $saleOrder = $ticket->shipmentOrder->sales_order->folio ?? 'S/A';
                }

                return [
                    'id' => $order->id ?? $ticket->id, // Link ID. If ShipmentOrder, pass that ID.
                    'ticket_id' => $ticket->id,
                    'folio' => $folio,
                    'ticket_number' => $ticket->ticket_number,
                    'driver' => $driver,
                    'vehicle_plate' => $plate,
                    'product' => $productName,
                    'sale_order' => $saleOrder,
                    'status' => $ticket->weighing_status,
                    'entry_at' => $ticket->weigh_in_at,
                    'exit_at' => $ticket->weigh_out_at,
                    'tare_weight' => $ticket->tare_weight,
                    'gross_weight' => $ticket->gross_weight,
                    'net_weight' => $ticket->net_weight,
                    // Pass type for frontend URL generation if needed?
                    // Currently edit link uses /scale/tickets/{id}/edit -> calls editTicket($id)
                    // editTicket uses LoadingOrder::find($id). I need to fix that too.
                    'is_shipment_order' => !!$ticket->shipmentOrder,
                ];
            });

        return Inertia::render('Scale/Tickets/Index', [
            'tickets' => $tickets,
            'filters' => $filters
        ]);
    }

    public function editTicket($id)
    {
        // Try LoadingOrder first
        $order = LoadingOrder::with(['weight_ticket'])->find($id);

        if (!$order) {
            $order = \App\Models\ShipmentOrder::with(['weight_ticket'])->find($id);
        }

        if (!$order || !$order->weight_ticket) {
            return back()->withErrors(['error' => 'Ticket no encontrado.']);
        }

        return Inertia::render('Scale/Tickets/Edit', [
            'ticket' => $order->weight_ticket,
            'order' => $order
        ]);
    }

    public function updateTicket(Request $request, $id)
    {
        // $id is Order ID (logic from edit link)
        $order = LoadingOrder::with('weight_ticket')->find($id);
        if (!$order)
            $order = \App\Models\ShipmentOrder::with(['weight_ticket'])->find($id);

        if (!$order)
            abort(404, 'Orden no encontrada');

        $ticket = $order->weight_ticket;

        $validated = $request->validate([
            'tare_weight' => 'required|numeric|min:0',
            'gross_weight' => 'required|numeric|min:0',
            'net_weight' => 'required|numeric|min:0', // calculated usually, but allowed to edit?
            'observations' => 'nullable|string',
        ]);

        $ticket->update([
            'tare_weight' => $validated['tare_weight'],
            'gross_weight' => $validated['gross_weight'],
            'net_weight' => $validated['net_weight'],
        ]);

        // Also update Order observations if needed
        if ($request->has('observations')) {
            $order->update(['observations' => $validated['observations']]);
        }

        return redirect()->route('scale.tickets.index')->with('success', 'Ticket actualizado correctamente.');
    }

    public function destroyTicket($id)
    {
        try {
            DB::transaction(function () use ($id) {
                // $id is Order ID
                $order = LoadingOrder::with('weight_ticket')->findOrFail($id);

                if ($order->weight_ticket) {
                    $order->weight_ticket->delete();
                }

                // Reset Order
                // "Authorized" allows creating a new ticket (Entry).
                $order->update([
                    'status' => 'authorized', // Revert to pre-scale status
                    'destare_status' => 'pending', // Reset to default (cannot be null)
                ]);
            });

            return redirect()->back()->with('success', 'Ticket eliminado. La orden ha vuelto a estado "Autorizado".');

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error deleting ticket: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Error al eliminar ticket: ' . $e->getMessage()]);
        }
    }

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
            $order = LoadingOrder::with(['client', 'product', 'driver', 'vehicle', 'transporter', 'weight_ticket', 'shipment_order'])
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
                'programmed_weight' => $order->shipment_order->programmed_weight ?? 0,
            ];
        }

        return Inertia::render('Scale/ExitMP', [
            'order' => $orderData,
            'active_scale_id' => (int) $request->input('scale_id', 1)
        ]);
    }

    public function searchFolio(Request $request)
    {
        $folio = $request->input('folio');

        if (!$folio) {
            return response()->json(['error' => 'Por favor ingrese un folio.'], 400);
        }

        // Search in ShipmentOrders (Ordenes de Embarque) for Sales/Exit
        $order = \App\Models\ShipmentOrder::with(['client', 'items.product', 'driver', 'vehicle', 'transporter', 'sales_order'])
            ->where('folio', $folio)
            ->first();

        if (!$order) {
            return response()->json(['error' => 'Orden de Embarque no encontrada.'], 404);
        }

        // Check if ticket exists via weight_ticket relation
        if ($order->weight_ticket) {
            return response()->json(['error' => 'Esta orden ya tiene un ticket de báscula generado.'], 403);
        }

        // Calculate Programmed Weight and Product from Items
        $programmedWeight = $order->items->sum('requested_quantity');
        $productName = $order->items->first()?->product->name ?? 'N/A';

        // Override if multiple items? For now just take first or comma separated. 
        // Usually bulk is single product.

        return response()->json([
            'id' => $order->id,
            'folio' => $order->folio,
            'provider' => $order->client->business_name ?? ($order->client->name ?? 'N/A'),
            'driver' => $order->operator_name ?? ($order->driver->name ?? 'N/A'),
            'vehicle_plate' => $order->tractor_plate ?? ($order->vehicle->plate ?? 'N/A'),
            'trailer_plate' => $order->trailer_plate ?? ($order->vehicle->trailer_plate ?? 'N/A'),
            'vehicle_type' => $order->unit_type ?? 'N/A',
            'transport_line' => $order->transport_company ?? ($order->transporter->name ?? 'N/A'),
            'economic_number' => $order->economic_number,
            'product' => $productName,
            'origin' => $order->origin,
            'reference' => $order->customer_reference, // Accessor
            'consignee' => $order->consigned_to ?? ($order->consignee ?? ''),
            'destination' => $order->destination,
            'bill_of_lading' => $order->carta_porte ?? ($order->bill_of_lading ?? ''),
            'withdrawal_letter' => $order->sale_order_folio ?? '',
            'programmed_weight' => $programmedWeight,
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
                    // ARCHIVE CHECK: If vessel is inactive or already departed, block ALL operations immediately
                    // requested message: "ALERTA: El barco asociado a este operador no está en operación"
                    if (!$operator->vessel->is_active) {
                        return response()->json([
                            'error' => 'ALERTA: El barco asociado a este operador no está en operación.',
                            'blocked' => true
                        ], 403);
                    }

                    // BEFORE suggesting a new entry, check if this operator already has an active order "In Plant"
                    $activeOrder = LoadingOrder::with(['client', 'product', 'vessel'])
                        ->where(function ($q) {
                            $q->where('status', 'loading')
                                ->orWhere('status', 'authorized')
                                ->orWhere('destare_status', 'pending');
                        })
                        ->where('status', '!=', 'completed')
                        ->where('status', '!=', 'closed')
                        ->where('tractor_plate', $operator->tractor_plate)
                        ->orderBy('created_at', 'desc')
                        ->first();

                    if ($activeOrder) {
                        // ALERT LOGIC:
                        // 1. If in APT context, only block if it already has a warehouse
                        if ($request->input('context') === 'apt' && $activeOrder->warehouse !== null) {
                            return response()->json([
                                'error' => 'ALERTA: El operador no termina su proceso aún o está esperando destare. Ya cuenta con el almacén ' . $activeOrder->warehouse . ' asignado.',
                                'blocked' => true
                            ], 403);
                        }

                        // 2. If in Scale context (Entry), always block
                        if ($request->input('context') !== 'apt') {
                            return response()->json([
                                'error' => 'ALERTA: El operador no termina su proceso aún o está esperando destare.',
                                'blocked' => true
                            ], 403);
                        }

                        // 3. Otherwise (In APT and NO warehouse yet), return the active order for assignment
                        return response()->json([
                            'type' => 'loading_order',
                            'id' => $activeOrder->id,
                            'provider' => $activeOrder->client_name ?? ($activeOrder->client->name ?? ($operator->vessel->client->name ?? 'N/A')),
                            'driver' => $activeOrder->operator_name ?? 'N/A',
                            'vehicle_plate' => $activeOrder->tractor_plate ?? 'N/A',
                            'product' => $activeOrder->product?->name ?? ($operator->vessel->product->name ?? 'N/A'),
                            'origin' => $activeOrder->origin ?? ($operator->vessel->origin ?? 'N/A'),
                            'status' => $activeOrder->status,
                            'warehouse' => $activeOrder->warehouse,
                            'cubicle' => $activeOrder->cubicle,
                            'vessel_etb' => $operator->vessel->etb,
                            'force_burreo' => false,
                            'apt_operation_type' => $operator->vessel->apt_operation_type ?? 'scale',
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

                    if ($operator->vessel->apt_operation_type === 'burreo' && $request->input('context') !== 'apt') {
                        return response()->json([
                            'error' => 'ALERTA: Este operador NO puede ingresar por Báscula. El barco (' . $operator->vessel->name . ') está marcado para operación de BURREO.',
                            'blocked' => true
                        ], 403);
                    }

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
                        'force_burreo' => false, // Decoupled from ETB as per user request
                        'apt_operation_type' => $operator->vessel->apt_operation_type ?? 'scale',
                    ]);
                }
            }
        }

        return response()->json(['error' => 'Orden o QR no encontrado'], 404);
    }

    public function storeEntry(Request $request)
    {
        $validated = $request->validate([
            'shipment_order_id' => 'nullable|uuid', // Sales Order ID (ShipmentOrder)
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
            'bill_of_lading' => 'nullable|string',

            // Transport info (Snapshot)
            'driver' => 'required|string',
            'vehicle_plate' => 'required|string',
            'trailer_plate' => 'nullable|string',
            'vehicle_type' => 'nullable|string',
            'transport_line' => 'required|string',
            'economic_number' => 'nullable|string',

            // Scale info
            'tare_weight' => 'required|numeric|min:1',
            'container_type' => 'nullable|string',
            'container_id' => 'nullable|string',
            'observations' => 'nullable|string',
            'scale_id' => 'nullable|integer',
        ]);

        try {
            DB::transaction(function () use ($validated) {
                $shipmentOrderId = !empty($validated['shipment_order_id']) ? $validated['shipment_order_id'] : null;

                // Ensure nullable integer fields are strictly NULL if empty
                $vesselId = !empty($validated['vessel_id']) ? $validated['vessel_id'] : null;
                $productId = !empty($validated['product_id']) ? $validated['product_id'] : null;
                $clientId = !empty($validated['client_id']) ? $validated['client_id'] : 1;
                $scaleId = !empty($validated['scale_id']) ? $validated['scale_id'] : null;

                $vessel = $vesselId ? Vessel::find($vesselId) : null;
                $isBurreo = $vessel && $vessel->apt_operation_type === 'burreo';

                if ($isBurreo) {
                    // Burreo Logic if needed
                }

                // UNIFIED LOGIC: ALWAYS CREATE LOADING ORDER
                // Whether it came from a Vessel (Import) or ShipmentOrder (Export/Sales),
                // we create a specific operational "Trip" record (LoadingOrder).

                // Generate Folio
                $lastFolio = LoadingOrder::where('folio', 'REGEXP', '^[0-9]+$')
                    ->lockForUpdate()
                    ->max('folio');

                $nextFolioNum = $lastFolio ? intval($lastFolio) + 1 : 1;
                $folio = str_pad($nextFolioNum, 4, '0', STR_PAD_LEFT);

                $order = LoadingOrder::create([
                    'id' => (string) \Illuminate\Support\Str::uuid(),
                    'folio' => $folio,
                    'client_id' => $clientId,
                    'product_id' => $productId,
                    'vessel_id' => $vesselId,
                    'status' => 'loading', // or 'weighing_in'
                    'entry_at' => now(),

                    // Link to Sales/Export Doc if provided
                    'shipment_order_id' => $shipmentOrderId,

                    // Snapshot Fields
                    'operator_name' => $validated['driver'],
                    'tractor_plate' => $validated['vehicle_plate'],
                    'trailer_plate' => $validated['trailer_plate'],
                    'unit_type' => $validated['vehicle_type'] ?? 'N/A',
                    'transport_company' => $validated['transport_line'],
                    'economic_number' => $validated['economic_number'] ?? null,
                    'bill_of_lading' => $validated['bill_of_lading'] ?? null,
                    'withdrawal_letter' => $validated['withdrawal_letter'] ?? null,
                    'reference' => $validated['reference'] ?? null,
                    'consignee' => $validated['consignee'] ?? null,
                    'destination' => $validated['destination'] ?? null,
                    'origin' => $validated['origin'] ?? null,
                ]);

                $loadingOrderId = $order->id;

                // Create Ticket linked to this Loading Order
                WeightTicket::create([
                    'loading_order_id' => $loadingOrderId,
                    'shipment_order_id' => $shipmentOrderId, // Legacy redundancy, safe to keep or null
                    'weighmaster_id' => auth()->id(),
                    'ticket_number' => 'TK-' . time(),
                    'tare_weight' => $validated['tare_weight'], // First Weight
                    'gross_weight' => 0,
                    'net_weight' => 0,
                    'weighing_status' => 'in_progress',
                    'weigh_in_at' => now(),
                    'container_type' => $validated['container_type'] ?? 'N/A',
                    'scale_id' => $scaleId,
                    'is_burreo' => $isBurreo,
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
            'shipment_order_id' => 'required|exists:loading_orders,id', // Input is actually LoadingOrder ID
            'weight' => 'required|numeric|min:0',
        ]);

        try {
            DB::transaction(function () use ($validated) {
                // Find LoadingOrder (Unified Flow)
                $order = LoadingOrder::with('weight_ticket')->findOrFail($validated['shipment_order_id']);
                $ticket = $order->weight_ticket;

                if (!$ticket) {
                    throw new \Exception("Esta orden no tiene ticket de entrada.");
                }

                // Validate Warehouse assignment if needed (mostly for Imports)
                // If it's linked to a ShipmentOrder (Export), maybe skip?
                // For now, relax or check logic.
                if (!$order->shipment_order_id && empty($order->warehouse)) {
                    // Only strictly enforce for Imports (no shipment_order_id)
                    throw new \Exception("ALERTA: No se puede destarar sin haber asignado Almacén en el módulo APT.");
                }

                $firstWeight = $ticket->tare_weight;
                $secondWeight = $validated['weight'];
                $net = abs($secondWeight - $firstWeight);

                // Update Ticket
                $ticket->update([
                    'gross_weight' => $secondWeight,
                    'net_weight' => $net,
                    'weighing_status' => 'completed',
                    'weigh_out_at' => now(),
                ]);

                // Update Order Status
                $order->update([
                    'status' => 'completed',
                    'destare_status' => 'completed',
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
        $order = LoadingOrder::with(['client', 'product', 'driver', 'vehicle', 'transporter', 'weight_ticket', 'vessel', 'shipment_order.client', 'shipment_order.product'])
            ->findOrFail($id);

        $ticket = $order->weight_ticket;

        if (!$ticket) {
            return back()->withErrors(['error' => 'Ticket no encontrado.']);
        }

        // Format dates
        $entryDate = $transactionEntryDate = \Carbon\Carbon::parse($ticket->weigh_in_at ?? $order->entry_at);
        $exitDate = \Carbon\Carbon::parse($ticket->weigh_out_at ?? now());

        $isSale = !empty($order->shipment_order_id);

        // Map Data
        $clientName = $order->client_name ?? ($order->client->name ?? 'N/A');
        $productName = is_string($order->product) ? $order->product : ($order->product->name ?? 'N/A');
        $programmedWeight = 0;

        // Sales Specific Overrides
        if ($isSale) {
            $clientName = $order->shipment_order->client->business_name ?? ($order->shipment_order->client->name ?? $clientName);
            $productName = $order->shipment_order->product->name ?? ($order->shipment_order->product ?? $productName);
            $programmedWeight = $order->shipment_order->programmed_weight ?? 0;
        } else {
            // Vessel Fallback
            $clientName = $order->vessel->client->name ?? $clientName;
        }

        // Observations Logic
        $observations = $order->observation ?? '';
        if (!$isSale && $order->vessel) {
            $observations = 'DESCARGA DE BARCO ' . $order->vessel->name . ' ' . $observations;
        }

        // Destination Logic
        $destination = trim(($order->warehouse ?? '') . ($order->cubicle && $order->cubicle !== 'N/A' ? " - Cubículo {$order->cubicle}" : '')) ?: 'N/A';
        if ($isSale) {
            $dest = $order->shipment_order->destination ?? ($order->destination ?? 'N/A');
            $state = $order->shipment_order->state ?? '';
            $destination = $state ? "$dest, $state" : $dest;
        }

        // Economic Number Logic
        $economicNumber = $order->economic_number ?? 'N/A';
        if ($isSale) {
            $unitType = $order->shipment_order->unit_type ?? '';
            // Only show economic number if unit_type is 'Volteo' (case insensitive)
            if (stripos($unitType, 'volteo') === false) {
                $economicNumber = 'N/A';
            }
        }

        $data = [
            'folio' => $order->folio,
            'ticket_number' => $ticket->ticket_number,
            'date' => $exitDate->format('d/m/Y'),
            'time' => $exitDate->format('H:i:s'),

            'reference' => $isSale ? ($order->shipment_order->folio ?? 'N/A') : ($order->reference ?? 'N/A'),
            'operation' => $isSale ? 'SALIDA' : 'DESCARGA (COMPRA)',
            'scale_number' => $ticket->scale_id ?? 2,

            'product' => $productName,
            'presentation' => $order->presentation ?? ($order->product->presentation ?? 'GRANEL'),

            // Weights
            'entry_weight' => $ticket->tare_weight,
            'exit_weight' => $ticket->gross_weight,
            'gross_weight' => max($ticket->tare_weight, $ticket->gross_weight),
            'tare_weight' => min($ticket->tare_weight, $ticket->gross_weight),
            'net_weight' => $ticket->net_weight,
            'programmed_weight' => number_format($programmedWeight, 2),

            'client' => $clientName,
            'sale_order' => $order->sale_order_folio,
            'sale_order_reference' => $order->customer_reference,
            'withdrawal_letter' => $order->bill_of_lading ?? ($order->withdrawal_letter ?? 'N/A'),

            'driver' => $order->operator_name ?? 'N/A',
            'tractor_plate' => $order->tractor_plate ?? 'N/A',
            'trailer_plate' => $order->trailer_plate ?? 'N/A',
            'economic_number' => $economicNumber,

            'destination' => $destination,
            'transporter' => $order->transport_company ?? ($order->transporter->name ?? 'N/A'),
            'consignee' => $order->consignee ?? 'N/A',

            'observations' => trim($observations),

            'entry_at' => $entryDate->format('d/m/Y H:i'),
            'exit_at' => $exitDate->format('d/m/Y H:i'),

            'weighmaster' => auth()->user()->name ?? 'BASCULA',
            'documenter' => 'DOCUMENTACIÓN',
        ];

        return Inertia::render('Scale/Ticket', [
            'ticket' => $data
        ]);
    }
}
