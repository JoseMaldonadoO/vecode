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
use App\Helpers\OperationalTimeHelper;

class WeightTicketController extends Controller
{
    public function index(Request $request)
    {
        // 1. Pending Entry (Authorized but no Ticket)
        $pending_entry = LoadingOrder::with(['client', 'driver', 'vehicle', 'product'])
            ->where('status', 'authorized')
            ->whereDoesntHave('weight_ticket')
            ->orderBy('entry_at', 'asc')
            ->get();

        // 2. Pending Exit (Ticket In Progress OR Status Loading)
        $query = LoadingOrder::with([
            'client',
            'driver',
            'vehicle',
            'product',
            'weight_ticket',
            'exit_operator',
            'vessel_operator',
            'shipment_order.items.product',
            'shipment_order.client',
            'vessel'
        ])
            ->whereHas('weight_ticket', function ($q) {
                $q->where('weighing_status', 'in_progress')
                    ->where('is_burreo', false);
            });

        if ($request->filled('client_id')) {
            $query->where(function ($q) use ($request) {
                $q->where('client_id', $request->client_id)
                    ->orWhereHas('shipment_order', function ($sub) use ($request) {
                        $sub->where('client_id', $request->client_id);
                    });
            });
        }

        if ($request->filled('product_id')) {
            // Check direct, shipment order items, and sales order product
            $query->where(function ($q) use ($request) {
                $q->where('product_id', $request->product_id)
                    ->orWhereHas('shipment_order.items', function ($sub) use ($request) {
                        $sub->where('product_id', $request->product_id);
                    })
                    ->orWhereHas('shipment_order.sales_order', function ($sub) use ($request) {
                        $sub->where('product_id', $request->product_id);
                    });
            });
        }

        if ($request->filled('warehouse')) {
            $query->where('warehouse', $request->warehouse);
        }

        if ($request->filled('presentation')) {
            $query->whereHas('shipment_order', function ($sub) use ($request) {
                $sub->where('presentation', $request->presentation);
            });
        }

        $pending_exit_collection = $query->orderBy('entry_at', 'asc')->get();

        // Extract options for filters from the UNFILTERED list (or separate query)
        // For simplicity, we can fetch all active clients/products or just distincts from the main query without filters.
        // Let's stick to passing all options or distincts.
        // For this iteration, let's just pass the filtered list and maybe all Clients/Products for the dropdowns.
        $all_pending = LoadingOrder::whereHas('weight_ticket', function ($q) {
            $q->where('weighing_status', 'in_progress')
                ->where('is_burreo', false);
        })->with('client', 'product')->get();

        $warehouses = $all_pending->pluck('warehouse')->unique()->filter()->values();
        $products = \App\Models\Product::orderBy('name')->get(['id', 'name']);
        $clients = \App\Models\Client::orderBy('business_name')->get(['id', 'business_name']);

        $currentFilters = [
            'client_id' => $request->client_id ?? '',
            'product_id' => $request->product_id ?? '',
            'warehouse' => $request->warehouse ?? '',
            'presentation' => $request->presentation ?? '',
        ];


        $pending_exit = $pending_exit_collection->map(function ($order) {
            $ticket = $order->weight_ticket;
            $operatorName = $order->operator_name ?? $order->driver->name ?? 'N/A';
            $tractorPlate = $order->tractor_plate;
            $trailerPlate = $order->trailer_plate ?? 'N/A';

            // SALES PRIORITY: If linked to a Shipment Order (OE), use its dynamic data
            if ($order->shipment_order_id && $order->shipment_order) {
                $operatorName = $order->shipment_order->operator_name ?? $operatorName;
                $tractorPlate = $order->shipment_order->tractor_plate ?? $tractorPlate;
                $trailerPlate = $order->shipment_order->trailer_plate ?? $trailerPlate;
            }

            $programmedWeight = $order->shipment_order?->programmed_tons ?? $order->programmed_tons ?? 'N/A';

            // Determine Product Name
            $productName = $order->product?->name
                ?? $order->shipment_order?->product?->name
                ?? $order->shipment_order?->product
                ?? 'N/A';

            // Re-mapping the return array for clarity
            return [
                'id' => $order->id,
                'folio' => $order->folio,
                'provider' => $order->shipment_order?->client?->business_name
                    ?? $order->shipment_order?->client?->name
                    ?? $order->client_name,
                'product' => $productName,
                'entry_weight' => $ticket->tare_weight,
                'vehicle_plate' => $tractorPlate,
                'trailer_plate' => $trailerPlate,
                'driver' => $operatorName,
                'transport_line' => $order->transport_company,
                'economic_number' => $order->economic_number ?? 'N/A',
                'warehouse' => $order->warehouse ?? 'N/A',
                'cubicle' => $order->cubicle ?? 'N/A',
                'reference' => $order->reference ?? ($order->shipment_order?->customer_reference ?? 'N/A'),
                'consignee' => $order->consignee ?? ($order->shipment_order?->consignee ?? 'N/A'),
                'programmed_weight' => $programmedWeight,
                'entry_at' => $order->entry_at,
                'type' => $order->shipment_order_id ? 'sale' : 'vessel',
                'oe_folio' => $order->shipment_order?->folio ?? 'N/A',
                'real_transport_line' => $order->shipment_order_id
                    ? ($order->exit_operator->real_transport_line ??
                        (\App\Models\ExitOperator::where('name', $order->operator_name)->where('tractor_plate', $order->tractor_plate)->value('real_transport_line') ?? $order->transport_company))
                    : ($order->vessel_operator->transporter_line ??
                        (\App\Models\VesselOperator::where('operator_name', $order->operator_name)->where('tractor_plate', $order->tractor_plate)->value('transporter_line') ?? $order->transport_company)),
                'vessel_name' => $order->vessel->name ?? 'N/A',
            ];
        });

        return Inertia::render('Scale/Index', [
            'pending_entry' => $pending_entry,
            'pending_exit' => $pending_exit,
            'clients' => $clients,
            'products' => $products,
            'warehouses' => $warehouses,
            'filters' => $request->only(['client_id', 'product_id', 'warehouse', 'presentation']),
        ]);
    }

    // --- Ticket Management Section ---

    public function tickets(Request $request)
    {
        $filters = $request->only(['search', 'date', 'tab']);
        $activeTab = $request->input('tab', 'sale');

        $query = WeightTicket::with([
            'loadingOrder' => function ($q) {
                // Vessel / Import
                $q->with(['client', 'product', 'driver', 'vehicle', 'vessel.client', 'vessel.product', 'sales_order', 'shipment_order.client', 'shipment_order.items.product']);
            },
            'shipmentOrder' => function ($q) {
                // Sales / Export
                $q->with(['client', 'product', 'driver', 'vehicle', 'sales_order.product', 'items.product']);
            }
        ])
            ->where('is_burreo', false) // EXCLUDE BURREO
            ->where(function ($q) {
                // EXCLUDE ORPHANED TICKETS: Must have at least one valid link
                $q->has('loadingOrder')->orHas('shipmentOrder');
            });

        // Tab Filtering
        if ($activeTab === 'sale') {
            // "Ventas" (SALIDA) must have a Shipment Order AND NOT be linked to a Vessel
            $query->where(function ($q) {
                $q->where(function ($sub) {
                    $sub->whereNotNull('shipment_order_id')
                        ->whereHas('loadingOrder', function ($lo) {
                            $lo->whereNull('vessel_id');
                        });
                })->orWhere(function ($sub) {
                    $sub->whereHas('loadingOrder', function ($lo) {
                        $lo->whereNotNull('shipment_order_id')
                            ->whereNull('vessel_id');
                    });
                })->orWhere(function ($sub) {
                    // Legacy ShipmentOrder tickets without loadingOrder
                    $sub->whereNotNull('shipment_order_id')
                        ->whereDoesntHave('loadingOrder');
                });
            });
        } elseif ($activeTab === 'vessel') {
            // "Barcos/Descarga" (DESCARGA) is everything else:
            // 1. Has a Vessel linked
            // 2. OR Does not have a Shipment Order linked
            $query->where(function ($q) {
                $q->whereHas('loadingOrder', function ($lo) {
                    $lo->whereNotNull('vessel_id')
                        ->orWhereNull('shipment_order_id');
                })->orWhere(function ($sub) {
                    $sub->whereNull('shipment_order_id')
                        ->whereDoesntHave('loadingOrder');
                });
            });
        }

        $query->orderBy('created_at', 'desc');

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
            $range = OperationalTimeHelper::getOperationalRange($request->date);
            $query->whereBetween('created_at', $range);
        }

        $tickets = $query->paginate(10)
            ->withQueryString()
            ->through(function ($ticket) {
                // Robust Resolution for Client and Product
                $loadingOrder = $ticket->loadingOrder;
                $shipmentOrder = $ticket->shipmentOrder ?? $loadingOrder?->shipment_order;

                // Determine if it's a Sale-related operation (O.E.)
                $isSale = $shipmentOrder && (!$loadingOrder || empty($loadingOrder->vessel_id));

                // Folio resolution
                $folio = $shipmentOrder->folio ?? ($loadingOrder->folio ?? ($ticket->folio ?? 'N/A'));

                // Driver/Vehicle resolution
                $driver = $loadingOrder->operator_name ?? ($shipmentOrder->operator_name ?? 'N/A');
                $plate = $loadingOrder->tractor_plate ?? ($shipmentOrder->tractor_plate ?? 'N/A');

                if ($isSale) {
                    $driver = $shipmentOrder->operator_name ?? $driver;
                    $plate = $shipmentOrder->tractor_plate ?? $plate;
                }

                // 1. Resolve Product Name
                $productName = 'N/A';
                if ($isSale && $shipmentOrder) {
                    // Try items first
                    $productName = $shipmentOrder->items->first()?->product?->name
                        ?? (is_string($shipmentOrder->product) ? $shipmentOrder->product : ($shipmentOrder->product->name ?? 'N/A'));
                } elseif ($loadingOrder && $loadingOrder->vessel) {
                    $productName = $loadingOrder->vessel->product->name ?? 'N/A';
                }

                if ($productName === 'N/A' && $loadingOrder) {
                    $productName = $loadingOrder->product?->name
                        ?? (is_string($loadingOrder->product) ? $loadingOrder->product : 'N/A');
                }

                // 2. Resolve Provider Name (Client / Vessel)
                $providerName = 'N/A';
                if ($isSale && $shipmentOrder) {
                    // Priority for Sales: Use OE commercial client
                    $providerName = $shipmentOrder->client->business_name ?? $shipmentOrder->client->name ?? 'N/A';
                } elseif ($loadingOrder && $loadingOrder->vessel) {
                    // Priority for Discharges: Use Vessel NAME (User's specific request)
                    $providerName = $loadingOrder->vessel->name ?? 'N/A';

                    // If name is missing, fallback to client
                    if ($providerName === 'N/A') {
                        $providerName = $loadingOrder->vessel->client->business_name ?? $loadingOrder->vessel->client->name ?? 'N/A';
                    }
                }

                // Final fallbacks for Provider (Scale entries might have a generic client 1)
                if ($providerName === 'N/A' || $providerName === 'PROAGRO') {
                    $providerName = $loadingOrder?->client_name
                        ?? ($loadingOrder?->client?->business_name
                            ?? ($shipmentOrder?->client?->business_name ?? 'N/A'));
                }

                $saleOrder = $shipmentOrder->sale_order_folio ?? ($loadingOrder->sale_order_folio ?? 'S/A');

                return [
                    'id' => $loadingOrder->id ?? ($shipmentOrder->id ?? $ticket->id),
                    'ticket_id' => $ticket->id,
                    'folio' => $folio,
                    'ticket_number' => $ticket->ticket_number,
                    'operation' => $isSale ? 'SALIDA' : 'DESCARGA',
                    'driver' => $driver,
                    'vehicle_plate' => $plate,
                    'product' => $productName,
                    'provider' => $providerName,
                    'sale_order' => $saleOrder,
                    'status' => $ticket->weighing_status,
                    'entry_at' => $ticket->weigh_in_at,
                    'exit_at' => $ticket->weigh_out_at,
                    'tare_weight' => $ticket->tare_weight,
                    'gross_weight' => $ticket->gross_weight,
                    'net_weight' => $ticket->net_weight,
                    'is_shipment_order' => !!$shipmentOrder,
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
        $order = LoadingOrder::with(['weight_ticket', 'client', 'vessel.client', 'product', 'shipment_order.client'])->find($id);

        if (!$order) {
            $order = \App\Models\ShipmentOrder::with(['weight_ticket', 'client', 'product', 'items.product'])->find($id);
        }

        if (!$order || !$order->weight_ticket) {
            return back()->withErrors(['error' => 'Ticket no encontrado.']);
        }

        $activeLots = \App\Models\Lot::where('status', 'open')->orderBy('created_at', 'desc')->get(['id', 'folio']);

        return Inertia::render('Scale/Tickets/Edit', [
            'ticket' => $order->weight_ticket,
            'order' => $order,
            'active_lots' => $activeLots
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
            'lot_id' => 'nullable|exists:lots,id',
            'packaging_type' => 'nullable|string',
            'observations' => 'nullable|string',
        ]);

        $ticket->update([
            'tare_weight' => $validated['tare_weight'],
            'gross_weight' => $validated['gross_weight'],
            'net_weight' => $validated['net_weight'],
            'lot_id' => $validated['lot_id'],
            'packaging_type' => $validated['packaging_type'],
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
        $activeLots = \App\Models\Lot::where('status', 'open')->orderBy('created_at', 'desc')->get(['id', 'folio']);

        if ($id) {
            $order = LoadingOrder::with(['client', 'product', 'driver', 'vehicle', 'transporter', 'weight_ticket', 'shipment_order'])
                ->findOrFail($id);

            $productName = 'N/A';
            if ($order->product_id) {
                $productName = $order->product->name ?? 'N/A';
            }
            if ($productName === 'N/A' && $order->shipment_order_id && $order->shipment_order) {
                $productName = $order->shipment_order->product ?? 'N/A'; // snapshot
                if ($productName === 'N/A') {
                    $productName = $order->shipment_order->items->first()?->product->name ?? 'N/A';
                }
            }

            // Programmed weight logic (In Tons for Sales/Salida as requested)
            $progWeight = 0;
            if ($order->shipment_order_id && $order->shipment_order) {
                if ($order->shipment_order->programmed_tons > 0) {
                    $progWeight = $order->shipment_order->programmed_tons; // Already in Tons
                } else {
                    $totalKg = $order->shipment_order->items->sum('requested_quantity') ?? 0;
                    $progWeight = $totalKg > 0 ? ($totalKg / 1000) : 0; // Convert to Tons
                }
            }

            $driver = $order->operator_name ?? ($order->driver->name ?? 'N/A');
            $tractorPlate = $order->tractor_plate ?? ($order->vehicle->plate ?? 'N/A');
            $trailerPlate = $order->trailer_plate ?? ($order->vehicle->trailer_plate ?? 'N/A');

            // SALES PRIORITY
            if ($order->shipment_order_id && $order->shipment_order) {
                $driver = $order->shipment_order->operator_name ?? $driver;
                $tractorPlate = $order->shipment_order->tractor_plate ?? $tractorPlate;
                $trailerPlate = $order->shipment_order->trailer_plate ?? $trailerPlate;
            }

            $orderData = [
                'id' => $order->id,
                'folio' => $order->folio,
                'provider' => $order->shipment_order?->client?->business_name
                    ?? $order->shipment_order?->client?->name
                    ?? ($order->client_name ?? ($order->client->business_name ?? 'N/A')),
                'product' => $productName,
                'driver' => $driver,
                'vehicle_plate' => $tractorPlate,
                'trailer_plate' => $trailerPlate,
                'transport_line' => $order->transport_company ?? ($order->transporter->name ?? 'N/A'),
                'entry_weight' => $order->weight_ticket->tare_weight ?? 0,
                'warehouse' => $order->warehouse ?? 'N/A',
                'cubicle' => $order->cubicle ?? 'N/A',
                'reference' => $order->reference ?? ($order->request_id ?? ''),
                'consignee' => $order->consignee ?? ($order->consigned_to ?? ''),
                'programmed_weight' => $progWeight,
                'type' => $order->shipment_order_id ? 'sale' : 'vessel',
                'programmed_tons' => $order->shipment_order->programmed_tons ?? 0,
            ];
        }

        return Inertia::render('Scale/ExitMP', [
            'order' => $orderData,
            'active_scale_id' => (int) $request->input('scale_id', 1),
            'active_lots' => $activeLots,
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

        // Calculate Programmed Weight and Product from Items or Direct Columns
        $programmedWeight = 0;

        // Priority to programmed_tons (already in Tons)
        if (isset($order->programmed_tons) && $order->programmed_tons > 0) {
            $programmedWeight = (float) $order->programmed_tons;
        } else {
            // Fallback to items sum (usually in KG) -> convert to Tons
            $totalKg = $order->items->sum('requested_quantity') ?? 0;
            $programmedWeight = $totalKg > 0 ? ($totalKg / 1000) : 0;
        }

        $productName = $order->items->first()?->product->name ?? 'N/A';
        // Priority if product column exists directly
        if (!empty($order->product) && is_string($order->product)) {
            $productName = $order->product;
        }

        $productId = $order->items->first()?->product_id;

        // Flexible matching for ExitOperator
        $operatorName = trim($order->operator_name);
        $tractorPlate = preg_replace('/[^A-Za-z0-9]/', '', $order->tractor_plate);

        $exitOperator = \App\Models\ExitOperator::where('name', 'like', "%{$operatorName}%")
            ->get()
            ->filter(function ($op) use ($tractorPlate) {
                $opPlate = preg_replace('/[^A-Za-z0-9]/', '', $op->tractor_plate);
                return $opPlate === $tractorPlate;
            })
            ->first();

        $operatorId = $exitOperator?->id;
        $transportLine = $exitOperator?->real_transport_line ?? ($order->transport_company ?? ($order->transporter->name ?? 'N/A'));

        return response()->json([
            'id' => $order->id,
            'folio' => $order->folio,
            'provider' => $order->client->business_name ?? ($order->client->name ?? 'N/A'),
            'driver' => $order->operator_name ?? 'N/A',
            'vehicle_plate' => $order->tractor_plate ?? 'N/A',
            'trailer_plate' => $order->trailer_plate ?? 'N/A',
            'vehicle_type' => $order->unit_type ?? 'N/A',
            'transport_line' => $transportLine,
            'economic_number' => $order->economic_number ?? 'N/A',
            'product' => $productName,
            'product_id' => $productId,
            'exit_operator_id' => $operatorId,
            'origin' => $order->origin,
            'reference' => $order->customer_reference,
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
                    $activeOrder = LoadingOrder::with(['client', 'product', 'vessel', 'shipment_order.client'])
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
                            'provider' => $activeOrder->shipment_order?->client?->business_name
                                ?? $activeOrder->shipment_order?->client?->name
                                ?? ($activeOrder->client_name ?? ($activeOrder->client->name ?? ($operator->vessel->client->name ?? 'N/A'))),
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
                        'force_burreo' => false,
                        'apt_operation_type' => $operator->vessel->apt_operation_type ?? 'scale',
                        'vessel_operator_id_val' => $operator->id, // Added this to be explicit
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
            'exit_operator_id' => 'nullable|exists:exit_operators,id',
            'vessel_operator_id' => 'nullable|exists:vessel_operators,id',
        ]);

        try {
            DB::transaction(function () use ($validated) {
                $shipmentOrderId = !empty($validated['shipment_order_id']) ? $validated['shipment_order_id'] : null;

                // Retrieve Sales Order ID from Shipment Order if possible
                $salesOrderId = null;
                if ($shipmentOrderId) {
                    $salesOrderId = \App\Models\ShipmentOrder::where('id', $shipmentOrderId)->value('sales_order_id');
                }

                // Ensure nullable integer fields are strictly NULL if empty
                $vesselId = !empty($validated['vessel_id']) ? $validated['vessel_id'] : null;
                $productId = !empty($validated['product_id']) ? $validated['product_id'] : null;
                $clientId = !empty($validated['client_id']) ? $validated['client_id'] : 1;
                $scaleId = !empty($validated['scale_id']) ? $validated['scale_id'] : null;
                $exitOperatorId = !empty($validated['exit_operator_id']) ? $validated['exit_operator_id'] : null;
                $vesselOperatorId = !empty($validated['vessel_operator_id']) ? $validated['vessel_operator_id'] : null;

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

                    // Link to Commercial Orders
                    'sales_order_id' => $salesOrderId,
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
                    'exit_operator_id' => $exitOperatorId,
                    'vessel_operator_id' => $vesselOperatorId,
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
            'lot_id' => 'nullable|exists:lots,id',
            'packaging_type' => 'nullable|string',
            'warehouse' => 'nullable|string',
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
                    'lot_id' => $validated['lot_id'] ?? null,
                    'packaging_type' => $validated['packaging_type'] ?? null,
                    'weighmaster_id' => auth()->id(),
                ]);

                // Determine Warehouse to update in LoadingOrder
                $finalWarehouse = $order->warehouse;
                if (!empty($validated['lot_id'])) {
                    $lot = \App\Models\Lot::find($validated['lot_id']);
                    if ($lot && $lot->warehouse) {
                        $finalWarehouse = $lot->warehouse;
                    }
                } elseif (!empty($validated['warehouse'])) {
                    $finalWarehouse = $validated['warehouse'];
                }

                // Update Order Status and Warehouse
                $order->update([
                    'status' => 'completed',
                    'destare_status' => 'completed',
                    'warehouse' => $finalWarehouse,
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
        $order = LoadingOrder::with(['client', 'product', 'driver', 'vehicle', 'transporter', 'weight_ticket.weighmaster', 'vessel.client', 'vessel.product', 'shipment_order.client', 'shipment_order.product', 'shipment_order.creator', 'vessel_operator.creator', 'sales_order', 'shipment_order.sales_order'])
            ->findOrFail($id);

        $ticket = $order->weight_ticket;

        if (!$ticket) {
            return back()->withErrors(['error' => 'Ticket no encontrado.']);
        }

        // Format dates
        $entryDate = $transactionEntryDate = \Carbon\Carbon::parse($ticket->weigh_in_at ?? $order->entry_at);
        $exitDate = \Carbon\Carbon::parse($ticket->weigh_out_at ?? now());

        // Robust Sale detection
        $isSale = empty($order->vessel_id) && !empty($order->shipment_order_id);

        // Map Data
        $clientName = $order->client_name ?? ($order->client->name ?? 'N/A');
        // Product Logic with Vessel fallback
        $productName = is_string($order->product) ? $order->product : ($order->product->name ?? 'N/A');
        if ($productName === 'N/A' && !empty($order->vessel->product)) {
            $productName = $order->vessel->product->name;
        }

        $programmedWeight = 0;

        // Sales Specific Overrides (Eager loaded via $order->shipment_order)
        if ($isSale) {
            $clientName = $order->shipment_order->client->business_name ?? ($order->shipment_order->client->name ?? $clientName);
            $productName = $order->shipment_order->product->name ?? ($order->shipment_order->product ?? $productName);
            $programmedWeight = $order->shipment_order->programmed_tons ?? 0;
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
            'operation' => $isSale ? 'SALIDA' : 'DESCARGA',
            'scale_number' => $ticket->scale_id ?? 2,
            'product' => $productName,
            'presentation' => $isSale
                ? ($order->shipment_order->presentation . ($order->shipment_order->presentation === 'ENVASADO' && $order->shipment_order->sacks_count ? ' ' . $order->shipment_order->sacks_count : ''))
                : 'N/A', // Remove GRANEL/ENVASADO for Barcos

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

            'driver' => $isSale && $order->shipment_order
                ? ($order->shipment_order->operator_name ?? $order->operator_name ?? 'N/A')
                : ($order->operator_name ?? 'N/A'),
            'tractor_plate' => $isSale && $order->shipment_order
                ? ($order->shipment_order->tractor_plate ?? $order->tractor_plate ?? 'N/A')
                : ($order->tractor_plate ?? 'N/A'),
            'trailer_plate' => $isSale && $order->shipment_order
                ? ($order->shipment_order->trailer_plate ?? $order->trailer_plate ?? 'N/A')
                : ($order->trailer_plate ?? 'N/A'),
            'economic_number' => $economicNumber,

            'destination' => $destination,
            'transporter' => $order->transport_company ?? ($order->transporter->name ?? 'N/A'),
            'consignee' => $order->consignee ?? 'N/A',

            'observations' => trim($observations),

            'entry_at' => $entryDate->format('d/m/Y H:i'),
            'exit_at' => $exitDate->format('d/m/Y H:i'),

            'weighmaster' => $ticket->weighmaster?->name ?? 'BASCULA',
            'documenter' => $isSale
                ? ($order->shipment_order->creator->name ?? 'DOCUMENTACIÓN')
                : ($order->vessel_operator->creator->name ?? 'DOCUMENTACIÓN'),
        ];

        return Inertia::render('Scale/Ticket', [
            'ticket' => $data
        ]);
    }
}
