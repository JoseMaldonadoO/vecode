<?php

namespace App\Http\Controllers;

use App\Models\LoadingOrder;
use App\Models\WeightTicket;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;
use App\Models\Vehicle;
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

        // 1. Fetch prioritized vessel list
        // Prioritize vessels with:
        // - shipments in 'loading' status (active descarga)
        // - most recent shipment activity
        // STRICT FILTER: Only show ACTIVE vessels (not departed)
        $vesselsList = \App\Models\Vessel::active()
            ->withCount([
                'loadingOrders as active_loading_count' => function ($q) {
                    $q->where('status', 'loading');
                }
            ])
            ->withMax('loadingOrders', 'created_at')
            ->orderByDesc('active_loading_count')
            ->orderByDesc('loading_orders_max_created_at')
            ->orderByDesc('created_at')
            ->take(15)
            ->get(['id', 'name']);

        // 2. Resolve Vessel (Default to top of prioritized list if not provided)
        if (!$vesselId) {
            $vesselId = $vesselsList->first()?->id;
        }

        $selectedVessel = $vesselId ? \App\Models\Vessel::find($vesselId) : null;

        // Base query linked to the specific vessel and ALWAYS joined with weight_tickets
        // since the dashboard focuses on tonnages and operational dates (weigh_out_at).
        $baseQuery = LoadingOrder::query()
            ->join('weight_tickets', 'loading_orders.id', '=', 'weight_tickets.loading_order_id');

        if ($vesselId) {
            $baseQuery->where('loading_orders.vessel_id', $vesselId);
        }

        // Apply filters
        if ($dateStart && $dateEnd) {
            $baseQuery->whereBetween('weight_tickets.weigh_out_at', [$dateStart . ' 00:00:00', $dateEnd . ' 23:59:59']);
        } elseif ($request->has('date')) {
            $baseQuery->whereDate('weight_tickets.weigh_out_at', $request->date);
        }

        if ($warehouse)
            $baseQuery->where('loading_orders.warehouse', $warehouse);
        if ($cubicle)
            $baseQuery->where('loading_orders.cubicle', $cubicle);
        if ($operator)
            $baseQuery->where('loading_orders.operator_name', $operator);

        if ($operationType === 'scale') {
            $baseQuery->where(function ($q) {
                $q->where('loading_orders.operation_type', 'scale')
                    ->orWhereNull('loading_orders.operation_type');
            });
        } elseif ($operationType === 'burreo') {
            $baseQuery->where('loading_orders.operation_type', 'burreo');
        }

        // --- KPIS ---

        // Trips Completed:
        // For Scale: only 'completed' (standard flow)
        // For Burreo: any status that has a weight ticket should count if operation_type is filtered, 
        // but for total charts we stick to completed OR we show everything that has net weight.
        // Let's count anything with status 'completed' OR 'weighing_out' if it's Burreo.
        $tripsCompleted = (clone $baseQuery)
            ->where(function ($q) {
                $q->where('loading_orders.status', 'completed')
                    ->orWhere(function ($sq) {
                        $sq->where('loading_orders.operation_type', 'burreo')
                            ->whereIn('loading_orders.status', ['weighing_out', 'loading']);
                    });
            })
            ->count();

        // Units in Circuit (Live status, restricted to vessel but usually ignores date filter for current state)
        $liveQuery = LoadingOrder::where('vessel_id', $vesselId);
        if ($warehouse)
            $liveQuery->where('warehouse', $warehouse);

        $unitsInCircuit = (clone $liveQuery)->whereIn('status', ['authorized', 'weighing_in', 'loading', 'weighing_out'])->count();
        $unitsDischarging = (clone $liveQuery)->where('status', 'loading')->count();

        // Total Tonnes (Net Weight from Tickets in Kg)
        $totalTonnage = (clone $baseQuery)
            ->where(function ($q) {
                $q->where('loading_orders.status', 'completed')
                    ->orWhere('loading_orders.operation_type', 'burreo');
            })
            ->sum('weight_tickets.net_weight');

        // Stats for the toggle buttons (always independent of the global operation_type filter)
        $totalScale = (clone $baseQuery)
            ->where('loading_orders.status', 'completed')
            ->where(function ($q) {
                $q->where('loading_orders.operation_type', 'scale')
                    ->orWhereNull('loading_orders.operation_type');
            })
            ->sum('weight_tickets.net_weight');

        $totalBurreo = (clone $baseQuery)
            ->where('loading_orders.operation_type', 'burreo')
            ->sum('weight_tickets.net_weight');

        $totalTonnage = (float) $totalTonnage;
        $totalScale = (float) $totalScale;
        $totalBurreo = (float) $totalBurreo;

        // --- CHARTS ---

        // 1. Daily Tonnage (Split keys)
        $dailyTonnage = (clone $baseQuery)
            ->where(function ($q) {
                $q->where('loading_orders.status', 'completed')
                    ->orWhere('loading_orders.operation_type', 'burreo');
            })
            ->selectRaw('
                COALESCE(DATE(weight_tickets.weigh_out_at), DATE(loading_orders.entry_at)) as date, 
                SUM(weight_tickets.net_weight) as total,
                SUM(CASE WHEN loading_orders.operation_type = "burreo" THEN weight_tickets.net_weight ELSE 0 END) as burreo,
                SUM(CASE WHEN loading_orders.operation_type != "burreo" OR loading_orders.operation_type IS NULL THEN weight_tickets.net_weight ELSE 0 END) as scale
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
            ->where(function ($q) {
                $q->where('loading_orders.status', 'completed')
                    ->orWhere('loading_orders.operation_type', 'burreo');
            })
            ->selectRaw('CONCAT(COALESCE(loading_orders.warehouse, "Almacén ??"), " - ", COALESCE(loading_orders.cubicle, "General")) as label, SUM(weight_tickets.net_weight) as total')
            ->whereNotNull('loading_orders.warehouse')
            ->groupBy('loading_orders.warehouse', 'loading_orders.cubicle')
            ->orderByDesc('total')
            ->get();

        // 3. Operator Breakdown
        $byOperator = (clone $baseQuery)
            ->where(function ($q) {
                $q->where('loading_orders.status', 'completed')
                    ->orWhere('loading_orders.operation_type', 'burreo');
            })
            ->selectRaw('loading_orders.operator_name as label, SUM(weight_tickets.net_weight) as total')
            ->groupBy('loading_orders.operator_name')
            ->orderByDesc('total')
            ->get();


        // Options for Selectors
        // Send the prioritized list to the frontend
        $vessels = $vesselsList;

        // Filter options based on the CURRENT vessel context
        $filterOptions = [
            'warehouses' => LoadingOrder::where('vessel_id', $vesselId)->whereNotNull('warehouse')->distinct()->pluck('warehouse'),
            'cubicles' => LoadingOrder::where('vessel_id', $vesselId)->whereNotNull('cubicle')->distinct()->pluck('cubicle'),
            'operators' => LoadingOrder::where('vessel_id', $vesselId)->whereNotNull('operator_name')->distinct()->pluck('operator_name'),
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

        $query = LoadingOrder::query()
            ->join('weight_tickets', 'loading_orders.id', '=', 'weight_tickets.loading_order_id')
            ->where('loading_orders.vessel_id', $vesselId)
            ->where(function ($q) use ($date) {
                $q->whereDate('weight_tickets.weigh_out_at', $date)
                    ->orWhere(function ($sq) use ($date) {
                        $sq->whereNull('weight_tickets.weigh_out_at')
                            ->whereDate('loading_orders.entry_at', $date);
                    });
            });

        if ($operationType === 'scale') {
            $query->whereIn('loading_orders.operation_type', ['scale', null])
                ->where('loading_orders.status', 'completed');
        } elseif ($operationType === 'burreo') {
            $query->where('loading_orders.operation_type', 'burreo');
        } else {
            $query->where(function ($q) {
                $q->where('loading_orders.status', 'completed')
                    ->orWhere('loading_orders.operation_type', 'burreo');
            });
        }

        $data = $query->selectRaw('COALESCE(loading_orders.warehouse, "S/A") as warehouse, SUM(weight_tickets.net_weight) as total')
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
        try {
            $vesselId = $request->input('vessel_id');
            $date = $request->input('date');
            $warehouse = $request->input('warehouse');
            $operationType = $request->input('operation_type', 'all');

            $query = LoadingOrder::query()
                ->join('weight_tickets', 'loading_orders.id', '=', 'weight_tickets.loading_order_id')
                ->leftJoin('vehicles', 'loading_orders.vehicle_id', '=', 'vehicles.id')
                ->where('loading_orders.vessel_id', $vesselId)
                ->where(function ($q) use ($date) {
                    $q->whereDate('weight_tickets.weigh_out_at', $date)
                        ->orWhere(function ($sq) use ($date) {
                            $sq->whereNull('weight_tickets.weigh_out_at')
                                ->whereDate('loading_orders.entry_at', $date);
                        });
                });

            // Robust Warehouse Filter
            if ($warehouse === 'S/A' || $warehouse === 'Sin Asignar' || empty($warehouse)) {
                $query->where(function ($q) {
                    $q->whereNull('loading_orders.warehouse')
                        ->orWhere('loading_orders.warehouse', '')
                        ->orWhere('loading_orders.warehouse', 'S/A');
                });
            } else {
                $query->where('loading_orders.warehouse', $warehouse);
            }

            if ($operationType === 'scale') {
                $query->whereIn('loading_orders.operation_type', ['scale', null])
                    ->where('loading_orders.status', 'completed');
            } elseif ($operationType === 'burreo') {
                $query->where('loading_orders.operation_type', 'burreo');
            } else {
                $query->where(function ($q) {
                    $q->where('loading_orders.status', 'completed')
                        ->orWhere('loading_orders.operation_type', 'burreo');
                });
            }

            // Agregate by Unit (Operator + Economic Number)
            // Use Single Quotes for SQL compatibility
            $data = $query->selectRaw("
                    loading_orders.operator_name,
                    COALESCE(NULLIF(loading_orders.economic_number, ''), 'S/N') as economic_number,
                    COALESCE(MAX(loading_orders.tractor_plate), MAX(vehicles.plate_number), '---') as tractor_plate,
                    MAX(loading_orders.cubicle) as cubicle,
                    SUM(weight_tickets.net_weight) as total_net_weight,
                    COUNT(*) as trip_count
                ")
                ->groupBy('loading_orders.operator_name', 'loading_orders.economic_number')
                ->orderByDesc('total_net_weight')
                ->get();

            // Manual Pagination
            $page = (int) $request->input('page', 1);
            $perPage = 10;
            $total = $data->count();
            $items = $data->skip(($page - 1) * $perPage)->take($perPage)->values();

            return response()->json([
                'current_page' => $page,
                'data' => $items,
                'total' => $total,
                'per_page' => $perPage,
                'last_page' => ceil($total / $perPage)
            ]);

        } catch (Exception $e) {
            Log::error('DrillDownUnits Critical Error: ' . $e->getMessage());
            return response()->json([
                'error' => true,
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ], 200);
        }
    }

    /**
     * Drill-down Level 3: Get individual trips for a specific unit/warehouse/date
     */
    /**
     * Drill-down Level 3: Get individual trips for a specific unit/warehouse/date
     */
    public function drillDownUnitTrips(Request $request)
    {
        try {
            // Level 3: Trips for a specific Unit (Unit ID or Plate/Economic)
            // We receive 'unit_id' which is likely 'economic_number' from Level 2 grouping.
            $unitId = $request->input('unit_id'); // This is the economic_number
            $operator = $request->input('operator');
            $vesselId = $request->input('vessel_id');

            $query = LoadingOrder::query()
                ->join('weight_tickets', 'loading_orders.id', '=', 'weight_tickets.loading_order_id')
                ->leftJoin('vehicles', 'loading_orders.vehicle_id', '=', 'vehicles.id') // Fallback for plates
                ->where('weight_tickets.weighing_status', 'completed') // Only completed trips
                ->where('loading_orders.vessel_id', $vesselId); // Filter by vessel_id

            // Filter by Unit (Economic Number)
            if ($unitId && $unitId !== 'S/N') {
                $query->where('loading_orders.economic_number', $unitId);
            } else {
                // Handle 'S/N' case for units without economic_number
                $query->where(function ($q) {
                    $q->whereNull('loading_orders.economic_number')->orWhere('loading_orders.economic_number', '');
                });
            }

            // Filter by Operator
            if ($operator) {
                $query->where('loading_orders.operator_name', $operator);
            }

            // Date Filter (Global)
            if ($request->has('date') && $request->date) {
                $query->whereDate('weight_tickets.weigh_out_at', $request->date);
            }

            // Operation filters
            $operationType = $request->input('operation_type', 'all');
            if ($operationType === 'scale') {
                $query->whereIn('loading_orders.operation_type', ['scale', null])
                    ->where('loading_orders.status', 'completed');
            } elseif ($operationType === 'burreo') {
                $query->where('loading_orders.operation_type', 'burreo');
            } else {
                $query->where(function ($q) {
                    $q->where('loading_orders.status', 'completed')
                        ->orWhere('loading_orders.operation_type', 'burreo');
                });
            }

            $data = $query->select([
                'loading_orders.id',
                'loading_orders.folio',
                'loading_orders.cubicle',
                'weight_tickets.net_weight',
                'weight_tickets.weigh_out_at',
                // Fallback to Vehicle Plate if Snapshot is NULL
                \Illuminate\Support\Facades\DB::raw('COALESCE(loading_orders.tractor_plate, vehicles.plate_number, \'---\') as tractor_plate'),
                'loading_orders.trailer_plate'
            ])
                ->orderBy('weight_tickets.weigh_out_at', 'asc')
                ->get();

            return response()->json($data);
        } catch (Exception $e) {
            Log::error('DrillDownUnitTrips Critical Error: ' . $e->getMessage());
            return response()->json([
                'error' => true,
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ], 200);
        }
    }
}
