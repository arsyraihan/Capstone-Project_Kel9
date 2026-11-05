<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RakRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'kode_rak' => ['required', 'string', 'max:30', Rule::unique('rak', 'kode_rak')->ignore($this->route('rak'))],
            'keterangan' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function attributes(): array
    {
        return [
            'kode_rak' => 'Kode rak',
            'keterangan' => 'Keterangan',
        ];
    }
}
