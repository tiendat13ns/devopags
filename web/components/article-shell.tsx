import type { ReactNode } from 'react';
import Link from 'next/link';
import { ExternalLink, GitFork, Menu, Terminal } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

type TocItem = {
  href: string;
  label: string;
};

export function ArticleShell({ children, toc }: { children: ReactNode; toc: TocItem[] }) {
  return (
    <main className="article-reading-bg min-h-screen text-foreground transition-colors duration-300">
      <ArticleHeader />

      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[230px_minmax(0,820px)] lg:justify-center lg:py-14">
        <aside className="hidden lg:block">
          <nav className="sticky top-24 border-l border-border pl-5" aria-label="Mục lục bài viết">
            <p className="mb-4 text-xs font-extrabold uppercase tracking-[0.13em] text-ink">Trong bài này</p>
            <ol className="space-y-1.5">
              {toc.map((item, index) => (
                <li key={item.href}>
                  <a
                    className={`block py-1 text-sm leading-5 transition-colors hover:text-primary ${index === 0 ? 'font-bold text-ink' : 'text-muted-foreground'}`}
                    href={item.href}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </aside>

        <article className="min-w-0">{children}</article>
      </div>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="flex items-center gap-2 font-bold text-ink"><Terminal size={16} className="text-primary" /> DevOpags</div>
          <p>Học đến đâu, thực hành và giải thích lại đến đó.</p>
          <a className="inline-flex items-center gap-2 font-semibold hover:text-primary" href="https://github.com/tiendat13ns/devopags" target="_blank" rel="noreferrer">
            <GitFork size={15} /> Mã nguồn mở
          </a>
        </div>
      </footer>
    </main>
  );
}

export function ArticleIntro({
  eyebrow,
  title,
  description,
  readTime,
  tags,
}: {
  eyebrow: string;
  title: string;
  description: string;
  readTime: string;
  tags: string[];
}) {
  return (
    <header className="mb-12 border-b border-border pb-10">
      <p className="section-eyebrow">{eyebrow}</p>
      <h1 className="mt-3 text-4xl font-bold leading-[1.1] tracking-[-0.045em] text-ink sm:text-5xl">{title}</h1>
      <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">{description}</p>
      <div className="mt-6 flex flex-wrap items-center gap-2 text-xs">
        <span className="font-mono text-muted-foreground">16/09/2026 · {readTime}</span>
        {tags.map((tag) => (
          <span className="border border-primary/20 bg-primary-soft px-2.5 py-1 font-mono font-semibold text-primary-dark" key={tag}>{tag}</span>
        ))}
      </div>
    </header>
  );
}

export function ArticleSection({
  id,
  number,
  eyebrow,
  title,
  children,
}: {
  id: string;
  number: string;
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 pt-12 first:pt-0">
      <div className="article-section-title">
        <span className="section-number">{number}</span>
        <div>
          <p className="section-eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
        </div>
      </div>
      <div className="article-copy mt-5 space-y-5 text-base leading-8 text-muted-foreground">{children}</div>
    </section>
  );
}

export function ReferenceLink({ href, label }: { href: string; label: string }) {
  return (
    <li>
      <a className="inline-flex items-start gap-2 font-semibold text-primary hover:text-primary-dark hover:underline" href={href} target="_blank" rel="noreferrer">
        <ExternalLink className="mt-0.5 shrink-0" size={15} /> {label}
      </a>
    </li>
  );
}

function ArticleHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link className="group flex items-center gap-3" href="/" aria-label="DevOpags - Trang chủ">
          <span className="brand-mark size-10 rounded-[13px] p-[3px] transition-transform group-hover:-rotate-3">
            <span className="brand-mark-screen grid size-full place-items-center rounded-[9px]">
              <Terminal size={20} strokeWidth={2.4} />
            </span>
          </span>
          <span className="text-[1.05rem] font-bold tracking-[-0.025em]">DevOp<span className="text-primary">ags</span></span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex" aria-label="Điều hướng chính">
          <Link className="text-primary" href="/#bai-viet" aria-current="page">Bài viết</Link>
          <Link className="transition-colors hover:text-primary" href="/#chu-de">Chủ đề</Link>
          <Link className="transition-colors hover:text-primary" href="/#gioi-thieu">Về mình</Link>
        </nav>

        <div className="flex items-center gap-2">
          <a
            className="grid size-9 place-items-center rounded-lg border border-border bg-card text-ink transition-colors hover:border-primary/30 hover:bg-accent hover:text-primary"
            href="https://github.com/tiendat13ns/devopags"
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
            <summary className="grid size-9 cursor-pointer list-none place-items-center rounded-lg border border-border bg-card [&::-webkit-details-marker]:hidden" aria-label="Mở menu"><Menu size={18} /></summary>
            <nav className="absolute right-0 top-12 flex w-44 flex-col gap-1 rounded-xl border border-border bg-card p-2 text-sm font-medium shadow-xl" aria-label="Điều hướng di động">
              <Link className="rounded-lg bg-primary-soft px-3 py-2 text-primary" href="/#bai-viet">Bài viết</Link>
              <Link className="rounded-lg px-3 py-2 hover:bg-accent" href="/#chu-de">Chủ đề</Link>
              <Link className="rounded-lg px-3 py-2 hover:bg-accent" href="/#gioi-thieu">Về mình</Link>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
