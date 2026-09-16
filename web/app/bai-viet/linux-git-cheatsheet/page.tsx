import type { Metadata } from 'next';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { ArticleToc } from '@/components/article-shell';
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
  usage?: string;
  example?: string;
  note?: string;
};

const linuxSections: { id: string; title: string; description: string; commands: Command[] }[] = [
  {
    id: 'linux-basics',
    title: 'Bắt đầu trong terminal',
    description: 'Xác định mình đang đứng ở đâu và đang đăng nhập bằng tài khoản nào.',
    commands: [
      {
        command: 'pwd',
        description: 'Hiển thị đường dẫn đầy đủ của thư mục hiện tại. Dùng lệnh này trước khi sao chép, di chuyển hoặc xóa file để tránh thao tác nhầm chỗ.',
        usage: 'pwd',
        example: '$ pwd\n/home/tiendat/projects/devopags',
      },
      {
        command: 'whoami',
        description: 'Hiển thị tên user đang chạy terminal. Hữu ích khi cần kiểm tra mình đang dùng tài khoản thường hay tài khoản có quyền quản trị.',
        usage: 'whoami',
        example: '$ whoami\ntiendat',
      },
    ],
  },
  {
    id: 'linux-files',
    title: 'Hệ thống file',
    description: 'Các thao tác cơ bản để di chuyển, xem, tạo, sao chép và xóa file hoặc thư mục.',
    commands: [
      {
        command: 'cd',
        description: 'Chuyển sang một thư mục khác. Dùng đường dẫn tuyệt đối như /var/log hoặc đường dẫn tương đối như ../ để quay lên thư mục cha.',
        usage: 'cd <đường-dẫn>',
        example: '$ cd /var/log',
      },
      {
        command: 'ls',
        description: 'Liệt kê nội dung thư mục. Tùy chọn -l hiện thông tin chi tiết, -a hiện file ẩn và -h giúp kích thước file dễ đọc.',
        usage: 'ls [tùy-chọn] [đường-dẫn]',
        example: '$ ls -lah /var/log',
      },
      {
        command: 'mkdir',
        description: 'Tạo thư mục mới. Thêm -p để tự tạo cả các thư mục cha còn thiếu.',
        usage: 'mkdir [tùy-chọn] <tên-thư-mục>',
        example: '$ mkdir -p app/config',
      },
      {
        command: 'touch',
        description: 'Tạo nhanh một file rỗng. Nếu file đã tồn tại, lệnh chỉ cập nhật thời gian chỉnh sửa gần nhất.',
        usage: 'touch <tên-file>',
        example: '$ touch .env.example',
      },
      {
        command: 'rm',
        description: 'Xóa file hoặc thư mục. Dùng -i để hệ thống hỏi lại trước khi xóa; chỉ dùng -r khi thực sự cần xóa cả thư mục.',
        usage: 'rm [tùy-chọn] <file-hoặc-thư-mục>',
        example: '$ rm -i old.log',
        note: 'File đã xóa bằng rm thường không nằm trong thùng rác. Luôn kiểm tra pwd và ls trước khi chạy.',
      },
      {
        command: 'cp',
        description: 'Sao chép file từ nơi này sang nơi khác. Thêm -r khi cần sao chép cả thư mục và nội dung bên trong.',
        usage: 'cp [tùy-chọn] <nguồn> <đích>',
        example: '$ cp -r config/ backup/config/',
      },
      {
        command: 'mv',
        description: 'Di chuyển file hoặc thư mục. Nếu nguồn và đích cùng vị trí, mv được dùng để đổi tên.',
        usage: 'mv <nguồn> <đích>',
        example: '$ mv nginx-old.conf nginx.conf',
      },
    ],
  },
  {
    id: 'linux-content',
    title: 'Nội dung file và lịch sử lệnh',
    description: 'Ghi nội dung đơn giản, đọc file và theo dõi log mà không cần công cụ phức tạp.',
    commands: [
      {
        command: 'echo',
        description: 'In một chuỗi ra terminal. Lệnh thường được dùng để kiểm tra biến hoặc ghi một thông báo đơn giản trong script.',
        usage: 'echo <nội-dung>',
        example: '$ echo "Deploy completed"\nDeploy completed',
      },
      {
        command: 'cat',
        description: 'Đọc toàn bộ nội dung của file ngay trên terminal. Phù hợp với file cấu hình hoặc file text ngắn.',
        usage: 'cat <tên-file>',
        example: '$ cat /etc/os-release',
      },
      {
        command: 'history',
        description: 'Hiển thị các lệnh đã chạy trước đó trong terminal, giúp tìm và sử dụng lại câu lệnh cũ.',
        usage: 'history',
        example: '$ history\n  41  pwd\n  42  ls -lah',
      },
      {
        command: 'tail',
        description: 'Xem những dòng cuối của file. Tùy chọn -f tiếp tục chờ và hiển thị dòng mới, rất hữu ích khi theo dõi log.',
        usage: 'tail [tùy-chọn] <tên-file>',
        example: '$ tail -f /var/log/nginx/access.log',
        note: 'Nhấn Ctrl+C để dừng chế độ theo dõi.',
      },
    ],
  },
  {
    id: 'linux-system',
    title: 'Quyền, tài nguyên và tiến trình',
    description: 'Kiểm tra quyền quản trị, RAM, ổ đĩa và các tiến trình đang chạy trên server.',
    commands: [
      {
        command: 'sudo',
        description: 'Chạy một lệnh với quyền quản trị. Chỉ thêm sudo khi thao tác thật sự yêu cầu quyền cao hơn.',
        usage: 'sudo <lệnh>',
        example: '$ sudo apt update',
        note: 'Đọc kỹ câu lệnh trước khi nhập mật khẩu, đặc biệt trên máy production.',
      },
      {
        command: 'free',
        description: 'Xem tổng dung lượng RAM, lượng đang dùng, còn trống và swap. Tùy chọn -h hiển thị theo MB hoặc GB dễ đọc.',
        usage: 'free [tùy-chọn]',
        example: '$ free -h',
      },
      {
        command: 'df',
        description: 'Xem dung lượng đã dùng và còn trống của các filesystem. Đây là lệnh nên kiểm tra khi server báo hết ổ đĩa.',
        usage: 'df [tùy-chọn]',
        example: '$ df -h',
      },
      {
        command: 'top',
        description: 'Theo dõi CPU, RAM và các tiến trình theo thời gian thực. Danh sách được cập nhật liên tục ngay trong terminal.',
        usage: 'top',
        example: '$ top',
        note: 'Nhấn q để thoát.',
      },
      {
        command: 'hostnamectl',
        description: 'Xem hostname, hệ điều hành, kernel và kiến trúc của máy Linux dùng systemd.',
        usage: 'hostnamectl [lệnh-con]',
        example: '$ hostnamectl status',
      },
      {
        command: 'reboot',
        description: 'Khởi động lại hệ thống. Trên server, lệnh thường cần sudo và sẽ ngắt toàn bộ phiên kết nối hiện tại.',
        usage: 'sudo reboot',
        example: '$ sudo reboot',
        note: 'Chỉ chạy sau khi đã kiểm tra dịch vụ và thông báo cho người liên quan.',
      },
      {
        command: 'ps',
        description: 'Liệt kê các tiến trình. Cách dùng ps aux cho biết user, PID, CPU, RAM và câu lệnh của từng tiến trình.',
        usage: 'ps [tùy-chọn]',
        example: '$ ps aux',
      },
    ],
  },
  {
    id: 'linux-network-packages',
    title: 'Mạng và cài đặt package',
    description: 'Những lệnh đủ dùng để kiểm tra kết nối, port và cài phần mềm trên Ubuntu hoặc Debian.',
    commands: [
      {
        command: 'netstat',
        description: 'Xem kết nối mạng và các port đang lắng nghe. Tùy chọn -tulpn hiển thị TCP, UDP, port và tiến trình liên quan.',
        usage: 'netstat [tùy-chọn]',
        example: '$ sudo netstat -tulpn',
        note: 'Một số bản Linux không cài sẵn netstat; có thể cài bằng sudo apt install net-tools.',
      },
      {
        command: 'ping',
        description: 'Gửi gói tin đến một IP hoặc tên miền để kiểm tra máy đích có phản hồi và đo độ trễ cơ bản.',
        usage: 'ping [tùy-chọn] <host>',
        example: '$ ping -c 4 8.8.8.8',
      },
      {
        command: 'telnet',
        description: 'Thử mở kết nối TCP đến một host và port, thường dùng để kiểm tra nhanh một dịch vụ có nhận kết nối hay không.',
        usage: 'telnet <host> <port>',
        example: '$ telnet example.com 80',
        note: 'Không dùng Telnet để đăng nhập từ xa vì dữ liệu không được mã hóa.',
      },
      {
        command: 'traceroute',
        description: 'Hiển thị các chặng mạng mà gói tin đi qua để tới máy đích, hữu ích khi tìm vị trí kết nối bị chậm hoặc gián đoạn.',
        usage: 'traceroute <host>',
        example: '$ traceroute 8.8.8.8',
      },
      {
        command: 'apt',
        description: 'Quản lý package trên Ubuntu và Debian. Thường chạy update trước để cập nhật danh sách, sau đó dùng install để cài phần mềm.',
        usage: 'sudo apt <update|install|remove> [tên-package]',
        example: '$ sudo apt update\n$ sudo apt install nginx',
      },
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
  {
    label: 'Chương 1 — Linux commands',
    items: [
      { href: '#linux', label: 'Linux commands', active: true },
      ...linuxSections.map((section) => ({ href: `#${section.id}`, label: section.title })),
    ],
  },
  {
    label: 'Chương 2 — Git commands',
    items: [
      { href: '#git', label: 'Git commands' },
      ...gitSections.map((section) => ({ href: `#${section.id}`, label: section.title })),
    ],
  },
  {
    label: 'Thực hành và đọc thêm',
    items: [
      { href: '#workflow', label: 'Workflow Git gợi ý' },
      { href: '#references', label: 'Tài liệu tham khảo' },
    ],
  },
];

export default function LinuxGitCheatsheet() {
  return (
    <main className="article-reading-bg min-h-screen text-foreground transition-colors duration-300">
      <SiteHeader />

      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[230px_minmax(0,820px)] lg:justify-center lg:py-14">
        <aside className="hidden lg:block">
          <ArticleToc groups={tableOfContents} />
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
              Linux xuất hiện ở hầu hết server, container và môi trường CI. Với người mới, 25 lệnh nền tảng dưới đây đã đủ để di chuyển trong terminal, đọc log, kiểm tra tài nguyên và xử lý các tình huống thường gặp.
            </p>

            {linuxSections.map((section) => (
              <CommandSection key={section.id} {...section} />
            ))}

            <div className="my-10 overflow-hidden rounded-2xl border border-[#6f32a8] bg-[#100b18] p-5 text-white shadow-[0_24px_70px_-45px_rgba(111,50,168,0.9)] sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-6">
              <div>
                <p className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-[#c77dff]">Đọc xong thì thử ngay</p>
                <h3 className="mt-2 text-xl font-bold">Thực hành trong Linux Playground</h3>
                <p className="mt-2 max-w-xl text-sm leading-6 text-[#c9c1d4]">Gõ các lệnh vừa học trong terminal và filesystem mô phỏng, không ảnh hưởng đến máy thật.</p>
              </div>
              <Link className="mt-5 inline-flex shrink-0 items-center gap-2 rounded-lg border border-[#9d4edd] bg-[#7b2cbf] px-4 py-2.5 text-sm font-bold text-white transition hover:border-[#c77dff] hover:bg-[#8f3bd1] sm:mt-0" href="/playground">
                <Terminal size={16} /> Mở Playground
              </Link>
            </div>

            <div className="my-10 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950">
              <TriangleAlert className="mt-0.5 shrink-0 text-amber-600" size={20} />
              <div>
                <p className="font-bold">Dừng một nhịp trước lệnh có ảnh hưởng lớn</p>
                <p className="mt-1 text-sm leading-6 text-amber-900/80">
                  Trước khi dùng <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono">rm</code>, <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono">sudo</code> hoặc <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono">reboot</code>, hãy kiểm tra lại máy đang thao tác, đường dẫn hiện tại và ảnh hưởng đến người dùng.
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
                  {number !== '03' && <ChevronRight className="absolute -right-2.5 top-1/2 hidden -translate-y-1/2 rounded-full bg-card text-primary sm:block" size={20} />}
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

      </div>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="flex items-center gap-2 font-bold text-ink"><Terminal size={16} className="text-primary" /> DevOpags</div>
          <p>Học đến đâu, thực hành và giải thích lại đến đó.</p>
          <a className="inline-flex items-center gap-2 font-semibold hover:text-primary" href="https://github.com/tiendat13ns" target="_blank" rel="noreferrer">
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
          <div className="command-row grid gap-4 border-b border-border bg-card p-4 last:border-b-0 sm:grid-cols-[minmax(150px,0.32fr)_1fr] sm:gap-6 sm:px-5 sm:py-5" key={item.command}>
            <div>
              <code className="command-code text-base">{item.command}</code>
            </div>
            <div className="min-w-0">
              <p className="text-sm leading-6 text-foreground">{item.description}</p>
              {(item.usage || item.example) && (
                <div className="mt-3 grid gap-2">
                  {item.usage && (
                    <div className="grid gap-1 sm:grid-cols-[72px_minmax(0,1fr)] sm:items-start">
                      <span className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Cách dùng</span>
                      <code className="min-w-0 overflow-x-auto rounded-md border border-border bg-surface px-2.5 py-1.5 font-mono text-xs text-primary">{item.usage}</code>
                    </div>
                  )}
                  {item.example && (
                    <div className="grid gap-1 sm:grid-cols-[72px_minmax(0,1fr)] sm:items-start">
                      <span className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Ví dụ</span>
                      <code className="min-w-0 whitespace-pre overflow-x-auto rounded-md border border-code-border bg-code px-2.5 py-1.5 font-mono text-xs leading-5 text-code-foreground">{item.example}</code>
                    </div>
                  )}
                </div>
              )}
              {item.note && <p className="mt-2 text-xs font-semibold leading-5 text-amber-700">Lưu ý: {item.note}</p>}
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
