<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PenerimaanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'keterangan' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function attributes(): array
    {
        return ['keterangan' => 'Keterangan'];
    }
}
