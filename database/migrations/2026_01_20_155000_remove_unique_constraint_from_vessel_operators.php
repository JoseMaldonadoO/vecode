<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (config('database.default') === 'mysql') {
            \Illuminate\Support\Facades\DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        }

        Schema::table('vessel_operators', function (Blueprint $table) {
            // Drop the unique index that prevents same operator name in same vessel
            $table->dropUnique('vessel_operators_vessel_id_operator_name_unique');
        });

        if (config('database.default') === 'mysql') {
            \Illuminate\Support\Facades\DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vessel_operators', function (Blueprint $table) {
            $table->unique(['vessel_id', 'operator_name']);
        });
    }
};
