import type { ApexOptions } from 'apexcharts';
import Chart from 'react-apexcharts';
import { formatRupiah } from '@/lib/format';

export interface RekapKas {
    bulan: string;
    masuk: number;
    keluar: number;
}

/** Grafik batang uang masuk vs keluar per bulan (tanpa saldo awal). */
export default function KasBarChart({ data }: { data: RekapKas[] }) {
    const options: ApexOptions = {
        chart: {
            type: 'bar',
            toolbar: { show: false },
            animations: { enabled: false },
            zoom: { enabled: false },
            fontFamily: 'Inter, ui-sans-serif, system-ui, "Segoe UI", sans-serif',
        },
        colors: ['#1e3a5f', '#9aa5b1'], // masuk, keluar
        plotOptions: { bar: { columnWidth: '55%', borderRadius: 2 } },
        dataLabels: { enabled: false },
        stroke: { show: true, width: 2, colors: ['transparent'] },
        xaxis: { categories: data.map((d) => d.bulan) },
        yaxis: { labels: { formatter: (v: number) => `${(v / 1_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} jt` } },
        grid: { borderColor: '#dee2e6' },
        legend: { position: 'top', horizontalAlign: 'right', fontSize: '13px' },
        tooltip: { y: { formatter: (v: number) => formatRupiah(v) } },
    };

    const series = [
        { name: 'Uang Masuk', data: data.map((d) => d.masuk) },
        { name: 'Uang Keluar', data: data.map((d) => d.keluar) },
    ];

    return <Chart type="bar" height={300} options={options} series={series} />;
}
