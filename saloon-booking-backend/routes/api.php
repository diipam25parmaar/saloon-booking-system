<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AppointmentController;
use App\Http\Controllers\Api\AvailabilityController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\WorkingTimeRuleController;
use App\Http\Controllers\Api\PasswordResetController;
use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    return response()->json(['ok' => true, 'time' => now()->toDateTimeString()]);
})->name('health');

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::post('/forgot-password', [PasswordResetController::class, 'sendResetLinkEmail'])->name('password.email');
Route::get('/reset-password/{token}', function (string $token) {
    return response()->json(['token' => $token]);
})->name('password.reset');
Route::post('/reset-password', [PasswordResetController::class, 'reset'])->name('password.update');

Route::get('/categories', [CategoryController::class, 'index'])->name('categories.index');
Route::get('/services', [ServiceController::class, 'index'])->name('services.index');
Route::get('/available-slots', AvailabilityController::class)->name('availability.index');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/appointments', [AppointmentController::class, 'store'])->name('appointments.store');
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    
    // Admin routes
    Route::middleware('admin')->group(function () {
        Route::post('/categories', [CategoryController::class, 'store']);
        Route::put('/categories/{category}', [CategoryController::class, 'update']);
        Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);
        
        Route::post('/services', [ServiceController::class, 'store']);
        Route::put('/services/{service}', [ServiceController::class, 'update']);
        Route::delete('/services/{service}', [ServiceController::class, 'destroy']);
        
        Route::get('/appointments', [AppointmentController::class, 'index'])->name('appointments.index');
        Route::delete('/appointments/{id}', [AppointmentController::class, 'destroy'])->name('appointments.destroy');
        
        Route::get('/working-time-rules', [WorkingTimeRuleController::class, 'index'])->name('working-time-rules.index');
        Route::post('/working-time-rules', [WorkingTimeRuleController::class, 'store'])->name('working-time-rules.store');
        Route::delete('/working-time-rules/{id}', [WorkingTimeRuleController::class, 'destroy'])->name('working-time-rules.destroy');
    });
});
