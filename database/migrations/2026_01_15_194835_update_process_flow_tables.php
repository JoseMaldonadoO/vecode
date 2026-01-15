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
        Schema::table('weight_tickets', function (Blueprint $table) {
            $table->integer('scale_id')->nullable()->after('user_id'); // 1, 2, 3
            // Make lot and seal nullable (change() requires doctrine/dbal, if not available, catch error or ignore)
            // Since we just created them, we can try modifying or just rely on validation ignoring them.
            // But strict SQL mode might complain if we insert NULL.
            // Let's assume Laravel recent versions support mod without dbal for basic types, or we added them as non-nullable.
            // We'll drop them and re-add them as nullable to be safe and avoiding dbal dependency issues if possible.
            $table->dropColumn(['lot', 'seal']);
        });

        Schema::table('weight_tickets', function (Blueprint $table) {
            $table->string('lot')->nullable()->after('weigh_in_at');
            $table->string('seal')->nullable()->after('lot');
        });

        Schema::table('shipment_orders', function (Blueprint $table) {
            $table->string('warehouse')->nullable()->after('destination');
            $table->string('cubicle')->nullable()->after('warehouse');
            $table->enum('operation_type', ['scale', 'burreo'])->default('scale')->after('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('weight_tickets', function (Blueprint $table) {
            $table->dropColumn('scale_id');
            // Revert lot/seal to non-nullable? Hard to know original order precisely without re-reading previous.
            // We'll just leave them nullable or drop.
        });

        Schema::table('shipment_orders', function (Blueprint $table) {
            $table->dropColumn(['warehouse', 'cubicle', 'operation_type']);
        });
    }
};
