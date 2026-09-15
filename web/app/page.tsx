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
    <main className="relative min-h-screen overflow-hidden bg-[#0d0715] text-[#f8f3ff]">
      <DevOpsBackdrop />
      <SiteHeader />

      <div className="relative z-10 mx-auto max-w-6xl px-5 sm:px-8">
        <section id="top" className="grid gap-10 py-12 sm:py-16 lg:grid-cols-[minmax(0,1fr)_250px] lg:gap-20 lg:py-20">
          <div className="max-w-2xl border-l-2 border-[#a855f7] pl-6 sm:pl-8">
            <p className="font-mono text-sm font-semibold text-[#c084fc]">$ whoami</p>
            <h1 className="mt-3 text-4xl font-bold tracking-[-0.045em] text-white sm:text-5xl">Tiến Đạt</h1>
            <p className="mt-2 text-base font-semibold text-[#d8c8e8]">DevOps Intern · Người viết DevOpags</p>
            <p className="mt-6 max-w-xl text-base leading-7 text-[#b9a9ca]">
              Mình ghi lại những gì vừa học về Linux, Git, Docker và hệ thống — ngắn gọn, có ví dụ và đủ để mở ra tra cứu khi cần.
            </p>
          </div>

          <nav className="h-fit border border-[#b66cff]/20 bg-[#130b20]/70 p-5 backdrop-blur-sm" aria-label="Trong trang này">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-[#a98cbe]">Trong blog này</p>
            <div className="mt-4 flex flex-col text-sm font-medium">
              <a className="border-l-2 border-[#a855f7] py-2 pl-3 text-[#d8a7ff]" href="#bai-viet">Bài viết mới</a>
              <a className="border-l-2 border-transparent py-2 pl-3 text-[#cbbbd8] transition hover:border-[#a855f7]/50 hover:text-white" href="#chu-de">Chủ đề</a>
              <a className="border-l-2 border-transparent py-2 pl-3 text-[#cbbbd8] transition hover:border-[#a855f7]/50 hover:text-white" href="#gioi-thieu">Về mình</a>
            </div>
          </nav>
        </section>

        <div className="grid gap-12 pb-16 lg:grid-cols-[minmax(0,1fr)_250px] lg:gap-20 lg:pb-24">
          <section id="bai-viet" aria-labelledby="posts-title">
            <SectionTitle id="posts-title" label="Bài viết mới" command="ls ./posts" />

            <div className="mt-5">
              {posts.map((post) => (
                <article key={post.href}>
                  <Link
                    className="group block border border-[#b66cff]/20 bg-[#160d24]/75 p-5 backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:border-[#b66cff]/50 hover:bg-[#1b102c]/90 sm:p-7"
                    href={post.href}
                  >
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-xs text-[#9f8daf]">
                      <span className="inline-flex items-center gap-1.5"><CalendarDays size={14} /> {post.date}</span>
                      <span className="inline-flex items-center gap-1.5"><Clock size={14} /> {post.readTime}</span>
                    </div>

                    <div className="mt-4 flex items-start justify-between gap-5">
                      <div>
                        <h2 className="text-xl font-bold leading-snug tracking-[-0.025em] text-white transition-colors group-hover:text-[#d8a7ff] sm:text-2xl">
                          {post.title}
                        </h2>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#b7a7c5] sm:text-base sm:leading-7">
                          {post.description}
                        </p>
                      </div>
                      <span className="grid size-9 shrink-0 place-items-center border border-[#b66cff]/30 text-[#c084fc] transition group-hover:border-[#a855f7] group-hover:bg-[#a855f7] group-hover:text-white">
                        <ArrowUpRight size={16} />
                      </span>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <span key={tag} className="border border-[#b66cff]/20 bg-[#a855f7]/10 px-2.5 py-1 font-mono text-xs font-semibold text-[#d8a7ff]">{tag}</span>
                      ))}
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </section>

          <aside className="space-y-10 lg:border-l lg:border-[#b66cff]/15 lg:pl-7">
            <section id="gioi-thieu" aria-labelledby="about-title">
              <h2 id="about-title" className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-[#c084fc]">Về mình</h2>
              <p className="mt-3 text-sm leading-6 text-[#ad9cbb]">
                Đang học DevOps qua từng task nhỏ và viết lại theo cách mình hiểu.
              </p>
            </section>

            <section id="chu-de" aria-labelledby="topics-title">
              <h2 id="topics-title" className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-[#c084fc]">Chủ đề</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                <a className="border border-[#b66cff]/20 bg-[#160d24]/60 px-3 py-1.5 text-sm text-[#cbbbd8] transition hover:border-[#b66cff]/50 hover:text-white" href="#bai-viet">Linux</a>
                <a className="border border-[#b66cff]/20 bg-[#160d24]/60 px-3 py-1.5 text-sm text-[#cbbbd8] transition hover:border-[#b66cff]/50 hover:text-white" href="#bai-viet">Git</a>
              </div>
            </section>

            <section aria-labelledby="status-title">
              <h2 id="status-title" className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-[#c084fc]">Status</h2>
              <p className="mt-3 inline-flex items-center gap-2 text-sm text-[#ad9cbb]">
                <span className="size-2 rounded-full bg-[#a855f7] shadow-[0_0_12px_rgba(168,85,247,0.9)]" />
                Đang học mỗi ngày
              </p>
            </section>
          </aside>
        </div>
      </div>

      <footer className="relative z-10 border-t border-[#b66cff]/15 bg-[#0b0612]/70 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-7 text-sm text-[#8f7f9d] sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>© 2026 Tiến Đạt · DevOpags</p>
          <a className="font-semibold transition hover:text-[#c084fc]" href="https://github.com/tiendat13ns/devopags" target="_blank" rel="noreferrer">GitHub</a>
        </div>
      </footer>
    </main>
  );
}

function SectionTitle({ id, label, command }: { id: string; label: string; command: string }) {
  return (
    <div className="flex items-end justify-between gap-5 border-b border-[#b66cff]/20 pb-3">
      <h2 id={id} className="text-xl font-bold tracking-tight text-white">{label}</h2>
      <span className="hidden font-mono text-xs text-[#735e83] sm:block">$ {command}</span>
    </div>
  );
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#b66cff]/15 bg-[#0d0715]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <a className="group flex items-center gap-3" href="#top" aria-label="DevOpags - Trang chủ">
          <span className="grid size-9 place-items-center rounded-lg bg-[#8b3fd6] text-white shadow-[0_8px_28px_-10px_rgba(168,85,247,0.9)] transition-transform group-hover:-rotate-3">
            <Terminal size={19} strokeWidth={2.2} />
          </span>
          <span className="text-[1.05rem] font-bold tracking-[-0.025em] text-white">DevOp<span className="text-[#c084fc]">ags</span></span>
        </a>

        <nav className="hidden items-center gap-7 text-sm font-medium text-[#ad9cbb] md:flex" aria-label="Điều hướng chính">
          <a className="transition hover:text-[#d8a7ff]" href="#bai-viet">Bài viết</a>
          <a className="transition hover:text-[#d8a7ff]" href="#chu-de">Chủ đề</a>
          <a className="transition hover:text-[#d8a7ff]" href="#gioi-thieu">Về mình</a>
        </nav>

        <div className="flex items-center gap-2">
          <GitHubLink />
          <details className="relative md:hidden">
            <summary className="grid size-9 cursor-pointer list-none place-items-center border border-[#b66cff]/20 bg-[#160d24]/70 text-[#d8c8e8] [&::-webkit-details-marker]:hidden" aria-label="Mở menu">
              <Menu size={18} />
            </summary>
            <nav className="absolute right-0 top-12 flex w-40 flex-col gap-1 border border-[#b66cff]/20 bg-[#130b20] p-2 text-sm font-medium text-[#cbbbd8] shadow-2xl" aria-label="Điều hướng di động">
              <a className="px-3 py-2 hover:bg-[#a855f7]/10 hover:text-white" href="#bai-viet">Bài viết</a>
              <a className="px-3 py-2 hover:bg-[#a855f7]/10 hover:text-white" href="#chu-de">Chủ đề</a>
              <a className="px-3 py-2 hover:bg-[#a855f7]/10 hover:text-white" href="#gioi-thieu">Về mình</a>
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
      className="grid size-9 place-items-center border border-[#b66cff]/20 bg-[#160d24]/70 text-[#d8c8e8] transition hover:border-[#b66cff]/50 hover:bg-[#a855f7]/10 hover:text-[#d8a7ff]"
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

function DevOpsBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div
        className="devops-aurora-motion absolute inset-[-4%]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 18% 12%, rgba(147, 51, 234, 0.22), transparent 30%), radial-gradient(circle at 82% 40%, rgba(88, 28, 135, 0.2), transparent 34%), linear-gradient(135deg, #0d0715 0%, #12091f 50%, #09050f 100%)',
        }}
      />
      <div
        className="devops-grid-motion absolute inset-[-64px] opacity-30"
        style={{
          backgroundImage:
            'linear-gradient(rgba(192,132,252,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(192,132,252,0.035) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'linear-gradient(to bottom, black, transparent 88%)',
        }}
      />

      <svg className="devops-network-motion absolute inset-0 h-full w-full opacity-60" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
        <g fill="none" stroke="#a855f7" strokeWidth="1">
          <path opacity="0.12" d="M64 172 188 124l96 82 132-74 96 94 128-50 124 97" />
          <path opacity="0.09" d="M884 126 1008 196l112-56 78 116 152-54" />
          <path opacity="0.11" d="M76 616 210 530l116 92 146-66 130 90 118-38" />
          <path opacity="0.08" d="M864 620 988 524l114 90 92-52 170 106" />
        </g>
        <g fill="#c084fc">
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
      className={`devops-command-motion absolute hidden whitespace-nowrap font-mono text-xs text-[#d8a7ff]/10 sm:block ${className}`}
      style={{ animationDelay: delay }}
    >
      {text}
    </span>
  );
}
