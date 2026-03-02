<?php

namespace App\Exports;

use App\Models\ShipmentOrder;
use App\Models\Product;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Carbon\Carbon;
use App\Helpers\OperationalTimeHelper;

class ShipmentOrdersExport implements FromQuery, WithHeadings, WithMapping, ShouldAutoSize
{
    protected $filters;

    public function __construct($filters)
    {
        $this->filters = $filters;
    }

    public function query()
    {
        $isSader = $this->filters['is_sader'] ?? false;

        $query = ShipmentOrder::query()
            ->with([
                'client',
                'sales_order',
                'weight_ticket.lot',
                'weight_ticket.weighmaster',
                'creator',
                'loadingOrders',
                'items.product'
            ]);

        // Filter by SADER
        if ($isSader) {
            $query->where('consigned_to', 'SADER');
        } else {
            $query->where(function ($q) {
                $q->where('consigned_to', '!=', 'SADER')
                    ->orWhereNull('consigned_to')
                    ->orWhere('consigned_to', 'N/A');
            });
        }

        // Active filters from UI
        if (!empty($this->filters['search'])) {
            $search = $this->filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('folio', 'like', "%{$search}%")
                    ->orWhere('operator_name', 'like', "%{$search}%")
                    ->orWhere('transport_company', 'like', "%{$search}%")
                    ->orWhere('consigned_to', 'like', "%{$search}%")
                    ->orWhereHas('client', function ($q2) use ($search) {
                        $q2->where('business_name', 'like', "%{$search}%");
                    });
            });
        }

        // Operational Range Filter if provided
        if (!empty($this->filters['date'])) {
            $range = OperationalTimeHelper::getOperationalRange($this->filters['date']);
            // We use the OE creation date or the weigh_out_at from the ticket?
            // Usually, report is by date of OE or date of load.
            // Requirement says: "FECHA DE CARGA (con el corte operativo que se agrego)"
            // So we should filter by weight_ticket.weigh_out_at if it exists.
            $query->whereHas('weight_ticket', function ($q) use ($range) {
                $q->whereBetween('weigh_out_at', $range);
            });
        }

        // Exclude cancelled
        $query->where('status', '!=', 'cancelled');

        return $query->orderByDesc('created_at');
    }

    public function headings(): array
    {
        return [
            'FECHA DE CARGA',
            'ORDEN DE VENTA',
            'O.E',
            'CLIENTE',
            'CONSIGNADO',
            'DESTINO CONSIGNADO',
            'ESTADO',
            'CODIGO',
            'PRODUCTO',
            'PRESENTACION',
            'EL NUMERO DE LOTE',
            'PB',
            'PT',
            'PN',
            'P.PROG',
            'NO. DE SACOS',
            'ENVASE',
            'ALMACEN',
            'ENTRADA',
            'SALIDA',
            'LINEA TRANSPORTISTA',
            'OPERADOR',
            'CARTA PORTE',
            'TIPO DE UNIDAD',
            'P.TRACTOR',
            'ECONOMICO',
            'P.REMOLQUE',
            'DOCUMENTADOR',
            'OP. DE BASCULA'
        ];
    }

    public function map($order): array
    {
        $ticket = $order->weight_ticket;
        $loadingOrder = $order->loadingOrders->first();

        // Product Logic
        $productObj = $order->items->first()?->product;
        $productName = $order->product ?? ($productObj->name ?? 'N/A');
        $productCode = 'N/A';

        if ($productObj) {
            $productCode = $productObj->code;
        } else {
            // Fallback search by name
            $p = Product::where('name', $productName)->first();
            if ($p)
                $productCode = $p->code;
        }

        // Fecha de Carga
        $fechaCarga = $ticket && $ticket->weigh_out_at
            ? Carbon::parse($ticket->weigh_out_at)->format('d/m/Y')
            : Carbon::parse($order->date)->format('d/m/Y');

        return [
            $fechaCarga,
            $order->sales_order?->sale_order ?? 'N/A',
            $order->folio,
            $order->client_name ?? ($order->client->business_name ?? 'N/A'),
            $order->consigned_to ?? 'N/A',
            $order->destination ?? 'N/A',
            $order->state ?? 'N/A',
            $productCode,
            $productName,
            $order->presentation ?? 'N/A',
            $ticket->lot->folio ?? 'N/A',
            $ticket->gross_weight ?? 0,
            $ticket->tare_weight ?? 0,
            $ticket->net_weight ?? 0,
            $order->programmed_tons ?? 0,
            $order->sacks_count ?? 'N/A',
            $ticket->packaging_type ?? 'N/A',
            $loadingOrder->warehouse ?? 'N/A',
            $ticket && $ticket->weigh_in_at ? Carbon::parse($ticket->weigh_in_at)->format('H:i') : '---',
            $ticket && $ticket->weigh_out_at ? Carbon::parse($ticket->weigh_out_at)->format('H:i') : '---',
            $order->transport_company ?? 'N/A',
            $order->operator_name ?? 'N/A',
            $order->carta_porte ?? 'N/A',
            $order->unit_type ?? 'N/A',
            $order->tractor_plate ?? 'N/A',
            $order->economic_number ?? 'N/A',
            $order->trailer_plate ?? 'N/A',
            $order->creator->name ?? 'DOCUMENTACIÓN',
            $ticket->weighmaster->name ?? '---'
        ];
    }
}
