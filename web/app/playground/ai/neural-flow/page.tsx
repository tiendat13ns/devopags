import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { NeuralFlowPlayground } from '@/components/neural-flow-playground';
import { PrimaryHeader } from '@/components/primary-header';

export const metadata: Metadata = {
  title: 'Neural Flow Playground | tiendat13ns',
  description:
    'Quan sát dữ liệu được chuẩn hóa và truyền qua từng layer của một mạng neural nhỏ.',
};

export default function NeuralFlowPage() {
  return (
    <main className="article-reading-bg min-h-screen bg-background text-foreground transition-colors duration-300">
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
              Neural Flow
            </h1>
          </div>
          <p className="max-w-md text-sm leading-6 text-muted-foreground">
            Điều chỉnh dữ liệu đầu vào, sau đó chạy từng bước để thấy một dự
            đoán được tạo ra như thế nào.
          </p>
        </div>
        <NeuralFlowPlayground />
      </div>
    </main>
  );
}
