import type { ReactNode } from 'react';
import Link from 'next/link';
import { ExternalLink, GitFork, Menu } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { SocialLinks } from '@/components/social-links';

type TopicItem = {
  href: string;
  label: string;
};

type TopicGroup = {
  label: string;
  items: TopicItem[];
};

const articleTopics: TopicGroup[] = [
  {
    label: 'Linux',
    items: [
      { href: '/bai-viet/tu-duy-trien-khai-du-an', label: 'Tư duy triển khai dự án cho DevOps' },
      { href: '/bai-viet/linux-la-gi', label: 'Linux là gì?' },
      { href: '/bai-viet/linux-git-cheatsheet', label: 'Linux & Git Cheatsheet' },
    ],
  },
  {
    label: 'Git',
    items: [
      { href: '/bai-viet/linux-git-cheatsheet', label: 'Linux & Git Cheatsheet' },
    ],
  },
  {
    label: 'Docker',
    items: [
      { href: '/bai-viet/docker-la-gi', label: 'Docker là gì và tại sao nên dùng?' },
    ],
  },
  {
    label: 'Machine Learning',
    items: [
      { href: '/bai-viet/nhap-mon-machine-learning-va-knn', label: 'Nhập môn Machine Learning với KNN' },
      { href: '/bai-viet/decision-tree-va-bias-variance', label: 'Decision Tree và bias–variance' },
    ],
  },
  {
    label: 'AI / Deep Learning',
    items: [
      { href: '/bai-viet/deep-learning-la-gi', label: 'Deep Learning' },
      { href: '/bai-viet/du-lieu-vao-mang-vector-tensor-token-embedding-graph', label: 'Dữ liệu đi vào mạng dưới dạng gì?' },
      { href: '/bai-viet/kien-truc-mlp-la-gi', label: 'Kiến trúc MLP' },
      { href: '/bai-viet/ham-kich-hoat-la-gi', label: 'Hàm kích hoạt' },
      { href: '/bai-viet/kien-truc-cnn-la-gi', label: 'Kiến trúc CNN' },
      { href: '/bai-viet/kien-truc-rnn-la-gi', label: 'Kiến trúc RNN' },
      { href: '/bai-viet/so-sanh-rnn-lstm-gru', label: 'So sánh RNN, LSTM và GRU' },
      { href: '/bai-viet/co-che-attention', label: 'Cơ chế Attention' },
      { href: '/bai-viet/kien-truc-transformer', label: 'Kiến trúc Transformer' },
      { href: '/bai-viet/danh-gia-model-loss-accuracy-precision-recall-f1', label: 'Đọc loss và các metric' },
    ],
  },
];

export function ArticleShell({
  children,
  currentHref,
  theme = 'default',
}: {
  children: ReactNode;
  currentHref: string;
  theme?: 'default' | 'docker';
}) {
  return (
    <main className={`article-reading-bg min-h-screen text-foreground transition-colors duration-300 ${theme === 'docker' ? 'docker-article-theme' : ''}`}>
      <ArticleHeader />

      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[230px_minmax(0,820px)] lg:justify-center lg:py-14">
        <aside className="hidden lg:block">
          <ArticleToc currentHref={currentHref} />
        </aside>

        <article className="min-w-0">{children}</article>
      </div>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="font-bold text-ink">tiendat13ns</div>
          <p>Học đến đâu, thực hành và giải thích lại đến đó.</p>
          <a className="inline-flex items-center gap-2 font-semibold hover:text-primary" href="https://github.com/tiendat13ns" target="_blank" rel="noreferrer">
            <GitFork size={15} /> Mã nguồn mở
          </a>
        </div>
      </footer>
    </main>
  );
}

export function ArticleToc({ currentHref }: { currentHref: string }) {
  return (
    <nav className="article-toc sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto border border-border bg-card/55 p-5 backdrop-blur-sm" aria-label="Bài viết theo chủ đề">
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.08em] text-primary">Bài viết theo chủ đề</p>
      <div className="mt-4 space-y-6">
        {articleTopics.map((topic) => (
          <section key={topic.label}>
            <h2 className="text-[0.72rem] font-semibold uppercase leading-5 tracking-[0.08em] text-primary/75">{topic.label}</h2>
            <ul className="mt-2 space-y-1">
              {topic.items.map((item) => {
                const isActive = item.href === currentHref;

                return (
                  <li key={`${topic.label}-${item.href}`}>
                    <Link
                      className={`block border-l-2 py-1.5 pl-3 text-sm font-semibold leading-5 transition-colors ${isActive ? 'border-primary bg-primary-soft text-primary' : 'border-transparent text-ink hover:border-primary/45 hover:text-primary'}`}
                      href={item.href}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </nav>
  );
}

export function ArticleIntro({
  eyebrow,
  title,
  description,
  date = '16/09/2026',
  readTime,
  tags,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  date?: string;
  readTime: string;
  tags: string[];
}) {
  return (
    <header className="mb-12 border-b border-border pb-10">
      {eyebrow ? <p className="section-eyebrow">{eyebrow}</p> : null}
      <h1 className="mt-3 text-2xl font-semibold leading-[1.25] tracking-normal text-ink sm:text-3xl">{title}</h1>
      <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">{description}</p>
      <div className="mt-6 flex flex-wrap items-center gap-2 text-xs">
        <span className="font-mono text-muted-foreground">{date} · {readTime}</span>
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
  eyebrow?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 pt-12 first:pt-0">
      <div className="article-section-title">
        <span className="section-number">{number.replace(/^0+/, '') || '0'}</span>
        <div>
          {eyebrow ? <p className="section-eyebrow">{eyebrow}</p> : null}
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
        <Link className="inline-flex items-center" href="/" aria-label="tiendat13ns - Trang chủ">
          <span className="text-[1.05rem] font-bold tracking-[-0.025em]">tiendat<span className="text-primary">13ns</span></span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex" aria-label="Điều hướng chính">
          <Link className="text-primary" href="/tai-lieu" aria-current="page">Tài liệu</Link>
          <Link className="transition-colors hover:text-primary" href="/playground">Playground</Link>
          <Link className="transition-colors hover:text-primary" href="/chia-se">Chia sẻ</Link>
          <Link className="transition-colors hover:text-primary" href="/#gioi-thieu">Về mình</Link>
        </nav>

        <div className="flex items-center gap-2">
          <SocialLinks />
          <a
            className="grid size-9 place-items-center rounded-lg border border-border bg-card text-ink transition-colors hover:border-primary/30 hover:bg-accent hover:text-primary"
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
            <summary className="grid size-9 cursor-pointer list-none place-items-center rounded-lg border border-border bg-card [&::-webkit-details-marker]:hidden" aria-label="Mở menu"><Menu size={18} /></summary>
            <nav className="absolute right-0 top-12 flex w-44 flex-col gap-1 rounded-xl border border-border bg-card p-2 text-sm font-medium shadow-xl" aria-label="Điều hướng di động">
              <Link className="rounded-lg bg-primary-soft px-3 py-2 text-primary" href="/tai-lieu">Tài liệu</Link>
              <Link className="rounded-lg px-3 py-2 hover:bg-accent" href="/playground">Playground</Link>
              <Link className="rounded-lg px-3 py-2 hover:bg-accent" href="/chia-se">Chia sẻ</Link>
              <Link className="rounded-lg px-3 py-2 hover:bg-accent" href="/#gioi-thieu">Về mình</Link>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
