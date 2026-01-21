<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WeightTicket extends Model
{
    protected $guarded = [];

    protected $casts = [
        'weigh_in_at' => 'datetime',
        'weigh_out_at' => 'datetime',
    ];

    public function shipmentOrder()
    {
        return $this->belongsTo(ShipmentOrder::class);
    }
}
