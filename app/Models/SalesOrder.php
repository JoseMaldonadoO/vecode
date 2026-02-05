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
        // 1. Sum programmed_tons for ENVASADO shipments (Immediate deduction)
        $envasado = $this->shipments()
            ->where('presentation', 'ENVASADO')
            ->sum('programmed_tons') ?: 0;

        // 2. Sum net_weight for GRANEL shipments (Only after weighing/destare)
        $granel = $this->shipments()
            ->where('presentation', 'GRANEL')
            ->join('weight_tickets', 'shipment_orders.id', '=', 'weight_tickets.shipment_order_id')
            ->sum('weight_tickets.net_weight') ?: 0;

        return (float) ($envasado + $granel);
    }

    public function getBalanceAttribute()
    {
        return max(0, $this->total_quantity - $this->loaded_quantity);
    }

    protected $appends = ['loaded_quantity', 'balance'];
}
