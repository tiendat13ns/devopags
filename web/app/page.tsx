import Link from 'next/link';
import { ArrowUpRight, CalendarDays, Clock, Menu, Terminal } from 'lucide-react';

const posts = [
  {
    title: 'Linux & Git Cheatsheet cho DevOps Intern',
    description: 'Các lệnh thường dùng trên server và workflow Git hằng ngày, được nhóm lại để tra cứu nhanh.',
    date: '15/09/2026',
    readTime: '15 phút đọc',
    tags: ['Linux', 'Git'],
    href: '/bai-viet/linux-git-cheatsheet',
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <section id="top" className="border-b border-border py-10 sm:py-14">
          <p className="text-sm font-bold text-primary">Xin chào, mình là Tiến Đạt.</p>
          <h1 className="mt-3 max-w-2xl text-balance text-3xl font-bold leading-tight tracking-[-0.04em] text-ink sm:text-4xl">
            Ghi chép DevOps của một intern.
          </h1>
          <p className="mt-3 max-w-xl text-base leading-7 text-muted-foreground">
            Linux, Git, Docker và những điều mình học được khi thực hành.
          </p>
        </section>

        <div className="grid gap-12 py-10 sm:py-14 lg:grid-cols-[minmax(0,1fr)_240px] lg:gap-16">
          <section id="bai-viet" aria-labelledby="posts-title">
            <div className="flex items-baseline justify-between border-b border-border pb-4">
              <h2 id="posts-title" className="text-xl font-bold tracking-tight text-ink">Bài viết mới</h2>
              <span className="text-sm text-muted-foreground">{posts.length} bài viết</span>
            </div>

            <div className="divide-y divide-border">
              {posts.map((post) => (
                <article key={post.href} className="py-7 first:pt-6">
                  <Link className="group block" href={post.href}>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5"><CalendarDays size={14} /> {post.date}</span>
                      <span className="inline-flex items-center gap-1.5"><Clock size={14} /> {post.readTime}</span>
                    </div>
                    <div className="mt-3 flex items-start justify-between gap-5">
                      <div>
                        <h3 className="text-xl font-bold leading-snug tracking-[-0.025em] text-ink transition-colors group-hover:text-primary sm:text-2xl">
                          {post.title}
                        </h3>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
                          {post.description}
                        </p>
                      </div>
                      <span className="mt-1 grid size-9 shrink-0 place-items-center rounded-full border border-border text-primary transition group-hover:border-primary group-hover:bg-primary group-hover:text-white">
                        <ArrowUpRight size={16} />
                      </span>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <span key={tag} className="rounded-md bg-primary-soft px-2.5 py-1 text-xs font-bold text-primary-dark">{tag}</span>
                      ))}
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </section>

          <aside className="space-y-8 lg:border-l lg:border-border lg:pl-7">
            <section id="gioi-thieu" aria-labelledby="about-title">
              <h2 id="about-title" className="text-sm font-extrabold uppercase tracking-[0.12em] text-ink">Về mình</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                DevOps Intern, viết lại những gì mình vừa học theo cách dễ hiểu nhất.
              </p>
            </section>

            <section id="chu-de" aria-labelledby="topics-title">
              <h2 id="topics-title" className="text-sm font-extrabold uppercase tracking-[0.12em] text-ink">Chủ đề</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                <a className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:border-primary/30 hover:text-primary" href="#bai-viet">Linux</a>
                <a className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:border-primary/30 hover:text-primary" href="#bai-viet">Git</a>
              </div>
            </section>
          </aside>
        </div>
      </div>

      <footer className="border-t border-border bg-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-5 py-7 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>© 2026 Tiến Đạt · DevOpags</p>
          <a className="font-semibold transition hover:text-primary" href="https://github.com/tiendat13ns/devopags" target="_blank" rel="noreferrer">GitHub</a>
        </div>
      </footer>
    </main>
  );
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5 sm:px-8">
        <a className="group flex items-center gap-3" href="#top" aria-label="DevOpags - Trang chủ">
          <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-[0_8px_24px_-10px_rgba(123,44,191,0.8)] transition-transform group-hover:-rotate-3">
            <Terminal size={19} strokeWidth={2.2} />
          </span>
          <span className="text-[1.05rem] font-bold tracking-[-0.025em]">DevOp<span className="text-primary">ags</span></span>
        </a>

        <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex" aria-label="Điều hướng chính">
          <a className="transition-colors hover:text-primary" href="#bai-viet">Bài viết</a>
          <a className="transition-colors hover:text-primary" href="#chu-de">Chủ đề</a>
          <a className="transition-colors hover:text-primary" href="#gioi-thieu">Về mình</a>
        </nav>

        <div className="flex items-center gap-2">
          <GitHubLink />
          <details className="relative md:hidden">
            <summary className="grid size-9 cursor-pointer list-none place-items-center rounded-lg border border-border bg-white [&::-webkit-details-marker]:hidden" aria-label="Mở menu">
              <Menu size={18} />
            </summary>
            <nav className="absolute right-0 top-12 flex w-40 flex-col gap-1 rounded-xl border border-border bg-white p-2 text-sm font-medium shadow-xl" aria-label="Điều hướng di động">
              <a className="rounded-lg px-3 py-2 hover:bg-accent" href="#bai-viet">Bài viết</a>
              <a className="rounded-lg px-3 py-2 hover:bg-accent" href="#chu-de">Chủ đề</a>
              <a className="rounded-lg px-3 py-2 hover:bg-accent" href="#gioi-thieu">Về mình</a>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}

function GitHubLink() {
  return (
    <a
      className="grid size-9 place-items-center rounded-lg border border-border bg-white text-ink transition-colors hover:border-primary/30 hover:bg-accent hover:text-primary"
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
  );
}
