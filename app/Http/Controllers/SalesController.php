<?php

namespace App\Http\Controllers;

use App\Models\ShipmentOrder;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SalesController extends Controller
{
    public function index()
    {
        $orders = ShipmentOrder::with('client')
            ->where('operation_type', 'sale')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Sales/Index', [
            'orders' => $orders,
            'clients' => \App\Models\Client::all()
        ]);
    }

    public function create()
    {
        // Get all existing folios
        $folios = ShipmentOrder::pluck('folio')->toArray();
        $suggestedFolios = [];
        $patterns = [];

        foreach ($folios as $folio) {
            // Match pattern: ends with -NUMBER (e.g., OV-AMO-25-1)
            // Use - separator specifically based on user request "OV-AMO-25-2"
            if (preg_match('/^(.*)-(\d+)$/', $folio, $matches)) {
                $prefix = $matches[1];
                $number = intval($matches[2]);

                if (!isset($patterns[$prefix]) || $number > $patterns[$prefix]) {
                    $patterns[$prefix] = $number;
                }
            }
        }

        foreach ($patterns as $prefix => $maxNumber) {
            $suggestedFolios[] = $prefix . '-' . ($maxNumber + 1);
        }

        // Default if empty
        if (empty($suggestedFolios)) {
            $suggestedFolios[] = 'OV-' . date('Y') . '-1';
        }

        // Sort descending
        rsort($suggestedFolios);

        return Inertia::render('Sales/Create', [
            'clients' => \App\Models\Client::all(),
            'products' => \App\Models\Product::all(),
            'suggested_folios' => array_values($suggestedFolios),
            'default_folio' => ''
        ]);
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'folio' => 'required|string',
                'sale_order' => 'required|string',
                'sale_conditions' => 'nullable|string',
                'delivery_conditions' => 'nullable|string',
                'client_id' => 'required|exists:clients,id',
                'product_id' => 'required|exists:products,id',
                'quantity' => 'required|numeric|min:0.1',
                'destination' => 'nullable|string',
            ]);

            $order = \Illuminate\Support\Facades\DB::transaction(function () use ($validated) {
                $order = ShipmentOrder::create([
                    'folio' => $validated['folio'],
                    'sale_order' => $validated['sale_order'],
                    'sale_conditions' => $validated['sale_conditions'] ?? null,
                    'delivery_conditions' => $validated['delivery_conditions'] ?? null,
                    'client_id' => $validated['client_id'],
                    'status' => 'created',
                    'operation_type' => 'sale',
                    'destination' => $validated['destination'] ?? null,
                ]);

                $order->items()->create([
                    'product_id' => $validated['product_id'],
                    'requested_quantity' => $validated['quantity'],
                    'packaging_type' => 'Granel'
                ]);

                return $order;
            });

            // Redirect to print view
            return redirect()->route('sales.print', $order->id);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Sales Store Error: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Error al guardar la orden: ' . $e->getMessage()]);
        }
    }

    public function show(string $id)
    {
        $order = ShipmentOrder::with(['client', 'items.product', 'transporter', 'driver', 'vehicle', 'weight_ticket'])
            ->findOrFail($id);

        return Inertia::render('Sales/Show', [
            'order' => $order
        ]);
    }

    public function print(string $id)
    {
        $order = ShipmentOrder::with(['client', 'items.product'])
            ->findOrFail($id);

        return Inertia::render('Sales/Print', [
            'order' => $order
        ]);
    }

    public function edit(string $id)
    {
        $order = ShipmentOrder::with(['items', 'client'])->findOrFail($id);

        if ($order->status !== 'created') {
            return redirect()->route('sales.index')->withErrors(['message' => 'Solo se pueden editar órdenes en estatus CREADO.']);
        }

        return Inertia::render('Sales/Edit', [
            'order' => $order,
            'clients' => \App\Models\Client::all(),
            'products' => \App\Models\Product::all()
        ]);
    }

    public function update(Request $request, string $id)
    {
        $order = ShipmentOrder::findOrFail($id);

        if ($order->status !== 'created') {
            return redirect()->back()->withErrors(['message' => 'No se puede editar una orden en proceso.']);
        }

        $validated = $request->validate([
            'folio' => 'required|string',
            'sale_order' => 'required|string',
            'sale_conditions' => 'nullable|string',
            'delivery_conditions' => 'nullable|string',
            'client_id' => 'required|exists:clients,id',
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|numeric|min:0.1',
        ]);

        \Illuminate\Support\Facades\DB::transaction(function () use ($validated, $order) {
            $order->update([
                'folio' => $validated['folio'],
                'sale_order' => $validated['sale_order'],
                'sale_conditions' => $validated['sale_conditions'] ?? null,
                'delivery_conditions' => $validated['delivery_conditions'] ?? null,
                'client_id' => $validated['client_id'],
                'destination' => $validated['destination'] ?? null,
            ]);

            // Assuming single item per order for this MVP
            $order->items()->first()->update([
                'product_id' => $validated['product_id'],
                'requested_quantity' => $validated['quantity'],
            ]);
        });

        return redirect()->route('sales.index')->with('success', 'Orden actualizada correctamente.');
    }

    public function destroy(string $id)
    {
        $order = ShipmentOrder::findOrFail($id);

        if ($order->status !== 'created') {
            return redirect()->back()->withErrors(['message' => 'Solo se pueden cancelar órdenes en estatus CREADO.']);
        }

        $order->items()->delete();
        $order->delete();

        return redirect()->route('sales.index')->with('success', 'Orden eliminada (cancelada) correctamente.');
    }

    public function toggleStatus(string $id)
    {
        $order = ShipmentOrder::findOrFail($id);

        if ($order->status === 'created') {
            $order->update(['status' => 'closed']);
            $message = 'Orden CERRADA correctamente.';
        } elseif ($order->status === 'closed') {
            $order->update(['status' => 'created']);
            $message = 'Orden ABIERTA correctamente.';
        } else {
            return redirect()->back()->withErrors(['message' => 'No se puede cambiar el estatus de esta orden.']);
        }

        return redirect()->back()->with('success', $message);
    }
}
