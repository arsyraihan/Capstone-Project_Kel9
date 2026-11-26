<?php

return [
    'required' => ':attribute wajib diisi.',
    'string' => ':attribute harus berupa teks.',
    'email' => ':attribute harus berupa alamat email yang valid.',
    'unique' => ':attribute sudah digunakan.',
    'exists' => ':attribute yang dipilih tidak valid.',
    'integer' => ':attribute harus berupa angka bulat.',
    'numeric' => ':attribute harus berupa angka.',
    'min' => [
        'numeric' => ':attribute minimal :min.',
        'string' => ':attribute minimal :min karakter.',
        'array' => ':attribute minimal memiliki :min item.',
    ],
    'max' => [
        'numeric' => ':attribute maksimal :max.',
        'string' => ':attribute maksimal :max karakter.',
        'array' => ':attribute maksimal memiliki :max item.',
    ],
    'gte' => [
        'numeric' => ':attribute minimal :value.',
    ],
    'required_if' => ':attribute wajib diisi.',
    'before_or_equal' => ':attribute harus berupa tanggal sebelum atau sama dengan :date.',
    'confirmed' => 'Konfirmasi :attribute tidak cocok.',
    'date' => ':attribute bukan tanggal yang valid.',
    'after_or_equal' => ':attribute harus berupa tanggal setelah atau sama dengan :date.',
    'in' => ':attribute yang dipilih tidak valid.',
    'distinct' => ':attribute memiliki nilai duplikat.',
    'array' => ':attribute harus berupa daftar.',
    'gt' => [
        'numeric' => ':attribute harus lebih besar dari :value.',
    ],
    'attributes' => [
        'email' => 'Email',
        'password' => 'Kata sandi',
        'name' => 'Nama',
    ],
];
