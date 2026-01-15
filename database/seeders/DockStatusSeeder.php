<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Vessel;
use App\Models\Client;
use App\Models\Product;
use Carbon\Carbon;

class DockStatusSeeder extends Seeder
{
    public function run()
    {
        // Ensure Clients
        $pemex = Client::firstOrCreate(['business_name' => 'PEMEX'], ['rfc' => 'PEMEX000000']);
        $generic = Client::firstOrCreate(['business_name' => 'Generico'], ['rfc' => 'GEN000000']);

        // Ensure Products
        $urea = Product::firstOrCreate(['name' => 'UREA'], ['code' => 'UREA']);
        $dap = Product::firstOrCreate(['name' => 'DAP'], ['code' => 'DAP']);
        $none = Product::firstOrCreate(['name' => 'N/A'], ['code' => 'NA']);

        // 1. Blue Commander (ECO - Active)
        Vessel::create([
            'name' => 'Blue Commander',
            'vessel_type' => 'B/T',
            'dock' => 'ECO',
            'eta' => Carbon::create(2021, 4, 21),
            'berthal_datetime' => Carbon::create(2021, 4, 21, 9, 0, 0),
            'docking_date' => Carbon::create(2021, 4, 21), // Legacy field
            'docking_time' => '09:00', // Legacy field
            'operation_type' => 'Resguardo',
            'stay_days' => 1724,
            'client_id' => $pemex->id,
            'observations' => 'N/A'
        ]);

        // 2. Ignacio Allende (Fondeado - Whisky Assigned)
        Vessel::create([
            'name' => 'Ignacio Allende',
            'vessel_type' => 'B/T',
            'dock' => 'WHISKY',
            // No berthal_datetime because it is anchored
            'eta' => Carbon::now()->subDays(1), // arrived already
            'etb' => Carbon::create(2026, 1, 9),
            'docking_date' => Carbon::create(2026, 1, 9), // Legacy
            'docking_time' => '00:00', // Legacy
            'operation_type' => 'Resguardo por mal tiempo',
            'stay_days' => 3,
            'client_id' => $pemex->id,
            'is_anchored' => true,
            'observations' => 'Salida sujeta a las condiciones del tiempo'
        ]);

        // 3. Nordorinoco
        Vessel::create([
            'name' => 'Nordorinoco',
            'vessel_type' => 'M/V',
            'dock' => 'WHISKY',
            'eta' => Carbon::create(2026, 1, 17),
            'etb' => Carbon::create(2026, 1, 18),
            'docking_date' => Carbon::create(2026, 1, 18), // Legacy
            'docking_time' => '00:00', // Legacy
            'operation_type' => 'Descarga',
            'stay_days' => 4,
            'client_id' => $generic->id,
            'product_id' => $urea->id,
            'programmed_tonnage' => 17500,
            'observations' => 'Buque con prospecto de atraque al arribo al muelle de Asipona pajaritos'
        ]);

        // 4. Yasa Rose
        Vessel::create([
            'name' => 'Yasa Rose',
            'vessel_type' => 'M/V',
            'dock' => 'WHISKY',
            'eta' => Carbon::create(2026, 1, 22),
            'etb' => Carbon::create(2026, 1, 22),
            'docking_date' => Carbon::create(2026, 1, 22), // Legacy
            'docking_time' => '00:00', // Legacy
            'operation_type' => 'Descarga',
            'stay_days' => 5,
            'client_id' => $generic->id,
            'product_id' => $dap->id,
            'programmed_tonnage' => 18500,
            'observations' => 'Buque con prospecto de atraque al arribo'
        ]);

        // 5. Rojen
        Vessel::create([
            'name' => 'Rojen',
            'vessel_type' => 'M/V',
            'dock' => 'WHISKY',
            'eta' => Carbon::create(2026, 2, 4),
            'etb' => Carbon::create(2026, 2, 4),
            'docking_date' => Carbon::create(2026, 2, 4), // Legacy
            'docking_time' => '00:00', // Legacy
            'operation_type' => 'Descarga',
            'stay_days' => 5,
            'client_id' => $generic->id,
            'product_id' => $dap->id,
            'programmed_tonnage' => 20000,
            'observations' => 'Buque con prospecto de atraque al arribo'
        ]);
    }
}
