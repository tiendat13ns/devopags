import Link from 'next/link';
import { ArrowUpRight, Menu, Terminal } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { PaginatedPostList, type Post } from '@/components/post-list';

const posts: Post[] = [
  {
    title: 'Linux là gì và tại sao Linux cần thiết cho DevOps?',
    description: 'Hiểu Linux từ kernel, distribution đến vai trò của Linux trong server, container, cloud và công việc DevOps hằng ngày.',
    date: '16/09/2026',
    readTime: '9 phút đọc',
    tags: ['Linux', 'DevOps', 'Cơ bản'],
    href: '/bai-viet/linux-la-gi',
    accent: 'amethyst',
  },
  {
    title: 'Docker là gì và tại sao nên dùng Docker?',
    description: 'Tìm hiểu image, container, registry và cách Docker giúp môi trường phát triển, CI và production nhất quán hơn.',
    date: '16/09/2026',
    readTime: '10 phút đọc',
    tags: ['Docker', 'Container', 'DevOps'],
    href: '/bai-viet/docker-la-gi',
    accent: 'docker',
  },
  {
    title: 'Linux & Git Cheatsheet cho DevOps Intern',
    description: 'Các lệnh thường dùng trên server và workflow Git hằng ngày, được nhóm lại để tra cứu nhanh.',
    date: '15/09/2026',
    readTime: '15 phút đọc',
    tags: ['Linux', 'Git'],
    href: '/bai-viet/linux-git-cheatsheet',
    accent: 'amethyst',
  },
];

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-background text-foreground transition-colors duration-300">
      <DevOpsBackdrop />
      <SiteHeader />

      <div className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-5 sm:px-8">
        <section id="top" className="grid gap-10 py-12 sm:py-16 lg:grid-cols-[minmax(0,1fr)_250px] lg:gap-20 lg:py-20">
          <div className="max-w-2xl border-l-2 border-primary pl-6 sm:pl-8">
            <p className="font-mono text-sm font-semibold text-primary">$ whoami</p>
            <h1 className="mt-3 text-4xl font-bold tracking-[-0.045em] text-ink sm:text-5xl">Tiến Đạt</h1>
            <p className="mt-2 text-base font-semibold text-foreground">DevOps Intern · Người viết DevOpags</p>
            <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground">
              Mình ghi lại những gì vừa học về Linux, Git, Docker và hệ thống — ngắn gọn, có ví dụ và đủ để mở ra tra cứu khi cần.
            </p>
          </div>

          <nav className="h-fit border border-border bg-card/75 p-5 backdrop-blur-sm" aria-label="Trong trang này">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Trong blog này</p>
            <div className="mt-4 flex flex-col text-sm font-medium">
              <a className="border-l-2 border-primary py-2 pl-3 text-primary" href="#bai-viet">Bài viết mới</a>
              <a className="border-l-2 border-transparent py-2 pl-3 text-muted-foreground transition hover:border-primary/50 hover:text-ink" href="#playground">DevOps Playground</a>
              <a className="border-l-2 border-transparent py-2 pl-3 text-muted-foreground transition hover:border-primary/50 hover:text-ink" href="#chu-de">Chủ đề</a>
              <a className="border-l-2 border-transparent py-2 pl-3 text-muted-foreground transition hover:border-primary/50 hover:text-ink" href="#gioi-thieu">Về mình</a>
            </div>
          </nav>
        </section>

        <div className="grid gap-12 pb-16 lg:grid-cols-[minmax(0,1fr)_250px] lg:gap-20 lg:pb-24">
          <section id="bai-viet" aria-labelledby="posts-title">
            <SectionTitle id="posts-title" label="Bài viết mới" command="ls ./posts" />

            <PaginatedPostList posts={posts} />

            <LinuxPlaygroundPreview />
          </section>

          <aside className="space-y-10 lg:border-l lg:border-border lg:pl-7">
            <section id="gioi-thieu" aria-labelledby="about-title">
              <h2 id="about-title" className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-primary">Về mình</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Đang học DevOps qua từng task nhỏ và viết lại theo cách mình hiểu.
              </p>
            </section>

            <section id="chu-de" aria-labelledby="topics-title">
              <h2 id="topics-title" className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-primary">Chủ đề</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                <a className="border border-border bg-card/70 px-3 py-1.5 text-sm text-muted-foreground transition hover:border-primary/50 hover:text-ink" href="#bai-viet">Linux</a>
                <a className="border border-border bg-card/70 px-3 py-1.5 text-sm text-muted-foreground transition hover:border-primary/50 hover:text-ink" href="#bai-viet">Git</a>
                <a className="border border-border bg-card/70 px-3 py-1.5 text-sm text-muted-foreground transition hover:border-primary/50 hover:text-ink" href="#bai-viet">Docker</a>
              </div>
            </section>

            <section aria-labelledby="status-title">
              <h2 id="status-title" className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-primary">Status</h2>
              <p className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground">
                <span className="size-2 rounded-full bg-primary shadow-[0_0_12px_rgba(168,85,247,0.9)]" />
                Đang học mỗi ngày
              </p>
            </section>
          </aside>
        </div>
      </div>

      <footer className="relative z-10 border-t border-border bg-background/75 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-7 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>© 2026 Tiến Đạt · DevOpags</p>
          <a className="font-semibold transition hover:text-primary" href="https://github.com/tiendat13ns" target="_blank" rel="noreferrer">GitHub</a>
        </div>
      </footer>
    </main>
  );
}

function SectionTitle({ id, label, command }: { id: string; label: string; command: string }) {
  return (
    <div className="flex items-end justify-between gap-5 border-b border-border pb-3">
      <h2 id={id} className="text-xl font-bold tracking-tight text-ink">{label}</h2>
      <span className="hidden font-mono text-xs text-muted-foreground sm:block">$ {command}</span>
    </div>
  );
}

function LinuxPlaygroundPreview() {
  return (
    <section id="playground" className="mt-12 scroll-mt-24" aria-labelledby="playground-title">
      <div className="overflow-hidden rounded-2xl border border-[#6f32a8] bg-[#100b18] shadow-[0_24px_70px_-42px_rgba(111,50,168,0.95)]">
        <div className="flex h-11 items-center justify-between border-b border-white/10 bg-[#1a1026] px-4">
          <div className="flex gap-2" aria-hidden="true">
            <span className="size-2.5 rounded-full bg-[#5a189a]" />
            <span className="size-2.5 rounded-full bg-[#9d4edd]" />
            <span className="size-2.5 rounded-full bg-[#c77dff]" />
          </div>
          <span className="font-mono text-[11px] font-semibold text-white/45">linux-playground</span>
          <Terminal className="text-white/35" size={15} />
        </div>

        <div className="grid gap-7 p-5 sm:p-7 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-[#c77dff]">Thực hành ngay trên trình duyệt</p>
            <h2 id="playground-title" className="mt-2 text-2xl font-bold tracking-[-0.035em] text-white">DevOps Playground</h2>
            <p className="mt-3 max-w-lg text-sm leading-6 text-[#c9c1d4]">
              Thử Linux trong filesystem ảo và luyện Git với repository mô phỏng có branch, staging area và commit history.
            </p>
            <Link
              className="mt-5 inline-flex items-center gap-2 rounded-lg border border-[#a855d4] bg-gradient-to-r from-[#552077] via-[#7629a8] to-[#5d2184] px-4 py-2.5 text-sm font-bold text-white ring-1 ring-[#c77dff]/20 shadow-[0_0_9px_rgba(168,85,247,0.3),0_8px_22px_-15px_rgba(168,85,247,0.75),inset_0_1px_0_rgba(255,255,255,0.2)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#c77dff] hover:from-[#67268f] hover:via-[#8b35bc] hover:to-[#6f2998] hover:shadow-[0_0_13px_rgba(192,132,252,0.45),0_10px_26px_-16px_rgba(168,85,247,0.85),inset_0_1px_0_rgba(255,255,255,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c77dff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#100b18]"
              href="/playground"
            >
              <Terminal size={16} /> Mở DevOps Playground <ArrowUpRight size={16} />
            </Link>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#160d20] p-4 font-mono text-xs leading-6 sm:text-[13px]">
            <p>
              <span className="font-semibold text-[#c77dff]">devopags@lab</span>
              <span className="font-semibold text-[#67d9ff]">:~</span>
              <span className="text-white">$ pwd</span>
            </p>
            <p className="text-[#c9c1d4]">/home/devopags</p>
            <p className="mt-1">
              <span className="font-semibold text-[#c77dff]">devopags@lab</span>
              <span className="font-semibold text-[#67d9ff]">:~</span>
              <span className="text-white">$ git status</span>
            </p>
            <p className="text-[#63d7a4]">On branch main · app.js modified</p>
            <p className="mt-1">
              <span className="font-semibold text-[#c77dff]">devopags@lab</span>
              <span className="font-semibold text-[#67d9ff]">:~</span>
              <span className="text-white">$ <span className="inline-block h-4 w-1.5 translate-y-1 bg-[#dfa8ff]" aria-hidden="true" /></span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <a className="group flex items-center gap-3" href="#top" aria-label="DevOpags - Trang chủ">
          <span className="brand-mark size-10 rounded-[13px] p-[3px] transition-transform group-hover:-rotate-3">
            <span className="brand-mark-screen grid size-full place-items-center rounded-[9px]">
              <Terminal size={20} strokeWidth={2.4} />
            </span>
          </span>
          <span className="text-[1.05rem] font-bold tracking-[-0.025em] text-ink">DevOp<span className="text-primary">ags</span></span>
        </a>

        <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex" aria-label="Điều hướng chính">
          <a className="transition hover:text-primary" href="#bai-viet">Bài viết</a>
          <a className="transition hover:text-primary" href="#playground">Playground</a>
          <a className="transition hover:text-primary" href="#chu-de">Chủ đề</a>
          <a className="transition hover:text-primary" href="#gioi-thieu">Về mình</a>
        </nav>

        <div className="flex items-center gap-2">
          <GitHubLink />
          <ThemeToggle />
          <details className="relative md:hidden">
            <summary className="grid size-9 cursor-pointer list-none place-items-center rounded-lg border border-border bg-card text-foreground [&::-webkit-details-marker]:hidden" aria-label="Mở menu">
              <Menu size={18} />
            </summary>
            <nav className="absolute right-0 top-12 flex w-40 flex-col gap-1 rounded-xl border border-border bg-card p-2 text-sm font-medium text-muted-foreground shadow-2xl" aria-label="Điều hướng di động">
              <a className="rounded-lg px-3 py-2 hover:bg-accent hover:text-ink" href="#bai-viet">Bài viết</a>
              <a className="rounded-lg px-3 py-2 hover:bg-accent hover:text-ink" href="#playground">Playground</a>
              <a className="rounded-lg px-3 py-2 hover:bg-accent hover:text-ink" href="#chu-de">Chủ đề</a>
              <a className="rounded-lg px-3 py-2 hover:bg-accent hover:text-ink" href="#gioi-thieu">Về mình</a>
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
  );
}

function DevOpsBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div
        className="devops-aurora-motion absolute inset-[-4%]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 18% 12%, var(--devops-glow-primary), transparent 30%), radial-gradient(circle at 82% 40%, var(--devops-glow-secondary), transparent 34%), linear-gradient(135deg, var(--background) 0%, var(--surface) 50%, var(--background) 100%)',
        }}
      />
      <div
        className="devops-grid-motion absolute inset-[-64px] opacity-30"
        style={{
          backgroundImage:
            'linear-gradient(var(--devops-grid) 1px, transparent 1px), linear-gradient(90deg, var(--devops-grid) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'linear-gradient(to bottom, black, transparent 88%)',
        }}
      />

      <svg className="devops-network-motion absolute inset-0 h-full w-full opacity-60" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
        <g fill="none" stroke="var(--devops-network)" strokeWidth="1">
          <path opacity="0.12" d="M64 172 188 124l96 82 132-74 96 94 128-50 124 97" />
          <path opacity="0.09" d="M884 126 1008 196l112-56 78 116 152-54" />
          <path opacity="0.11" d="M76 616 210 530l116 92 146-66 130 90 118-38" />
          <path opacity="0.08" d="M864 620 988 524l114 90 92-52 170 106" />
        </g>
        <g fill="var(--devops-node)">
          {[['64','172'],['188','124'],['284','206'],['416','132'],['512','226'],['640','176'],['764','273'],['884','126'],['1008','196'],['1120','140'],['1198','256'],['1350','202'],['76','616'],['210','530'],['326','622'],['472','556'],['602','646'],['720','608'],['864','620'],['988','524'],['1102','614'],['1194','562'],['1364','668']].map(([cx, cy], index) => (
            <circle
              className="devops-node-motion"
              key={`${cx}-${cy}`}
              cx={cx}
              cy={cy}
              r="2"
              style={{ animationDelay: `${index * -0.37}s` }}
            />
          ))}
        </g>
      </svg>

      <CommandLine className="left-[4%] top-[13%] -rotate-6" delay="-2s" text="$ ssh deploy@10.0.0.12" />
      <CommandLine className="right-[5%] top-[18%] rotate-3" delay="-8s" text="kubectl get pods -A" />
      <CommandLine className="left-[2%] top-[43%] rotate-2" delay="-5s" text="git log --oneline --graph" />
      <CommandLine className="right-[3%] top-[49%] -rotate-3" delay="-11s" text="docker compose up -d" />
      <CommandLine className="left-[7%] top-[72%] -rotate-2" delay="-7s" text="journalctl -u nginx -f" />
      <CommandLine className="right-[8%] top-[80%] rotate-2" delay="-14s" text="terraform plan" />
    </div>
  );
}

function CommandLine({ className, delay, text }: { className: string; delay: string; text: string }) {
  return (
    <span
      className={`devops-command-motion absolute hidden whitespace-nowrap font-mono text-xs text-primary sm:block ${className}`}
      style={{ animationDelay: delay }}
    >
      {text}
    </span>
  );
}
