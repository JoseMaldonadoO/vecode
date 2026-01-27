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

    public function getLoadedQuantityAttribute()
    {
        return $this->shipments()
            ->join('weight_tickets', 'shipment_orders.id', '=', 'weight_tickets.shipment_order_id')
            ->sum('weight_tickets.net_weight') ?: 0;
    }

    public function getBalanceAttribute()
    {
        return max(0, $this->total_quantity - $this->loaded_quantity);
    }

    protected $appends = ['loaded_quantity', 'balance'];
}
