<?php

namespace App\Http\Controllers;

use App\Models\ShipmentOrder;
use App\Models\Vessel;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class DockController extends Controller
{
    public function index()
    {
        return Inertia::render('Dock/Index');
    }

    public function createVessel()
    {
        return Inertia::render('Dock/CreateVessel', [
            'products' => \App\Models\Product::all(),
            'clients' => \App\Models\Client::all(),
        ]);
    }

    public function storeVessel(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'product_id' => 'required|exists:products,id',
            'client_id' => 'required|exists:clients,id',
            'service_type' => 'required|string',
        ]);

        Vessel::create($validated);

        return redirect()->route('dock.index'); // Return to menu
    }

    public function scanQr()
    {
        return Inertia::render('Dock/ScanQr');
    }

    public function processQr(Request $request)
    {
        $validated = $request->validate([
            'folio' => 'required|string|exists:shipment_orders,folio',
        ]);

        $order = ShipmentOrder::where('folio', $validated['folio'])->firstOrFail();

        // Logic: Truck MUST be in 'loading' status (Checked in by Guard -> Weighed In by Scale)
        if ($order->status === 'authorized') {
             return back()->withErrors(['folio' => "La orden {$order->folio} está autorizada pero NO ha realizado el primer pesaje (Tara). Envié a Báscula."]);
        }
        
        if ($order->status !== 'loading') {
            return back()->withErrors(['folio' => "La orden no está lista. Estatus: {$order->status} (Req: loading)"]);
        }

        // Logic: Assign to Active Vessel (Simplified: Pick first active or require input?)
        // For this MVP, let's assume we are operating on the "Current Active Vessel".
        // Or we could ask the user to select the vessel in the Scan QR screen.
        // Let's keep it simple: Just mark as loaded/unloaded so they can go to Scale Out.
        // And optionally link a vessel if sent.
        
        // If we want to link a vessel, we should probably have it selected in session or passed.
        // For now, let's just authorize the "Exit Weigh" by changing status.
        
        $order->update([
            'status' => 'weighing_out', // Now ready for Second Weigh
        ]);

        return back()->with('success', "Orden {$order->folio} procesada. Autorizada para pesaje de salida.");
    }
}
