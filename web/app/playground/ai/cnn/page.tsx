import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { CnnDigitPlayground } from '@/components/cnn-digit-playground';
import { PrimaryHeader } from '@/components/primary-header';

export const metadata: Metadata = {
  title: 'CNN Digit Visualizer | tiendat13ns',
  description:
    'Chọn một chữ số và quan sát ảnh đi qua convolution, ReLU, pooling, flatten và softmax.',
};

export default function CnnPlaygroundPage() {
  return (
    <main className="article-reading-bg min-h-screen bg-background text-foreground transition-colors duration-300">
      <PrimaryHeader active="playground" />
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <Link
              className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-primary"
              href="/playground"
            >
              <ArrowLeft size={16} /> Tất cả playground
            </Link>
            <p className="mt-5 font-mono text-xs font-bold uppercase tracking-[0.14em] text-primary">
              Computer vision lab
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-[-0.035em] text-ink sm:text-3xl">
              CNN Digit Visualizer
            </h1>
          </div>
          <p className="max-w-lg text-sm leading-6 text-muted-foreground">
            Quan sát cùng một ảnh thay đổi hình dạng và kích thước qua từng
            layer của một CNN thu gọn.
          </p>
        </div>
        <CnnDigitPlayground />
      </div>
    </main>
  );
}
