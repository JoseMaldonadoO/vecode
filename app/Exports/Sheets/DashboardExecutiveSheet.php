<?php

namespace App\Exports\Sheets;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithDrawings;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Drawing;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use Carbon\Carbon;

class DashboardExecutiveSheet implements FromArray, WithTitle, WithStyles, WithColumnWidths, WithDrawings
{
    protected $stats;
    protected $charts;
    protected $filters;

    public function __construct($stats, $charts, $filters)
    {
        $this->stats = $stats;
        $this->charts = $charts;
        $this->filters = $filters;
    }

    public function drawings()
    {
        $drawings = [];

        // Logo VECODE
        if (file_exists(public_path('images/Logo_vde.png'))) {
            $drawing = new Drawing();
            $drawing->setName('Logo VECODE');
            $drawing->setDescription('Logo VECODE');
            $drawing->setPath(public_path('images/Logo_vde.png'));
            $drawing->setHeight(50);
            $drawing->setCoordinates('B2');
            $drawings[] = $drawing;
        }

        // Logo Proagro
        if (file_exists(public_path('images/Proagro2.png'))) {
            $drawing2 = new Drawing();
            $drawing2->setName('Logo Proagro');
            $drawing2->setDescription('Logo Proagro');
            $drawing2->setPath(public_path('images/Proagro2.png'));
            $drawing2->setHeight(50);
            $drawing2->setCoordinates('E2');
            $drawings[] = $drawing2;
        }

        return $drawings;
    }

    public function array(): array
    {
        // Construct the "Visual" report manually as rows
        $rows = [];

        // Header Spacing
        $rows[] = ['', '', '', '', '', '']; // Row 1
        $rows[] = ['', '', '', '', '', '']; // Row 2 (Logos here)
        $rows[] = ['', '', '', '', '', '']; // Row 3
        $rows[] = ['', 'REPORTE EJECUTIVO DE OPERACIONES', '', '', '', '']; // Row 4 Title

        // Context
        $rows[] = ['', 'Fecha de Reporte:', Carbon::now()->format('d/m/Y H:i'), '', 'Generado por:', 'VECODE'];
        $rows[] = ['', 'Barco/Filtro:', $this->getFilterContext(), '', '', ''];
        $rows[] = ['', '', '', '', '', ''];

        // KPIs Section Header
        $rows[] = ['', 'INDICADORES CLAVE (KPIs)', '', '', '', ''];
        $rows[] = ['', 'Tonelaje Total', 'Viajes Totales', 'Unidades en Circuito', 'Báscula', 'Burreo'];

        // KPIS Values
        $rows[] = [
            '',
            number_format($this->stats['total_tonnage'] / 1000, 3) . ' MT',
            $this->stats['trips_completed'],
            $this->stats['units_in_circuit'],
            number_format($this->stats['total_scale'] / 1000, 3) . ' MT',
            number_format($this->stats['total_burreo'] / 1000, 3) . ' MT'
        ];

        $rows[] = ['', '', '', '', '', ''];
        $rows[] = ['', '', '', '', '', ''];

        // Stats Table: Daily Tonnage
        $rows[] = ['', 'DETALLE DIARIO DE OPERACIÓN', '', '', '', ''];
        $rows[] = ['', 'Fecha', 'Tonelaje Total', 'Báscula', 'Burreo', ''];

        foreach ($this->charts['daily_tonnage'] as $day) {
            $rows[] = [
                '',
                $day['date'],
                number_format($day['total'] / 1000, 3),
                number_format($day['scale'] / 1000, 3),
                number_format($day['burreo'] / 1000, 3),
                ''
            ];
        }

        return $rows;
    }

    public function styles(Worksheet $sheet)
    {
        // 1. Title Style
        $sheet->mergeCells('B4:E4');
        $sheet->getStyle('B4')->getFont()->setBold(true)->setSize(16)->getColor()->setARGB('1e3a8a'); // Blue
        $sheet->getStyle('B4')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        // 2. KPI Headers
        $sheet->getStyle('B8:F8')->getFont()->setBold(true)->getColor()->setARGB('FFFFFF');
        $sheet->getStyle('B8:F8')->getFill()->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)->getStartColor()->setARGB('1e3a8a');
        $sheet->getStyle('B8:F8')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        // 3. KPI Values
        $sheet->getStyle('B9:F9')->getFont()->setBold(true)->setSize(12);
        $sheet->getStyle('B9:F9')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->getStyle('B9:F9')->getBorders()->getAllBorders()->setBorderStyle(\PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN);

        // 4. Daily Table Header
        $sheet->mergeCells('B12:E12');
        $sheet->getStyle('B12')->getFont()->setBold(true)->getColor()->setARGB('1e3a8a');

        $sheet->getStyle('B13:E13')->getFont()->setBold(true)->getColor()->setARGB('FFFFFF');
        $sheet->getStyle('B13:E13')->getFill()->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)->getStartColor()->setARGB('4b5563'); // Gray

        // Borders for table
        $lastRow = $sheet->getHighestRow();
        $sheet->getStyle('B13:E' . $lastRow)->getBorders()->getAllBorders()->setBorderStyle(\PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN);
    }

    public function columnWidths(): array
    {
        return [
            'A' => 2,
            'B' => 25,
            'C' => 20,
            'D' => 20,
            'E' => 20,
            'F' => 20,
        ];
    }

    public function title(): string
    {
        return 'Dashboard Ejecutivo';
    }

    private function getFilterContext()
    {
        $context = $this->filters['vessel_id'] ? 'Barco Seleccionado ' : 'Todos los Barcos';
        if ($this->filters['warehouse'])
            $context .= ' | Almacén: ' . $this->filters['warehouse'];
        if ($this->filters['operator'])
            $context .= ' | Operador: ' . $this->filters['operator'];
        return $context;
    }
}
