<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAppointmentRequest;
use App\Models\Appointment;
use App\Services\BookingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AppointmentController extends Controller
{
    public function __construct(private BookingService $bookingService)
    {
    }

    public function store(StoreAppointmentRequest $request): JsonResponse
    {
        $appointment = $this->bookingService->bookAppointment(
            $request->input('date'),
            $request->input('start_time'),
            (int) $request->input('service_id'),
            $request->input('client_email') ?? (auth()->check() ? auth()->user()->email : 'guest@example.com'),
            auth()->id()
        );

        $appointment->update([
            'client_name' => $request->input('client_name'),
            'client_phone' => $request->input('client_phone'),
        ]);

        return response()->json([
            'message' => 'Appointment booked successfully.',
            'data' => $appointment->load('service'),
        ], 201);
    }
    public function index(Request $request): JsonResponse
    {
        $query = Appointment::with('service')->orderBy('start_at');

        if ($request->filled('date')) {
            $date = $request->input('date');
            $query->whereDate('start_at', $date);
        }

        $items = $query->get();

        return response()->json(['data' => $items]);
    }

    public function destroy($id)
    {
        $appointment = Appointment::find($id);
        if (!$appointment) {
            return response()->json(['message' => 'Appointment not found.'], 404);
        }
        
        $appointment->delete();
        
        return response()->json(['message' => 'Appointment canceled successfully.']);
    }
}
