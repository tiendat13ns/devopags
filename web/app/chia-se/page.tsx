import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { PrimaryHeader } from '@/components/primary-header';

export const metadata: Metadata = {
  title: 'Chia sẻ | tiendat13ns',
  description: 'Những ghi chép và câu chuyện về cuộc sống của Tiến Đạt.',
};

export default function SharingPage() {
  return (
    <main className="article-reading-bg min-h-screen text-foreground">
      <PrimaryHeader active="chia-se" />
      <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <header className="max-w-3xl border-l-2 border-primary pl-6 sm:pl-8">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-primary">Những điều ngoài terminal</p>
          <h1 className="mt-3 text-4xl font-bold tracking-[-0.045em] text-ink sm:text-5xl">Chia sẻ</h1>
          <p className="mt-5 text-base leading-7 text-muted-foreground">
            Nơi mình viết về những trải nghiệm, suy nghĩ và câu chuyện trong cuộc sống.
          </p>
        </header>

        <section className="mt-12 border-t border-border" aria-labelledby="sharing-posts-title">
          <h2 id="sharing-posts-title" className="sr-only">Bài viết chia sẻ</h2>
          <article className="group grid gap-5 border-b border-border py-8 sm:grid-cols-[1fr_auto] sm:items-center sm:py-10">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-xs uppercase tracking-[0.08em] text-primary">
                <span>Văn hóa · Bóng đá</span>
                <time className="text-muted-foreground" dateTime="2026-09-16">16/09/2026</time>
              </div>
              <h3 className="mt-3 text-2xl font-bold tracking-[-0.035em] text-ink sm:text-3xl">
                <Link className="transition-colors group-hover:text-primary" href="/chia-se/three-wise-monkeys">
                  Three Wise Monkeys
                </Link>
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                Từ màn ăn mừng của ba cầu thủ PSV đến câu chuyện phía sau biểu tượng “không nhìn, không nghe, không nói điều ác”.
              </p>
              <p className="mt-4 font-mono text-xs text-muted-foreground">5 phút đọc</p>
            </div>
            <Link
              className="grid size-11 place-items-center border border-border text-muted-foreground transition-colors group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground"
              href="/chia-se/three-wise-monkeys"
              aria-label="Đọc bài Three Wise Monkeys"
            >
              <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          </article>
        </section>
      </div>
    </main>
  );
}
