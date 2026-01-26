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
        // 1. Group legacy shipments by their 'sale_order' reference (folio)
        $legacyShipments = ShipmentOrder::whereNull('sales_order_id')
            ->whereNotNull('sale_order')
            ->get();

        foreach ($legacyShipments as $shipment) {
            // Find or create a SalesOrder for this folio
            $salesOrder = SalesOrder::firstOrCreate(
                ['folio' => $shipment->sale_order],
                [
                    'client_id' => $shipment->client_id,
                    'product_id' => \App\Models\Product::where('name', $shipment->product)->first()?->id,
                    'total_quantity' => $shipment->programmed_tons ?? 0,
                    'status' => 'closed', // Use 'closed' instead of 'completed' (invalid enum value)
                    'destination' => $shipment->destination,
                    'created_at' => $shipment->date, // Use shipment date as creation date
                ]
            );

            // Link the shipment to the SalesOrder
            $shipment->update(['sales_order_id' => $salesOrder->id]);
        }
    }
}
