import { Ban, Eye, Pencil, Trash2 } from 'lucide-react';
import Button, { LinkButton } from '@/components/Button';

interface Props {
    showHref?: string;
    editHref?: string;
    onDelete?: () => void;
    /** Tombol "Batalkan" (untuk pesanan). */
    onBatal?: () => void;
}

/** Tombol Detail, Ubah, Hapus, dan Batalkan untuk kolom "Aksi". Hanya yang diberi prop yang tampil. */
export default function RowActions({ showHref, editHref, onDelete, onBatal }: Props) {
    return (
        <div className="flex justify-center gap-1.5">
            {showHref && (
                <LinkButton href={showHref} variant="secondary" size="sm">
                    <Eye className="size-3.5" />
                    Detail
                </LinkButton>
            )}
            {editHref && (
                <LinkButton href={editHref} variant="secondary" size="sm">
                    <Pencil className="size-3.5" />
                    Ubah
                </LinkButton>
            )}
            {onBatal && (
                <Button variant="danger" size="sm" onClick={onBatal}>
                    <Ban className="size-3.5" />
                    Batalkan
                </Button>
            )}
            {onDelete && (
                <Button variant="danger" size="sm" onClick={onDelete}>
                    <Trash2 className="size-3.5" />
                    Hapus
                </Button>
            )}
        </div>
    );
}
