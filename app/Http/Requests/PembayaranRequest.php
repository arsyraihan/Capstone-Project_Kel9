<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PembayaranRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'tanggal' => ['required', 'date', 'before_or_equal:today'],
            'jumlah' => ['required', 'numeric', 'min:1'],
            'metode' => ['required', 'in:tunai,transfer'],
            'keterangan' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function attributes(): array
    {
        return ['tanggal' => 'Tanggal', 'jumlah' => 'Jumlah', 'metode' => 'Metode', 'keterangan' => 'Keterangan'];
    }

    public function messages(): array
    {
        return ['tanggal.before_or_equal' => 'Tanggal tidak boleh melewati hari ini.'];
    }
}
