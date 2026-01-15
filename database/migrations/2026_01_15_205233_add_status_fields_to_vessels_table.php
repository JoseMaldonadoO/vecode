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
        Schema::table('vessels', function (Blueprint $table) {
            $table->string('vessel_type')->nullable()->comment('B/T, M/V');
            $table->string('dock')->nullable()->comment('ECO or WHISKY');

            $table->dateTime('eta')->nullable()->comment('Estimated Time of Arrival');
            $table->dateTime('etb')->nullable()->comment('Estimated Time of Berthing');
            $table->dateTime('berthal_datetime')->nullable()->comment('Fecha/Hora Atracado');

            $table->string('operation_type')->nullable()->comment('Resguardo, Descarga, etc');
            $table->integer('stay_days')->default(0);

            $table->string('etc')->nullable()->comment('Estimated Time of Completion (Can be SIN FECHA)');
            $table->dateTime('departure_date')->nullable();

            $table->text('observations')->nullable();

            // Helpful flags
            $table->boolean('is_anchored')->default(false); // Fondeado
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vessels', function (Blueprint $table) {
            $table->dropColumn([
                'vessel_type',
                'dock',
                'eta',
                'etb',
                'berthal_datetime',
                'operation_type',
                'stay_days',
                'etc',
                'departure_date',
                'observations',
                'is_anchored'
            ]);
        });
    }
};
