<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Vessel;
use App\Models\VesselOperator;
use App\Models\LoadingOrder;
use App\Models\AptScan;
use App\Models\WeightTicket;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class AptController extends Controller
{
    public function index()
    {
        return Inertia::render('APT/Index');
    }

    // Operator Registration
    public function createOperator()
    {
        return Inertia::render('APT/RegisterOperator', [
            'vessels' => Vessel::active()->with('product')->orderBy('name')->get()
        ]);
    }

    public function storeOperator(Request $request)
    {
        $validated = $request->validate([
            'vessel_id' => 'required|exists:vessels,id',
            'operator_name' => 'required|string|max:255',
            'unit_type' => 'required|string',
            'economic_number' => 'required|string',
            'tractor_plate' => 'required|string',
            'trailer_plate' => 'nullable|required_unless:unit_type,Volteo|string',
            'transporter_line' => 'required|string',
        ]);

        // Check for duplicate
        $exists = VesselOperator::where('vessel_id', $validated['vessel_id'])
            ->where('operator_name', $validated['operator_name'])
            ->exists();

        if ($exists) {
            return back()->withErrors(['operator_name' => 'Este operador ya está registrado en este barco.']);
        }

        VesselOperator::create($validated);

        return back()->with('success', 'Operador registrado correctamente.');
    }

    // QR Printing
    public function qrPrint()
    {
        return Inertia::render('APT/QrPrint');
    }

    public function searchOperators(Request $request)
    {
        $query = $request->input('q');
        $operators = VesselOperator::with('vessel')
            ->where(function ($q) use ($query) {
                $q->where('operator_name', 'like', "%{$query}%")
                    ->orWhere('id', $query);
            })
            ->orderBy('operator_name')
            ->limit(20)
            ->get()
            ->map(function ($op) {
                $op->is_active = $op->vessel ? $op->vessel->is_active : false;
                return $op;
            });

        return response()->json($operators);
    }

    // Status Dashboard
    public function status(Request $request)
    {
        $date = $request->input('date', Carbon::today()->toDateString());

        // Define Warehouse Structure
        $warehouses = [
            ['name' => 'Almacén 1', 'type' => 'flat'],
            ['name' => 'Almacén 2', 'type' => 'flat'],
            ['name' => 'Almacén 3', 'type' => 'flat'],
            ['name' => 'Almacén 4', 'type' => 'cubicles', 'total_cubicles' => 8],
            ['name' => 'Almacén 5', 'type' => 'cubicles', 'total_cubicles' => 8],
        ];

        // Fetch Orders for the selected date (Active OR Completed)
        // AND Active orders (regardless of date) if they are currently occupying space?
        // Actually, user wants a "Log view" per day usually, but "Status" implies Current State.
        // Hybrid Approach:
        // 1. If Date == Today: Show EVERYTHING active (regardless of entry date) + Completed Today.
        // 2. If Date != Today: Show ONLY what was active/completed ON that specific day?
        //    Let's stick to: "Show me the Log of [Date]".
        //    But for "Current Status", we usually want "What is here NOW".
        //    The user asked for "lo que entró ayer", so it's a log view.

        //    Let's stick to the Date Filter on `created_at` or `entry_at`.
        // 139:

        // HOWEVER, to be safe: filtering by `entry_at` is the most "Logbook" style.

        $query = \App\Models\LoadingOrder::with(['weight_ticket', 'vessel'])
            ->whereNotNull('warehouse');

        // Filter: 
        // We want orders that were "Active" or "Completed" on that date.
        // Simplest proxy: date(entry_at) == date OR date(updated_at) == date?
        // Let's use entry_at for "Lo que entró". Or if they want "Production Report", usually it's by Exit Date.
        // Let's stick to: "Orders processed/relevant to this date".

        // Revised Logic based on "Inventory":
        // Users want to know "How much weight ended up in Almacen 1 on Date X".
        // So we filter by the date the valid action happened. 
        // For simplicity and user expectation: Filter by `entry_at` (Date of Entry) matches selected date.
        // This shows "What entered on this day".
        $query->whereDate('entry_at', $date);

        // Include all relevant statuses
        $query->whereIn('status', ['loading', 'authorized', 'completed', 'closed', 'weighing_out']);

        $dailyOrders = $query->get();

        // Patch for Burreo Weights: Ensure we show the correct weight (Draft > Provisional)
        foreach ($dailyOrders as $order) {
            if ($order->operation_type === 'burreo' && $order->vessel) {
                if (!$order->weight_ticket) {
                    $order->setRelation('weight_ticket', new \App\Models\WeightTicket([
                        'net_weight' => 0
                    ]));
                }

                $v = $order->vessel;
                $draft = (float) ($v->draft_weight ?? 0);
                $prov = (float) ($v->provisional_burreo_weight ?? 0);

                // If a ticket already has a weight, we might want to keep it, 
                // but usually status view should reflect the master resolution for Burreo
                $order->weight_ticket->net_weight = ($draft > 0) ? $draft : $prov;
            }
        }

        // If Date is TODAY, we MIGHT also want to include "Leftovers" from previous days that are still Active?
        // If the view is "Inventory Status", yes. If it's "Daily Entry Log", no.
        // The Prompt said: "detalle de las ubicaciones... marca los pesos que quedaron guardados".
        // This implies INVENTORY.
        // If it's Inventory, we need:
        // 1. ALL currently Active units (regardless of entry date). -> Only if viewing Today?
        // 2. ALL units that COMPLETED/CLOSED on the requested date? 
        // Let's refine:
        // "Show me the stored weight".
        // If I pick "Yesterday", I probably want to see what was stored Yesterday.
        // Let's stick to the Date Filter on `created_at` or `entry_at`.

        // HOWEVER, to be safe: filtering by `entry_at` is the most "Logbook" style.

        $data = [];

        foreach ($warehouses as $wh) {
            $whData = [
                'name' => $wh['name'],
                'type' => $wh['type'],
                'occupied' => false,
                'orders' => [],
                'total_programmed' => 0,
                'total_net' => 0,
                'cubicles' => []
            ];

            if ($wh['type'] === 'flat') {
                $orders = $dailyOrders->where('warehouse', $wh['name']);

                if ($orders->isNotEmpty()) {
                    $whData['occupied'] = true; // Has activity on this day
                    $whData['orders'] = $orders->values()->all();
                    $whData['total_programmed'] = $orders->sum('programmed_tons'); // Assuming column exists
                    // Sum Net Weight (using weight_ticket)
                    $whData['total_net'] = $orders->sum(fn($o) => $o->weight_ticket?->net_weight ?? 0);
                }
            } else {
                // Cubicles Logic
                $occupiedCount = 0;
                for ($i = 1; $i <= 8; $i++) {
                    $cubicleName = (string) $i;
                    $orders = $dailyOrders->where('warehouse', $wh['name'])
                        ->where('cubicle', $cubicleName);

                    $hasActivity = $orders->isNotEmpty();
                    if ($hasActivity)
                        $occupiedCount++; // Simply counts active cubicles for this date

                    $whData['cubicles'][] = [
                        'id' => $i,
                        'occupied' => $hasActivity,
                        'orders' => $orders->values()->all(),
                        'total_programmed' => $orders->sum('programmed_tons'), // Assuming column exists
                        'total_net' => $orders->sum(fn($o) => $o->weight_ticket?->net_weight ?? 0)
                    ];
                }

                // Occupancy Rate for the specific Day's view
                $whData['occupancy_percentage'] = ($occupiedCount / 8) * 100;
            }

            $data[] = $whData;
        }

        return Inertia::render('APT/Status', [
            'warehouses' => $data,
            'filters' => [
                'date' => $date
            ]
        ]);
    }

    public function scanner(Request $request)
    {
        // Filters for active and historical vessel movements
        $filters = $request->only(['date', 'vessel_id']);
        $now = now();

        // Categorize Vessels
        $allVessels = Vessel::orderBy('created_at', 'desc')->get();
        $activeVessels = $allVessels->filter(function ($v) use ($now) {
            return !empty($v->berthal_datetime) && $v->berthal_datetime <= $now && empty($v->departure_date);
        })->values();

        $inactiveVessels = $allVessels->filter(function ($v) use ($now) {
            return empty($v->berthal_datetime) || $v->berthal_datetime > $now || !empty($v->departure_date);
        })->values();

        if (!$request->filled('vessel_id') && $activeVessels->isNotEmpty()) {
            $filters['vessel_id'] = (string) $activeVessels->first()->id;
        }

        $query = \App\Models\AptScan::with(['operator', 'loadingOrder.vessel'])
            ->orderBy('created_at', 'desc');

        if ($request->filled('date')) {
            $query->whereDate('created_at', $request->date);
        }

        if (isset($filters['vessel_id'])) {
            $query->whereHas('loadingOrder', function ($q) use ($filters) {
                $q->where('vessel_id', $filters['vessel_id']);
            });
        }

        $recentScans = $query->paginate(10)
            ->withQueryString();

        return Inertia::render('APT/Scanner', [
            'recentScans' => $recentScans,
            'filters' => $filters,
            'activeVessels' => $activeVessels,
            'inactiveVessels' => $inactiveVessels,
        ]);
    }

    public function storeScan(Request $request)
    {
        $validated = $request->validate([
            'qr' => 'required|string', // Order ID or Operator QR
            'warehouse' => 'required|string',
            'cubicle' => 'nullable|string', // Optional depending on WH
            'operation_type' => 'required|in:scale,burreo',
        ]);

        // Find Order logic similar to Scale search
        $qr = $validated['qr'];
        $order = null;

        if (str_starts_with($qr, 'OP ') && $validated['operation_type'] !== 'burreo') {
            // Find active order for this operator
            $parts = explode('|', substr($qr, 3));
            $operatorId = $parts[0] ?? null;
            // Assuming the order exists and is in 'loading' status for this operator/vehicle
            if ($operatorId) {
                // We need to find the LATEST active order for this operator
                // This is a bit loose, ideally we scan the Order Folio or Ticket.
                // But if they use the same Badge (Operator QR):
                $order = \App\Models\LoadingOrder::with('weight_ticket')->where('status', 'loading')
                    ->where(function ($q) use ($operatorId) {
                        // This assumes we stored Operator ID or can link back.
                        // Our LoadingOrder has driver/vehicle snapshots.
                        // We might need to look up VesselOperator and match?
                        // For simplicity, let's assume we search by Order ID if possible,
                        // or if they scan Operator QR, we find the order created today for this driver.
                        $op = VesselOperator::find($operatorId);
                        if ($op) {
                            $q->where('tractor_plate', $op->tractor_plate);
                        }
                    })
                    ->latest()
                    ->first();
            }
        } else {
            // Assume UUID or Folio
            $order = \App\Models\LoadingOrder::with('weight_ticket')->where('id', $qr)->orWhere('folio', $qr)->first();
        }

        if (!$order) {
            // Auto-create Logic for Burreo / Operator Scan
            if (str_starts_with($qr, 'OP ')) {
                $rawId = substr($qr, 3);
                $operatorId = null;
                if (preg_match('/^\d+/', trim($rawId), $matches)) {
                    $operatorId = $matches[0];
                }

                $operator = \App\Models\VesselOperator::with('vessel.product')->find($operatorId);

                if ($operator && $operator->vessel) {
                    // ARCHIVE CHECK: If vessel is inactive, block all scans
                    if (!$operator->vessel->is_active) {
                        return back()->withErrors(['qr' => 'ALERTA: El barco asociado a este operador no está en operación.']);
                    }

                    // STRICT CHECK: If vessel requires scale, do not allow auto-creation of Burreo
                    if (($operator->vessel->apt_operation_type ?? 'scale') !== 'burreo') {
                        return back()->withErrors(['qr' => 'ALERTA: El operador aún no pasa por báscula y por ende no se le puede asignar un almacén.']);
                    }

                    // PENDING PROCESS CHECK: Block burreo if operator has ANY active order
                    $activeOrder = \App\Models\LoadingOrder::where('operator_name', $operator->operator_name)
                        ->whereIn('status', ['loading', 'pending'])
                        ->exists();

                    if ($activeOrder) {
                        return back()->withErrors(['qr' => 'ALERTA: El operador tiene un proceso activo. Finalice el proceso previo antes de iniciar uno nuevo.']);
                    }

                    // 1. TRIP VALIDATION: FIFO (Muelle -> APT)
                    $pendingTrip = \App\Models\VesselOperatorTrip::where('vessel_id', $operator->vessel_id)
                        ->where('vessel_operator_id', $operator->id)
                        ->whereDoesntHave('loading_order')
                        ->where('status', '!=', 'cancelled')
                        ->orderBy('created_at', 'asc')
                        ->first();

                    if (!$pendingTrip) {
                        return back()->withErrors(['qr' => 'ALERTA: No se encontró un registro de salida en Muelle. El operador debe registrar su vuelta en Muelle antes de descargar en APT.']);
                    }

                    try {
                        // 2. WEIGHT RESOLUTION: Draft (Real) > Provisional
                        $vessel = $operator->vessel;
                        $draft = (float) ($vessel->draft_weight ?? 0);
                        $prov = (float) ($vessel->provisional_burreo_weight ?? 0);
                        $finalWeightKg = ($draft > 0) ? $draft : $prov;

                        // 3. ATOMIC TRANSACTION: Create Order, Ticket, Scan & Update Trip
                        \Illuminate\Support\Facades\DB::transaction(function () use ($operator, $pendingTrip, $validated, $finalWeightKg) {
                            $order = \App\Models\LoadingOrder::create([
                                'id' => (string) \Illuminate\Support\Str::uuid(),
                                'folio' => 'BUR-' . date('Ymd-His') . '-' . rand(100, 999),
                                'entry_at' => now(),
                                'client_id' => $operator->vessel->client_id,
                                'vessel_id' => $operator->vessel->id,
                                'product_id' => $operator->vessel->product_id,
                                'vessel_operator_id' => $operator->id, // Important for relations
                                'status' => 'completed',
                                'operator_name' => $operator->operator_name,
                                'economic_number' => $operator->economic_number,
                                'tractor_plate' => $operator->tractor_plate,
                                'trailer_plate' => $operator->trailer_plate,
                                'unit_type' => $operator->unit_type,
                                'transport_company' => $operator->transporter_line,
                                'operation_type' => 'burreo',
                                'warehouse' => $validated['warehouse'],
                                'cubicle' => $validated['cubicle'] ?? 'N/A',
                                'vessel_operator_trip_id' => $pendingTrip->id,
                            ]);

                            \App\Models\WeightTicket::create([
                                'loading_order_id' => $order->id,
                                'ticket_number' => 'B-' . $order->folio,
                                'weighing_status' => 'completed',
                                'is_burreo' => true,
                                'tare_weight' => $finalWeightKg,
                                'net_weight' => $finalWeightKg,
                                'weigh_in_at' => now(),
                                'weigh_out_at' => now(),
                            ]);

                            // Verify operator existence one last time before insert to debug FK issue
                            $opId = (int) $operator->id;
                            if (!\App\Models\VesselOperator::where('id', $opId)->exists()) {
                                throw new \Exception("ID de Operador {$opId} no encontrado en la base de datos justo antes de insertar en apt_scans.");
                            }

                            \App\Models\AptScan::create([
                                'loading_order_id' => $order->id,
                                'operator_id' => $opId,
                                'warehouse' => (string) $validated['warehouse'],
                                'cubicle' => (string) ($validated['cubicle'] ?? 'N/A'),
                                'user_id' => auth()->id(),
                            ]);

                            $pendingTrip->update(['status' => 'completed']);
                        });

                        $dailyCount = \App\Models\LoadingOrder::where('operator_name', $operator->operator_name)
                            ->where('operation_type', 'burreo')
                            ->whereDate('created_at', now())
                            ->count();

                        return redirect()->back()->with('success', "✅ Nueva Entrada Registrada: Descarga #{$dailyCount} del día. Peso vinculado: " . number_format($finalWeightKg) . " kg.");

                    } catch (\Exception $e) {
                        \Illuminate\Support\Facades\Log::error('Burreo Operation Error: ' . $e->getMessage(), [
                            'operator_id' => $operator->id ?? 'null',
                            'qr' => $qr,
                            'trace' => $e->getTraceAsString()
                        ]);
                        return back()->withErrors(['qr' => 'Error en el proceso de Burreo: ' . $e->getMessage()]);
                    }
                } else {
                    return back()->withErrors(['qr' => 'Operador o Barco no vinculados correctamente.']);
                }
            } else {
                return back()->withErrors(['qr' => 'Orden de Báscula no encontrada o no activa.']);
            }
        }

        // --- COMMON FLOW (ONLY FOR SCALE) ---
        // At this point, if it was 'burreo', it already returned.

        // status check for Scale Flow
        if ($validated['operation_type'] === 'scale') {
            // ARCHIVE CHECK: If vessel is inactive, block scans even for existing orders
            if ($order->vessel && !$order->vessel->is_active) {
                return back()->withErrors(['qr' => 'ALERTA: Este barco ya ha zarpado. No se pueden registrar nuevos movimientos.']);
            }

            // Must be 'loading' AND have a Weight Ticket
            if ($order->status !== 'loading' || !$order->weight_ticket) {
                return back()->withErrors(['qr' => 'ALERTA: El operador aún no pasa por báscula y por ende no se le puede asignar un almacén.']);
            }

            // PENDING DESTRARE CHECK: If already assigned, block re-scanning/re-assignment in APT
            if ($order->warehouse !== null) {
                return back()->withErrors(['qr' => 'ALERTA: El operador ya tiene un almacén asignado (' . $order->warehouse . ') y su proceso está pendiente de finalizar en Báscula (Destare).']);
            }
        }

        // Validation for Cubicle (WH 4 & 5)
        if (in_array($validated['warehouse'], ['4', '5', 'Almacén 4', 'Almacén 5'])) {
            if (empty($validated['cubicle'])) {
                return back()->withErrors(['cubicle' => 'El cubículo es obligatorio para el Almacén seleccionado.']);
            }
        }

        $finalCubicle = $validated['cubicle'] ?? 'N/A';
        if (!in_array($validated['warehouse'], ['Almacén 4', 'Almacén 5', '4', '5'])) {
            $finalCubicle = 'N/A';
        }

        // Get Operator ID if available
        $operatorId = null;
        if (str_starts_with($qr, 'OP ')) {
            $rawId = substr($qr, 3);
            if (preg_match('/^\d+/', $rawId, $matches)) {
                $rawOperatorId = $matches[0];
                if (\App\Models\VesselOperator::where('id', $rawOperatorId)->exists()) {
                    $operatorId = $rawOperatorId;
                }
            }
        }

        if (!$operatorId && $order) {
            $matchedOp = \App\Models\VesselOperator::where('tractor_plate', $order->tractor_plate)->first();
            if ($matchedOp) {
                $operatorId = $matchedOp->id;
            }
        }

        // Update Order (For Scale Only)
        $order->update([
            'warehouse' => $validated['warehouse'],
            'cubicle' => $finalCubicle,
            'operation_type' => $validated['operation_type'],
        ]);

        // Log Scan Record (For Scale Only)
        \App\Models\AptScan::create([
            'loading_order_id' => $order->id,
            'operator_id' => $operatorId,
            'warehouse' => (string) $validated['warehouse'],
            'cubicle' => (string) $finalCubicle,
            'user_id' => auth()->id(),
        ]);

        return redirect()->back()->with('success', 'Asignación de Almacén registrada correctamente.');
    }

    public function updateScan(Request $request, $id)
    {
        $scan = \App\Models\AptScan::findOrFail($id);

        $validated = $request->validate([
            'warehouse' => 'required|string',
            'cubicle' => 'nullable|string',
        ]);

        // Same Validation Logic as Store
        if (in_array($validated['warehouse'], ['4', '5', 'Almacén 4', 'Almacén 5'])) {
            if (empty($validated['cubicle'])) {
                return back()->withErrors(['cubicle' => 'El cubículo es obligatorio para el Almacén seleccionado.']);
            }
            // Occupancy Check REMOVED to allow multiple units
        }

        // Force 'N/A' cubicle if not WH 4/5
        if (!in_array($validated['warehouse'], ['Almacén 4', 'Almacén 5', '4', '5'])) {
            $validated['cubicle'] = 'N/A';
        }
        if (empty($validated['cubicle'])) {
            $validated['cubicle'] = 'N/A';
        }

        // Update Scan Record
        $scan->update([
            'warehouse' => $validated['warehouse'],
            'cubicle' => $validated['cubicle'],
        ]);

        // Update Linked Loading Order
        if ($scan->loading_order_id) {
            \App\Models\LoadingOrder::where('id', $scan->loading_order_id)->update([
                'warehouse' => $validated['warehouse'],
                'cubicle' => $validated['cubicle'],
            ]);
        }

        return redirect()->back()->with('success', 'Registro actualizado correctamente.');
    }

    public function destroyScan($id)
    {
        $scan = \App\Models\AptScan::findOrFail($id);

        if ($scan->loading_order_id) {
            // Deleting the LoadingOrder will automatically delete:
            // 1. The WeightTicket (cascade)
            // 2. The AptScan itself (cascade)
            // This ensures the Dashboard trip count is correctly reduced.
            \App\Models\LoadingOrder::where('id', $scan->loading_order_id)->delete();
        } else {
            // Fallback for scans without a loading order
            $scan->delete();
        }

        return redirect()->back()->with('success', 'Registro y viaje eliminados correctamente.');
    }
}
