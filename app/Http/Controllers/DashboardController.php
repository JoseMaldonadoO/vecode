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

        // 1. Resolve Vessel (Default to latest active if not provided)
        if (!$vesselId) {
            $latestVessel = \App\Models\Vessel::latest('created_at')->first();
            $vesselId = $latestVessel ? $latestVessel->id : null;
        }

        $selectedVessel = $vesselId ? \App\Models\Vessel::find($vesselId) : null;

        // Base query linked to the specific vessel
        $baseQuery = ShipmentOrder::query();

        if ($vesselId) {
            $baseQuery->where('vessel_id', $vesselId);
        }

        // Apply filters
        if ($dateStart && $dateEnd) {
            $baseQuery->whereBetween('shipment_orders.updated_at', [$dateStart . ' 00:00:00', $dateEnd . ' 23:59:59']);
        } elseif ($request->has('date')) {
            // Fallback for single date legacy filter
            $baseQuery->whereDate('shipment_orders.updated_at', $request->date);
        }

        if ($warehouse)
            $baseQuery->where('warehouse', $warehouse);
        if ($cubicle)
            $baseQuery->where('cubicle', $cubicle);
        if ($operator)
            $baseQuery->where('operator_name', $operator);

        // --- KPIS ---

        // Trips Completed (Total for this vessel, filtered by date if applied)
        $tripsCompleted = (clone $baseQuery)->where('status', 'completed')->count();

        // Units in Circuit (Live status, usually usually filtered by vessel but NOT by date, as they are "current")
        // However, if we are looking at historical data, this might be 0. 
        // For "Dashboard", we usually want CURRENT state for operational KPIs.
        // We'll restrict to vessel but ignore date filter for "Current Status" KPIs
        $liveQuery = ShipmentOrder::where('vessel_id', $vesselId);
        if ($warehouse)
            $liveQuery->where('warehouse', $warehouse); // Filter live units by warehouse if selected

        $unitsInCircuit = (clone $liveQuery)->whereIn('status', ['authorized', 'weighing_in', 'loading', 'weighing_out'])->count();
        $unitsDischarging = (clone $liveQuery)->where('status', 'loading')->count();

        // Total Tonnes (Net Weight from Tickets in Kg)
        // Split by Operation Type
        $totalScale = (clone $baseQuery)
            ->where('shipment_orders.status', 'completed')
            ->where(function ($q) {
                $q->where('shipment_orders.operation_type', 'scale')
                    ->orWhereNull('shipment_orders.operation_type');
            })
            ->join('weight_tickets', 'shipment_orders.id', '=', 'weight_tickets.shipment_order_id')
            ->sum('weight_tickets.net_weight');

        $totalBurreo = (clone $baseQuery)
            ->where('shipment_orders.status', 'completed')
            ->where('shipment_orders.operation_type', 'burreo')
            ->join('weight_tickets', 'shipment_orders.id', '=', 'weight_tickets.shipment_order_id')
            ->sum('weight_tickets.net_weight');

        $totalTonnage = (float) ($totalScale + $totalBurreo);
        $totalScale = (float) $totalScale;
        $totalBurreo = (float) $totalBurreo;

        // --- CHARTS ---

        // 1. Daily Tonnage (Split keys)
        $dailyTonnage = (clone $baseQuery)
            ->where('shipment_orders.status', 'completed')
            ->join('weight_tickets', 'shipment_orders.id', '=', 'weight_tickets.shipment_order_id')
            ->selectRaw('
                DATE(shipment_orders.updated_at) as date, 
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
            ->join('weight_tickets', 'shipment_orders.id', '=', 'weight_tickets.shipment_order_id')
            ->selectRaw('CONCAT(COALESCE(shipment_orders.warehouse, "Almacén ??"), " - ", COALESCE(shipment_orders.cubicle, "General")) as label, SUM(weight_tickets.net_weight) as total')
            ->whereNotNull('shipment_orders.warehouse')
            ->groupBy('shipment_orders.warehouse', 'shipment_orders.cubicle')
            ->orderByDesc('total')
            ->get();

        // 3. Operator Breakdown
        $byOperator = (clone $baseQuery)
            ->where('shipment_orders.status', 'completed')
            ->join('weight_tickets', 'shipment_orders.id', '=', 'weight_tickets.shipment_order_id')
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
}
