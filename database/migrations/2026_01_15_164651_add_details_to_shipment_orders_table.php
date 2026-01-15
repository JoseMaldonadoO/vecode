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
        Schema::table('shipment_orders', function (Blueprint $table) {
            $table->foreignId('product_id')->nullable()->constrained()->after('client_id');
            $table->foreignId('vessel_id')->nullable()->constrained()->after('product_id'); // Link to Vessel if applicable
            $table->decimal('programmed_weight', 10, 2)->default(0)->after('sacks_count'); // Programmed Quantity
            $table->string('bill_of_lading')->nullable()->after('trailer_plate'); // Carta Porte
            $table->string('withdrawal_letter')->nullable()->after('bill_of_lading'); // Carta Retiro
            $table->string('reference')->nullable()->after('sale_order'); // Reference (if no vessel)
            $table->string('consignee')->nullable()->after('client_id'); // Consignado
            $table->string('destination')->nullable()->after('origin'); // Destination override
            $table->string('origin')->nullable()->after('qr_code'); // Origin override
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('shipment_orders', function (Blueprint $table) {
            $table->dropForeign(['product_id']);
            $table->dropColumn('product_id');
            $table->dropForeign(['vessel_id']);
            $table->dropColumn('vessel_id');
            $table->dropColumn('programmed_weight');
            $table->dropColumn('bill_of_lading');
            $table->dropColumn('withdrawal_letter');
            $table->dropColumn('reference');
            $table->dropColumn('consignee');
            $table->dropColumn('destination');
            $table->dropColumn('origin');
        });
    }
};
