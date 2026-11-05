<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PembelianRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'tanggal' => ['required', 'date'],
            'pemasok_id' => ['required', 'integer', 'exists:pemasok,id'],
            'keterangan' => ['nullable', 'string', 'max:500'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.barang_id' => ['required', 'integer', 'exists:barang,id', 'distinct'],
            'items.*.jumlah' => ['required', 'integer', 'min:1'],
        ];
    }

    public function attributes(): array
    {
        return [
            'tanggal' => 'Tanggal',
            'pemasok_id' => 'Pemasok',
            'keterangan' => 'Keterangan',
            'items' => 'Daftar barang',
            'items.*.barang_id' => 'Barang',
            'items.*.jumlah' => 'Jumlah',
        ];
    }

    public function messages(): array
    {
        return [
            'items.required' => 'Minimal 1 barang harus ditambahkan.',
            'items.min' => 'Minimal 1 barang harus ditambahkan.',
            'items.*.barang_id.distinct' => 'Barang tidak boleh duplikat.',
            'items.*.jumlah.min' => 'Jumlah harus lebih dari 0.',
        ];
    }
}
