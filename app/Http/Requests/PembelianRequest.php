<?php

namespace App\Http\Requests;

use App\Models\Barang;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

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
            'cara_bayar' => ['required', 'in:tunai,tempo,konsinyasi'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.barang_id' => ['required', 'integer', 'exists:barang,id', 'distinct'],
            'items.*.jumlah' => ['required', 'integer', 'min:1'],
            'items.*.harga_satuan' => ['required', 'integer', 'min:0'],
        ];
    }

    /** PO konsinyasi hanya berisi titipan pemasok itu; PO beli putus tidak boleh berisi barang titipan. */
    public function after(): array
    {
        return [function (Validator $validator) {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }

            $barang = Barang::query()->whereIn('id', array_column($this->input('items', []), 'barang_id'))->get()->keyBy('id');

            foreach ($this->input('items', []) as $i => $item) {
                $b = $barang->get((int) $item['barang_id']);

                if ($this->input('cara_bayar') === 'konsinyasi') {
                    if (! $b->isKonsinyasi() || (int) $b->pemasok_id !== (int) $this->input('pemasok_id')) {
                        $validator->errors()->add("items.{$i}.barang_id", "{$b->sku} bukan barang titipan pemasok ini.");
                    }
                } elseif ($b->isKonsinyasi()) {
                    $validator->errors()->add("items.{$i}.barang_id", "{$b->sku} adalah barang konsinyasi; pilih cara bayar konsinyasi.");
                }
            }
        }];
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
