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
        return $this->hasMany(LoadingOrder::class);
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

        // Use all individual trips (LoadingOrders) as the source of truth for weights
        $trips = $this->loading_orders()
            ->with(['weight_ticket'])
            ->where('status', '!=', 'cancelled')
            ->get();

        foreach ($trips as $trip) {
            if ($trip->weight_ticket) {
                if ($trip->weight_ticket->weighing_status === 'completed') {
                    // 1. Completed: Use actual Net Weight from Scale (KG/1000)
                    $total += ($trip->weight_ticket->net_weight / 1000);
                } else {
                    // 2. In Yard (Tared but not exit yet): Use programmed weight as reservation
                    // Units: programmed_tons is already in TM.
                    $total += (float) ($trip->programmed_tons ?: ($trip->shipment_order->programmed_tons ?? 0));
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
