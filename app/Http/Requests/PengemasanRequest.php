<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PengemasanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'jumlah_koli' => ['required', 'integer', 'min:1', 'max:999'],
        ];
    }

    public function attributes(): array
    {
        return ['jumlah_koli' => 'Jumlah koli'];
    }
}
