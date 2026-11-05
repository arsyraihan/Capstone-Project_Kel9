<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PelangganRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'kode_pelanggan' => ['required', 'string', 'max:30', Rule::unique('pelanggan', 'kode_pelanggan')->ignore($this->route('pelanggan'))],
            'nama' => ['required', 'string', 'max:150'],
            'telepon' => ['nullable', 'string', 'max:30'],
            'alamat' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function attributes(): array
    {
        return [
            'kode_pelanggan' => 'Kode pelanggan',
            'nama' => 'Nama pelanggan',
            'telepon' => 'Telepon',
            'alamat' => 'Alamat',
        ];
    }
}
