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

        // Iterate through all shipment orders (Ordenes de Embarque) 
        // to aggregate actual scale weights or yard reservations.
        $shipments = $this->shipments()
            ->with(['weight_ticket'])
            ->where('status', '!=', 'cancelled')
            ->get();

        foreach ($shipments as $shipment) {
            if ($shipment->weight_ticket) {
                if ($shipment->weight_ticket->weighing_status === 'completed') {
                    // 1. Completed: Use actual Net Weight from Scale (KG/1000)
                    $total += ($shipment->weight_ticket->net_weight / 1000);
                } else {
                    // 2. In Yard (Entry scale done, but not exit): 
                    // Use programmed weight as a reservation for the order balance.
                    $total += (float) ($shipment->programmed_tons ?: 0);
                }
            }
            // 3. Programmed but NOT in yard: Ignore (Weight is not yet deducted from OV balance)
        }

        return (float) $total;
    }

    public function getBalanceAttribute()
    {
        return max(0, $this->total_quantity - $this->loaded_quantity);
    }

    protected $appends = ['loaded_quantity', 'balance'];
}
