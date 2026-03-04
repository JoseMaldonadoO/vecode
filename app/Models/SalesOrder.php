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
        // Performance: If the denormalized column exists and we are in production-scaling mode,
        // we should favor the column. We keep the fallback for backward compatibility during migration.
        if (array_key_exists('loaded_quantity', $this->attributes)) {
            return (float) $this->attributes['loaded_quantity'];
        }

        return $this->calculateLoadedQuantity();
    }

    /**
     * The original heavy calculation logic, now available as a helper.
     */
    public function calculateLoadedQuantity(): float
    {
        $total = 0;

        // Traverse: SalesOrder -> ShipmentOrder -> LoadingOrder -> WeightTicket
        $shipments = $this->shipments()
            ->with(['loadingOrders.weight_ticket'])
            ->where('status', '!=', 'cancelled')
            ->get();

        foreach ($shipments as $shipment) {
            $trips = $shipment->loadingOrders;

            // 1. Packed Product (ENVASADO): Bypasses scale, counts immediately
            if (strtoupper($shipment->presentation) === 'ENVASADO') {
                $total += (float) ($shipment->programmed_tons ?? 0);
                continue;
            }

            // 2. Bulk Product (GRANEL): Follows standard scale flow
            foreach ($trips as $trip) {
                if ($trip->status === 'cancelled')
                    continue;

                if ($trip->weight_ticket) {
                    if ($trip->weight_ticket->weighing_status === 'completed') {
                        $total += ($trip->weight_ticket->net_weight / 1000);
                    } else {
                        $total += (float) ($trip->programmed_tons ?? 0);
                    }
                }
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
