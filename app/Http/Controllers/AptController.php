<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Vessel;
use App\Models\VesselOperator;
use Inertia\Inertia;
use Carbon\Carbon;

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
            'vessels' => Vessel::with('product')->orderBy('created_at', 'desc')->get()
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
        $operators = VesselOperator::where('operator_name', 'like', "%{$query}%")
            ->orWhere('id', $query)
            ->orderBy('operator_name')
            ->limit(20)
            ->get();

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

        $query = \App\Models\ShipmentOrder::with(['weight_ticket'])
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

        $query = \App\Models\AptScan::with(['operator', 'shipmentOrder.vessel'])
            ->orderBy('created_at', 'desc');

        if ($request->filled('date')) {
            $query->whereDate('created_at', $request->date);
        }

        if ($request->filled('vessel_id')) {
            $query->whereHas('shipmentOrder', function ($q) use ($request) {
                $q->where('vessel_id', $request->vessel_id);
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
                $order = \App\Models\ShipmentOrder::with('weight_ticket')->where('status', 'loading')
                    ->where(function ($q) use ($operatorId) {
                        // This assumes we stored Operator ID or can link back.
                        // Our ShipmentOrder has driver/vehicle snapshots.
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
            $order = \App\Models\ShipmentOrder::with('weight_ticket')->where('id', $qr)->orWhere('folio', $qr)->first();
        }

        if (!$order) {
            // Auto-create Logic for Burreo / Operator Scan
            if (str_starts_with($qr, 'OP ')) {
                $parts = explode('|', substr($qr, 3));
                $operatorId = $parts[0] ?? null;
                $operator = VesselOperator::with('vessel.product')->find($operatorId);

                if ($operator && $operator->vessel) {
                    // STRICT CHECK: If vessel requires scale, do not allow auto-creation of Burreo
                    if (($operator->vessel->apt_operation_type ?? 'scale') === 'scale') {
                        return back()->withErrors(['qr' => 'ALERTA: Este barco requiere registro en Báscula de entrada antes de asignar ubicación.']);
                    }

                    try {
                        // Create new Order for this Burreo/Direct Trip
                        $order = \App\Models\ShipmentOrder::create([
                            'folio' => 'BUR-' . date('Ymd-His') . '-' . rand(100, 999), // Unique Folio
                            'entry_at' => now(), // Use entry_at instead of date
                            'client_id' => $operator->vessel->client_id,
                            'vessel_id' => $operator->vessel->id,
                            'product_id' => $operator->vessel->product_id,
                            'status' => 'loading',
                            'operator_name' => $operator->operator_name,
                            'unit_number' => $operator->economic_number,
                            'tractor_plate' => $operator->tractor_plate,
                            'trailer_plate' => $operator->trailer_plate,
                            'unit_type' => $operator->unit_type,
                            'transport_company' => $operator->transporter_line,
                            'product' => $operator->vessel->product->name ?? 'N/A',
                            'operation_type' => 'burreo',
                            'warehouse' => $validated['warehouse'], // Assign immediately
                            'cubicle' => $validated['cubicle'],     // Assign immediately
                        ]);

                        // Auto-create Weight Ticket for Burreo
                        // Mark as COMPLETED immediately as per user request (skip scale exit)
                        \App\Models\WeightTicket::create([
                            'shipment_order_id' => $order->id,
                            'ticket_number' => 'B-' . $order->folio,
                            'weighing_status' => 'completed',
                            'is_burreo' => true,
                            'tare_weight' => $operator->vessel->provisional_burreo_weight ?? 0,
                            'net_weight' => $operator->vessel->provisional_burreo_weight ?? 0,
                            'weigh_in_at' => now(),
                            'weigh_out_at' => now(),
                        ]);

                        // Mark Order as completed immediately
                        $order->update(['status' => 'completed']);

                        // Since we created it, we don't need to update it again below, 
                        // unless we want to keep the logic unified. 
                        // But the update below sets warehouse/cubicle/op_type again. 
                        // Let's just let it fall through or return success here.
                        // Ideally fall through to allow the Log Scan to happen.

                    } catch (\Exception $e) {
                        \Illuminate\Support\Facades\Log::error('Burreo Order Create Error: ' . $e->getMessage());
                        return back()->withErrors(['qr' => 'Error creando orden automática: ' . $e->getMessage()]);
                    }
                } else {
                    return back()->withErrors(['qr' => 'Operador o Barco no encontrado para crear orden automática.']);
                }
            } else {
                return back()->withErrors(['qr' => 'Orden no encontrada o no activa.']);
            }
        }

        // status check for Scale Flow
        if ($validated['operation_type'] === 'scale') {
            // Must be 'loading' AND have a Weight Ticket
            if ($order->status !== 'loading' || !$order->weight_ticket) {
                return back()->withErrors(['qr' => 'ALERTA: El vehículo no ha pasado por báscula de entrada. No tiene ticket activo o estatus válido (Status: ' . $order->status . ').']);
            }
        }

        // Validation for Cubicle (WH 4 & 5)
        if (in_array($validated['warehouse'], ['4', '5', 'Almacén 4', 'Almacén 5'])) {
            if (empty($validated['cubicle'])) {
                return back()->withErrors(['cubicle' => 'El cubículo es obligatorio para el Almacén seleccionado.']);
            }
            // Occupancy Check REMOVED to allow multiple units
        }

        // Create explicit variable for cubicle to ensure it's 'N/A' for WH 1-3
        $finalCubicle = $validated['cubicle'] ?? 'N/A';
        if (!in_array($validated['warehouse'], ['Almacén 4', 'Almacén 5', '4', '5'])) {
            $finalCubicle = 'N/A';
        }

        // Get Operator ID if available from QR or order
        $operatorId = null;
        if (str_starts_with($qr, 'OP ')) {
            // Format: OP {ID}|{NAME} or OP {ID}]{INITIALS}
            // We split by '|' OR ']' just in case, or simply cast to int to be safe
            // Assuming format matches, first part of substr is ID.
            $rawId = substr($qr, 3);

            // Clean up: Extract only the leading integer
            // Example: "103|Juan" -> 103, "103]JCE" -> 103
            preg_match('/^\d+/', $rawId, $matches);
            $operatorId = $matches[0] ?? null;
        }

        // If still null, try to match by plate from Order
        if (!$operatorId && $order) {
            $matchedOp = \App\Models\VesselOperator::where('tractor_plate', $order->tractor_plate)->first();
            if ($matchedOp) {
                $operatorId = $matchedOp->id;
            }
        }

        // Update Order
        $order->update([
            'warehouse' => $validated['warehouse'],
            'cubicle' => $finalCubicle,
            'operation_type' => $validated['operation_type'],
            // Status remains 'loading' until Scale Exit
        ]);

        if ($validated['operation_type'] === 'burreo') {
            // Find existing ticket or create one
            $ticket = $order->weight_ticket;

            if (!$ticket) {
                $ticket = \App\Models\WeightTicket::create([
                    'shipment_order_id' => $order->id,
                    'ticket_number' => 'B-' . $order->folio,
                    'weighing_status' => 'completed',
                    'is_burreo' => true,
                    'tare_weight' => $order->vessel->provisional_burreo_weight ?? 0,
                    'net_weight' => $order->vessel->provisional_burreo_weight ?? 0,
                    'weigh_in_at' => now(),
                    'weigh_out_at' => now(),
                ]);
            } else {
                $ticket->update([
                    'weighing_status' => 'completed',
                    'is_burreo' => true,
                    'tare_weight' => $order->vessel->provisional_burreo_weight ?? 0,
                    'net_weight' => $order->vessel->provisional_burreo_weight ?? 0,
                    'weigh_out_at' => now(),
                ]);
            }

            // Mark Order as completed
            $order->update(['status' => 'completed']);
        }

        // Log Scan
        \App\Models\AptScan::create([
            'shipment_order_id' => $order->id,
            'operator_id' => $operatorId,
            'warehouse' => $validated['warehouse'],
            'cubicle' => $finalCubicle,
            'user_id' => auth()->id(),
        ]);

        $successMessage = 'Asignación de Almacén registrada correctamente.';

        if ($validated['operation_type'] === 'burreo') {
            $dailyCount = \App\Models\ShipmentOrder::where('operator_name', $order->operator_name)
                ->where('operation_type', 'burreo')
                ->whereDate('created_at', now())
                ->count();
            $successMessage .= " (Descarga #{$dailyCount} del día para este operador)";
        }

        return redirect()->back()->with('success', $successMessage);
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

        // Update Linked Shipment Order
        if ($scan->shipment_order_id) {
            \App\Models\ShipmentOrder::where('id', $scan->shipment_order_id)->update([
                'warehouse' => $validated['warehouse'],
                'cubicle' => $validated['cubicle'],
            ]);
        }

        return redirect()->back()->with('success', 'Registro actualizado correctamente.');
    }

    public function destroyScan($id)
    {
        $scan = \App\Models\AptScan::findOrFail($id);

        // Optional: Reset Order? 
        // For now, let's just delete the log as requested. 
        // If we wanted to "Unassign", we would handle that separately or assume user wants to just remove the history.
        // Actually, if it was the last action, maybe we should clear the order.
        // Let's stick to safe deletion of the log only, to avoid side effects on the Order flow.

        $scan->delete();

        return redirect()->back()->with('success', 'Registro eliminado.');
    }
}
