import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { TcpCongestionLab } from '@/components/tcp-congestion-lab';
import { PrimaryHeader } from '@/components/primary-header';

export const metadata: Metadata = {
  title: 'TCP Congestion Control: slow start, Tahoe và Reno | tiendat13ns',
  description:
    'Quan sát cwnd và ssthresh qua từng RTT, đặt sự kiện mất gói và so sánh TCP Tahoe với Reno.',
};

export default function TcpCongestionLabPage() {
  return (
    <main className="article-reading-bg network-article-theme min-h-screen bg-background text-foreground transition-colors duration-300">
      <PrimaryHeader active="playground" />
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link
              className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-primary"
              href="/playground"
            >
              <ArrowLeft size={16} /> Tất cả playground
            </Link>
            <h1 className="mt-3 text-2xl font-bold tracking-[-0.035em] text-ink sm:text-3xl">
              TCP Congestion Control
            </h1>
          </div>
          <p className="max-w-md text-sm leading-6 text-muted-foreground">
            TCP tự dò tốc độ phù hợp với mạng bằng cửa sổ cwnd. Đặt sự kiện mất gói lên biểu đồ để thấy slow start, congestion avoidance và fast recovery phản ứng ra sao.
          </p>
        </div>
        <TcpCongestionLab />
      </div>
    </main>
  );
}
