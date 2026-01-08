<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\Product;
use App\Models\Transporter;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Admin User
        User::factory()->create([
            'name' => 'Admin VECODE',
            'email' => 'admin@vecode.com',
            'password' => bcrypt('password'),
            'role_id' => 1 // Assuming 1 is Admin based on logic
        ]);

        // Clients
        Client::create(['business_name' => 'Agropecuaria El Sol', 'rfc' => 'ASO900101AAA', 'address' => 'Carr. Federal 45 Km 10', 'contact_info' => 'Juan Perez']);
        Client::create(['business_name' => 'Distribuidora de Granos del Bajio', 'rfc' => 'DGB800505BBB', 'address' => 'Av. Tecnologico 200', 'contact_info' => 'Maria Lopez']);
        Client::create(['business_name' => 'Alimentos Balanceados S.A.', 'rfc' => 'ABA101010CCC', 'address' => 'Zona Industrial Lote 5', 'contact_info' => 'Pedro Ramirez']);

        // Products
        Product::create(['code' => 'P-001', 'name' => 'Maíz Blanco', 'default_packaging' => 'Granel']);
        Product::create(['code' => 'P-002', 'name' => 'Sorgo', 'default_packaging' => 'Granel']);
        Product::create(['code' => 'P-003', 'name' => 'Fertilizante UREA', 'default_packaging' => 'Saco 50kg']);
        
        // Transporters
        $t1 = Transporter::create(['name' => 'Transportes Castores', 'rfc' => 'TCA909090123']);
        $t2 = Transporter::create(['name' => 'Fletes México', 'rfc' => 'FME808080456']);

        // Drivers & Vehicles for Transporter 1
        \App\Models\Driver::create(['name' => 'Roberto Gómez', 'license_number' => 'LIC-900800', 'transporter_id' => $t1->id]);
        \App\Models\Driver::create(['name' => 'Esteban Quito', 'license_number' => 'LIC-112233', 'transporter_id' => $t1->id]);
        
        \App\Models\Vehicle::create(['plate_number' => 'GTO-2233', 'economic_number' => 'ECO-01', 'type' => 'Tortour', 'transporter_id' => $t1->id]);
        \App\Models\Vehicle::create(['plate_number' => 'JAL-4455', 'economic_number' => 'ECO-02', 'type' => 'Rabón', 'transporter_id' => $t1->id]);
    }
}
