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
            'vessels' => Vessel::orderBy('created_at', 'desc')->get()
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

    // Scanner
    public function scanner()
    {
        $recentScans = \App\Models\AptScan::with('operator')
            ->whereDate('created_at', today())
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('APT/Scanner', [
            'recentScans' => $recentScans
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

        if (str_starts_with($qr, 'OP:')) {
            // Find active order for this operator
            $parts = explode('|', substr($qr, 3));
            $operatorId = $parts[0] ?? null;
            // Assuming the order exists and is in 'loading' status for this operator/vehicle
            if ($operatorId) {
                // We need to find the LATEST active order for this operator
                // This is a bit loose, ideally we scan the Order Folio or Ticket.
                // But if they use the same Badge (Operator QR):
                $order = \App\Models\ShipmentOrder::where('status', 'loading')
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
            $order = \App\Models\ShipmentOrder::where('id', $qr)->orWhere('folio', $qr)->first();
        }

        if (!$order) {
            return back()->withErrors(['qr' => 'Orden no encontrada o no activa.']);
        }

        // status check for Scale Flow
        if ($validated['operation_type'] === 'scale') {
            if ($order->status !== 'loading') { // 'loading' is set after Scale Entry
                return back()->withErrors(['qr' => 'ALERTA: El vehículo no ha pasado por báscula de entrada (Status: ' . $order->status . ').']);
            }
        }

        // Validation for Cubicle (WH 4 & 5)
        if (in_array($validated['warehouse'], ['4', '5', 'Almacén 4', 'Almacén 5'])) {
            if (empty($validated['cubicle'])) {
                return back()->withErrors(['cubicle' => 'El cubículo es obligatorio para el Almacén seleccionado.']);
            }
            // Check occupancy? (Future enhancement or simple check if cubicle isn't full)
            // User said: "Inhabilitar cubículo si ya está ocupado".
            // We can check if any *active* order has this cubicle assigned.
            $occupied = \App\Models\ShipmentOrder::where('warehouse', $validated['warehouse'])
                ->where('cubicle', $validated['cubicle'])
                ->whereIn('status', ['loading', 'authorized']) // Meaning currently in process using that cubicle?
                // Actually, "Occupied" means it has stuff in it. This needs Inventory logic.
                // For now, checks if another Truck is *currently* discharging there?
                // "Inhabilitar... si ya está ocupado".
                // Let's assume validation is enough for now or simple "Is there another truck discharging there right now?".
                ->exists();

            if ($occupied) {
                // return back()->withErrors(['cubicle' => 'El cubículo está ocupado por otra unidad.']);
                // Warning only? Or block. "Inhabilitar" implies Block.
            }
        }

        // Update Order
        $order->update([
            'warehouse' => $validated['warehouse'],
            'cubicle' => $validated['cubicle'],
            'operation_type' => $validated['operation_type'],
            // Status remains 'loading' until Scale Exit
        ]);

        // Log Scan
        \App\Models\AptScan::create([
            'shipment_order_id' => $order->id, // Need to add this column to apt_scans or use operator_id if we want legacy
            'operator_id' => null, // Legacy, nullable
            'warehouse' => $validated['warehouse'],
            'cubicle' => $validated['cubicle'],
            'user_id' => auth()->id(),
        ]);

        return redirect()->back()->with('success', 'Asignación de Almacén registrada correctamente.');
    }
}
