<?php

namespace App\Services;

use App\Models\Appointment;
use App\Models\Service;
use App\Models\WorkingTimeRule;
use Illuminate\Support\Carbon;
use Illuminate\Validation\ValidationException;

class BookingService
{
    public function getAvailableSlots(string $date, int $serviceId): array
    {
        $service = Service::findOrFail($serviceId);
        $dateObj = Carbon::parse($date)->startOfDay();

        if ($dateObj->isPast() && !$dateObj->isToday()) {
            throw ValidationException::withMessages(['date' => 'Cannot list slots for past dates.']);
        }

        $rules = WorkingTimeRule::forDate($dateObj)->get();

        if ($rules->isEmpty()) {
            return [];
        }

        $appointments = Appointment::with('service')
            ->whereDate('start_at', $dateObj)
            ->get();

        $slots = [];

        foreach ($rules as $rule) {
            $start = Carbon::parse($dateObj->toDateString() . ' ' . $rule->start_time);
            $end = Carbon::parse($dateObj->toDateString() . ' ' . $rule->end_time);

            $slotDuration = $service->duration_minutes;
            $current = $start->copy();

            while ($current->copy()->addMinutes($slotDuration) <= $end) {
                $slotStart = $current->copy();
                $slotEnd = $current->copy()->addMinutes($slotDuration);

                $isPast = $slotStart->isPast();

                $overlapAppointment = $appointments->first(function ($app) use ($slotStart, $slotEnd) {
                    return $app->start_at < $slotEnd && $app->end_at > $slotStart;
                });

                $isOverlapping = (bool) $overlapAppointment;
                $available = !$isPast && !$isOverlapping;

                $slots[] = [
                    'slot_key' => $slotStart->toIso8601String(),
                    'start_at' => $slotStart->toIso8601String(),
                    'end_at' => $slotEnd->toIso8601String(),
                    'label' => $slotStart->format('H:i') . ' - ' . $slotEnd->format('H:i'),
                    'available' => $available,
                    'booked_appointment_id' => $overlapAppointment?->id,
                    'booked_service' => $overlapAppointment?->service?->name ?? null,
                ];

                $current->addMinutes($slotDuration);
            }
        }

        usort($slots, fn($a, $b) => strcmp($a['start_at'], $b['start_at']));

        return $slots;
    }

    public function bookAppointment(string $date, string $startTime, int $serviceId, string $clientEmail, ?int $userId = null): Appointment
    {
        $service = Service::findOrFail($serviceId);
        $categoryId = $service->category_id;

        $start = Carbon::parse($date . ' ' . $startTime);
        $end = $start->copy()->addMinutes($service->duration_minutes);

        if ($start->isPast()) {
            throw ValidationException::withMessages(['start_time' => 'Cannot book in the past.']);
        }

        $rules = WorkingTimeRule::forDate($start)->get();

        if ($rules->isEmpty()) {
            throw ValidationException::withMessages(['start_time' => 'This time is outside of working hours.']);
        }

        $inWorkingHours = $rules->contains(function (WorkingTimeRule $rule) use ($start, $end) {
            $ruleStart = $start->copy()->setTimeFromTimeString($rule->start_time);
            $ruleEnd = $start->copy()->setTimeFromTimeString($rule->end_time);

            return $start->greaterThanOrEqualTo($ruleStart) && $end->lessThanOrEqualTo($ruleEnd);
        });

        if (! $inWorkingHours) {
            throw ValidationException::withMessages(['start_time' => 'This time is outside of working hours.']);
        }

        if (Appointment::hasOverlap($serviceId, $start, $end)) {
            throw ValidationException::withMessages(['start_time' => 'This time slot is already booked.']);
        }

        return Appointment::create([
            'service_id' => $serviceId,
            'category_id' => $categoryId,
            'user_id' => $userId,
            'status' => 'pending',
            'client_email' => $clientEmail,
            'start_at' => $start,
            'end_at' => $end,
        ]);
    }
}
