<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Vessel;
use App\Models\VesselOperator;
use Inertia\Inertia;

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
    public function status()
    {
        // Define Warehouse Structure
        $warehouses = [
            ['name' => 'Almacén 1', 'type' => 'flat'],
            ['name' => 'Almacén 2', 'type' => 'flat'],
            ['name' => 'Almacén 3', 'type' => 'flat'],
            ['name' => 'Almacén 4', 'type' => 'cubicles', 'total_cubicles' => 8],
            ['name' => 'Almacén 5', 'type' => 'cubicles', 'total_cubicles' => 8],
        ];

        // Fetch Active Orders (Loading or Authorized)
        $activeOrders = \App\Models\ShipmentOrder::whereIn('status', ['loading', 'authorized'])
            ->whereNotNull('warehouse')
            ->get();

        $data = [];

        foreach ($warehouses as $wh) {
            $whData = [
                'name' => $wh['name'],
                'type' => $wh['type'],
                'occupied' => false,
                'details' => null,
                'cubicles' => []
            ];

            if ($wh['type'] === 'flat') {
                // Check if any order is here
                $order = $activeOrders->where('warehouse', $wh['name'])->first();
                if ($order) {
                    $whData['occupied'] = true;
                    $whData['details'] = $order;
                }
            } else {
                // Cubicles Logic
                // Initialize 8 cubicles
                for ($i = 1; $i <= 8; $i++) {
                    $cubicleName = (string) $i; // Or "C-1"? Logic used simple numbers.
                    // Check occupancy
                    // We need to match loose strings potentially, but we standardized on "1", "2" etc.
                    $order = $activeOrders->where('warehouse', $wh['name'])
                        ->where('cubicle', $cubicleName)
                        ->first();

                    $whData['cubicles'][] = [
                        'id' => $i,
                        'occupied' => (bool) $order,
                        'details' => $order
                    ];
                }

                // Calculate total occupancy %
                $occupiedCount = count(array_filter($whData['cubicles'], fn($c) => $c['occupied']));
                $whData['occupancy_percentage'] = ($occupiedCount / 8) * 100;
            }

            $data[] = $whData;
        }

        return Inertia::render('APT/Status', [
            'warehouses' => $data
        ]);
    }

    public function scanner()
    {
        $recentScans = \App\Models\AptScan::with(['operator', 'shipmentOrder'])
            ->whereDate('created_at', today())
            ->orderBy('created_at', 'desc')
            ->get();

        // Check for Occupied Warehouses (1, 2, 3) - Flat
        $occupiedFlat = \App\Models\ShipmentOrder::whereIn('warehouse', ['Almacén 1', 'Almacén 2', 'Almacén 3'])
            ->whereIn('status', ['loading', 'authorized'])
            ->pluck('warehouse')
            ->unique()
            ->values()
            ->all();

        // Check for Occupied Cubicles (4, 5)
        $occupiedCubicles = \App\Models\ShipmentOrder::whereIn('warehouse', ['Almacén 4', 'Almacén 5'])
            ->whereIn('status', ['loading', 'authorized'])
            ->select('warehouse', 'cubicle')
            ->get()
            ->map(fn($item) => "{$item->warehouse}:{$item->cubicle}")
            ->all();

        return Inertia::render('APT/Scanner', [
            'recentScans' => $recentScans,
            'occupiedFlat' => $occupiedFlat,
            'occupiedCubicles' => $occupiedCubicles
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

        if (str_starts_with($qr, 'OP ')) {
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
                    try {
                        // Create new Order for this Burreo/Direct Trip
                        $order = \App\Models\ShipmentOrder::create([
                            'folio' => 'BUR-' . date('Ymd-His') . '-' . rand(100, 999), // Unique Folio
                            'sale_order' => 'N/A',
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
            // Strict Occupancy Check
            // Checks if any active order (status 'loading' or 'authorized') is already assigned to this cubicle.
            $occupied = \App\Models\ShipmentOrder::where('warehouse', $validated['warehouse'])
                ->where('cubicle', $validated['cubicle'])
                ->whereIn('status', ['loading', 'authorized'])
                ->where('id', '!=', $order->id) // Exclude current order
                ->exists();

            if ($occupied) {
                // Return Error with a clear message and disable action
                return back()->withErrors(['cubicle' => 'El cubículo ' . $validated['cubicle'] . ' en ' . $validated['warehouse'] . ' ya está ocupado por otra orden activa.']);
            }
        }

        // Create explicit variable for cubicle to ensure it's 'N/A' for WH 1-3
        $finalCubicle = $validated['cubicle'] ?? 'N/A';
        if (!in_array($validated['warehouse'], ['Almacén 4', 'Almacén 5', '4', '5'])) {
            $finalCubicle = 'N/A';
        }

        // Get Operator ID if available from QR or order
        $operatorId = null;
        if (str_starts_with($qr, 'OP ')) {
            $parts = explode('|', substr($qr, 3));
            $operatorId = $parts[0] ?? null;
        }

        // Update Order
        $order->update([
            'warehouse' => $validated['warehouse'],
            'cubicle' => $finalCubicle,
            'operation_type' => $validated['operation_type'],
            // Status remains 'loading' until Scale Exit
        ]);

        // Log Scan
        \App\Models\AptScan::create([
            'shipment_order_id' => $order->id,
            'operator_id' => $operatorId,
            'warehouse' => $validated['warehouse'],
            'cubicle' => $finalCubicle,
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

            // Allow same cubicle if it's the same order being edited? 
            // We need to check if occupied by DIFFERENT order.
            // But wait, $scan->shipment_order_id is the current one.

            $occupied = \App\Models\ShipmentOrder::where('warehouse', $validated['warehouse'])
                ->where('cubicle', $validated['cubicle'])
                ->whereIn('status', ['loading', 'authorized'])
                ->where('id', '!=', $scan->shipment_order_id) // Exclude current order
                ->exists();

            if ($occupied) {
                return back()->withErrors(['cubicle' => 'El cubículo ' . $validated['cubicle'] . ' ya está ocupado.']);
            }
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
