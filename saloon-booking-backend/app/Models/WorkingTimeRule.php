<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

class WorkingTimeRule extends Model
{
    use HasFactory;

    protected $fillable = [
        'day_of_week',
        'date',
        'start_time',
        'end_time',
        'is_active',
    ];

    protected $casts = [
        'date' => 'date',
        'is_active' => 'boolean',
    ];

    public function scopeForDate($query, Carbon|string $date)
    {
        $dateObj = $date instanceof Carbon ? $date : Carbon::parse($date);
        $dateRules = (clone $query)
            ->whereDate('date', $dateObj->toDateString())
            ->where('is_active', true);

        if ($dateRules->exists()) {
            return $dateRules;
        }

        $dayOfWeek = $dateObj->dayOfWeekIso; // 1-7
        return $query
            ->whereNull('date')
            ->where('day_of_week', $dayOfWeek)
            ->where('is_active', true);
    }
}
