<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class LoadingOrder extends Model
{
    use HasUuids;

    protected $guarded = [];

    // --- Relations ---

    // Parent Commercial Order
    public function shipment_order()
    {
        return $this->belongsTo(ShipmentOrder::class);
    }

    // Commercial Sales Order
    public function sales_order()
    {
        return $this->belongsTo(SalesOrder::class);
    }

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function vessel()
    {
        return $this->belongsTo(Vessel::class);
    }

    public function transporter()
    {
        return $this->belongsTo(Transporter::class);
    }

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function weight_ticket()
    {
        return $this->hasOne(WeightTicket::class);
    }

    public function apt_scan()
    {
        return $this->hasOne(AptScan::class); // usually one per trip
    }

    public function loading_operation()
    {
        return $this->hasOne(LoadingOperation::class);
    }

    // --- Virtual Attributes for Convenience ---

    public function getClientNameAttribute()
    {
        // Snapshot fallback
        return $this->attributes['client_name'] ?? $this->client->business_name ?? 'N/A';
    }
}
