<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PesananRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'tanggal' => ['required', 'date'],
            'pelanggan_id' => ['required', 'integer', 'exists:pelanggan,id'],
            'keterangan' => ['nullable', 'string', 'max:500'],
            'cara_bayar' => ['required', 'in:tunai,tempo'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.barang_id' => ['required', 'integer', 'exists:barang,id', 'distinct'],
            'items.*.jumlah' => ['required', 'integer', 'min:1'],
            'items.*.harga_satuan' => ['required', 'integer', 'min:0'],
        ];
    }

    public function attributes(): array
    {
        return [
            'tanggal' => 'Tanggal',
            'pelanggan_id' => 'Pelanggan',
            'keterangan' => 'Keterangan',
            'items' => 'Daftar barang',
            'items.*.barang_id' => 'Barang',
            'items.*.jumlah' => 'Jumlah',
            'items.*.harga_satuan' => 'Harga satuan',
            'cara_bayar' => 'Cara bayar',
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
