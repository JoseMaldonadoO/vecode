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

        // 2. Get ALL GRANEL shipments (Only if they have started the weight process)
        $granelTotal = 0;
        $granelShipments = $this->shipments()
            ->with(['weight_ticket'])
            ->where('presentation', 'GRANEL')
            ->where('status', '!=', 'cancelled')
            ->get();

        foreach ($granelShipments as $shipment) {
            if ($shipment->weight_ticket) {
                if ($shipment->weight_ticket->weighing_status === 'completed') {
                    // Use ACTUAL net weight (convert from KG to Tons)
                    $granelTotal += ($shipment->weight_ticket->net_weight / 1000);
                } else {
                    // In progress (tared but not grossed yet): Use PROGRAMMED weight as reservation
                    // Unit fix: programmed_tons is already in Tons.
                    $granelTotal += (float) ($shipment->programmed_tons ?: 0);
                }
            }
            // If No Weight Ticket: Do NOT discount (user said: "una vez que se destare")
        }

        return (float) ($envasado + $granelTotal);
    }

    public function getBalanceAttribute()
    {
        return max(0, $this->total_quantity - $this->loaded_quantity);
    }

    protected $appends = ['loaded_quantity', 'balance'];
}
