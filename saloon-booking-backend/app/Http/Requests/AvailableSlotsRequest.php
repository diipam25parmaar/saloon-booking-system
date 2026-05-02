<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AvailableSlotsRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'date' => ['required', 'date_format:Y-m-d'],
            'service_id' => ['required', 'integer', 'exists:services,id'],
        ];
    }

    public function authorize(): bool
    {
        return true;
    }
}
