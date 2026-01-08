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
    public function index()
    {
        // 1. Calculate Stats
        $stats = [
            'total_orders' => ShipmentOrder::count(),
            // Active = Any status between Created and Completed (Authorized, Weighing In, Loading, Weighing Out)
            'active_orders' => ShipmentOrder::whereIn('status', ['authorized', 'weighing_in', 'loading', 'weighing_out'])->count(),
            
            // Tonnes moved today (Sum of net_weight from completed tickets today)
            'tonnes_today' => WeightTicket::whereDate('updated_at', Carbon::today())
                ->whereNotNull('net_weight')
                ->sum('net_weight'), // Assumes net_weight is in kg. If needed in Tons, divide by 1000 in frontend.
                
            'active_users' => User::count(), // Simple count of registered users for now
        ];

        // 2. Recent Activity (Latest 5 completed orders)
        $recent_orders = ShipmentOrder::with(['client'])
            ->where('status', 'completed')
            ->orderBy('updated_at', 'desc')
            ->take(5)
            ->get();

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'recent_orders' => $recent_orders
        ]);
    }
}
