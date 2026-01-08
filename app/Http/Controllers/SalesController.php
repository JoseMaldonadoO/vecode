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
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Sales/Index', [
            'orders' => $orders
        ]);
    }

    public function create()
    {
        return Inertia::render('Sales/Create', [
            'clients' => \App\Models\Client::all(),
            'products' => \App\Models\Product::all()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'folio' => 'required|string',
            'sale_order' => 'required|string',
            'client_id' => 'required|exists:clients,id',
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|numeric|min:0.1',
            'destination' => 'nullable|string',
        ]);

        \Illuminate\Support\Facades\DB::transaction(function () use ($validated) {
            $order = ShipmentOrder::create([
                'folio' => $validated['folio'],
                'sale_order' => $validated['sale_order'],
                'client_id' => $validated['client_id'],
                'status' => 'created',
            ]);

            $order->items()->create([
                'product_id' => $validated['product_id'],
                'requested_quantity' => $validated['quantity'],
                 // Assuming 'packaging' default or passed from form if added later
                'packaging_type' => 'Granel' 
            ]);
        });

        return redirect()->route('sales.index');
    }

    public function show(string $id)
    {
        $order = ShipmentOrder::with(['client', 'items.product', 'transporter', 'driver', 'vehicle', 'weight_ticket'])
            ->findOrFail($id);

        return Inertia::render('Sales/Show', [
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
            'client_id' => 'required|exists:clients,id',
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|numeric|min:0.1',
        ]);

        \Illuminate\Support\Facades\DB::transaction(function () use ($validated, $order) {
            $order->update([
                'folio' => $validated['folio'],
                'sale_order' => $validated['sale_order'],
                'client_id' => $validated['client_id'],
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

        $order->update(['status' => 'cancelled']);

        return redirect()->back()->with('success', 'Orden cancelada correctamente.');
    }
}
