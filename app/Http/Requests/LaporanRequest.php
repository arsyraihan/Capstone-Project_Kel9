<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class LaporanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'tab' => ['nullable', Rule::in(['stok', 'masuk', 'keluar'])],
            'dari' => ['nullable', 'date'],
            'sampai' => ['nullable', 'date', 'after_or_equal:dari'],
        ];
    }

    public function attributes(): array
    {
        return [
            'tab' => 'Jenis laporan',
            'dari' => 'Tanggal awal',
            'sampai' => 'Tanggal akhir',
        ];
    }
}
