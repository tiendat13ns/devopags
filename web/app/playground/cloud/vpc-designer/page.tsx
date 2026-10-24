import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { VpcDesigner } from '@/components/vpc-designer';
import { PrimaryHeader } from '@/components/primary-header';

export const metadata: Metadata = {
  title: 'VPC Designer: tự thiết kế mạng AWS và chấm điểm | tiendat13ns',
  description:
    'Chia subnet, đặt NAT, ALB, web server và database vào VPC, chỉnh Security Group và để hệ thống kiểm tra lỗi bảo mật, kết nối và high availability.',
};

export default function VpcDesignerPage() {
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
              VPC Designer
            </h1>
          </div>
          <p className="max-w-md text-sm leading-6 text-muted-foreground">
            Tự chia subnet, đặt tài nguyên vào từng AZ và chỉnh Security Group. Mỗi thay đổi được kiểm tra ngay: CIDR, đường ra Internet, độ lộ của database và khả năng chịu sự cố một AZ.
          </p>
        </div>
        <VpcDesigner />
      </div>
    </main>
  );
}
