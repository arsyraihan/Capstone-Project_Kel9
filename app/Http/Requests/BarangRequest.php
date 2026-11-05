<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BarangRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** Catatan: kolom stok sengaja tidak ada. Stok hanya berubah lewat transaksi. */
    public function rules(): array
    {
        return [
            'sku' => ['required', 'string', 'max:50', Rule::unique('barang', 'sku')->ignore($this->route('barang'))],
            'nama' => ['required', 'string', 'max:150'],
            'kategori' => ['required', 'string', 'max:100'],
            'ukuran' => ['required', 'string', 'max:30'],
            'warna' => ['required', 'string', 'max:50'],
            'satuan' => ['required', 'string', 'max:20'],
            'stok_minimum' => ['required', 'integer', 'min:0'],
            'rak_id' => ['nullable', 'integer', 'exists:rak,id'],
        ];
    }

    public function attributes(): array
    {
        return [
            'sku' => 'SKU',
            'nama' => 'Nama barang',
            'kategori' => 'Kategori',
            'ukuran' => 'Ukuran',
            'warna' => 'Warna',
            'satuan' => 'Satuan',
            'stok_minimum' => 'Stok minimum',
            'rak_id' => 'Rak',
        ];
    }
}
