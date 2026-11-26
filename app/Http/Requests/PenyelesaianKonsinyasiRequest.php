<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PenyelesaianKonsinyasiRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'pemasok_id' => ['required', 'integer', 'exists:pemasok,id'],
            'periode_akhir' => ['required', 'date'],
        ];
    }

    public function attributes(): array
    {
        return ['pemasok_id' => 'Pemasok', 'periode_akhir' => 'Periode akhir'];
    }
}
