<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('working_time_rules', function (Blueprint $table) {
            $table->id();
            $table->unsignedTinyInteger('day_of_week')->nullable();
            $table->date('date')->nullable();
            $table->time('start_time');
            $table->time('end_time');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['day_of_week']);
            $table->index(['date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('working_time_rules');
    }
};
