<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Vessel extends Model
{
    use HasUuids;

    protected $guarded = [];

    protected $casts = [
        'eta' => 'datetime',
        'etb' => 'datetime',
        'berthal_datetime' => 'datetime',
        'docking_date' => 'date',
        'departure_date' => 'datetime',
        'is_anchored' => 'boolean',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function client()
    {
        return $this->belongsTo(Client::class);
    }
}
