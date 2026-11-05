<?php

namespace App\Exceptions;

use RuntimeException;

/** Pelanggaran aturan alur status pesanan (pesan sudah ramah untuk ditampilkan ke pengguna). */
class AlurPesananException extends RuntimeException
{
}
