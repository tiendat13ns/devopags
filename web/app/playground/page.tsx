import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  BrainCircuit,
  ChartNoAxesCombined,
  GitBranch,
  Network,
  ScanSearch,
  Terminal,
} from 'lucide-react';
import { PrimaryHeader } from '@/components/primary-header';

export const metadata: Metadata = {
  title: 'Interactive Playground | tiendat13ns',
  description:
    'Thực hành DevOps và khám phá cách dữ liệu đi qua các mô hình AI bằng những mô phỏng tương tác.',
};

const conceptLinks = [
  {
    title: 'Convolution trong CNN',
    description: 'Di chuyển kernel trên ảnh và quan sát feature map.',
    href: '/bai-viet/kien-truc-cnn-la-gi',
    icon: ScanSearch,
  },
  {
    title: 'Trọng số Attention',
    description: 'Xem mỗi token tập trung vào những token nào.',
    href: '/bai-viet/co-che-attention',
    icon: Network,
  },
  {
    title: 'Đánh giá mô hình',
    description: 'Thay đổi threshold và đọc precision, recall, F1.',
    href: '/bai-viet/danh-gia-model-loss-accuracy-precision-recall-f1',
    icon: ChartNoAxesCombined,
  },
];

export default function PlaygroundPage() {
  return (
    <main className="article-reading-bg min-h-screen bg-background text-foreground transition-colors duration-300">
      <PrimaryHeader active="playground" />

      <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
        <section
          className="border-l-2 border-primary pl-5 sm:pl-7"
          aria-labelledby="playground-heading"
        >
          <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-primary">
            Interactive learning
          </p>
          <h1
            id="playground-heading"
            className="mt-2 text-3xl font-bold tracking-[-0.04em] text-ink sm:text-4xl"
          >
            Playground
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
            Thay đổi dữ liệu, chạy từng bước và quan sát hệ thống phản hồi. Mỗi
            lab tập trung vào một cơ chế đủ nhỏ để bạn có thể hiểu bằng mắt.
          </p>
        </section>

        <section
          className="mt-9 grid gap-5 lg:grid-cols-2 xl:grid-cols-3"
          aria-label="Các playground đang hoạt động"
        >
          <LabCard
            eyebrow="AI Lab · mới"
            title="CNN Digit Visualizer"
            description="Chọn một chữ số, chạy qua convolution, ReLU, pooling và quan sát feature map cùng xác suất dự đoán ở từng bước."
            href="/playground/ai/cnn"
            action="Mở CNN Visualizer"
            icon={<ScanSearch size={26} />}
            featured
          />
          <LabCard
            eyebrow="AI Lab"
            title="Neural Flow"
            description="Theo một mẫu dữ liệu từ giá trị thô, chuẩn hóa, hidden layer đến xác suất dự đoán. Có thể dừng ở từng neuron để xem phép tính."
            href="/playground/ai/neural-flow"
            action="Mở Neural Flow"
            icon={<BrainCircuit size={26} />}
          />
          <LabCard
            eyebrow="DevOps Lab"
            title="Linux & Git Sandbox"
            description="Thực hành command, filesystem, staging area, branch và commit history trong môi trường mô phỏng an toàn trên trình duyệt."
            href="/playground/linux"
            action="Mở DevOps Lab"
            icon={<Terminal size={26} />}
          />
        </section>

        <section className="mt-12" aria-labelledby="quick-experiments-heading">
          <div className="flex items-end justify-between gap-4 border-b border-border pb-3">
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                Trong bài viết
              </p>
              <h2
                id="quick-experiments-heading"
                className="mt-1 text-xl font-bold tracking-tight text-ink"
              >
                Thí nghiệm nhanh
              </h2>
            </div>
            <GitBranch
              className="text-muted-foreground"
              size={20}
              aria-hidden="true"
            />
          </div>

          <div className="grid divide-y divide-border border-b border-border md:grid-cols-3 md:divide-x md:divide-y-0">
            {conceptLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  className="group px-1 py-5 transition-colors hover:bg-accent/55 md:px-5"
                  href={item.href}
                  key={item.href}
                >
                  <div className="flex items-start gap-3">
                    <Icon
                      className="mt-0.5 shrink-0 text-primary"
                      size={19}
                      aria-hidden="true"
                    />
                    <div>
                      <h3 className="font-semibold text-ink group-hover:text-primary">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}

function LabCard({
  eyebrow,
  title,
  description,
  href,
  action,
  icon,
  featured = false,
}: {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  action: string;
  icon: React.ReactNode;
  featured?: boolean;
}) {
  return (
    <article
      className={`group flex min-h-[300px] flex-col border p-6 sm:p-7 ${featured ? 'border-primary/45 bg-primary-soft/35' : 'border-border bg-card/65'}`}
    >
      <div className="flex items-start justify-between gap-4">
        <span className="font-mono text-xs font-bold uppercase tracking-[0.12em] text-primary">
          {eyebrow}
        </span>
        <span
          className="grid size-12 place-items-center border border-primary/25 bg-background text-primary"
          aria-hidden="true"
        >
          {icon}
        </span>
      </div>
      <h2 className="mt-8 text-2xl font-bold tracking-tight text-ink">
        {title}
      </h2>
      <p className="mt-3 max-w-xl text-base leading-7 text-muted-foreground">
        {description}
      </p>
      <Link
        className="mt-auto inline-flex w-fit items-center gap-2 pt-7 text-sm font-bold text-primary transition-all group-hover:gap-3"
        href={href}
      >
        {action} <ArrowRight size={16} />
      </Link>
    </article>
  );
}
