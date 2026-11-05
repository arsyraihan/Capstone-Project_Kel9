<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PenyimpananRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'rak_id' => ['nullable', 'integer', 'exists:rak,id'],
        ];
    }

    public function attributes(): array
    {
        return ['rak_id' => 'Rak'];
    }
}
