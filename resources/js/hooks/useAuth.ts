import { usePage } from '@inertiajs/react';
import { Role, SharedData } from '@/types';

/** Pengguna yang sedang login dan pengecekan peran: `is('pengadaan')` atau `is('admin', 'manajemen')`. */
export default function useAuth() {
    const { auth } = usePage<SharedData>().props;
    const user = auth.user;

    return {
        user,
        role: user?.role,
        is: (...peran: Role[]) => !!user && peran.includes(user.role),
    };
}
