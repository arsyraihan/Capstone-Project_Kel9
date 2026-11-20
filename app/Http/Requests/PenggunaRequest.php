<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PenggunaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('pengguna');

        return [
            'name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'string', 'email', 'max:150', Rule::unique('users', 'email')->ignore($id)],
            // Saat membuat pengguna, password wajib. Saat mengubah, boleh dikosongkan.
            'password' => [$id ? 'nullable' : 'required', 'string', 'min:8'],
            'role' => ['required', Rule::in(User::PERAN)],
        ];
    }

    public function attributes(): array
    {
        return [
            'name' => 'Nama',
            'email' => 'Email',
            'password' => 'Kata sandi',
            'role' => 'Role',
        ];
    }
}
