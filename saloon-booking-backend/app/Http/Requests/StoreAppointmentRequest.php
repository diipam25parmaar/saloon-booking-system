<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAppointmentRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'date' => ['required', 'date_format:Y-m-d'],
            'start_time' => ['required', 'date_format:H:i'],
            'service_id' => ['required', 'integer', 'exists:services,id'],
            'client_email' => ['required', 'email'],
            'client_name' => ['required', 'string', 'max:191'],
            'client_phone' => ['required', 'string', 'max:30'],
        ];
    }

    public function authorize(): bool
    {
        return true;
    }
}
