<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

use App\Traits\HasAuditTrail;

class SalesOrder extends Model
{
    use HasUuids, HasAuditTrail;

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

    public function loading_orders()
    {
        return $this->hasManyThrough(
            LoadingOrder::class,
            ShipmentOrder::class,
            'sales_order_id', // Foreign key on shipment_orders table
            'shipment_order_id', // Foreign key on loading_orders table
            'id', // Local key on sales_orders table
            'id' // Local key on shipment_orders table
        );
    }

    public function trips()
    {
        return $this->hasMany(LoadingOrder::class, 'sales_order_id');
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
        // Safety: If the column doesn't exist in the query result or is 0,
        // we fallback to real-time calculation to ensure data integrity during transition.
        if (!array_key_exists('loaded_quantity', $this->attributes) || (float) $this->attributes['loaded_quantity'] === 0.0) {
            return $this->calculateLoadedQuantity();
        }

        return (float) $this->attributes['loaded_quantity'];
    }

    /**
     * The original heavy calculation logic, now available as a helper.
     * $cutOff allows calculating state at a specific point in time.
     */
    public function calculateLoadedQuantity($cutOff = null): float
    {
        $total = 0;

        // Traverse all trips directly linked to the Sales Order
        $tripsQuery = $this->trips()
            ->with(['weight_ticket'])
            ->where('status', '!=', 'cancelled');

        if ($cutOff) {
            $tripsQuery->where('created_at', '<=', $cutOff);
        }

        $trips = $tripsQuery->get();

        // 1. Check Packed Product (ENVASADO) from OE Snapshot
        // We still need to handle Envasado differently as it may not have tickets
        $shipmentsQuery = $this->shipments()
            ->where('status', '!=', 'cancelled');
        
        if ($cutOff) {
            $shipmentsQuery->where('created_at', '<=', $cutOff)
                ->where(function($q) use ($cutOff) {
                    $q->whereNull('cancelled_at')
                      ->orWhere('cancelled_at', '>', $cutOff);
                });
        }
        
        $shipments = $shipmentsQuery->get();

        foreach ($shipments as $shipment) {
            if (strtoupper($shipment->presentation) === 'ENVASADO') {
                $total += (float) ($shipment->programmed_tons ?? 0);
            }
        }

        // 2. Sum regular trips for Bulk (GRANEL) or others using tickets
        foreach ($trips as $trip) {
            // Avoid double-counting if we already handled it as Envasado (Safety check)
            if ($trip->shipment_order && strtoupper($trip->shipment_order->presentation) === 'ENVASADO') {
                continue;
            }

            if ($trip->weight_ticket) {
                $ticket = $trip->weight_ticket;
                $isCompletedAtTime = ($ticket->weighing_status === 'completed' && (!$cutOff || $ticket->weigh_out_at <= $cutOff));
                
                if ($isCompletedAtTime) {
                    $total += ($ticket->net_weight / 1000);
                } else {
                    // In progress: Use programmed_tons (matches live "optimistic" behavior)
                    $total += (float) ($trip->programmed_tons ?? 0);
                }
            } else {
                // No ticket yet: fallback to programmed_tons
                $total += (float) ($trip->programmed_tons ?? 0);
            }
        }

        return (float) $total;
    }

    /**
     * Force a synchronization of the denormalized column.
     * This should be called whenever a weight ticket is completed or a shipment is modified.
     */
    public function syncLoadedQuantity(): void
    {
        $this->updateQuietly([
            'loaded_quantity' => $this->calculateLoadedQuantity()
        ]);
    }

    public function getBalanceAttribute()
    {
        return max(0, $this->total_quantity - $this->loaded_quantity);
    }

    protected $appends = ['balance']; // 'loaded_quantity' is now a real attribute
}
