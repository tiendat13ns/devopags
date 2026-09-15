import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ChevronRight,
  ExternalLink,
  GitBranch,
  GitFork,
  Info,
  Menu,
  Terminal,
  TriangleAlert,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Linux & Git Cheatsheet cho DevOps Intern | DevOpags',
  description:
    'Các lệnh Linux và Git thường dùng nhất khi học và làm DevOps, được nhóm theo tình huống để dễ tra cứu.',
};

type Command = {
  command: string;
  description: string;
  note?: string;
};

const linuxSections: { id: string; title: string; description: string; commands: Command[] }[] = [
  {
    id: 'linux-files',
    title: 'Di chuyển và quản lý file',
    description: 'Những lệnh đầu tiên cần nhớ khi làm việc trên server.',
    commands: [
      { command: 'pwd', description: 'In đường dẫn của thư mục hiện tại.' },
      { command: 'ls -lah', description: 'Liệt kê cả file ẩn, kèm quyền và kích thước dễ đọc.' },
      { command: 'cd /var/log', description: 'Di chuyển đến một thư mục theo đường dẫn tuyệt đối.' },
      { command: 'mkdir -p app/config', description: 'Tạo cả thư mục cha nếu chúng chưa tồn tại.' },
      { command: 'touch .env.example', description: 'Tạo file rỗng hoặc cập nhật thời gian sửa file.' },
      { command: 'cp -r source/ backup/', description: 'Sao chép một thư mục và toàn bộ nội dung.' },
      { command: 'mv old.conf new.conf', description: 'Di chuyển hoặc đổi tên file.' },
      { command: 'rm -i file.log', description: 'Xóa file và hỏi xác nhận trước khi xóa.' },
      { command: 'find . -type f -name "*.log"', description: 'Tìm tất cả file .log từ thư mục hiện tại.' },
      { command: 'du -sh *', description: 'Xem nhanh dung lượng của từng mục trong thư mục.' },
    ],
  },
  {
    id: 'linux-text',
    title: 'Đọc, tìm kiếm và xử lý text',
    description: 'Phần lớn việc debug bắt đầu từ việc đọc và lọc log.',
    commands: [
      { command: 'less app.log', description: 'Đọc file dài theo từng trang; nhấn q để thoát.' },
      { command: 'head -n 20 app.log', description: 'Xem 20 dòng đầu của file.' },
      { command: 'tail -f app.log', description: 'Theo dõi các dòng log mới theo thời gian thực.' },
      { command: 'grep -Rni "error" ./logs', description: 'Tìm error đệ quy, không phân biệt hoa thường và hiện số dòng.' },
      { command: 'sort access.log | uniq -c', description: 'Sắp xếp rồi đếm số dòng trùng nhau.' },
      { command: 'cut -d ":" -f 1 /etc/passwd', description: 'Tách cột đầu tiên bằng dấu phân cách :.' },
      { command: 'sed -n "1,20p" app.conf', description: 'In một khoảng dòng mà không sửa file gốc.' },
    ],
  },
  {
    id: 'linux-system',
    title: 'Hệ thống và tiến trình',
    description: 'Kiểm tra tài nguyên trước khi kết luận ứng dụng có lỗi.',
    commands: [
      { command: 'uname -a', description: 'Xem kernel và kiến trúc hệ thống.' },
      { command: 'uptime', description: 'Xem thời gian hoạt động và load average.' },
      { command: 'free -h', description: 'Xem lượng RAM và swap đang sử dụng.' },
      { command: 'df -h', description: 'Xem dung lượng còn lại của các filesystem.' },
      { command: 'ps aux', description: 'Liệt kê các tiến trình đang chạy.' },
      { command: 'top', description: 'Theo dõi tiến trình và tài nguyên theo thời gian thực.' },
      { command: 'kill -15 <PID>', description: 'Yêu cầu tiến trình dừng một cách an toàn.', note: 'Thử SIGTERM (-15) trước SIGKILL (-9).' },
      { command: 'lsof -i :8080', description: 'Tìm tiến trình đang sử dụng port 8080.' },
    ],
  },
  {
    id: 'linux-network',
    title: 'Network và kết nối từ xa',
    description: 'Một nhóm lệnh nhỏ để lần theo sự cố kết nối.',
    commands: [
      { command: 'ip addr', description: 'Xem địa chỉ IP của các network interface.' },
      { command: 'ip route', description: 'Xem bảng định tuyến và default gateway.' },
      { command: 'ss -tulpn', description: 'Liệt kê TCP/UDP port đang lắng nghe và tiến trình liên quan.' },
      { command: 'ping -c 4 8.8.8.8', description: 'Gửi bốn gói kiểm tra khả năng kết nối mạng.' },
      { command: 'dig example.com', description: 'Truy vấn DNS của một tên miền.' },
      { command: 'curl -I https://example.com', description: 'Chỉ lấy HTTP response headers.' },
      { command: 'curl -sS http://localhost:8080/health', description: 'Gọi health endpoint, ẩn progress nhưng vẫn hiện lỗi.' },
      { command: 'ssh user@server', description: 'Đăng nhập server từ xa qua SSH.' },
      { command: 'scp app.conf user@server:/tmp/', description: 'Sao chép file đến server qua SSH.' },
    ],
  },
  {
    id: 'linux-permissions',
    title: 'User và permission',
    description: 'Đủ dùng để hiểu ai đang chạy lệnh và ai được phép đọc file.',
    commands: [
      { command: 'whoami', description: 'Hiển thị user hiện tại.' },
      { command: 'id', description: 'Xem UID, GID và các group của user.' },
      { command: 'sudo -l', description: 'Xem những lệnh user được phép chạy với sudo.' },
      { command: 'chmod u+x deploy.sh', description: 'Thêm quyền thực thi cho chủ sở hữu file.' },
      { command: 'chmod 640 app.conf', description: 'Owner đọc/ghi, group chỉ đọc, người khác không có quyền.' },
      { command: 'sudo chown app:app app.conf', description: 'Đổi owner và group của file thành app.' },
    ],
  },
  {
    id: 'linux-services',
    title: 'Service, log và package',
    description: 'Những thao tác thường gặp trên Ubuntu/Debian sử dụng systemd.',
    commands: [
      { command: 'systemctl status nginx', description: 'Kiểm tra trạng thái service nginx.' },
      { command: 'sudo systemctl restart nginx', description: 'Khởi động lại service nginx.' },
      { command: 'journalctl -u nginx -n 100 --no-pager', description: 'Xem 100 dòng log gần nhất của nginx.' },
      { command: 'journalctl -u nginx -f', description: 'Theo dõi log mới của nginx theo thời gian thực.' },
      { command: 'sudo apt update', description: 'Cập nhật danh sách package khả dụng.' },
      { command: 'sudo apt install <package>', description: 'Cài một package trên Ubuntu/Debian.' },
    ],
  },
];

const gitSections: { id: string; title: string; description: string; commands: Command[] }[] = [
  {
    id: 'git-start',
    title: 'Khởi tạo và cấu hình',
    description: 'Thiết lập danh tính một lần, sau đó tạo hoặc tải repository.',
    commands: [
      { command: 'git config --global user.name "Tên của bạn"', description: 'Đặt tên tác giả cho các commit.' },
      { command: 'git config --global user.email "you@example.com"', description: 'Đặt email tác giả cho các commit.' },
      { command: 'git init', description: 'Khởi tạo Git trong thư mục hiện tại.' },
      { command: 'git clone <repository-url>', description: 'Tải repository và toàn bộ lịch sử về máy.' },
      { command: 'git remote -v', description: 'Xem các remote và URL đang được cấu hình.' },
    ],
  },
  {
    id: 'git-daily',
    title: 'Workflow hằng ngày',
    description: 'Luôn xem trạng thái và diff trước khi tạo commit.',
    commands: [
      { command: 'git status -sb', description: 'Xem trạng thái ngắn gọn kèm branch hiện tại.' },
      { command: 'git diff', description: 'Xem thay đổi chưa được đưa vào staging area.' },
      { command: 'git diff --staged', description: 'Xem chính xác thay đổi chuẩn bị được commit.' },
      { command: 'git add <file>', description: 'Đưa một file vào staging area.' },
      { command: 'git add -p', description: 'Chọn từng phần thay đổi để stage.' },
      { command: 'git commit -m "docs: add Linux notes"', description: 'Tạo commit với thông điệp ngắn, có ý nghĩa.' },
      { command: 'git log --oneline --graph --decorate -10', description: 'Xem 10 commit gần nhất dưới dạng đồ thị gọn.' },
    ],
  },
  {
    id: 'git-branches',
    title: 'Branch và tích hợp thay đổi',
    description: 'Tách công việc khỏi main để dễ review và rollback.',
    commands: [
      { command: 'git branch', description: 'Liệt kê các branch local.' },
      { command: 'git switch -c docs/linux-cheatsheet', description: 'Tạo branch mới và chuyển sang branch đó.' },
      { command: 'git switch main', description: 'Chuyển về branch main.' },
      { command: 'git merge docs/linux-cheatsheet', description: 'Gộp branch chỉ định vào branch hiện tại.' },
      { command: 'git branch -d docs/linux-cheatsheet', description: 'Xóa branch local đã được merge.' },
    ],
  },
  {
    id: 'git-remote',
    title: 'Đồng bộ với remote',
    description: 'Fetch để xem thay đổi trước; pull hoặc push khi đã rõ mình đang ở branch nào.',
    commands: [
      { command: 'git fetch origin', description: 'Tải thông tin mới từ remote nhưng chưa gộp vào branch.' },
      { command: 'git pull --rebase origin main', description: 'Lấy main mới và đặt commit local lên phía trên.' },
      { command: 'git push -u origin <branch>', description: 'Push branch lần đầu và thiết lập upstream.' },
      { command: 'git push', description: 'Push các commit mới sau khi upstream đã được thiết lập.' },
    ],
  },
  {
    id: 'git-undo',
    title: 'Sửa sai an toàn',
    description: 'Ưu tiên các lệnh không xóa lịch sử và luôn kiểm tra status trước.',
    commands: [
      { command: 'git restore <file>', description: 'Bỏ thay đổi chưa stage của một file.', note: 'Thay đổi chưa commit sẽ không thể khôi phục bằng Git.' },
      { command: 'git restore --staged <file>', description: 'Bỏ file khỏi staging nhưng giữ nội dung đã sửa.' },
      { command: 'git commit --amend', description: 'Sửa commit gần nhất trước khi push.' },
      { command: 'git revert <commit>', description: 'Tạo commit mới đảo ngược một commit cũ; phù hợp với branch đã chia sẻ.' },
      { command: 'git stash push -m "wip"', description: 'Cất tạm thay đổi chưa hoàn tất.' },
      { command: 'git stash pop', description: 'Áp dụng lại thay đổi được stash gần nhất.' },
    ],
  },
];

const tableOfContents = [
  { href: '#linux', label: 'Linux commands' },
  ...linuxSections.map((section) => ({ href: `#${section.id}`, label: section.title })),
  { href: '#git', label: 'Git commands' },
  ...gitSections.map((section) => ({ href: `#${section.id}`, label: section.title })),
  { href: '#workflow', label: 'Workflow gợi ý' },
  { href: '#references', label: 'Tài liệu tham khảo' },
];

export default function LinuxGitCheatsheet() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[230px_minmax(0,760px)_1fr] lg:py-14">
        <aside className="hidden lg:block">
          <nav className="sticky top-24 border-l border-border pl-5" aria-label="Mục lục bài viết">
            <p className="mb-4 text-xs font-extrabold uppercase tracking-[0.13em] text-ink">Trong bài này</p>
            <ol className="space-y-1.5">
              {tableOfContents.map((item, index) => (
                <li key={item.href}>
                  <a
                    className={`block py-1 text-sm leading-5 transition-colors hover:text-primary ${index === 0 || item.href === '#git' ? 'font-bold text-ink' : 'text-muted-foreground'}`}
                    href={item.href}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </aside>

        <article className="min-w-0">
          <div className="mb-10 rounded-2xl border border-primary/15 bg-primary-soft p-5 sm:p-6">
            <div className="flex gap-3">
              <Info className="mt-0.5 shrink-0 text-primary" size={20} />
              <div>
                <p className="font-bold text-ink">Cách dùng cheatsheet</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Đừng cố học thuộc tất cả. Hãy nhớ nhóm lệnh, dùng <code className="inline-code">--help</code> hoặc <code className="inline-code">man &lt;command&gt;</code> khi cần, và luôn đọc lại câu lệnh trước khi nhấn Enter trên production.
                </p>
              </div>
            </div>
          </div>

          <section id="linux" className="scroll-mt-24">
            <div className="article-section-title">
              <span className="section-number">01</span>
              <div>
                <p className="section-eyebrow">Làm việc trên server</p>
                <h2>Linux commands</h2>
              </div>
            </div>
            <p className="article-lead">
              Linux xuất hiện ở hầu hết server, container và môi trường CI. Mục tiêu đầu tiên không phải biết thật nhiều lệnh, mà là có một quy trình quan sát hệ thống rõ ràng.
            </p>

            {linuxSections.map((section) => (
              <CommandSection key={section.id} {...section} />
            ))}

            <div className="my-10 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950">
              <TriangleAlert className="mt-0.5 shrink-0 text-amber-600" size={20} />
              <div>
                <p className="font-bold">Cẩn thận với quyền và lệnh xóa</p>
                <p className="mt-1 text-sm leading-6 text-amber-900/80">
                  Không dùng <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono">chmod -R 777</code> như một cách sửa lỗi permission. Với lệnh xóa đệ quy, hãy kiểm tra đường dẫn bằng <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono">pwd</code> và <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono">ls</code> trước.
                </p>
              </div>
            </div>
          </section>

          <section id="git" className="scroll-mt-24 pt-12">
            <div className="article-section-title">
              <span className="section-number">02</span>
              <div>
                <p className="section-eyebrow">Làm việc với source code</p>
                <h2>Git commands</h2>
              </div>
            </div>
            <p className="article-lead">
              Git dễ hơn khi hình dung ba vùng: working tree là nơi đang sửa, staging area là nội dung chuẩn bị commit, và repository là lịch sử đã lưu.
            </p>

            <div className="my-8 grid gap-3 sm:grid-cols-3">
              {[
                ['01', 'Working tree', 'Bạn đang sửa file'],
                ['02', 'Staging area', 'Bạn chọn nội dung sẽ lưu'],
                ['03', 'Repository', 'Commit trở thành lịch sử'],
              ].map(([number, title, description]) => (
                <div className="relative rounded-xl border border-border bg-surface p-4" key={title}>
                  <span className="font-mono text-xs font-bold text-primary">{number}</span>
                  <p className="mt-2 font-bold text-ink">{title}</p>
                  <p className="mt-1 text-sm leading-5 text-muted-foreground">{description}</p>
                  {number !== '03' && <ChevronRight className="absolute -right-2.5 top-1/2 hidden -translate-y-1/2 rounded-full bg-white text-primary sm:block" size={20} />}
                </div>
              ))}
            </div>

            {gitSections.map((section) => (
              <CommandSection key={section.id} {...section} />
            ))}
          </section>

          <section id="workflow" className="scroll-mt-24 pt-12">
            <p className="section-eyebrow">Thói quen nên giữ</p>
            <h2 className="article-h2">Workflow Git gợi ý</h2>
            <div className="mt-6 overflow-hidden rounded-2xl border border-code-border bg-code text-code-foreground">
              <div className="flex h-11 items-center justify-between border-b border-white/10 px-4">
                <div className="flex gap-1.5" aria-hidden="true">
                  <span className="size-2.5 rounded-full bg-[#ff6b6b]" />
                  <span className="size-2.5 rounded-full bg-[#ffd166]" />
                  <span className="size-2.5 rounded-full bg-[#63d7a4]" />
                </div>
                <span className="font-mono text-[11px] text-white/45">một thay đổi nhỏ, một commit rõ ràng</span>
                <GitBranch size={15} className="text-white/35" />
              </div>
              <pre className="overflow-x-auto p-5 font-mono text-sm leading-7 sm:p-6"><code>{`git switch -c docs/linux-cheatsheet
git status -sb
git diff
git add -p
git diff --staged
git commit -m "docs: add Linux and Git cheatsheet"
git push -u origin docs/linux-cheatsheet`}</code></pre>
            </div>
          </section>

          <section id="references" className="scroll-mt-24 border-t border-border pt-10 mt-14">
            <p className="section-eyebrow">Đọc thêm</p>
            <h2 className="article-h2">Tài liệu tham khảo</h2>
            <ul className="mt-5 space-y-3 text-sm">
              <ReferenceLink href="https://vietnix.vn/lenh-linux-cho-devops/" label="Vietnix — Bảng cheatsheet lệnh Linux cho DevOps" />
              <ReferenceLink href="https://man7.org/linux/man-pages/" label="Linux man-pages — tài liệu tham chiếu các lệnh Linux" />
              <ReferenceLink href="https://git-scm.com/docs" label="Git Reference — tài liệu chính thức của Git" />
              <ReferenceLink href="https://git-scm.com/cheat-sheet.pdf" label="Git Cheat Sheet — bản tóm tắt chính thức" />
            </ul>
          </section>
        </article>

        <aside className="hidden xl:block">
          <div className="sticky top-24 rounded-2xl border border-border bg-surface p-5">
            <p className="text-xs font-extrabold uppercase tracking-[0.13em] text-primary">Ghi chú cá nhân</p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Đây là những lệnh mình thấy hữu ích trong quá trình học và thực tập, không phải danh sách đầy đủ của Linux hay Git.
            </p>
            <div className="mt-5 border-t border-border pt-4">
              <p className="text-sm font-bold text-ink">Tiến Đạt</p>
              <p className="mt-1 text-xs text-muted-foreground">DevOps Intern · DevOpags</p>
            </div>
          </div>
        </aside>
      </div>

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

function CommandSection({ id, title, description, commands }: { id: string; title: string; description: string; commands: Command[] }) {
  return (
    <section id={id} className="scroll-mt-24 pt-10">
      <h3 className="text-xl font-bold tracking-[-0.025em] text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
      <div className="mt-5 overflow-hidden rounded-xl border border-border">
        {commands.map((item) => (
          <div className="command-row grid gap-2 border-b border-border bg-white p-4 last:border-b-0 sm:grid-cols-[minmax(220px,0.9fr)_1.1fr] sm:gap-5 sm:px-5" key={item.command}>
            <code className="command-code">{item.command}</code>
            <div>
              <p className="text-sm leading-6 text-foreground">{item.description}</p>
              {item.note && <p className="mt-1 text-xs font-semibold leading-5 text-amber-700">Lưu ý: {item.note}</p>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ReferenceLink({ href, label }: { href: string; label: string }) {
  return (
    <li>
      <a className="inline-flex items-start gap-2 font-semibold text-primary hover:text-primary-dark hover:underline" href={href} target="_blank" rel="noreferrer">
        <ExternalLink className="mt-0.5 shrink-0" size={15} /> {label}
      </a>
    </li>
  );
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link className="group flex items-center gap-3" href="/" aria-label="DevOpags - Trang chủ">
          <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-[0_8px_24px_-10px_rgba(123,44,191,0.8)] transition-transform group-hover:-rotate-3">
            <Terminal size={19} strokeWidth={2.2} />
          </span>
          <span className="text-[1.05rem] font-bold tracking-[-0.025em]">DevOp<span className="text-primary">ags</span></span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex" aria-label="Điều hướng chính">
          <Link className="transition-colors hover:text-primary" href="/#lo-trinh">Lộ trình</Link>
          <Link className="text-primary" href="/#bai-viet" aria-current="page">Bài viết</Link>
          <Link className="transition-colors hover:text-primary" href="/#gioi-thieu">Về mình</Link>
        </nav>
        <div className="flex items-center gap-2">
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
          <details className="relative md:hidden">
            <summary className="grid size-9 cursor-pointer list-none place-items-center rounded-lg border border-border bg-white [&::-webkit-details-marker]:hidden" aria-label="Mở menu"><Menu size={18} /></summary>
            <nav className="absolute right-0 top-12 flex w-44 flex-col gap-1 rounded-xl border border-border bg-white p-2 text-sm font-medium shadow-xl" aria-label="Điều hướng di động">
              <Link className="rounded-lg px-3 py-2 hover:bg-accent" href="/#lo-trinh">Lộ trình</Link>
              <Link className="rounded-lg bg-primary-soft px-3 py-2 text-primary" href="/#bai-viet">Bài viết</Link>
              <Link className="rounded-lg px-3 py-2 hover:bg-accent" href="/#gioi-thieu">Về mình</Link>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
