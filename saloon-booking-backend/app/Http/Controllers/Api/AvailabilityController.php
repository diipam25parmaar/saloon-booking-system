<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AvailableSlotsRequest;
use App\Services\BookingService;

class AvailabilityController extends Controller
{
    public function __construct(private BookingService $bookingService)
    {
    }

    public function __invoke(AvailableSlotsRequest $request)
    {
        $slots = $this->bookingService->getAvailableSlots(
            $request->input('date'),
            (int) $request->input('service_id')
        );

        return response()->json([
            'data' => $slots,
        ]);
    }
}
