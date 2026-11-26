<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PemasokRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'kode_pemasok' => ['required', 'string', 'max:30', Rule::unique('pemasok', 'kode_pemasok')->ignore($this->route('pemasok'))],
            'nama' => ['required', 'string', 'max:150'],
            'telepon' => ['nullable', 'string', 'max:30'],
            'alamat' => ['nullable', 'string', 'max:500'],
            'termin_hari' => ['required', 'integer', 'min:0', 'max:180'],
        ];
    }

    public function attributes(): array
    {
        return [
            'kode_pemasok' => 'Kode pemasok',
            'nama' => 'Nama pemasok',
            'telepon' => 'Telepon',
            'alamat' => 'Alamat',
            'termin_hari' => 'Termin pembayaran',
        ];
    }
}
