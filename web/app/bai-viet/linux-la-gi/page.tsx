import type { Metadata } from 'next';
import { Boxes, CheckCircle2, Cloud, Container, Server, ShieldCheck, SquareTerminal } from 'lucide-react';
import { ArticleIntro, ArticleSection, ArticleShell, ReferenceLink } from '@/components/article-shell';

export const metadata: Metadata = {
  title: 'Linux là gì và tại sao Linux cần thiết cho DevOps? | DevOpags',
  description: 'Hiểu Linux từ kernel, distribution đến vai trò của Linux trong server, container, CI/CD và công việc DevOps hằng ngày.',
};

const toc = [
  { href: '#linux-la-gi', label: 'Linux là gì?' },
  { href: '#kernel-va-distro', label: 'Kernel và distribution' },
  { href: '#vi-sao-devops-can-linux', label: 'Vì sao DevOps cần Linux?' },
  { href: '#linux-xuat-hien-o-dau', label: 'Linux xuất hiện ở đâu?' },
  { href: '#tu-duy-khi-hoc-linux', label: 'Tư duy khi học Linux' },
  { href: '#bat-dau-tu-dau', label: 'Bắt đầu từ đâu?' },
  { href: '#references', label: 'Tài liệu tham khảo' },
];

export default function WhatIsLinuxPage() {
  return (
    <ArticleShell toc={toc}>
      <ArticleIntro
        eyebrow="Nền tảng DevOps"
        title="Linux là gì và tại sao Linux cần thiết cho DevOps?"
        description="Linux không chỉ là một màn hình terminal. Đó là nền tảng vận hành phần lớn server, container và công cụ tự động hóa mà một DevOps Engineer làm việc cùng mỗi ngày."
        readTime="9 phút đọc"
        tags={['Linux', 'DevOps', 'Cơ bản']}
      />

      <div className="mb-2 flex gap-3 rounded-2xl border border-primary/15 bg-primary-soft p-5 sm:p-6">
        <SquareTerminal className="mt-0.5 shrink-0 text-primary" size={21} />
        <p className="text-sm leading-6 text-muted-foreground">
          Nếu mới bắt đầu, bạn chưa cần thuộc hàng trăm câu lệnh. Điều quan trọng hơn là hiểu Linux quản lý file, tiến trình, quyền, network và service như thế nào.
        </p>
      </div>

      <ArticleSection id="linux-la-gi" number="01" eyebrow="Khái niệm" title="Linux là gì?">
        <p>
          Nói chính xác, Linux là <strong className="text-ink">kernel</strong> — phần lõi đứng giữa phần cứng và các chương trình. Kernel quản lý CPU, bộ nhớ, thiết bị, filesystem, network và tiến trình đang chạy.
        </p>
        <p>
          Trong giao tiếp hằng ngày, mọi người thường dùng “Linux” để chỉ một hệ điều hành hoàn chỉnh như Ubuntu, Debian, Fedora hay Rocky Linux. Những hệ thống này ghép Linux kernel với shell, thư viện, trình quản lý package và nhiều công cụ khác.
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ['Ứng dụng', 'Nginx, PostgreSQL, Docker, agent giám sát'],
            ['Không gian người dùng', 'Shell, systemd, package manager, thư viện'],
            ['Linux kernel', 'Tiến trình, bộ nhớ, network, thiết bị'],
          ].map(([title, description], index) => (
            <div className="rounded-xl border border-border bg-card p-4" key={title}>
              <span className="font-mono text-xs font-bold text-primary">0{index + 1}</span>
              <h3 className="mt-2 font-bold text-ink">{title}</h3>
              <p className="mt-1 text-sm leading-6">{description}</p>
            </div>
          ))}
        </div>
      </ArticleSection>

      <ArticleSection id="kernel-va-distro" number="02" eyebrow="Phân biệt" title="Kernel và distribution khác nhau thế nào?">
        <p>
          Kernel giống như động cơ. Một <strong className="text-ink">Linux distribution</strong> (distro) là chiếc xe hoàn chỉnh: có động cơ, bảng điều khiển, công cụ và cách cài phần mềm riêng.
        </p>
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          {[
            ['Ubuntu / Debian', 'Dùng apt; phổ biến cho server, cloud và người mới học.'],
            ['RHEL / Rocky / AlmaLinux', 'Dùng dnf; thường gặp trong hệ thống doanh nghiệp.'],
            ['Alpine Linux', 'Nhỏ gọn; xuất hiện nhiều trong container image.'],
          ].map(([name, note]) => (
            <div className="grid gap-1 border-b border-border p-4 last:border-b-0 sm:grid-cols-[180px_1fr] sm:gap-5" key={name}>
              <strong className="text-ink">{name}</strong>
              <span>{note}</span>
            </div>
          ))}
        </div>
        <p>
          Các distro có thể khác lệnh cài package hoặc vị trí một vài file cấu hình, nhưng những khái niệm cốt lõi như user, permission, process, signal, port và filesystem vẫn đi cùng bạn từ hệ thống này sang hệ thống khác.
        </p>
      </ArticleSection>

      <ArticleSection id="vi-sao-devops-can-linux" number="03" eyebrow="Trong công việc" title="Vì sao DevOps cần Linux?">
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { icon: Server, title: 'Phần lớn server chạy Linux', text: 'Khi ứng dụng gặp sự cố, bạn cần đăng nhập máy chủ, đọc log, kiểm tra tài nguyên và service.' },
            { icon: Container, title: 'Container dựa nhiều vào Linux', text: 'Namespace, cgroup và filesystem của Linux là nền móng quan trọng phía dưới container.' },
            { icon: Cloud, title: 'Cloud xoay quanh Linux', text: 'Máy ảo, image, Kubernetes node và nhiều dịch vụ cloud sử dụng Linux làm hệ điều hành nền.' },
            { icon: ShieldCheck, title: 'Bảo mật bắt đầu từ hệ điều hành', text: 'User, group, permission, SSH, firewall và cập nhật package đều là kiến thức vận hành cơ bản.' },
          ].map(({ icon: Icon, title, text }) => (
            <div className="rounded-xl border border-border bg-card p-5" key={title}>
              <Icon className="text-primary" size={21} />
              <h3 className="mt-3 font-bold text-ink">{title}</h3>
              <p className="mt-2 text-sm leading-6">{text}</p>
            </div>
          ))}
        </div>
        <p>
          Bạn không cần trở thành Linux administrator trước khi học DevOps. Nhưng nếu không hiểu hệ điều hành bên dưới, việc dùng Docker, Kubernetes hay CI/CD rất dễ trở thành học thuộc lệnh mà không biết nên kiểm tra gì khi có lỗi.
        </p>
      </ArticleSection>

      <ArticleSection id="linux-xuat-hien-o-dau" number="04" eyebrow="Bức tranh tổng thể" title="Linux xuất hiện ở đâu trong một quy trình DevOps?">
        <div className="grid gap-3 sm:grid-cols-4">
          {[
            ['Code', 'Shell script'],
            ['Build', 'CI runner'],
            ['Deploy', 'Container / VM'],
            ['Operate', 'Log & monitoring'],
          ].map(([step, detail], index) => (
            <div className="rounded-xl border border-border bg-surface p-4" key={step}>
              <span className="font-mono text-xs font-bold text-primary">{index + 1}</span>
              <h3 className="mt-2 font-bold text-ink">{step}</h3>
              <p className="mt-1 text-sm">{detail}</p>
            </div>
          ))}
        </div>
        <p>
          Một pipeline có thể chạy script trên Linux; build image chứa user space Linux; triển khai lên một Linux VM; rồi dùng các công cụ Linux để kiểm tra port, process và log. Linux không phải một bước riêng — nó là lớp nền xuyên suốt quy trình.
        </p>
      </ArticleSection>

      <ArticleSection id="tu-duy-khi-hoc-linux" number="05" eyebrow="Mental model" title="Học Linux theo tình huống, không theo danh sách lệnh">
        <p>Mỗi khi thao tác, hãy tự đặt một câu hỏi vận hành cụ thể:</p>
        <div className="overflow-hidden rounded-xl border border-code-border bg-code text-code-foreground">
          <div className="border-b border-white/10 px-5 py-3 font-mono text-xs text-white/50">một vòng kiểm tra cơ bản</div>
          <pre className="overflow-x-auto p-5 font-mono text-sm leading-7"><code>{'whoami                 # Mình đang là user nào?\npwd && ls -lah         # Mình đang ở đâu, có file gì?\nps aux                  # Tiến trình nào đang chạy?\nss -tulpn               # Port nào đang lắng nghe?\nsystemctl status nginx # Service có khỏe không?\njournalctl -u nginx    # Log nói điều gì?'}</code></pre>
        </div>
        <p>
          Cách học này giúp bạn nối câu lệnh với mục đích. Khi gặp một server lạ, bạn có quy trình quan sát trước khi thay đổi hệ thống.
        </p>
      </ArticleSection>

      <ArticleSection id="bat-dau-tu-dau" number="06" eyebrow="Lộ trình nhỏ" title="Bắt đầu từ đâu?">
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            'Làm quen terminal, đường dẫn và filesystem.',
            'Hiểu user, group và quyền rwx.',
            'Quan sát process, signal và tài nguyên.',
            'Kiểm tra DNS, port và kết nối HTTP.',
            'Quản lý service và đọc journal log.',
            'Viết shell script nhỏ để tự động hóa.',
          ].map((item) => (
            <div className="flex gap-3 rounded-xl border border-border bg-card p-4" key={item}>
              <CheckCircle2 className="mt-0.5 shrink-0 text-primary" size={18} />
              <span className="text-sm leading-6">{item}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-3 rounded-2xl border border-primary/15 bg-primary-soft p-5">
          <Boxes className="mt-0.5 shrink-0 text-primary" size={20} />
          <p className="text-sm leading-6">
            Không có máy Linux riêng cũng không sao. Bạn có thể dùng WSL, một máy ảo nhỏ hoặc mở shell trong container để tạo môi trường thực hành an toàn.
          </p>
        </div>
      </ArticleSection>

      <section id="references" className="mt-14 scroll-mt-24 border-t border-border pt-10">
        <p className="section-eyebrow">Đọc thêm</p>
        <h2 className="article-h2">Tài liệu tham khảo</h2>
        <ul className="mt-5 space-y-3 text-sm">
          <ReferenceLink href="https://www.kernel.org/linux.html" label="Kernel.org — Linux là gì và sự khác nhau giữa kernel với distribution" />
          <ReferenceLink href="https://kkloudtarus.net/en/blog/series/linux-from-basics-to-proficiency" label="KKloud Tarus — Linux From Basics to Proficiency" />
          <ReferenceLink href="https://ubuntu.com/server/docs" label="Ubuntu Server documentation — tài liệu vận hành server" />
        </ul>
      </section>
    </ArticleShell>
  );
}
