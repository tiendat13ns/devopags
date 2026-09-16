import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Menu, ShieldCheck, Terminal } from 'lucide-react';
import { DevOpsPlayground } from '@/components/linux-playground';
import { ThemeToggle } from '@/components/theme-toggle';

export const metadata: Metadata = {
  title: 'DevOps Playground | DevOpags',
  description: 'Thực hành Linux và Git ngay trên trình duyệt trong một môi trường terminal mô phỏng an toàn.',
};

export default function LinuxPlaygroundPage() {
  return (
    <main className="article-reading-bg min-h-screen bg-background text-foreground transition-colors duration-300">
      <PlaygroundHeader />

      <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
        <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-primary" href="/">
              <ArrowLeft size={16} /> Trang chủ
            </Link>
            <p className="mt-7 font-mono text-xs font-bold uppercase tracking-[0.16em] text-primary">Thực hành Linux và Git</p>
            <h1 className="mt-2 text-3xl font-bold tracking-[-0.045em] text-ink sm:text-4xl">DevOps Playground</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
              Chọn Linux hoặc Git, nhập lệnh và quan sát trạng thái thay đổi. Filesystem và repository đều được mô phỏng trong trình duyệt nên bạn có thể thử mà không ảnh hưởng máy thật.
            </p>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary-soft px-3 py-1.5 text-xs font-semibold text-primary">
            <ShieldCheck size={15} /> Sandbox mô phỏng
          </div>
        </div>

        <DevOpsPlayground />

        <div className="mt-8 flex flex-col gap-4 border-t border-border pt-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            Chưa nhớ cách dùng lệnh? Mở cheatsheet để xem phần giải thích, cú pháp và ví dụ Linux hoặc Git trước khi quay lại thực hành.
          </p>
          <Link className="inline-flex w-fit items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-semibold text-ink transition hover:border-primary/45 hover:bg-accent hover:text-primary" href="/bai-viet/linux-git-cheatsheet">
            <BookOpen size={16} /> Xem Linux & Git Cheatsheet
          </Link>
        </div>
      </div>
    </main>
  );
}

function PlaygroundHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link className="group flex items-center gap-3" href="/" aria-label="DevOpags - Trang chủ">
          <span className="brand-mark size-10 rounded-[13px] p-[3px] transition-transform group-hover:-rotate-3">
            <span className="brand-mark-screen grid size-full place-items-center rounded-[9px]">
              <Terminal size={20} strokeWidth={2.4} />
            </span>
          </span>
          <span className="text-[1.05rem] font-bold tracking-[-0.025em] text-ink">DevOp<span className="text-primary">ags</span></span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex" aria-label="Điều hướng chính">
          <Link className="transition hover:text-primary" href="/#bai-viet">Bài viết</Link>
          <Link className="text-primary" href="/playground" aria-current="page">Playground</Link>
          <Link className="transition hover:text-primary" href="/#gioi-thieu">Về mình</Link>
        </nav>

        <div className="flex items-center gap-2">
          <a
            className="grid size-9 place-items-center rounded-lg border border-border bg-card text-ink transition hover:border-primary/40 hover:bg-accent hover:text-primary"
            href="https://github.com/tiendat13ns"
            target="_blank"
            rel="noreferrer"
            aria-label="Mở GitHub"
            title="GitHub"
          >
            <svg aria-hidden="true" viewBox="0 0 16 16" className="size-[18px] fill-current">
              <path d="M8 0C3.58 0 0 3.64 0 8.13c0 3.59 2.29 6.64 5.47 7.71.4.08.55-.17.55-.39 0-.19-.01-.83-.01-1.51-2.01.38-2.53-.5-2.69-.96-.09-.23-.48-.96-.82-1.15-.28-.15-.68-.53-.01-.54.63-.01 1.08.59 1.23.83.72 1.23 1.87.88 2.33.67.07-.53.28-.88.51-1.08-1.78-.21-3.64-.91-3.64-4.02 0-.89.31-1.62.82-2.19-.08-.21-.36-1.04.08-2.16 0 0 .67-.22 2.2.84A7.37 7.37 0 0 1 8 3.91c.68 0 1.36.09 2 .27 1.53-1.06 2.2-.84 2.2-.84.44 1.12.16 1.95.08 2.16.51.57.82 1.29.82 2.19 0 3.12-1.87 3.81-3.65 4.02.29.25.54.74.54 1.5 0 1.08-.01 1.95-.01 2.23 0 .22.15.47.55.39A8.02 8.02 0 0 0 16 8.13C16 3.64 12.42 0 8 0Z" />
            </svg>
          </a>
          <ThemeToggle />
          <details className="relative md:hidden">
            <summary className="grid size-9 cursor-pointer list-none place-items-center rounded-lg border border-border bg-card text-foreground [&::-webkit-details-marker]:hidden" aria-label="Mở menu">
              <Menu size={18} />
            </summary>
            <nav className="absolute right-0 top-12 flex w-44 flex-col gap-1 rounded-xl border border-border bg-card p-2 text-sm font-medium text-muted-foreground shadow-2xl" aria-label="Điều hướng di động">
              <Link className="rounded-lg px-3 py-2 hover:bg-accent hover:text-ink" href="/#bai-viet">Bài viết</Link>
              <Link className="rounded-lg bg-primary-soft px-3 py-2 text-primary" href="/playground">Playground</Link>
              <Link className="rounded-lg px-3 py-2 hover:bg-accent hover:text-ink" href="/#gioi-thieu">Về mình</Link>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
