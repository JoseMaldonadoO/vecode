<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use App\Traits\HasAuditTrail;

class WeightTicket extends Model
{
    use HasAuditTrail;
    protected $guarded = [];

    protected $casts = [
        'weigh_in_at' => 'datetime',
        'weigh_out_at' => 'datetime',
        'is_burreo' => 'boolean',
    ];

    public function loadingOrder()
    {
        return $this->belongsTo(LoadingOrder::class);
    }

    public function shipmentOrder()
    {
        return $this->belongsTo(ShipmentOrder::class);
    }
}
