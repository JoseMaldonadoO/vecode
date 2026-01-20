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
        $date = $request->input('date', Carbon::today()->toDateString());
        $warehouse = $request->input('warehouse');
        $cubicle = $request->input('cubicle');
        $operator = $request->input('operator');

        // Base query for stats and filtering
        // Prefix columns to avoid ambiguity after joins
        $baseQuery = ShipmentOrder::whereDate('shipment_orders.updated_at', $date);

        if ($warehouse)
            $baseQuery->where('shipment_orders.warehouse', $warehouse);
        if ($cubicle)
            $baseQuery->where('shipment_orders.cubicle', $cubicle);
        if ($operator)
            $baseQuery->where('shipment_orders.operator_name', $operator);

        // 1. Calculate Stats
        $stats = [
            // Trips completed (Today or filtered date)
            'trips_completed' => (clone $baseQuery)->where('shipment_orders.status', 'completed')->count(),

            // Units in circuit (Currently in plant, regardless of date filtering)
            'units_in_circuit' => ShipmentOrder::whereIn('status', ['authorized', 'weighing_in', 'loading', 'weighing_out'])->count(),

            // Units discharging (Currently in APT)
            'units_discharging' => ShipmentOrder::where('status', 'loading')
                ->whereNotNull('warehouse')
                ->count(),

            // Total Tonnes (Filtered)
            'total_tonnes' => (clone $baseQuery)
                ->where('shipment_orders.status', 'completed')
                ->join('weight_tickets', 'shipment_orders.id', '=', 'weight_tickets.shipment_order_id')
                ->sum('weight_tickets.net_weight'),

            'active_users' => User::count(),
        ];

        // 2. Charts Data (Grouped)
        $by_cubicle = (clone $baseQuery)
            ->where('shipment_orders.status', 'completed')
            ->join('weight_tickets', 'shipment_orders.id', '=', 'weight_tickets.shipment_order_id')
            ->selectRaw('CONCAT(shipment_orders.warehouse, " - ", shipment_orders.cubicle) as label, SUM(weight_tickets.net_weight) as total')
            ->groupBy('shipment_orders.warehouse', 'shipment_orders.cubicle')
            ->get();

        $by_operator = (clone $baseQuery)
            ->where('shipment_orders.status', 'completed')
            ->join('weight_tickets', 'shipment_orders.id', '=', 'weight_tickets.shipment_order_id')
            ->selectRaw('shipment_orders.operator_name as label, SUM(weight_tickets.net_weight) as total')
            ->groupBy('shipment_orders.operator_name')
            ->get();

        // 3. Filter Options
        $options = [
            'warehouses' => ShipmentOrder::whereNotNull('warehouse')->distinct()->pluck('warehouse'),
            'cubicles' => ShipmentOrder::whereNotNull('cubicle')->distinct()->pluck('cubicle'),
            'operators' => ShipmentOrder::whereNotNull('operator_name')->distinct()->pluck('operator_name'),
        ];

        // 4. Latest Vessel
        $vessel = \App\Models\Vessel::latest()->first();

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'charts' => [
                'by_cubicle' => $by_cubicle,
                'by_operator' => $by_operator,
            ],
            'options' => $options,
            'filters' => [
                'date' => $date,
                'warehouse' => $warehouse,
                'cubicle' => $cubicle,
                'operator' => $operator,
            ],
            'vessel' => $vessel
        ]);
    }
}
