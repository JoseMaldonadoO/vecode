<?php

namespace App\Exports\Sheets;

use App\Models\LoadingOrder;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Illuminate\Support\Facades\DB;

class DashboardDataSheet implements FromQuery, WithHeadings, WithMapping, WithTitle, ShouldAutoSize
{
    protected $filters;

    public function __construct($filters)
    {
        $this->filters = $filters;
    }

    public function query()
    {
        $vesselId = $this->filters['vessel_id'];
        $dateStart = $this->filters['start_date'];
        $dateEnd = $this->filters['end_date'];
        $warehouse = $this->filters['warehouse'];
        $operator = $this->filters['operator'];
        $operationType = $this->filters['operation_type'];

        $query = LoadingOrder::query()
            ->join('weight_tickets', 'loading_orders.id', '=', 'weight_tickets.loading_order_id')
            ->select('loading_orders.*', 'weight_tickets.net_weight', 'weight_tickets.weigh_out_at', 'weight_tickets.ticket_number'); // Select specific columns to avoid collision

        if ($vesselId) {
            $query->where('loading_orders.vessel_id', $vesselId);
        }

        if ($dateStart && $dateEnd) {
            $query->whereBetween('weight_tickets.weigh_out_at', [$dateStart . ' 00:00:00', $dateEnd . ' 23:59:59']);
        }

        if ($warehouse) {
            $query->where('loading_orders.warehouse', $warehouse);
        }

        if ($operator) {
            $query->where('loading_orders.operator_name', $operator);
        }

        if ($operationType === 'scale') {
            $query->where(function ($q) {
                $q->where('loading_orders.operation_type', 'scale')
                    ->orWhereNull('loading_orders.operation_type');
            });
        } elseif ($operationType === 'burreo') {
            $query->where('loading_orders.operation_type', 'burreo');
        }

        return $query->orderByDesc('weight_tickets.weigh_out_at');
    }

    public function headings(): array
    {
        return [
            'ID Viaje',
            'Ticket',
            'Fecha Salida',
            'Operador',
            'Económico',
            'Placas',
            'Producto',
            'Almacén',
            'Cubículo',
            'Peso Neto (kg)',
            'Tipo Op.',
            'Estatus'
        ];
    }

    public function map($order): array
    {
        return [
            $order->id,
            $order->ticket_number ?? '---',
            $order->weigh_out_at,
            $order->operator_name,
            $order->economic_number ?? $order->unit_number ?? 'S/N',
            $order->tractor_plate ?? '---',
            $order->product_name,
            $order->warehouse,
            $order->cubicle,
            $order->net_weight,
            ucfirst($order->operation_type ?? 'Báscula'),
            ucfirst($order->status)
        ];
    }

    public function title(): string
    {
        return 'Data Cruda (Source)';
    }
}
