<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ShipmentOrder;
use App\Models\SalesOrder;
use Illuminate\Support\Facades\DB;

class MigrateLegacyShipmentsSeeder extends Seeder
{
    public function run()
    {
        // 1. Get all shipments not yet linked
        $legacyShipments = ShipmentOrder::whereNull('sales_order_id')->get();

        foreach ($legacyShipments as $shipment) {
            // Determine the reference to use (try sale_order, then purchase_order, then fallback to its own folio)
            $reference = $shipment->sale_order ?? $shipment->purchase_order ?? $shipment->reference ?? ('LEGACY-' . $shipment->folio);

            // Find or create a SalesOrder for this reference
            $salesOrder = SalesOrder::firstOrCreate(
                ['folio' => $reference],
                [
                    'client_id' => $shipment->client_id,
                    'product_id' => \App\Models\Product::where('name', $shipment->product)->first()?->id,
                    'total_quantity' => $shipment->programmed_tons ?? 0,
                    'status' => 'closed',
                    'destination' => $shipment->destination,
                    'created_at' => $shipment->date ?? $shipment->created_at,
                ]
            );

            // Link the shipment to the SalesOrder
            $shipment->update(['sales_order_id' => $salesOrder->id]);
        }
    }
}
