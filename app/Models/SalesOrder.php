<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class SalesOrder extends Model
{
    use HasUuids;

    protected $guarded = [];

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function shipments()
    {
        return $this->hasMany(ShipmentOrder::class);
    }

    public function loading_orders()
    {
        return $this->hasManyThrough(
            LoadingOrder::class,
            ShipmentOrder::class,
            'sales_order_id', // Foreign key on shipment_orders table
            'shipment_order_id', // Foreign key on loading_orders table
            'id', // Local key on sales_orders table
            'id' // Local key on shipment_orders table
        );
    }


    public function weight_tickets()
    {
        return $this->hasManyThrough(
            WeightTicket::class,
            ShipmentOrder::class,
            'sales_order_id', // Foreign key on shipment_orders table
            'shipment_order_id', // Foreign key on weight_tickets table
            'id', // Local key on sales_orders table
            'id' // Local key on shipment_orders table
        );
    }

    public function getLoadedQuantityAttribute()
    {
        $total = 0;

        // Traverse: SalesOrder -> ShipmentOrder -> LoadingOrder -> WeightTicket
        // This is the most robust path as shipment_order_id is always present.
        // Check if relationships are already loaded to avoid N+1
        if ($this->relationLoaded('shipments')) {
            $shipments = $this->shipments->where('status', '!=', 'cancelled');
        } else {
            $shipments = $this->shipments()
                ->with(['loadingOrders.weight_ticket'])
                ->where('status', '!=', 'cancelled')
                ->get();
        }

        foreach ($shipments as $shipment) {
            // Check if loadingOrders is loaded on the shipment
            $trips = $shipment->relationLoaded('loadingOrders')
                ? $shipment->loadingOrders
                : $shipment->loadingOrders()->with('weight_ticket')->get();

            // 1. Packed Product (ENVASADO): Bypasses scale, counts immediately upon creation
            if (strtoupper($shipment->presentation) === 'ENVASADO') {
                $total += (float) ($shipment->programmed_tons ?? 0);
                continue;
            }

            // 2. Bulk Product (GRANEL): Follows standard scale flow
            foreach ($trips as $trip) {
                if ($trip->status === 'cancelled')
                    continue;

                if ($trip->weight_ticket) {
                    if ($trip->weight_ticket->weighing_status === 'completed') {
                        // Completed: Use actual Net Weight from Scale
                        $total += ($trip->weight_ticket->net_weight / 1000);
                    } else {
                        // In Yard: Use programmed weight as reservation
                        $total += (float) ($trip->programmed_tons ?? 0);
                    }
                }
            }
        }

        return (float) $total;
    }

    public function getBalanceAttribute()
    {
        return max(0, $this->total_quantity - $this->loaded_quantity);
    }

    protected $appends = ['loaded_quantity', 'balance'];
}
