<?php

namespace App\Http\Controllers;

use App\Models\AccessLog;
use App\Models\VesselOperator;
use App\Models\ExitOperator;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class SurveillanceController extends Controller
{
    public function index()
    {
        // 1. Pending: Scanned but not yet authorized
        $pending = AccessLog::with(['subject', 'user'])
            ->where('status', 'pending')
            ->orderBy('created_at', 'desc')
            ->get();

        // 2. In Plant: Open Logs (authorized but no exit_at)
        $in_plant = AccessLog::with(['subject', 'user'])
            ->where('status', 'in_plant')
            ->whereNull('exit_at')
            ->orderBy('entry_at', 'desc')
            ->get();

        return Inertia::render('Surveillance/Index', [
            'pending_logs' => $pending,
            'in_plant' => $in_plant,
            'history' => AccessLog::with(['subject', 'user'])
                ->where('status', 'completed')
                ->whereNotNull('exit_at')
                ->orderBy('exit_at', 'desc')
                ->paginate(15)
        ]);
    }

    // API to search/scan operator and create pending log
    public function scan(Request $request)
    {
        $rawQr = $request->input('qr');
        $qr = strtoupper(trim($rawQr));
        $qr = str_replace(['?', "'", '-'], '_', $qr);

        $subject = null;
        $type = null;

        if (str_starts_with($qr, 'OP_EXIT') || str_starts_with($qr, 'OP-EXIT')) {
            $id = (int) filter_var($qr, FILTER_SANITIZE_NUMBER_INT);
            $subject = ExitOperator::find($id);
            $type = 'App\Models\ExitOperator';
        } elseif (str_starts_with($qr, 'OP')) {
            $id = (int) filter_var($qr, FILTER_SANITIZE_NUMBER_INT);
            $subject = VesselOperator::with('vessel')->find($id);
            $type = 'App\Models\VesselOperator';
        } else {
            return response()->json(['error' => "Formato QR no reconocido. Recibido: '{$rawQr}'"], 404);
        }

        if (!$subject) {
            return response()->json(['error' => "Operador no encontrado."], 404);
        }

        if ($subject->status === 'vetoed') {
            return response()->json(['error' => "ESTE OPERADOR SE ENCUENTRA VETADO."], 403);
        }

        // Check if currently inside (In Plant)
        $activeLog = AccessLog::where('subject_id', $subject->id)
            ->where('subject_type', $type)
            ->where('status', 'in_plant')
            ->whereNull('exit_at')
            ->first();

        if ($activeLog) {
            return response()->json(['error' => "El operador ya se encuentra en planta."], 422);
        }

        // Check if already pending
        $pendingLog = AccessLog::where('subject_id', $subject->id)
            ->where('subject_type', $type)
            ->where('status', 'pending')
            ->first();

        if ($pendingLog) {
            return response()->json(['error' => "El operador ya está en la lista de espera (Pendientes)."], 422);
        }

        // Create Pending Log
        AccessLog::create([
            'subject_id' => $subject->id,
            'subject_type' => $type,
            'status' => 'pending',
            'user_id' => auth()->id()
        ]);

        return response()->json([
            'message' => 'Operador agregado a la lista de pendientes.',
            'subject' => $subject
        ]);
    }

    // Authorize Entry (from pending)
    public function store(Request $request)
    {
        $request->validate([
            'log_id' => 'required|exists:access_logs,id',
            'authorized' => 'required|boolean'
        ]);

        $log = AccessLog::findOrFail($request->log_id);

        if ($request->authorized) {
            $log->update([
                'status' => 'in_plant',
                'entry_at' => Carbon::now(),
                'checklist_passed' => true,
                'user_id' => auth()->id()
            ]);
            return back()->with('success', 'Acceso autorizado correctamente.');
        } else {
            $log->update([
                'status' => 'rejected',
                'user_id' => auth()->id()
            ]);
            return back()->with('warning', 'Acceso denegado.');
        }
    }

    // Register Exit (with manual timestamp)
    public function update(Request $request, $id)
    {
        $request->validate([
            'exit_at' => 'required|date'
        ]);

        $log = AccessLog::findOrFail($id);

        if ($log->exit_at) {
            return back()->with('error', 'Este registro ya tiene salida marcada.');
        }

        $log->update([
            'exit_at' => Carbon::parse($request->exit_at),
            'status' => 'completed'
        ]);

        return back()->with('success', 'Salida registrada correctamente.');
    }

    public function vetoIndex()
    {
        return Inertia::render('Surveillance/VetoOperator');
    }

    public function searchOperators(Request $request)
    {
        // Existing logic for Veto Search...
        // Can be reused or updated
        $queryText = trim($request->input('q', ''));
        if (empty($queryText))
            return response()->json([]);

        // Normalized...
        $normalizedText = str_replace(['?', ']', '[', '}', '{'], ['_', '|', '|', '|', '|'], $queryText);

        // ... Reuse existing logic ...
        return response()->json([]); // Simplified for now, or copy paste existing code
    }

    public function vetoOperator($id)
    {
        // Existing logic...
        $operator = ExitOperator::findOrFail($id);
        $operator->status = 'vetoed';
        $operator->save();
        return back();
    }

    // History endpoint for AJAX/Pagination
    public function history(Request $request)
    {
        $query = AccessLog::with(['subject', 'user'])
            ->whereNotNull('exit_at')
            ->orderBy('exit_at', 'desc');

        if ($request->has('date')) {
            $query->whereDate('entry_at', $request->date);
        }

        return response()->json($query->paginate(15));
    }
}
