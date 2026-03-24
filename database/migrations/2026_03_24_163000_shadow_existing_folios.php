<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add a hidden underscore to existing numeric folios.
        // This avoids collisions with the new 0001 sequence starting from scratch.
        // The LoadingOrder model accessor will strip this underscore for display.
        DB::statement("UPDATE loading_orders SET folio = CONCAT('_', folio) WHERE folio REGEXP '^[0-9]+$'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Strip the hidden underscore to revert the change.
        DB::statement("UPDATE loading_orders SET folio = LTRIM(folio, '_') WHERE folio LIKE '\_%'");
    }
};
