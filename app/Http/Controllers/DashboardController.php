<?php

namespace App\Http\Controllers;

use App\Models\ShipmentOrder;
use App\Models\WeightTicket;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $vesselId = $request->input('vessel_id');
        $dateStart = $request->input('start_date');
        $dateEnd = $request->input('end_date');

        $warehouse = $request->input('warehouse');
        $cubicle = $request->input('cubicle');
        $operator = $request->input('operator');
        $operationType = $request->input('operation_type', 'all'); // 'all', 'scale', 'burreo'

        // 1. Resolve Vessel (Default to latest active if not provided)
        if (!$vesselId) {
            $latestVessel = \App\Models\Vessel::latest('created_at')->first();
            $vesselId = $latestVessel ? $latestVessel->id : null;
        }

        $selectedVessel = $vesselId ? \App\Models\Vessel::find($vesselId) : null;

        // Base query linked to the specific vessel and ALWAYS joined with weight_tickets
        // since the dashboard focuses on tonnages and operational dates (weigh_out_at).
        $baseQuery = ShipmentOrder::query()
            ->join('weight_tickets', 'shipment_orders.id', '=', 'weight_tickets.shipment_order_id');

        if ($vesselId) {
            $baseQuery->where('shipment_orders.vessel_id', $vesselId);
        }

        // Apply filters
        if ($dateStart && $dateEnd) {
            $baseQuery->whereBetween('weight_tickets.weigh_out_at', [$dateStart . ' 00:00:00', $dateEnd . ' 23:59:59']);
        } elseif ($request->has('date')) {
            $baseQuery->whereDate('weight_tickets.weigh_out_at', $request->date);
        }

        if ($warehouse)
            $baseQuery->where('shipment_orders.warehouse', $warehouse);
        if ($cubicle)
            $baseQuery->where('shipment_orders.cubicle', $cubicle);
        if ($operator)
            $baseQuery->where('shipment_orders.operator_name', $operator);

        if ($operationType === 'scale') {
            $baseQuery->where(function ($q) {
                $q->where('shipment_orders.operation_type', 'scale')
                    ->orWhereNull('shipment_orders.operation_type');
            });
        } elseif ($operationType === 'burreo') {
            $baseQuery->where('shipment_orders.operation_type', 'burreo');
        }

        // --- KPIS ---

        // Trips Completed (Total for this vessel, filtered by date if applied)
        $tripsCompleted = (clone $baseQuery)->where('shipment_orders.status', 'completed')->count();

        // Units in Circuit (Live status, restricted to vessel but usually ignores date filter for current state)
        $liveQuery = ShipmentOrder::where('vessel_id', $vesselId);
        if ($warehouse)
            $liveQuery->where('warehouse', $warehouse);

        $unitsInCircuit = (clone $liveQuery)->whereIn('status', ['authorized', 'weighing_in', 'loading', 'weighing_out'])->count();
        $unitsDischarging = (clone $liveQuery)->where('status', 'loading')->count();

        // Total Tonnes (Net Weight from Tickets in Kg)
        // Respecting the GLOBAL operationType filter
        $totalTonnage = (clone $baseQuery)
            ->where('shipment_orders.status', 'completed')
            ->sum('weight_tickets.net_weight');

        // Stats for the toggle buttons (always independent of the global operation_type filter)
        $totalScale = (clone $baseQuery)
            ->where('shipment_orders.status', 'completed')
            ->where(function ($q) {
                $q->where('shipment_orders.operation_type', 'scale')
                    ->orWhereNull('shipment_orders.operation_type');
            })
            ->sum('weight_tickets.net_weight');

        $totalBurreo = (clone $baseQuery)
            ->where('shipment_orders.status', 'completed')
            ->where('shipment_orders.operation_type', 'burreo')
            ->sum('weight_tickets.net_weight');

        $totalTonnage = (float) $totalTonnage;
        $totalScale = (float) $totalScale;
        $totalBurreo = (float) $totalBurreo;

        // --- CHARTS ---

        // 1. Daily Tonnage (Split keys)
        $dailyTonnage = (clone $baseQuery)
            ->where('shipment_orders.status', 'completed')
            ->selectRaw('
                DATE(weight_tickets.weigh_out_at) as date, 
                SUM(weight_tickets.net_weight) as total,
                SUM(CASE WHEN shipment_orders.operation_type = "burreo" THEN weight_tickets.net_weight ELSE 0 END) as burreo,
                SUM(CASE WHEN shipment_orders.operation_type != "burreo" OR shipment_orders.operation_type IS NULL THEN weight_tickets.net_weight ELSE 0 END) as scale
            ')
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(function ($item) {
                return [
                    'date' => $item->date,
                    'total' => (float) $item->total,
                    'burreo' => (float) $item->burreo,
                    'scale' => (float) $item->scale,
                ];
            });

        // 2. Storage Breakdown (By Warehouse/Cubicle)
        $byCubicle = (clone $baseQuery)
            ->where('shipment_orders.status', 'completed')
            ->selectRaw('CONCAT(COALESCE(shipment_orders.warehouse, "Almacén ??"), " - ", COALESCE(shipment_orders.cubicle, "General")) as label, SUM(weight_tickets.net_weight) as total')
            ->whereNotNull('shipment_orders.warehouse')
            ->groupBy('shipment_orders.warehouse', 'shipment_orders.cubicle')
            ->orderByDesc('total')
            ->get();

        // 3. Operator Breakdown
        $byOperator = (clone $baseQuery)
            ->where('shipment_orders.status', 'completed')
            ->selectRaw('shipment_orders.operator_name as label, SUM(weight_tickets.net_weight) as total')
            ->groupBy('shipment_orders.operator_name')
            ->orderByDesc('total')
            ->get();


        // Options for Selectors
        $vessels = \App\Models\Vessel::orderBy('created_at', 'desc')->take(20)->get(['id', 'name']);

        // Filter options based on the CURRENT vessel context
        $filterOptions = [
            'warehouses' => ShipmentOrder::where('vessel_id', $vesselId)->whereNotNull('warehouse')->distinct()->pluck('warehouse'),
            'cubicles' => ShipmentOrder::where('vessel_id', $vesselId)->whereNotNull('cubicle')->distinct()->pluck('cubicle'),
            'operators' => ShipmentOrder::where('vessel_id', $vesselId)->whereNotNull('operator_name')->distinct()->pluck('operator_name'),
        ];

        return Inertia::render('Dashboard', [
            'vessel' => $selectedVessel,
            'vessels_list' => $vessels,
            'stats' => [
                'trips_completed' => $tripsCompleted,
                'units_in_circuit' => $unitsInCircuit,
                'units_discharging' => $unitsDischarging,
                'total_tonnage' => $totalTonnage,
                'total_scale' => $totalScale,
                'total_burreo' => $totalBurreo,
                // Fix: programmed_tonnage is in MT, totalTonnage is in KG. Convert KG to MT for percentage.
                'progress_percent' => ($selectedVessel && $selectedVessel->programmed_tonnage > 0)
                    ? round((($totalTonnage / 1000) / $selectedVessel->programmed_tonnage) * 100, 1)
                    : 0
            ],
            'charts' => [
                'daily_tonnage' => $dailyTonnage,
                'by_cubicle' => $byCubicle,
                'by_operator' => $byOperator
            ],
            'filters' => $request->all(),
            'options' => $filterOptions
        ]);
    }

    /**
     * Drill-down Level 1: Get tonnage by warehouse for a specific date
     */
    public function drillDownWarehouses(Request $request)
    {
        $vesselId = $request->input('vessel_id');
        $date = $request->input('date');
        $operationType = $request->input('operation_type', 'all');

        $query = ShipmentOrder::query()
            ->join('weight_tickets', 'shipment_orders.id', '=', 'weight_tickets.shipment_order_id')
            ->where('shipment_orders.vessel_id', $vesselId)
            ->whereDate('weight_tickets.weigh_out_at', $date)
            ->where('shipment_orders.status', 'completed');

        if ($operationType === 'scale') {
            $query->whereIn('shipment_orders.operation_type', ['scale', null]);
        } elseif ($operationType === 'burreo') {
            $query->where('shipment_orders.operation_type', 'burreo');
        }

        $data = $query->selectRaw('COALESCE(shipment_orders.warehouse, "S/A") as warehouse, SUM(weight_tickets.net_weight) as total')
            ->groupBy('warehouse')
            ->orderByDesc('total')
            ->get();

        return response()->json($data);
    }

    /**
     * Drill-down Level 2: Get aggregated units for a warehouse/date
     */
    public function drillDownUnits(Request $request)
    {
        $vesselId = $request->input('vessel_id');
        $date = $request->input('date');
        $warehouse = $request->input('warehouse');
        $operationType = $request->input('operation_type', 'all');

        $query = ShipmentOrder::query()
            ->join('weight_tickets', 'shipment_orders.id', '=', 'weight_tickets.shipment_order_id')
            ->where('shipment_orders.vessel_id', $vesselId)
            ->whereDate('weight_tickets.weigh_out_at', $date)
            ->where('shipment_orders.warehouse', $warehouse)
            ->where('shipment_orders.status', 'completed');

        if ($operationType === 'scale') {
            $query->whereIn('shipment_orders.operation_type', ['scale', null]);
        } elseif ($operationType === 'burreo') {
            $query->where('shipment_orders.operation_type', 'burreo');
        }

        // Agregate by Unit (Operator + Economic Number)
        // We take the latest cubicle and plates.
        $data = $query->selectRaw('
                shipment_orders.operator_name,
                COALESCE(shipment_orders.economic_number, "S/N") as economic_number,
                MAX(shipment_orders.tractor_plate) as tractor_plate,
                MAX(shipment_orders.cubicle) as cubicle,
                SUM(weight_tickets.net_weight) as total_net_weight,
                COUNT(*) as trip_count
            ')
            ->groupBy('shipment_orders.operator_name', 'shipment_orders.economic_number')
            ->orderByDesc('total_net_weight')
            ->paginate(10);

        return response()->json($data);
    }

    /**
     * Drill-down Level 3: Get individual trips for a specific unit/warehouse/date
     */
    public function drillDownUnitTrips(Request $request)
    {
        $vesselId = $request->input('vessel_id');
        $date = $request->input('date');
        $warehouse = $request->input('warehouse');
        $operatorName = $request->input('operator_name');
        $economicNumber = $request->input('economic_number');
        $operationType = $request->input('operation_type', 'all');

        $query = ShipmentOrder::query()
            ->join('weight_tickets', 'shipment_orders.id', '=', 'weight_tickets.shipment_order_id')
            ->where('shipment_orders.vessel_id', $vesselId)
            ->whereDate('weight_tickets.weigh_out_at', $date)
            ->where('shipment_orders.warehouse', $warehouse)
            ->where('shipment_orders.operator_name', $operatorName)
            ->where('shipment_orders.status', 'completed');

        if ($economicNumber !== 'S/N') {
            $query->where('shipment_orders.economic_number', $economicNumber);
        } else {
            $query->whereNull('shipment_orders.economic_number');
        }

        if ($operationType === 'scale') {
            $query->whereIn('shipment_orders.operation_type', ['scale', null]);
        } elseif ($operationType === 'burreo') {
            $query->where('shipment_orders.operation_type', 'burreo');
        }

        $data = $query->select([
            'shipment_orders.id',
            'shipment_orders.folio',
            'shipment_orders.cubicle',
            'weight_tickets.net_weight',
            'weight_tickets.weigh_out_at'
        ])
            ->orderBy('weight_tickets.weigh_out_at', 'asc')
            ->get();

        return response()->json($data);
    }
}
