<?php

namespace App\Exports;

use App\Models\ShipmentOrder;
use App\Models\Product;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnFormatting;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use Carbon\Carbon;
use App\Helpers\OperationalTimeHelper;

class ShipmentOrdersExport implements FromQuery, WithHeadings, WithMapping, ShouldAutoSize, WithStyles, WithColumnFormatting, WithEvents
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
                'items.product',
                'origin'
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

            // Priority 1: weigh_out_at from weight_ticket (Completed orders)
            // Priority 2: created_at from shipment_order (Pending orders)
            $query->where(function ($q) use ($range) {
                $q->whereHas('weight_ticket', function ($q2) use ($range) {
                    $q2->whereBetween('weigh_out_at', $range);
                })->orWhere(function ($q3) use ($range) {
                    $q3->whereDoesntHave('weight_ticket')
                        ->whereBetween('created_at', $range);
                });
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
            'CATEGORIA',
            'ORIGEN DEL PRODUCTO',
            'ORDEN DE VENTA',
            'O.E',
            'CLIENTE',
            'CONSIGNADO',
            'PRIMER CONSIGNADO',
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
            $p = Product::where('name', $productName)->first();
            if ($p)
                $productCode = $p->code;
        }

        // Fecha de Carga
        $fechaCarga = $ticket && $ticket->weigh_out_at
            ? Carbon::parse($ticket->weigh_out_at)->format('d/m/Y')
            : Carbon::parse($order->created_at)->format('d/m/Y');

        return [
            $fechaCarga,
            'SIN DATOS',
            ($order->origin ? (is_object($order->origin) ? $order->origin->name : $order->origin) : 'N/A'),
            $order->sale_order_folio ?? ($order->sales_order?->folio ?? 'N/A'),
            $order->folio,
            $order->client_name ?? ($order->client->business_name ?? 'N/A'),
            $order->consigned_to ?? 'N/A',
            'SIN DATOS',
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
            $order->sacks_count ? preg_replace('/[^0-9]/', '', $order->sacks_count) : '0',
            $ticket->packaging_type ?? 'N/A',
            $loadingOrder->warehouse ?? 'N/A',
            $ticket && $ticket->weigh_in_at ? Carbon::parse($ticket->weigh_in_at)->format('h:i A') : '---',
            $ticket && $ticket->weigh_out_at ? Carbon::parse($ticket->weigh_out_at)->format('h:i A') : '---',
            $order->transport_company ?? 'N/A',
            $order->operator_name ?? ($order->driver->name ?? 'N/A'),
            $order->carta_porte ?? 'N/A',
            $order->unit_type ?? 'N/A',
            $order->tractor_plate ?? 'N/A',
            $order->economic_number ?? 'N/A',
            $order->trailer_plate ?? 'N/A',
            $order->creator->name ?? 'DOCUMENTACIÓN',
            $ticket->weighmaster->name ?? '---'
        ];
    }

    public function styles(Worksheet $sheet)
    {
        $isSader = $this->filters['is_sader'] ?? false;
        $headerColor = $isSader ? '22C55E' : '4F46E5'; // Green 500 (Proagro) vs Indigo 600

        return [
            1 => [
                'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => $headerColor]
                ],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                    'vertical' => Alignment::VERTICAL_CENTER,
                ],
            ],
            'A:AF' => [
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                    'vertical' => Alignment::VERTICAL_CENTER,
                ],
            ],
        ];
    }

    public function columnFormats(): array
    {
        return [
            'O' => '#,##0.00', // PB
            'P' => '#,##0.00', // PT
            'Q' => '#,##0.00', // PN
            'R' => '#,##0.00', // P.PROG
        ];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                // Set Filter on Headings
                $event->sheet->setAutoFilter('A1:AF1');
            },
        ];
    }
}
