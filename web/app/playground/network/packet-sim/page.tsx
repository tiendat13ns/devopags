import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PacketSimulator } from '@/components/packet-simulator';
import { PrimaryHeader } from '@/components/primary-header';

export const metadata: Metadata = {
  title: 'Packet Simulator: theo một gói ping qua LAN, router và NAT | tiendat13ns',
  description:
    'Sửa IP, mask, gateway, bật tắt NAT hay cắt dây, rồi gửi ping và theo dõi ARP, switch, bảng định tuyến và NAT ở từng chặng.',
};

export default function PacketSimulatorPage() {
  return (
    <main className="article-reading-bg network-article-theme min-h-screen bg-background text-foreground transition-colors duration-300">
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
              Packet Simulator
            </h1>
          </div>
          <p className="max-w-md text-sm leading-6 text-muted-foreground">
            Gửi một gói ping và xem nó đi qua switch, router và NAT. Mọi bước được tính từ cấu hình hiện tại, nên sửa sai một chỗ là thấy ngay gói chết ở đâu.
          </p>
        </div>
        <PacketSimulator />
      </div>
    </main>
  );
}
