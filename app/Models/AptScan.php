<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AptScan extends Model
{
    use HasFactory;

    protected $fillable = [
        'shipment_order_id',
        'operator_id',
        'warehouse',
        'cubicle',
        'user_id',
        'loading_order_id',
    ];

    public function operator()
    {
        return $this->belongsTo(VesselOperator::class, 'operator_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function loadingOrder()
    {
        return $this->belongsTo(LoadingOrder::class);
    }

    public function shipmentOrder()
    {
        return $this->belongsTo(ShipmentOrder::class);
    }
}
