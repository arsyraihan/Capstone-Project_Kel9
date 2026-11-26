import { router } from '@inertiajs/react';
import SelectInput from '@/components/SelectInput';

interface Props {
    url: string;
    status: string;
    search: string;
}

/** Dropdown filter status tagihan untuk daftar hutang/piutang. */
export default function FilterStatusBayar({ url, status, search }: Props) {
    return (
        <div className="w-full sm:w-56">
            <SelectInput
                aria-label="Filter status pembayaran"
                value={status}
                onChange={(e) => router.get(url, { search: search || undefined, status: e.target.value || undefined }, { preserveState: true, replace: true })}
            >
                <option value="">Semua status</option>
                <option value="belum">Belum lunas</option>
                <option value="jatuh_tempo">Lewat jatuh tempo</option>
                <option value="lunas">Lunas</option>
            </SelectInput>
        </div>
    );
}
