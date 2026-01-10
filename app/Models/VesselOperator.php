<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VesselOperator extends Model
{
    protected $guarded = [];

    public function vessel()
    {
        return $this->belongsTo(Vessel::class);
    }
}
