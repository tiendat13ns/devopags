import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { CloudCostEstimator } from '@/components/cloud-cost-estimator';
import { PrimaryHeader } from '@/components/primary-header';

export const metadata: Metadata = {
  title: 'Cloud Cost Estimator: hóa đơn AWS đến từ đâu | tiendat13ns',
  description:
    'Ước tính chi phí hằng tháng của EC2, NAT Gateway, ALB, S3, RDS và truyền dữ liệu, xem hạng mục nào chiếm nhiều nhất và cách giảm.',
};

export default function CloudCostEstimatorPage() {
  return (
    <main className="article-reading-bg cloud-article-theme min-h-screen bg-background text-foreground transition-colors duration-300">
      <PrimaryHeader active="playground" />
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link
              className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-primary"
              href="/playground"
            >
              <ArrowLeft size={16} /> Tất cả playground
            </Link>
            <h1 className="mt-3 text-2xl font-bold tracking-[-0.035em] text-ink sm:text-3xl">
              Cloud Cost Estimator
            </h1>
          </div>
          <p className="max-w-md text-sm leading-6 text-muted-foreground">
            Kéo số lượng tài nguyên để xem hóa đơn tháng hình thành từ đâu. Thường thứ gây bất ngờ không phải máy ảo, mà là NAT, IP public và truyền dữ liệu.
          </p>
        </div>
        <CloudCostEstimator />
      </div>
    </main>
  );
}
