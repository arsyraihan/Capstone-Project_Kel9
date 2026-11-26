<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ReturKonsinyasiRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'barang_id' => ['required', 'integer', Rule::exists('barang', 'id')->where('jenis_stok', 'konsinyasi')],
            'jumlah' => ['required', 'integer', 'min:1'],
            'keterangan' => ['nullable', 'string', 'max:200'],
        ];
    }

    public function attributes(): array
    {
        return ['barang_id' => 'Barang', 'jumlah' => 'Jumlah', 'keterangan' => 'Keterangan'];
    }

    public function messages(): array
    {
        return ['barang_id.exists' => 'Hanya barang konsinyasi yang dapat diretur.'];
    }
}
