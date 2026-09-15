import {
  ArrowRight,
  BookOpen,
  Boxes,
  Check,
  ChevronRight,
  CircleDot,
  Cloud,
  Code2,
  Container,
  GitFork,
  Menu,
  Network,
  Server,
  Terminal,
} from 'lucide-react';

const topics = [
  {
    icon: Terminal,
    number: '01',
    title: 'Linux căn bản',
    description: 'Filesystem, permission, process và những câu lệnh dùng mỗi ngày.',
    count: '6 bài viết',
  },
  {
    icon: Network,
    number: '02',
    title: 'Networking',
    description: 'IP, DNS, port và hành trình của một request qua Internet.',
    count: '4 bài viết',
  },
  {
    icon: Container,
    number: '03',
    title: 'Docker',
    description: 'Từ image đầu tiên đến một môi trường chạy có thể tái tạo.',
    count: 'Đang viết',
  },
  {
    icon: Boxes,
    number: '04',
    title: 'CI/CD',
    description: 'Build, test và deploy tự động bằng những pipeline nhỏ, rõ ràng.',
    count: 'Sắp ra mắt',
  },
];

const notes = [
  {
    category: 'Linux + Git',
    title: 'Linux & Git Cheatsheet cho DevOps Intern',
    description: 'Các lệnh thường dùng, được nhóm theo tình huống để mở ra là tra được ngay.',
    date: '15 phút đọc',
    href: '/bai-viet/linux-git-cheatsheet',
  },
  {
    category: 'Networking',
    title: 'Điều gì xảy ra khi bạn gõ một URL?',
    description: 'Lần theo DNS, TCP, TLS và HTTP bằng góc nhìn của một DevOps intern.',
    date: '9 phút đọc',
    href: '#bai-viet',
  },
  {
    category: 'Docker',
    title: 'Vì sao container của tôi vừa chạy đã dừng?',
    description: 'Hiểu PID 1, foreground process và cách đọc container logs.',
    date: '7 phút đọc',
    href: '#bai-viet',
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <a className="group flex items-center gap-3" href="#top" aria-label="DevOpags - Trang chủ">
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-[0_8px_24px_-10px_rgba(123,44,191,0.8)] transition-transform group-hover:-rotate-3">
              <Terminal size={19} strokeWidth={2.2} />
            </span>
            <span className="text-[1.05rem] font-bold tracking-[-0.025em]">
              DevOp<span className="text-primary">ags</span>
            </span>
          </a>

          <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex" aria-label="Điều hướng chính">
            <a className="transition-colors hover:text-primary" href="#lo-trinh">Lộ trình</a>
            <a className="transition-colors hover:text-primary" href="#bai-viet">Bài viết</a>
            <a className="transition-colors hover:text-primary" href="#gioi-thieu">Về mình</a>
          </nav>

          <div className="flex items-center gap-2">
            <a
              className="hidden h-9 items-center gap-2 rounded-lg border border-border bg-white px-3.5 text-sm font-semibold transition-colors hover:border-primary/30 hover:bg-accent sm:flex"
              href="https://github.com/tiendat13ns/devopags"
              target="_blank"
              rel="noreferrer"
            >
              <GitFork size={16} />
              GitHub
            </a>
            <details className="relative md:hidden">
              <summary className="grid size-9 cursor-pointer list-none place-items-center rounded-lg border border-border bg-white [&::-webkit-details-marker]:hidden" aria-label="Mở menu">
                <Menu size={18} />
              </summary>
              <nav className="absolute right-0 top-12 flex w-44 flex-col gap-1 rounded-xl border border-border bg-white p-2 text-sm font-medium shadow-xl" aria-label="Điều hướng di động">
                <a className="rounded-lg px-3 py-2 hover:bg-accent" href="#lo-trinh">Lộ trình</a>
                <a className="rounded-lg px-3 py-2 hover:bg-accent" href="#bai-viet">Bài viết</a>
                <a className="rounded-lg px-3 py-2 hover:bg-accent" href="#gioi-thieu">Về mình</a>
              </nav>
            </details>
          </div>
        </div>
      </header>

      <section id="top" className="relative border-b border-border/70">
        <div className="hero-grid absolute inset-0 opacity-70" aria-hidden="true" />
        <div className="hero-glow absolute left-[12%] top-[-180px] size-[420px] rounded-full" aria-hidden="true" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1.08fr_0.92fr] lg:py-24">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary-soft px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-primary-dark">
              <CircleDot size={13} fill="currentColor" className="text-primary" />
              Nhật ký học DevOps
            </div>
            <h1 className="text-balance text-[clamp(2.6rem,7vw,5rem)] font-bold leading-[1.02] tracking-[-0.055em] text-ink">
              Hiểu DevOps từ những điều <span className="text-primary">nhỏ nhất.</span>
            </h1>
            <p className="mt-6 max-w-xl text-pretty text-lg leading-8 text-muted-foreground">
              Ghi chép từ hành trình của một DevOps Intern — học đến đâu, thực hành và giải thích lại đến đó.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground shadow-[0_12px_30px_-14px_rgba(90,24,154,0.8)] transition hover:-translate-y-0.5 hover:bg-primary-dark" href="#lo-trinh">
                Bắt đầu đọc
                <ArrowRight size={17} />
              </a>
              <a className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-white px-5 text-sm font-bold transition hover:border-primary/25 hover:bg-accent" href="#bai-viet">
                <BookOpen size={17} />
                Bài viết mới
              </a>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              {['Dễ hiểu', 'Có thực hành', 'Cập nhật liên tục'].map((item) => (
                <span className="flex items-center gap-2" key={item}>
                  <Check size={15} className="text-primary" strokeWidth={2.5} />
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[540px] lg:mr-0">
            <div className="absolute -inset-5 -z-10 rounded-[2rem] bg-primary/[0.045] blur-2xl" aria-hidden="true" />
            <div className="overflow-hidden rounded-2xl border border-code-border bg-code text-code-foreground shadow-[0_30px_70px_-35px_rgba(37,27,43,0.55)]">
              <div className="flex h-11 items-center justify-between border-b border-white/10 px-4">
                <div className="flex gap-1.5" aria-hidden="true">
                  <span className="size-2.5 rounded-full bg-[#ff6b6b]" />
                  <span className="size-2.5 rounded-full bg-[#ffd166]" />
                  <span className="size-2.5 rounded-full bg-[#63d7a4]" />
                </div>
                <span className="font-mono text-[11px] tracking-wide text-white/45">devopags — pipeline</span>
                <Terminal size={14} className="text-white/35" />
              </div>
              <div className="space-y-5 p-5 font-mono text-[13px] leading-6 sm:p-7 sm:text-sm">
                <p><span className="text-violet-300">$</span> git push origin main</p>
                <div className="space-y-3 border-l border-white/10 pl-4">
                  <PipelineRow icon={Code2} label="Build website" status="passed" />
                  <PipelineRow icon={Server} label="Run checks" status="passed" />
                  <PipelineRow icon={Cloud} label="Deploy production" status="running" />
                </div>
                <p className="text-white/45">
                  <span className="text-emerald-300">✓</span> Học một chút. Viết một chút. Tiến bộ mỗi ngày.
                </p>
              </div>
            </div>
            <div className="absolute -bottom-5 -right-2 rounded-xl border border-primary/15 bg-white px-4 py-3 shadow-lg sm:-right-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Trạng thái</p>
              <p className="mt-1 flex items-center gap-2 text-sm font-bold text-ink">
                <span className="size-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.12)]" />
                Đang học mỗi ngày
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="lo-trinh" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-24">
        <SectionHeading
          eyebrow="Bắt đầu từ nền tảng"
          title="Một lộ trình đủ chậm để hiểu sâu."
          description="Mỗi chủ đề được chia thành những bài nhỏ, có ví dụ và ghi lại cả những lỗi thường gặp khi thực hành."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {topics.map((topic) => {
            const Icon = topic.icon;
            return (
              <a className="topic-card group rounded-2xl border border-border bg-white p-5" href="#bai-viet" key={topic.title}>
                <div className="flex items-start justify-between">
                  <span className="grid size-11 place-items-center rounded-xl bg-primary-soft text-primary">
                    <Icon size={21} />
                  </span>
                  <span className="font-mono text-xs font-bold text-primary/45">{topic.number}</span>
                </div>
                <h3 className="mt-7 text-lg font-bold tracking-tight text-ink">{topic.title}</h3>
                <p className="mt-2 min-h-[4.5rem] text-sm leading-6 text-muted-foreground">{topic.description}</p>
                <div className="mt-5 flex items-center justify-between border-t border-border/80 pt-4 text-xs font-bold">
                  <span className="text-muted-foreground">{topic.count}</span>
                  <ChevronRight size={16} className="text-primary transition-transform group-hover:translate-x-1" />
                </div>
              </a>
            );
          })}
        </div>
      </section>

      <section id="bai-viet" className="border-y border-border/70 bg-surface">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-24">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <SectionHeading
              eyebrow="Ghi chép gần đây"
              title="Đọc từ một vấn đề thực tế."
              description="Những câu hỏi mình từng vướng và câu trả lời sau khi tự tay kiểm chứng."
            />
            <a className="inline-flex shrink-0 items-center gap-2 text-sm font-bold text-primary hover:text-primary-dark" href="#top">
              Xem tất cả bài viết <ArrowRight size={16} />
            </a>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {notes.map((note, index) => (
              <a className="group flex min-h-[270px] flex-col rounded-2xl border border-border bg-white p-6 transition hover:-translate-y-1 hover:border-primary/25 hover:shadow-[0_18px_45px_-30px_rgba(90,24,154,0.5)]" href={note.href} key={note.title}>
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="rounded-full bg-primary-soft px-2.5 py-1 text-primary-dark">{note.category}</span>
                  <span className="font-mono text-muted-foreground">0{index + 1}</span>
                </div>
                <h3 className="mt-7 text-xl font-bold leading-snug tracking-[-0.025em] text-ink group-hover:text-primary-dark">{note.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{note.description}</p>
                <div className="mt-auto flex items-center justify-between pt-7 text-xs font-semibold text-muted-foreground">
                  <span>{note.date}</span>
                  <span className="grid size-8 place-items-center rounded-full border border-border text-primary transition group-hover:border-primary group-hover:bg-primary group-hover:text-white">
                    <ArrowRight size={14} />
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section id="gioi-thieu" className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-center lg:py-24">
        <div>
          <p className="section-eyebrow">Vì sao có DevOpags?</p>
          <h2 className="mt-3 text-3xl font-bold leading-tight tracking-[-0.04em] text-ink sm:text-4xl">Không cần là chuyên gia mới có thể chia sẻ.</h2>
        </div>
        <div className="border-l-2 border-primary/25 pl-6 sm:pl-8">
          <p className="text-lg leading-8 text-muted-foreground">
            Mình đang là một DevOps Intern. Website này là nơi mình hệ thống lại điều đã học, ghi lại điều từng hiểu sai và biến mỗi task nhỏ thành một bài viết có thể giúp người mới tiếp theo.
          </p>
          <p className="mt-5 text-sm font-bold text-primary-dark">— Tiến Đạt, người viết DevOpags</p>
        </div>
      </section>

      <footer className="border-t border-border bg-white">
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

function PipelineRow({ icon: Icon, label, status }: { icon: typeof Code2; label: string; status: 'passed' | 'running' }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-7 place-items-center rounded-md bg-white/[0.06] text-violet-300"><Icon size={14} /></span>
      <span className="flex-1 text-white/75">{label}</span>
      <span className={status === 'passed' ? 'text-emerald-300' : 'text-amber-300'}>
        {status === 'passed' ? 'passed' : 'running'}
      </span>
    </div>
  );
}

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="max-w-2xl">
      <p className="section-eyebrow">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-bold leading-tight tracking-[-0.04em] text-ink sm:text-4xl">{title}</h2>
      <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">{description}</p>
    </div>
  );
}
