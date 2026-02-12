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
        // 1. Get ALL ENVASADO shipments (Immediate deduction based on program)
        $envasado = $this->shipments()
            ->where('presentation', 'ENVASADO')
            ->where('status', '!=', 'cancelled') // Exclude cancelled
            ->sum('programmed_tons') ?: 0;

        // 2. Get ALL GRANEL shipments (Weighed OR Programmed)
        $granelShipments = $this->shipments()
            ->with(['weight_ticket']) // Eager load weight ticket
            ->where('presentation', 'GRANEL')
            ->where('status', '!=', 'cancelled') // Exclude cancelled
            ->get();

        $granelTotal = 0;

        foreach ($granelShipments as $shipment) {
            // Check if we have a VALID weight ticket with net_weight > 0
            if ($shipment->weight_ticket && $shipment->weight_ticket->net_weight > 0) {
                // Use ACTUAL weight (converted from KG to Tons)
                $granelTotal += ($shipment->weight_ticket->net_weight / 1000);
            } else {
                // Use PROGRAMMED weight as placeholder (reservation)
                // This ensures the balance drops immediately upon creating the order
                // Convert KG to Tons (1 Ton = 1000 KG)
                $granelTotal += (($shipment->programmed_tons ?: 0) / 1000);
            }
        }

        return (float) ($envasado + $granelTotal);
    }

    public function getBalanceAttribute()
    {
        return max(0, $this->total_quantity - $this->loaded_quantity);
    }

    protected $appends = ['loaded_quantity', 'balance'];
}
