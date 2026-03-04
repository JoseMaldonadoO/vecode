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
use Maatwebsite\Excel\Concerns\WithCustomStartCell;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;
use Carbon\Carbon;
use App\Helpers\OperationalTimeHelper;
use App\Models\ShipmentOrigin;

class ShipmentOrdersExport implements FromQuery, WithHeadings, WithMapping, ShouldAutoSize, WithStyles, WithColumnFormatting, WithEvents, WithCustomStartCell
{
    protected $filters;

    public function __construct($filters)
    {
        $this->filters = $filters;
    }

    public function startCell(): string
    {
        // All reports now start at A6 to accommodate corporate header
        return 'A6';
    }

    public function query()
    {
        $isSader = $this->filters['is_sader'] ?? false;

        $query = ShipmentOrder::query()
            ->select('shipment_orders.*')
            ->selectRaw(
                'COALESCE(so.name, shipment_orders.origin) as origin_name'
            )
            ->leftJoin('shipment_origins as so', 'so.id', '=', 'shipment_orders.origin_id')
            ->with([
                'client',
                'sales_order',
                'weight_ticket.lot',
                'weight_ticket.weighmaster',
                'weight_ticket.loadingOrder',
                'creator',
                'loadingOrders.weight_ticket.lot',
                'items.product',
            ]);

        // Filter by SADER
        if ($isSader) {
            $query->where(function ($q) {
                $q->whereRaw("UPPER(TRIM(consigned_to)) = 'SADER'")
                    ->orWhere('consigned_to', 'SADER');
            });
            // Only include records that have physically completed the weighing process
            $query->whereHas('weight_ticket', function ($q) {
                $q->whereNotNull('weigh_out_at');
            });
        } else {
            $query->where(function ($q) {
                $q->where('consigned_to', '!=', 'SADER')
                    ->orWhereNull('consigned_to')
                    ->orWhere('consigned_to', 'N/A');
            });
        }

        // Always exclude cancelled orders
        $query->where('status', '!=', 'cancelled');

        // Active filters from UI
        // SADER report should IGNORE the search filter to ensure full daily availability
        if (!$isSader && !empty($this->filters['search'])) {
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

            $query->where(function ($q) use ($range, $isSader) {
                if ($isSader) {
                    // For SADER, filter ONLY by final weight out time (Completion)
                    $q->whereHas('weight_ticket', function ($q2) use ($range) {
                        $q2->whereBetween('weigh_out_at', $range);
                    });
                } else {
                    // Standard General logic: Weighed out OR (if no ticket) created in range
                    $q->whereHas('weight_ticket', function ($q2) use ($range) {
                        $q2->whereBetween('weigh_out_at', $range);
                    })->orWhere(function ($q3) use ($range) {
                        $q3->whereDoesntHave('weight_ticket')
                            ->whereBetween('shipment_orders.created_at', $range);
                    });
                }
            });
        }

        return $query->orderByDesc('shipment_orders.created_at');
    }

    public function headings(): array
    {
        // Unified headings for all reports
        return [
            'TICKET',
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
            'NO. DE LOTE',
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
        // Robust Ticket & LoadingOrder Resolution
        $ticket = null;
        $loadingOrder = null;

        // Iterate loading orders to find the ticket with a lot (Destare priority)
        foreach ($order->loadingOrders as $lo) {
            if ($lo->weight_ticket) {
                if (!$ticket || $lo->weight_ticket->lot_id) {
                    $ticket = $lo->weight_ticket;
                    $loadingOrder = $lo;
                }
                if ($ticket->lot_id)
                    break;
            }
        }

        // Fallbacks
        $ticket = $ticket ?? $order->weight_ticket;
        $loadingOrder = $loadingOrder ?? $order->loadingOrders->first();
        $isSader = $this->filters['is_sader'] ?? false;

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

        // Weight/Date Logic
        $rawDate = $ticket->weigh_out_at ?? $order->created_at;
        $fechaCarga = OperationalTimeHelper::getOperativeDate($rawDate);
        $fechaCarga = Carbon::parse($fechaCarga)->format('d/m/Y');

        // Sacks Calculation Logic (Numeric and Precise)
        $sacksValue = '0';
        if ($order->presentation && strpos(strtoupper($order->presentation), 'ENVASADO') !== false) {
            $tons = (float) ($order->programmed_tons ?? 0);
            if ($order->sacks_count && strpos(strtoupper($order->sacks_count), 'KG') !== false) {
                $size = (int) preg_replace('/[^0-9]/', '', $order->sacks_count);
                if ($size > 0) {
                    $sacksValue = round(($tons * 1000) / $size);
                }
            } else {
                // Fallback using net weight if available
                $netWeight = (float) ($ticket->net_weight ?? 0);
                if ($netWeight > 0 && $order->sacks_count) {
                    $size = (int) preg_replace('/[^0-9]/', '', $order->sacks_count);
                    if ($size > 0) {
                        $sacksValue = round($netWeight / $size);
                    }
                }
            }
        }

        $ticketFolio = $ticket?->loadingOrder?->folio
            ?? $ticket?->ticket_number
            ?? $order->folio
            ?? 'N/A';

        // Unified Mapping (Tons for all reports)
        return [
            $ticketFolio,
            $fechaCarga,
            'SIN DATOS',
            ($order->origin_name ?: 'N/A'),
            $order->sale_order_folio ?? ($order->sales_order?->folio ?? 'N/A'),
            $order->folio,
            $order->client?->business_name ?? ($order->client_name ?? 'N/A'),
            $order->consigned_to ?? 'N/A',
            'SIN DATOS',
            $order->destination ?? 'N/A',
            $order->state ?? 'N/A',
            $productCode,
            $productName,
            $order->presentation ?? 'N/A',
            $ticket->lot->folio ?? 'N/A',
            ($ticket->gross_weight ?? 0) / 1000,
            ($ticket->tare_weight ?? 0) / 1000,
            ($ticket->net_weight ?? 0) / 1000,
            (float) ($order->programmed_tons ?? 0),
            $sacksValue,
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
        $headerColor = $isSader ? '22C55E' : '4F46E5';
        $headerRow = $isSader ? 6 : 1;
        $lastCol = $isSader ? 'AG' : 'AF';

        $styles = [
            $headerRow => [
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
            "A:$lastCol" => [
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                    'vertical' => Alignment::VERTICAL_CENTER,
                ],
            ],
        ];

        // All reports now use corporate styling
        $sheet->mergeCells('A1:AG1');
        $sheet->mergeCells('A2:AG2');
        $sheet->mergeCells('A3:AG3');
        $sheet->mergeCells('A4:AG4');
        $sheet->mergeCells('A5:AG5');

        $sheet->setCellValue('A1', 'PRO-AGROINDUSTRIA, S.A. DE C.V.');
        $sheet->setCellValue('A2', 'CONTROL DE PESAJE DE UNIDADES');
        $sheet->setCellValue('A3', 'JEFATURA DE TRAFICO');
        $sheet->setCellValue('A4', '');
        $sheet->setCellValue('A5', 'REGISTRO DE SALIDA DE PRODUCTO');

        $sheet->getStyle('A1:AG5')->getFont()->setBold(true);
        $sheet->getStyle('A1')->getFont()->setSize(14);
        $sheet->getStyle('A1:AG5')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        // Red Line under corporate header (A1 to AG1 bottom)
        $sheet->getStyle('A1:AG1')->getBorders()->getBottom()->setBorderStyle(Border::BORDER_THICK)->getColor()->setRGB('FF0000');

        return $styles;
    }

    public function columnFormats(): array
    {
        $isSader = $this->filters['is_sader'] ?? false;

        return [
            'P' => '0.000', // PB
            'Q' => '0.000', // PT
            'R' => '0.000', // PN
            'S' => '0.00',  // P.PROG
        ];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $isSader = $this->filters['is_sader'] ?? false;
                $headerRow = 6;
                $lastCol = 'AG';

                // Set Filter on Headings row
                $event->sheet->setAutoFilter("A{$headerRow}:{$lastCol}{$headerRow}");
            },
        ];
    }
}
