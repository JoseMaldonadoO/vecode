<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class ShipmentOrder extends Model
{
    use HasUuids;
    protected $guarded = [];

    public function sales_order()
    {
        return $this->belongsTo(SalesOrder::class, 'sales_order_id');
    }

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function product() // Ideally via items, but simplified for direct access if needed
    {
        // Shortcut to get product from first item if architecture allows, 
        // OR if we store product_id on order directly. 
        // migration said: $table->foreignId('client_id'); 
        // It didn't mention product_id on shipments table, it's usually in items.
        // Let's check migration 2026_01_08_030407_create_shipment_orders_table.php
        // Just in case I made a shortcut in controller code.
        return $this->hasOneThrough(Product::class, ShipmentItem::class, 'shipment_order_id', 'id', 'id', 'product_id');
    }

    // Actually, let's just implement items() and the direct relations
    public function items()
    {
        return $this->hasMany(ShipmentItem::class);
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

    public function vessel()
    {
        return $this->belongsTo(Vessel::class);
    }

    public function loadingOrders()
    {
        return $this->hasMany(LoadingOrder::class);
    }

    /**
     * Get the folios of the associated Sales Order if it exists.
     * This provides a safe fallback for the removed 'sale_order' column.
     */
    public function getSaleOrderFolioAttribute()
    {
        return $this->sales_order?->folio ?? 'S/A';
    }

    /**
     * Get the customer reference from the Sales Order.
     */
    public function getCustomerReferenceAttribute()
    {
        return $this->sales_order?->sale_order ?? 'N/A';
    }

    protected $appends = ['sale_order_folio', 'customer_reference'];
}
