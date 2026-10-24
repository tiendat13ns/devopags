'use client';

import { useState } from 'react';
import { Lightbulb, RotateCcw } from 'lucide-react';

// Giá On-Demand tham khảo ở us-east-1 (USD). Giá AWS thay đổi theo thời gian và region, nên mọi đơn giá đều sửa được.
const defaultPrices = {
  'ec2:t3.micro': 0.0104,
  'ec2:t3.small': 0.0208,
  'ec2:t3.medium': 0.0416,
  'ec2:m7g.large': 0.0816,
  'ec2:m7i.large': 0.1008,
  'ec2:c7g.xlarge': 0.145,
  ebsGb: 0.08,
  albHour: 0.0225,
  lcuHour: 0.008,
  natHour: 0.045,
  natGb: 0.045,
  ipv4Hour: 0.005,
  dataOutGb: 0.09,
  interAzGb: 0.02,
  's3:STANDARD': 0.023,
  's3:STANDARD_IA': 0.0125,
  's3:GLACIER_IR': 0.004,
  's3:DEEP_ARCHIVE': 0.00099,
  'rds:db.t4g.micro': 0.016,
  'rds:db.t4g.small': 0.032,
  'rds:db.t4g.medium': 0.065,
  rdsStorageGb: 0.115,
  logsGb: 0.5,
};

type PriceKey = keyof typeof defaultPrices;

const priceLabels: Partial<Record<PriceKey, string>> = {
  ebsGb: 'EBS gp3 / GB-tháng',
  albHour: 'ALB / giờ',
  lcuHour: 'ALB LCU / giờ',
  natHour: 'NAT Gateway / giờ',
  natGb: 'NAT xử lý / GB',
  ipv4Hour: 'Public IPv4 / giờ',
  dataOutGb: 'Data ra Internet / GB',
  interAzGb: 'Traffic giữa AZ / GB',
  rdsStorageGb: 'RDS storage / GB-tháng',
  logsGb: 'CloudWatch Logs ingest / GB',
};

type Inputs = {
  ec2Type: string;
  ec2Count: number;
  ec2Hours: number;
  ebsGb: number;
  albCount: number;
  albLcu: number;
  natCount: number;
  natGb: number;
  publicIps: number;
  dataOutGb: number;
  interAzGb: number;
  s3Class: string;
  s3Gb: number;
  rdsClass: string;
  rdsMultiAz: boolean;
  rdsStorageGb: number;
  logsGb: number;
};

const HOURS = 730;
const FREE_DATA_OUT = 100;

const presets: { id: string; label: string; inputs: Inputs }[] = [
  {
    id: 'forgot-demo',
    label: 'Demo bài 3 quên xóa',
    inputs: { ec2Type: 't3.micro', ec2Count: 2, ec2Hours: HOURS, ebsGb: 8, albCount: 0, albLcu: 1, natCount: 1, natGb: 1, publicIps: 2, dataOutGb: 1, interAzGb: 0, s3Class: 'STANDARD', s3Gb: 0, rdsClass: '', rdsMultiAz: false, rdsStorageGb: 20, logsGb: 0 },
  },
  {
    id: 'small',
    label: 'Web nhỏ 2 AZ',
    inputs: { ec2Type: 't3.small', ec2Count: 2, ec2Hours: HOURS, ebsGb: 20, albCount: 1, albLcu: 1, natCount: 1, natGb: 50, publicIps: 1, dataOutGb: 200, interAzGb: 50, s3Class: 'STANDARD', s3Gb: 50, rdsClass: 'db.t4g.micro', rdsMultiAz: false, rdsStorageGb: 20, logsGb: 5 },
  },
  {
    id: 'production',
    label: 'Production cỡ vừa',
    inputs: { ec2Type: 'm7g.large', ec2Count: 6, ec2Hours: HOURS, ebsGb: 50, albCount: 1, albLcu: 5, natCount: 2, natGb: 2000, publicIps: 2, dataOutGb: 3000, interAzGb: 1000, s3Class: 'STANDARD', s3Gb: 2000, rdsClass: 'db.t4g.medium', rdsMultiAz: true, rdsStorageGb: 200, logsGb: 100 },
  },
];

const money = (value: number) => (value >= 100 ? value.toFixed(0) : value.toFixed(2));

function Slider({ label, value, max, step = 1, unit, onChange }: { label: string; value: number; max: number; step?: number; unit?: string; onChange: (value: number) => void }) {
  return (
    <label className="block text-muted-foreground">
      <span className="flex justify-between gap-2">
        {label}
        <span className="font-mono font-semibold text-ink">{value}{unit ? ` ${unit}` : ''}</span>
      </span>
      <input type="range" min={0} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} className="mt-1 block w-full accent-[var(--primary)]" />
    </label>
  );
}

const selectClass = 'mt-0.5 block h-8 w-full border border-border bg-background px-1.5 text-xs text-ink outline-none focus:border-primary';

export function CloudCostEstimator() {
  const [inputs, setInputs] = useState<Inputs>(presets[1].inputs);
  const [prices, setPrices] = useState(defaultPrices);
  const [showPrices, setShowPrices] = useState(false);
  const set = (patch: Partial<Inputs>) => setInputs((current) => ({ ...current, ...patch }));
  const price = (key: string) => prices[key as PriceKey] ?? 0;

  const rdsFactor = inputs.rdsMultiAz ? 2 : 1;
  const items = [
    { id: 'ec2', group: 'Compute', label: `EC2 ${inputs.ec2Type} × ${inputs.ec2Count}`, formula: `${inputs.ec2Count} máy × ${inputs.ec2Hours} giờ × $${price(`ec2:${inputs.ec2Type}`)}`, cost: inputs.ec2Count * inputs.ec2Hours * price(`ec2:${inputs.ec2Type}`) },
    { id: 'ebs', group: 'Lưu trữ', label: 'Ổ EBS của EC2', formula: `${inputs.ec2Count} × ${inputs.ebsGb} GB × $${prices.ebsGb}`, cost: inputs.ec2Count * inputs.ebsGb * prices.ebsGb },
    { id: 'alb', group: 'Mạng', label: 'Application Load Balancer', formula: `${inputs.albCount} ALB × ${HOURS} giờ × ($${prices.albHour} + ${inputs.albLcu} LCU × $${prices.lcuHour})`, cost: inputs.albCount * HOURS * (prices.albHour + inputs.albLcu * prices.lcuHour) },
    { id: 'nat-hour', group: 'Mạng', label: 'NAT Gateway: phí giờ', formula: `${inputs.natCount} NAT × ${HOURS} giờ × $${prices.natHour}`, cost: inputs.natCount * HOURS * prices.natHour },
    { id: 'nat-data', group: 'Mạng', label: 'NAT Gateway: phí xử lý dữ liệu', formula: `${inputs.natGb} GB × $${prices.natGb}`, cost: inputs.natCount > 0 ? inputs.natGb * prices.natGb : 0 },
    { id: 'ipv4', group: 'Mạng', label: 'Public IPv4', formula: `${inputs.publicIps} IP × ${HOURS} giờ × $${prices.ipv4Hour}`, cost: inputs.publicIps * HOURS * prices.ipv4Hour },
    { id: 'data-out', group: 'Mạng', label: 'Data ra Internet', formula: `(${inputs.dataOutGb} − ${FREE_DATA_OUT} GB miễn phí) × $${prices.dataOutGb}`, cost: Math.max(inputs.dataOutGb - FREE_DATA_OUT, 0) * prices.dataOutGb },
    { id: 'inter-az', group: 'Mạng', label: 'Traffic giữa các AZ', formula: `${inputs.interAzGb} GB × $${prices.interAzGb} (tính cả hai chiều)`, cost: inputs.interAzGb * prices.interAzGb },
    { id: 's3', group: 'Lưu trữ', label: `S3 ${inputs.s3Class}`, formula: `${inputs.s3Gb} GB × $${price(`s3:${inputs.s3Class}`)}`, cost: inputs.s3Gb * price(`s3:${inputs.s3Class}`) },
    { id: 'rds', group: 'Database', label: inputs.rdsClass ? `RDS ${inputs.rdsClass}${inputs.rdsMultiAz ? ' Multi-AZ' : ''}` : 'RDS (không dùng)', formula: `${HOURS} giờ × $${price(`rds:${inputs.rdsClass}`)}${inputs.rdsMultiAz ? ' × 2' : ''}`, cost: inputs.rdsClass ? HOURS * price(`rds:${inputs.rdsClass}`) * rdsFactor : 0 },
    { id: 'rds-storage', group: 'Database', label: 'RDS storage', formula: `${inputs.rdsStorageGb} GB × $${prices.rdsStorageGb}${inputs.rdsMultiAz ? ' × 2' : ''}`, cost: inputs.rdsClass ? inputs.rdsStorageGb * prices.rdsStorageGb * rdsFactor : 0 },
    { id: 'logs', group: 'Giám sát', label: 'CloudWatch Logs', formula: `${inputs.logsGb} GB × $${prices.logsGb}`, cost: inputs.logsGb * prices.logsGb },
  ];

  const total = items.reduce((sum, item) => sum + item.cost, 0);
  const sorted = [...items].filter((item) => item.cost > 0).sort((left, right) => right.cost - left.cost);
  const max = sorted[0]?.cost ?? 1;
  const share = (id: string) => (total > 0 ? (items.filter((item) => item.id.startsWith(id)).reduce((sum, item) => sum + item.cost, 0) / total) * 100 : 0);

  const insights: string[] = [];
  if (share('nat') >= 15) insights.push(`NAT Gateway chiếm ${share('nat').toFixed(0)}% hóa đơn. Traffic tới S3 và DynamoDB có thể đi qua Gateway VPC Endpoint miễn phí thay vì qua NAT; môi trường dev có thể dùng một NAT chung.`);
  if (inputs.publicIps > 0) insights.push(`${inputs.publicIps} public IPv4 tốn khoảng $${money(inputs.publicIps * HOURS * prices.ipv4Hour)}/tháng kể cả khi không dùng. Đặt máy sau load balancer để không cần public IP riêng.`);
  if (inputs.ec2Hours === HOURS && inputs.ec2Count > 0) {
    const saving = items[0].cost * (1 - 220 / HOURS);
    insights.push(`Nếu đây là môi trường dev chỉ cần chạy giờ hành chính (khoảng 220 giờ/tháng), tắt máy ngoài giờ tiết kiệm khoảng $${money(saving)}/tháng. Với production chạy 24/7, Savings Plans giảm giá đổi lấy cam kết 1–3 năm.`);
  }
  if (share('data-out') + share('inter-az') >= 25) insights.push(`Truyền dữ liệu chiếm ${(share('data-out') + share('inter-az')).toFixed(0)}%. CloudFront giúp giảm data ra Internet từ origin; giữ các thành phần nói chuyện nhiều với nhau trong cùng AZ giúp giảm phí giữa AZ.`);
  if (inputs.rdsMultiAz) insights.push('Multi-AZ nhân đôi chi phí RDS: đó là giá của một bản standby luôn sẵn sàng ở AZ khác.');

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <button key={preset.id} type="button" onClick={() => setInputs(preset.inputs)} className="border border-border bg-card px-3 py-1.5 text-xs font-semibold text-ink hover:border-primary">
            {preset.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <div className="grid gap-px border border-border bg-border sm:grid-cols-3">
            <div className="bg-card p-4">
              <p className="text-xs text-muted-foreground">Ước tính mỗi tháng</p>
              <p className="mt-1 font-mono text-3xl font-bold text-ink">${money(total)}</p>
            </div>
            <div className="bg-card p-4">
              <p className="text-xs text-muted-foreground">Mỗi năm</p>
              <p className="mt-1 font-mono text-3xl font-bold text-ink">${money(total * 12)}</p>
            </div>
            <div className="bg-card p-4">
              <p className="text-xs text-muted-foreground">Mỗi ngày</p>
              <p className="mt-1 font-mono text-3xl font-bold text-ink">${money(total / 30.4)}</p>
            </div>
          </div>

          <div className="border border-border bg-card p-4">
            <p className="text-sm font-bold text-ink">Chi phí theo hạng mục (USD/tháng)</p>
            <ul className="mt-3 space-y-2.5">
              {sorted.map((item) => (
                <li key={item.id} className="text-xs">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-semibold text-ink">{item.label} <span className="font-normal text-muted-foreground">· {item.group}</span></span>
                    <span className="shrink-0 font-mono font-semibold text-ink">${money(item.cost)} <span className="font-normal text-muted-foreground">({((item.cost / total) * 100).toFixed(0)}%)</span></span>
                  </div>
                  <div className="mt-1 h-2.5 bg-surface">
                    <div className="h-full bg-primary" style={{ width: `${(item.cost / max) * 100}%` }} />
                  </div>
                  <p className="mt-0.5 font-mono text-[0.65rem] text-muted-foreground">{item.formula}</p>
                </li>
              ))}
              {sorted.length === 0 ? <li className="text-xs text-muted-foreground">Chưa có tài nguyên nào.</li> : null}
            </ul>
          </div>

          {insights.length > 0 ? (
            <div className="border border-primary/25 bg-primary-soft p-4">
              <p className="flex items-center gap-2 text-sm font-bold text-ink"><Lightbulb className="text-primary" size={16} /> Nhận xét</p>
              <ul className="mt-2 list-disc space-y-1.5 pl-5 text-xs leading-5 text-muted-foreground">
                {insights.map((insight) => <li key={insight}>{insight}</li>)}
              </ul>
            </div>
          ) : null}

          <p className="text-xs leading-5 text-muted-foreground">
            Đơn giá mặc định là giá On-Demand tham khảo ở us-east-1, chưa gồm thuế và Free Tier (trừ 100 GB data ra Internet). Giá thực tế thay đổi theo thời gian và region: sửa trong bảng đơn giá, và dùng AWS Pricing Calculator khi cần con số chính thức.
          </p>
        </div>

        <aside className="space-y-4 text-xs">
          <div className="space-y-3 border border-border bg-card p-4">
            <p className="font-semibold text-ink">Compute</p>
            <label className="block text-muted-foreground">
              Instance type
              <select value={inputs.ec2Type} onChange={(event) => set({ ec2Type: event.target.value })} className={selectClass}>
                {Object.keys(defaultPrices).filter((key) => key.startsWith('ec2:')).map((key) => <option key={key} value={key.slice(4)}>{key.slice(4)}</option>)}
              </select>
            </label>
            <Slider label="Số máy" value={inputs.ec2Count} max={20} onChange={(value) => set({ ec2Count: value })} />
            <label className="block text-muted-foreground">
              Thời gian chạy
              <select value={inputs.ec2Hours} onChange={(event) => set({ ec2Hours: Number(event.target.value) })} className={selectClass}>
                <option value={HOURS}>24/7 ({HOURS} giờ/tháng)</option>
                <option value={220}>Giờ hành chính (220 giờ/tháng)</option>
              </select>
            </label>
            <Slider label="EBS mỗi máy" value={inputs.ebsGb} max={500} step={4} unit="GB" onChange={(value) => set({ ebsGb: value })} />
          </div>

          <div className="space-y-3 border border-border bg-card p-4">
            <p className="font-semibold text-ink">Mạng</p>
            <Slider label="Số ALB" value={inputs.albCount} max={3} onChange={(value) => set({ albCount: value })} />
            <Slider label="LCU trung bình mỗi ALB" value={inputs.albLcu} max={20} onChange={(value) => set({ albLcu: value })} />
            <Slider label="Số NAT Gateway" value={inputs.natCount} max={3} onChange={(value) => set({ natCount: value })} />
            <Slider label="Dữ liệu qua NAT" value={inputs.natGb} max={5000} step={10} unit="GB" onChange={(value) => set({ natGb: value })} />
            <Slider label="Public IPv4 (EIP, IP của máy)" value={inputs.publicIps} max={10} onChange={(value) => set({ publicIps: value })} />
            <Slider label="Data ra Internet" value={inputs.dataOutGb} max={10000} step={10} unit="GB" onChange={(value) => set({ dataOutGb: value })} />
            <Slider label="Traffic giữa các AZ" value={inputs.interAzGb} max={5000} step={10} unit="GB" onChange={(value) => set({ interAzGb: value })} />
          </div>

          <div className="space-y-3 border border-border bg-card p-4">
            <p className="font-semibold text-ink">Lưu trữ, database, giám sát</p>
            <label className="block text-muted-foreground">
              S3 storage class
              <select value={inputs.s3Class} onChange={(event) => set({ s3Class: event.target.value })} className={selectClass}>
                <option value="STANDARD">Standard</option>
                <option value="STANDARD_IA">Standard-IA</option>
                <option value="GLACIER_IR">Glacier Instant Retrieval</option>
                <option value="DEEP_ARCHIVE">Glacier Deep Archive</option>
              </select>
            </label>
            <Slider label="Dung lượng S3" value={inputs.s3Gb} max={10000} step={10} unit="GB" onChange={(value) => set({ s3Gb: value })} />
            <label className="block text-muted-foreground">
              RDS PostgreSQL
              <select value={inputs.rdsClass} onChange={(event) => set({ rdsClass: event.target.value })} className={selectClass}>
                <option value="">Không dùng</option>
                {Object.keys(defaultPrices).filter((key) => key.startsWith('rds:')).map((key) => <option key={key} value={key.slice(4)}>{key.slice(4)}</option>)}
              </select>
            </label>
            <label className="flex items-center gap-2 text-ink">
              <input type="checkbox" checked={inputs.rdsMultiAz} onChange={() => set({ rdsMultiAz: !inputs.rdsMultiAz })} disabled={!inputs.rdsClass} className="accent-[var(--primary)]" />
              Multi-AZ
            </label>
            <Slider label="RDS storage" value={inputs.rdsStorageGb} max={1000} step={10} unit="GB" onChange={(value) => set({ rdsStorageGb: value })} />
            <Slider label="Log đẩy vào CloudWatch" value={inputs.logsGb} max={500} unit="GB" onChange={(value) => set({ logsGb: value })} />
          </div>

          <div className="border border-border bg-card">
            <div className="flex items-center justify-between px-4 py-2.5">
              <button type="button" onClick={() => setShowPrices((value) => !value)} className="font-semibold text-ink hover:text-primary" aria-expanded={showPrices}>
                {showPrices ? 'Ẩn' : 'Sửa'} bảng đơn giá (USD)
              </button>
              <button type="button" onClick={() => setPrices(defaultPrices)} className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary">
                <RotateCcw size={12} /> Mặc định
              </button>
            </div>
            {showPrices ? (
              <div className="grid grid-cols-[1fr_6rem] items-center gap-x-2 gap-y-1 border-t border-border px-4 py-3">
                {(Object.keys(defaultPrices) as PriceKey[]).map((key) => (
                  <label key={key} className="contents">
                    <span className="truncate text-muted-foreground">{priceLabels[key] ?? `${key.replace(':', ' ')} / ${key.startsWith('s3:') ? 'GB-tháng' : 'giờ'}`}</span>
                    <input
                      type="number"
                      step="0.0001"
                      min={0}
                      value={prices[key]}
                      onChange={(event) => setPrices((current) => ({ ...current, [key]: Number(event.target.value) || 0 }))}
                      className="h-7 border border-border bg-background px-1.5 text-right font-mono text-ink outline-none focus:border-primary"
                    />
                  </label>
                ))}
              </div>
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  );
}
