<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use App\Exports\Sheets\DashboardExecutiveSheet;
use App\Exports\Sheets\DashboardDataSheet;

class DashboardExport implements WithMultipleSheets
{
    use Exportable;

    protected $vesselId;
    protected $dateStart;
    protected $dateEnd;
    protected $warehouse;
    protected $operator;
    protected $operationType;
    protected $stats;
    protected $charts;

    public function __construct($filters, $stats, $charts)
    {
        $this->vesselId = $filters['vessel_id'] ?? null;
        $this->dateStart = $filters['start_date'] ?? null;
        $this->dateEnd = $filters['end_date'] ?? null;
        $this->warehouse = $filters['warehouse'] ?? null;
        $this->operator = $filters['operator'] ?? null;
        $this->operationType = $filters['operation_type'] ?? 'all';

        $this->stats = $stats;
        $this->charts = $charts;
    }

    /**
     * @return array
     */
    public function sheets(): array
    {
        $sheets = [];

        // Sheet 1: Executive Dashboard (Visual)
        $sheets[] = new DashboardExecutiveSheet($this->stats, $this->charts, [
            'vessel_id' => $this->vesselId,
            'warehouse' => $this->warehouse,
            'operator' => $this->operator
        ]);

        // Sheet 2: Raw Data (Source)
        $sheets[] = new DashboardDataSheet([
            'vessel_id' => $this->vesselId,
            'start_date' => $this->dateStart,
            'end_date' => $this->dateEnd,
            'warehouse' => $this->warehouse,
            'operator' => $this->operator,
            'operation_type' => $this->operationType
        ]);

        return $sheets;
    }
}
