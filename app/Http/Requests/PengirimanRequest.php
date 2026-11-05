<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PengirimanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'ekspedisi' => ['required', 'string', 'max:100'],
            'no_resi' => ['required', 'string', 'max:100'],
        ];
    }

    public function attributes(): array
    {
        return [
            'ekspedisi' => 'Ekspedisi',
            'no_resi' => 'Nomor resi',
        ];
    }
}
