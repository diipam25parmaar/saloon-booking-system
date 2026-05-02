<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$appointment = \App\Models\Appointment::first();
if (!$appointment) {
    echo "No appointment found.\n";
    exit(1);
}

echo "Existing appointment ID: {$appointment->id}, start: {$appointment->start_at}\n";

$service = \App\Models\Service::find($appointment->service_id);

$bookingService = app(\App\Services\BookingService::class);
try {
    $bookingService->bookAppointment(
        \Carbon\Carbon::parse($appointment->start_at)->format('Y-m-d'),
        \Carbon\Carbon::parse($appointment->start_at)->format('H:i:s'),
        $appointment->service_id,
        'test@example.com'
    );
    echo "FAILED: Double booking was allowed!\n";
} catch (\Illuminate\Validation\ValidationException $e) {
    echo "SUCCESS: Caught ValidationException. Messages: " . json_encode($e->errors()) . "\n";
} catch (\Exception $e) {
    echo "UNEXPECTED ERROR: " . $e->getMessage() . "\n";
}
