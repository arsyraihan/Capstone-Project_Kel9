import AdminLayout from '@/components/AdminLayout';

export default function Dashboard() {
    return (
        <AdminLayout title="Dashboard">
            <h1 className="mb-4 text-xl font-semibold text-gray-900">Dashboard</h1>
            <div className="rounded border border-line bg-white p-6 text-sm text-gray-600">
                Selamat datang. Ringkasan stok, grafik, dan pesanan terbaru akan ditampilkan di sini pada Fase 6.
            </div>
        </AdminLayout>
    );
}
