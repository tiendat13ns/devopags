import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { RoutingLab } from '@/components/routing-lab';
import { PrimaryHeader } from '@/components/primary-header';

export const metadata: Metadata = {
  title: 'Routing Lab: Dijkstra và bảng định tuyến OSPF | tiendat13ns',
  description:
    'Đổi cost, cắt link giữa sáu router và xem Dijkstra tính lại đường ngắn nhất, bảng định tuyến và quá trình hội tụ.',
};

export default function RoutingLabPage() {
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
              Routing Lab
            </h1>
          </div>
          <p className="max-w-md text-sm leading-6 text-muted-foreground">
            Sáu router, tám link. Đổi cost hoặc cắt link để xem đường đi và bảng định tuyến được tính lại, hoặc chạy Dijkstra từng bước.
          </p>
        </div>
        <RoutingLab />
      </div>
    </main>
  );
}
