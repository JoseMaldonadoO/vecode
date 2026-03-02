<?php

namespace App\Exports\Sheets;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithDrawings;
use Maatwebsite\Excel\Concerns\WithCharts;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Drawing;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Chart\Chart;
use PhpOffice\PhpSpreadsheet\Chart\DataSeries;
use PhpOffice\PhpSpreadsheet\Chart\DataSeriesValues;
use PhpOffice\PhpSpreadsheet\Chart\Legend;
use PhpOffice\PhpSpreadsheet\Chart\PlotArea;
use PhpOffice\PhpSpreadsheet\Chart\Title;
use Carbon\Carbon;

class DashboardExecutiveSheet implements FromArray, WithTitle, WithStyles, WithColumnWidths, WithDrawings, WithCharts
{
    protected $stats;
    protected $charts;
    protected $filters;
    protected $dataStartRow = 32;

    // Paleta Proagro
    protected $primaryGreen = '166534'; // Verde Oscuro
    protected $lightGreen = 'f0fdf4';   // Verde Fondo
    protected $goldAccent = 'fbbf24';   // Acento visual

    public function __construct($stats, $charts, $filters)
    {
        $this->stats = $stats;
        $this->charts = $charts;
        $this->filters = $filters;
    }

    public function drawings()
    {
        $drawings = [];
        // Tenant Logo (Prioritize Proagro)
        $logoPath = public_path('images/Proagro2.png');
        if (!file_exists($logoPath)) {
            $logoPath = public_path('images/Logo_vde.png');
        }

        if (file_exists($logoPath)) {
            $drawing = new Drawing();
            $drawing->setName('Logo Corporativo');
            $drawing->setPath($logoPath);
            $drawing->setHeight(55);
            $drawing->setCoordinates('B2');
            $drawing->setOffsetY(5);
            $drawings[] = $drawing;
        }

        return $drawings;
    }

    public function array(): array
    {
        $rows = [];

        // Header Background Area (Rows 1-6)
        for ($i = 0; $i < 6; $i++)
            $rows[] = ['', '', '', '', '', ''];

        $rows[3] = ['', '  REPORTE EJECUTIVO DE OPERACIONES', '', '', '', ''];
        $rows[4] = ['', '  ' . $this->getFilterContext(), '', '', '', ''];
        $rows[5] = ['', '  Generado: ' . Carbon::now()->format('d/m/Y H:i'), '', '', '', ''];

        // Spacers
        $rows[] = ['', '', '', '', '', ''];
        $rows[] = ['', '', '', '', '', ''];

        // KPI CARDS Labels
        $rows[] = ['', 'TONELAJE TOTAL', 'VIAJES COMPLETADOS', 'UNIDADES EN CIRCUITO', 'BÁSCULA (MT)', 'BURREO (MT)'];
        // KPI CARDS Values
        $rows[] = [
            '',
            number_format($this->stats['total_tonnage'] / 1000, 2) . ' MT',
            $this->stats['trips_completed'],
            $this->stats['units_in_circuit'],
            number_format($this->stats['total_scale'] / 1000, 2),
            number_format($this->stats['total_burreo'] / 1000, 2)
        ];

        // Chart Space (Rows 11-30)
        for ($i = 0; $i < 20; $i++)
            $rows[] = ['', '', '', '', '', ''];

        // Table Header
        $rows[] = ['', 'RESUMEN SEMANAL / HISTÓRICO (Últimos días)', '', '', '', ''];
        $rows[] = ['', 'Fecha', 'Total (MT)', 'Báscula (MT)', 'Burreo (MT)', ''];

        // Data (Max 10 rows for executive view)
        $dailyData = array_slice($this->charts['daily_tonnage'], -10);
        foreach ($dailyData as $day) {
            $rows[] = [
                '',
                $day['date'],
                round($day['total'] / 1000, 2),
                round($day['scale'] / 1000, 2),
                round($day['burreo'] / 1000, 2),
                ''
            ];
        }

        return $rows;
    }

    public function charts()
    {
        $rowCount = count(array_slice($this->charts['daily_tonnage'], -10));
        if ($rowCount === 0)
            return [];

        $startRow = $this->dataStartRow + 1;
        $endRow = $startRow + $rowCount - 1;

        $categories = [new DataSeriesValues(DataSeriesValues::DATASERIES_TYPE_STRING, '\'Dashboard\'!$B$' . $startRow . ':$B$' . $endRow, null, $rowCount)];
        $values = [new DataSeriesValues(DataSeriesValues::DATASERIES_TYPE_NUMBER, '\'Dashboard\'!$C$' . $startRow . ':$C$' . $endRow, null, $rowCount)];

        $series = new DataSeries(
            DataSeries::TYPE_BARCHART,
            DataSeries::GROUPING_CLUSTERED,
            range(0, count($values) - 1),
            [new DataSeriesValues(DataSeriesValues::DATASERIES_TYPE_STRING, null, null, 1, ['Tonnaje Diario'])],
            $categories,
            $values
        );

        $layout = new \PhpOffice\PhpSpreadsheet\Chart\Layout();
        $layout->setShowVal(true); // Data labels on top
        $layout->setShowLeaderLines(true);

        $plotArea = new PlotArea($layout, [$series]);
        $legend = new Legend(Legend::POSITION_BOTTOM, null, false);
        $title = new Title('Curva de Descarga Operativa');

        $chart = new Chart('executive_chart', $title, $legend, $plotArea, true, 'gap', null, null);
        $chart->setTopLeftPosition('B12');
        $chart->setBottomRightPosition('F30');

        return [$chart];
    }

    public function styles(Worksheet $sheet)
    {
        $sheet->setShowGridlines(false);
        $sheet->getParent()->getDefaultStyle()->getFont()->setName('Segoe UI');

        // Header Style
        $sheet->getStyle('A1:F7')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB($this->primaryGreen);
        $sheet->getStyle('B4')->getFont()->setBold(true)->setSize(22)->getColor()->setARGB('FFFFFF');
        $sheet->getStyle('B5:B6')->getFont()->setSize(10)->getColor()->setARGB('dcfce7'); // Light green text

        // KPI Styles (Cards)
        $kpiRange = 'B9:F10';
        $sheet->getStyle('B9:F9')->getFont()->setBold(true)->setSize(9)->getColor()->setARGB('64748b'); // Slate 500
        $sheet->getStyle('B10:F10')->getFont()->setBold(true)->setSize(18)->getColor()->setARGB($this->primaryGreen);
        $sheet->getStyle($kpiRange)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->getStyle($kpiRange)->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB('FFFFFF');

        // Card Borders
        $styleArray = [
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THICK,
                    'color' => ['argb' => 'e2e8f0'],
                ],
            ],
        ];
        $sheet->getStyle($kpiRange)->applyFromArray($styleArray);

        // Table Style
        $tableHeader = $this->dataStartRow - 1;
        $sheet->getStyle('B' . $tableHeader . ':E' . $tableHeader)->getFont()->setBold(true)->getColor()->setARGB('FFFFFF');
        $sheet->getStyle('B' . $tableHeader . ':E' . $tableHeader)->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB($this->primaryGreen);

        $lastRow = $sheet->getHighestRow();
        $sheet->getStyle('B' . $this->dataStartRow . ':E' . $lastRow)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->getStyle('B' . $this->dataStartRow . ':E' . $lastRow)->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB($this->lightGreen);

        return [];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 4,
            'B' => 28,
            'C' => 20,
            'D' => 20,
            'E' => 20,
            'F' => 20,
        ];
    }

    public function title(): string
    {
        return 'Dashboard';
    }

    private function getFilterContext()
    {
        $context = $this->filters['vessel_name'] ?? 'Global';

        if (!empty($this->filters['specific_date'])) {
            $context .= ' | Fecha: ' . $this->filters['specific_date'];
        } elseif (!empty($this->filters['start_date']) && !empty($this->filters['end_date'])) {
            $context .= ' | Rango: ' . $this->filters['start_date'] . ' al ' . $this->filters['end_date'];
        }

        if (!empty($this->filters['warehouse']))
            $context .= ' | Alm: ' . $this->filters['warehouse'];
        if (!empty($this->filters['operator']))
            $context .= ' | Op: ' . $this->filters['operator'];

        return $context;
    }
}
