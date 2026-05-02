<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreWorkingTimeRuleRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'day_of_week' => ['nullable', 'integer', 'between:1,7'],
            'date' => ['nullable', 'date'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }

    public function authorize(): bool
    {
        return true;
    }
}
