import type { ApexOptions } from 'apexcharts';
import Chart from 'react-apexcharts';

export interface RekapBulanan {
    bulan: string;
    masuk: number;
    keluar: number;
}

/** Grafik batang barang masuk vs keluar per bulan. Gaya kalem, tanpa animasi dan toolbar. */
export default function MutasiBarChart({ data }: { data: RekapBulanan[] }) {
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
        yaxis: { labels: { formatter: (v: number) => String(Math.round(v)) } },
        grid: { borderColor: '#dee2e6' },
        legend: { position: 'top', horizontalAlign: 'right', fontSize: '13px' },
        tooltip: { y: { formatter: (v: number) => `${v} pcs` } },
    };

    const series = [
        { name: 'Barang Masuk', data: data.map((d) => d.masuk) },
        { name: 'Barang Keluar', data: data.map((d) => d.keluar) },
    ];

    return <Chart type="bar" height={300} options={options} series={series} />;
}
