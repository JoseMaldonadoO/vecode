<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Fix for "Integrity constraint violation: 1048 Column 'shipment_order_id' cannot be null"
        // Since doctrine/dbal might be missing or failed to change the column, we force it with raw SQL.

        // 1. weight_tickets
        DB::statement("ALTER TABLE weight_tickets MODIFY shipment_order_id CHAR(36) NULL");

        // 2. apt_scans
        DB::statement("ALTER TABLE apt_scans MODIFY shipment_order_id CHAR(36) NULL");

        // 3. loading_operations
        DB::statement("ALTER TABLE loading_operations MODIFY shipment_order_id CHAR(36) NULL");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Reverting to NOT NULL is risky if nulls exist, but technically:
        // DB::statement("ALTER TABLE weight_tickets MODIFY shipment_order_id CHAR(36) NOT NULL");
    }
};
