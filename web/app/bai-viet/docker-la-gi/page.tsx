import type { Metadata } from 'next';
import { Box, Boxes, CheckCircle2, Container, Layers3, PackageOpen, RefreshCcw, ShipWheel } from 'lucide-react';
import { ArticleIntro, ArticleSection, ArticleShell, ReferenceLink } from '@/components/article-shell';

export const metadata: Metadata = {
  title: 'Docker là gì và tại sao nên dùng Docker? | DevOpags',
  description: 'Giải thích Docker, image, container, registry và lý do container giúp quy trình phát triển, kiểm thử, CI/CD và triển khai nhất quán hơn.',
};

const toc = [
  {
    label: 'Tổng quan',
    items: [
      { href: '#van-de-docker-giai-quyet', label: 'Docker giải quyết vấn đề gì?', active: true },
      { href: '#docker-la-gi', label: 'Docker là gì?' },
    ],
  },
  {
    label: 'Chương 1 — Container dễ hiểu',
    items: [
      { href: '#khai-niem-cot-loi', label: 'Các khái niệm cốt lõi' },
      { href: '#container-va-vm', label: 'Container khác máy ảo như thế nào?' },
    ],
  },
  {
    label: 'Chương 2 — Docker trong DevOps',
    items: [
      { href: '#vi-sao-devops-dung-docker', label: 'Vì sao DevOps dùng Docker?' },
      { href: '#vong-doi', label: 'Vòng đời một ứng dụng với Docker' },
      { href: '#docker-khong-phai', label: 'Docker không phải là gì?' },
      { href: '#bat-dau', label: 'Bắt đầu thực hành' },
    ],
  },
  {
    label: 'Đọc thêm',
    items: [{ href: '#references', label: 'Tài liệu tham khảo' }],
  },
];

export default function WhatIsDockerPage() {
  return (
    <ArticleShell toc={toc} theme="docker">
      <ArticleIntro
        eyebrow="Container cơ bản"
        title="Docker là gì và tại sao nên dùng Docker?"
        description="Docker đóng gói ứng dụng cùng môi trường cần thiết thành một đơn vị có thể build, chia sẻ và chạy nhất quán. Đây là cách thực tế để thu hẹp khoảng cách giữa máy cá nhân, CI và production."
        readTime="10 phút đọc"
        tags={['Docker', 'Container', 'DevOps']}
      />

      <div className="mb-2 flex gap-3 rounded-2xl border border-primary/15 bg-primary-soft p-5 sm:p-6">
        <Container className="mt-0.5 shrink-0 text-primary" size={21} />
        <p className="text-sm leading-6 text-muted-foreground">
          Câu ngắn gọn nhất: Docker giúp biến “chạy được trên máy tôi” thành một môi trường có thể mô tả bằng code và tái tạo ở nơi khác.
        </p>
      </div>

      <ArticleSection id="van-de-docker-giai-quyet" number="01" eyebrow="Điểm xuất phát" title="Docker giải quyết vấn đề gì?">
        <p>
          Một ứng dụng hiếm khi chỉ có source code. Nó còn phụ thuộc vào phiên bản runtime, thư viện hệ thống, biến môi trường, file cấu hình và các dịch vụ đi kèm. Chỉ một khác biệt nhỏ cũng có thể làm ứng dụng chạy trên laptop nhưng lỗi ở CI hoặc server.
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ['Máy cá nhân', 'Node 22 · PostgreSQL 17'],
            ['CI runner', 'Node 20 · thiếu thư viện'],
            ['Production', 'Cấu hình và package khác'],
          ].map(([place, state], index) => (
            <div className="rounded-xl border border-border bg-card p-4" key={place}>
              <span className="font-mono text-xs font-bold text-primary">0{index + 1}</span>
              <h3 className="mt-2 font-bold text-ink">{place}</h3>
              <p className="mt-1 text-sm leading-6">{state}</p>
            </div>
          ))}
        </div>
        <p>
          Docker không tự sửa lỗi ứng dụng. Điều nó làm tốt là tạo ra một ranh giới rõ ràng: môi trường chạy được mô tả, đóng gói và kiểm soát phiên bản cùng với ứng dụng.
        </p>
      </ArticleSection>

      <ArticleSection id="docker-la-gi" number="02" eyebrow="Khái niệm" title="Docker là gì?">
        <p>
          Docker là một nền tảng để phát triển, đóng gói, phân phối và chạy ứng dụng trong <strong className="text-ink">container</strong>. Container là một tiến trình được cô lập, có filesystem, dependency và cấu hình cần thiết cho ứng dụng.
        </p>
        <p>
          Trên Linux, container chia sẻ kernel của máy chủ nhưng có không gian tiến trình, network và filesystem được tách biệt. Trên macOS và Windows, Docker Desktop thường cung cấp một Linux VM nhẹ ở phía dưới để chạy Linux container.
        </p>
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <div className="flex items-center gap-3 text-ink">
            <ShipWheel className="text-primary" size={22} />
            <h3 className="font-bold">Docker là công cụ; container là đơn vị chạy</h3>
          </div>
          <p className="mt-3 text-sm leading-6">
            Có thể hình dung Docker như bộ công cụ và runtime giúp bạn tạo image, khởi chạy container, nối network, gắn volume và quản lý vòng đời của chúng.
          </p>
        </div>
      </ArticleSection>

      <ArticleSection id="khai-niem-cot-loi" number="03" eyebrow="Bộ từ vựng" title="Bốn khái niệm cốt lõi">
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { icon: Layers3, title: 'Image', text: 'Mẫu chỉ đọc chứa filesystem và hướng dẫn cần thiết để tạo container.' },
            { icon: Box, title: 'Container', text: 'Một instance đang chạy của image, có trạng thái và lớp ghi riêng.' },
            { icon: PackageOpen, title: 'Registry', text: 'Nơi lưu và phân phối image, ví dụ Docker Hub hoặc registry nội bộ.' },
            { icon: Boxes, title: 'Dockerfile', text: 'File khai báo từng bước dùng để build image một cách lặp lại được.' },
          ].map(({ icon: Icon, title, text }) => (
            <div className="rounded-xl border border-border bg-card p-5" key={title}>
              <Icon className="text-primary" size={21} />
              <h3 className="mt-3 font-bold text-ink">{title}</h3>
              <p className="mt-2 text-sm leading-6">{text}</p>
            </div>
          ))}
        </div>
        <div className="overflow-hidden rounded-xl border border-code-border bg-code text-code-foreground">
          <div className="border-b border-white/10 px-5 py-3 font-mono text-xs text-white/50">Dockerfile tối giản</div>
          <pre className="overflow-x-auto p-5 font-mono text-sm leading-7"><code>{'FROM node:22-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci --omit=dev\nCOPY . .\nCMD ["node", "server.js"]'}</code></pre>
        </div>
      </ArticleSection>

      <ArticleSection id="container-va-vm" number="04" eyebrow="So sánh" title="Container khác máy ảo như thế nào?">
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="grid grid-cols-[120px_1fr_1fr] gap-3 border-b border-border bg-surface p-4 text-sm font-bold text-ink sm:grid-cols-[180px_1fr_1fr]">
            <span>Tiêu chí</span><span>Container</span><span>Máy ảo</span>
          </div>
          {[
            ['Kernel', 'Chia sẻ kernel host', 'Mỗi VM có kernel riêng'],
            ['Khởi động', 'Thường nhanh', 'Thường chậm hơn'],
            ['Kích thước', 'Nhẹ hơn', 'Chứa cả hệ điều hành'],
            ['Cách ly', 'Ở mức tiến trình', 'Ở mức phần cứng ảo hóa'],
          ].map(([criterion, container, vm]) => (
            <div className="grid grid-cols-[120px_1fr_1fr] gap-3 border-b border-border p-4 text-sm leading-6 last:border-b-0 sm:grid-cols-[180px_1fr_1fr]" key={criterion}>
              <strong className="text-ink">{criterion}</strong><span>{container}</span><span>{vm}</span>
            </div>
          ))}
        </div>
        <p>
          Container và VM không loại trừ nhau. Trong cloud, một VM Linux thường chạy nhiều container. VM cung cấp ranh giới hạ tầng; container giúp đóng gói và vận hành ứng dụng phía trên.
        </p>
      </ArticleSection>

      <ArticleSection id="vi-sao-devops-dung-docker" number="05" eyebrow="Giá trị thực tế" title="Vì sao Docker hữu ích cho DevOps?">
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            'Môi trường local, CI và production gần nhau hơn.',
            'Dependency được đóng gói thay vì cài thủ công trên server.',
            'Image có tag và digest, thuận tiện truy vết phiên bản.',
            'Build và test dễ tự động hóa trong pipeline.',
            'Container hỏng có thể thay thế bằng instance mới.',
            'Một máy có thể chạy nhiều dịch vụ được cô lập tương đối.',
          ].map((item) => (
            <div className="flex gap-3 rounded-xl border border-border bg-card p-4" key={item}>
              <CheckCircle2 className="mt-0.5 shrink-0 text-primary" size={18} />
              <span className="text-sm leading-6">{item}</span>
            </div>
          ))}
        </div>
        <p>
          Giá trị lớn nhất không nằm ở một lệnh <code className="inline-code">docker run</code>. Nó nằm ở việc môi trường chạy trở thành artifact có thể kiểm thử, lưu trong registry và triển khai lại một cách nhất quán.
        </p>
      </ArticleSection>

      <ArticleSection id="vong-doi" number="06" eyebrow="Từ code đến runtime" title="Vòng đời một ứng dụng với Docker">
        <div className="grid gap-3 sm:grid-cols-5">
          {['Dockerfile', 'Build image', 'Test', 'Push registry', 'Run container'].map((step, index) => (
            <div className="rounded-xl border border-border bg-surface p-4" key={step}>
              <span className="font-mono text-xs font-bold text-primary">{index + 1}</span>
              <h3 className="mt-2 text-sm font-bold leading-5 text-ink">{step}</h3>
            </div>
          ))}
        </div>
        <div className="overflow-hidden rounded-xl border border-code-border bg-code text-code-foreground">
          <div className="flex items-center gap-2 border-b border-white/10 px-5 py-3 font-mono text-xs text-white/50"><RefreshCcw size={14} /> build → run → inspect</div>
          <pre className="overflow-x-auto p-5 font-mono text-sm leading-7"><code>{'docker build -t my-app:1.0 .\ndocker run -d --name my-app -p 8080:8080 my-app:1.0\ndocker ps\ndocker logs -f my-app\ndocker stop my-app'}</code></pre>
        </div>
      </ArticleSection>

      <ArticleSection id="docker-khong-phai" number="07" eyebrow="Giới hạn" title="Docker không phải là gì?">
        <ul className="space-y-3">
          <li><strong className="text-ink">Không phải máy ảo thu nhỏ:</strong> container không mang theo một kernel riêng như VM.</li>
          <li><strong className="text-ink">Không tự động bảo mật ứng dụng:</strong> image vẫn cần được cập nhật, quét lỗ hổng và chạy với quyền tối thiểu.</li>
          <li><strong className="text-ink">Không thay Kubernetes:</strong> Docker giải quyết build và chạy container; orchestration nhiều máy là một bài toán khác.</li>
          <li><strong className="text-ink">Không làm dữ liệu tự bền vững:</strong> dữ liệu quan trọng cần volume hoặc dịch vụ lưu trữ phù hợp.</li>
        </ul>
      </ArticleSection>

      <ArticleSection id="bat-dau" number="08" eyebrow="Thực hành" title="Nên bắt đầu từ đâu?">
        <p>
          Hãy chọn một ứng dụng nhỏ bạn đã hiểu, viết Dockerfile, build image rồi chạy container. Sau đó quan sát log, port, biến môi trường và volume trước khi học Docker Compose.
        </p>
        <div className="rounded-2xl border border-primary/15 bg-primary-soft p-5 sm:p-6">
          <h3 className="font-bold text-ink">Mục tiêu đầu tiên</h3>
          <p className="mt-2 text-sm leading-6">
            Một người khác clone repository, chạy một câu lệnh và có đúng môi trường của bạn — không cần cài thủ công từng runtime hay dependency.
          </p>
        </div>
      </ArticleSection>

      <section id="references" className="mt-14 scroll-mt-24 border-t border-border pt-10">
        <p className="section-eyebrow">Nguồn và đọc thêm</p>
        <h2 className="article-h2">Tài liệu tham khảo</h2>
        <ul className="mt-5 space-y-3 text-sm">
          <ReferenceLink href="https://kkloudtarus.net/blog/what-docker-is-and-why-you-should-use-it" label="KKloud Tarus — What Docker Is and Why You Should Use It" />
          <ReferenceLink href="https://docs.docker.com/get-started/docker-overview/" label="Docker Docs — Docker overview" />
          <ReferenceLink href="https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-a-container/" label="Docker Docs — What is a container?" />
        </ul>
      </section>
    </ArticleShell>
  );
}
