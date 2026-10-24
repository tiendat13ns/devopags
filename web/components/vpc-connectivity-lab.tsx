'use client';

import { useState } from 'react';
import { RotateCcw } from 'lucide-react';

type ConfigKey = 'igwRoute' | 'bastionPublicIp' | 'bastionSsh' | 'natRoute' | 'appFromBastion' | 'bastionIcmpFromApp';

type Config = Record<ConfigKey, boolean>;

const configItems: { key: ConfigKey; label: string; detail: string }[] = [
  { key: 'igwRoute', label: 'Route public: 0.0.0.0/0 → IGW', detail: 'create-route --gateway-id $IGW' },
  { key: 'bastionPublicIp', label: 'Bastion có public IP', detail: 'map-public-ip-on-launch trên subnet public' },
  { key: 'bastionSsh', label: 'bastion-sg: SSH 22 từ IP của bạn', detail: '--port 22 --cidr $MYIP/32' },
  { key: 'natRoute', label: 'Route private: 0.0.0.0/0 → NAT', detail: 'create-route --nat-gateway-id $NAT' },
  { key: 'appFromBastion', label: 'app-sg: SSH + ICMP từ bastion-sg', detail: '--source-group $SG_B' },
  { key: 'bastionIcmpFromApp', label: 'bastion-sg: ICMP từ app-sg', detail: 'demo cố tình KHÔNG mở luật này' },
];

const initialConfig: Config = {
  igwRoute: true,
  bastionPublicIp: true,
  bastionSsh: true,
  natRoute: true,
  appFromBastion: true,
  bastionIcmpFromApp: false,
};

type Result = { ok: boolean; reason: string };

type Test = {
  id: string;
  label: string;
  command: string;
  expected: boolean;
  run: (config: Config) => Result;
};

const tests: Test[] = [
  {
    id: 'laptop-bastion',
    label: 'Laptop → bastion (SSH)',
    command: 'ssh ec2-user@<bastion-public-ip>',
    expected: true,
    run: (c) => {
      if (!c.bastionPublicIp) return { ok: false, reason: 'Bastion không có public IP: Internet không có địa chỉ nào để gọi tới.' };
      if (!c.igwRoute) return { ok: false, reason: 'Subnet không có route tới IGW nên gói trả lời không ra được Internet: subnet này thực chất là private.' };
      if (!c.bastionSsh) return { ok: false, reason: 'bastion-sg không có luật cho cổng 22 từ IP của bạn → timeout.' };
      return { ok: true, reason: 'Đủ cả ba: public IP, route tới IGW và luật SG cho cổng 22.' };
    },
  },
  {
    id: 'laptop-app',
    label: 'Laptop → app (SSH thẳng)',
    command: 'ssh ec2-user@10.0.2.x',
    expected: false,
    run: () => ({ ok: false, reason: '10.0.2.x là private IP, không định tuyến được trên Internet, và app không có public IP. Đây chính là mục đích của private subnet.' }),
  },
  {
    id: 'bastion-app',
    label: 'Bastion → app (SSH, ping)',
    command: 'ssh -J ec2-user@<bastion> ec2-user@10.0.2.x',
    expected: true,
    run: (c) =>
      c.appFromBastion
        ? { ok: true, reason: 'Route local 10.0.0.0/16 luôn có sẵn; app-sg cho phép mọi máy thuộc bastion-sg. Gói trả lời đi về được dù bastion-sg không mở ICMP, vì SG là stateful.' }
        : { ok: false, reason: 'Route local vẫn có, nhưng app-sg không cho bastion vào: chặn ở tầng firewall chứ không phải routing.' },
  },
  {
    id: 'app-internet',
    label: 'App → Internet',
    command: 'curl https://checkip.amazonaws.com',
    expected: true,
    run: (c) => {
      if (!c.natRoute) return { ok: false, reason: 'Route table private không có đường ra 0.0.0.0/0 → timeout. dnf update cũng sẽ treo y như vậy.' };
      if (!c.igwRoute) return { ok: false, reason: 'NAT Gateway nằm ở subnet public; subnet đó mất route tới IGW thì NAT cũng không ra được Internet.' };
      return { ok: true, reason: 'Trả về Elastic IP của NAT Gateway, không phải IP của app: NAT đã thay địa chỉ nguồn.' };
    },
  },
  {
    id: 'app-bastion',
    label: 'App → bastion (ping)',
    command: 'ping 10.0.1.x',
    expected: false,
    run: (c) =>
      c.bastionIcmpFromApp
        ? { ok: true, reason: 'bastion-sg đã mở ICMP từ app-sg. Trong demo ta cố tình không mở, để thấy SG chỉ cho phép đúng chiều đã khai báo.' }
        : { ok: false, reason: 'bastion-sg không có luật ICMP inbound từ app-sg. Chiều ngược lại (bastion ping app) vẫn chạy: SG xét theo chiều mở kết nối.' },
  },
  {
    id: 'bastion-internet',
    label: 'Bastion → Internet',
    command: 'sudo dnf update',
    expected: true,
    run: (c) => {
      if (!c.igwRoute) return { ok: false, reason: 'Không có route 0.0.0.0/0 → IGW.' };
      if (!c.bastionPublicIp) return { ok: false, reason: 'Có route tới IGW nhưng máy không có public IP; IGW chỉ dịch địa chỉ cho máy có public IP.' };
      return { ok: true, reason: 'SG mặc định cho mọi traffic outbound; IGW dịch private IP ↔ public IP của bastion.' };
    },
  },
];

export function VpcConnectivityLab() {
  const [config, setConfig] = useState<Config>(initialConfig);

  const results = tests.map((test) => ({ test, ...test.run(config) }));
  const unexpected = results.filter((result) => result.ok !== result.test.expected).length;

  return (
    <div className="my-8 border border-border bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div>
          <p className="font-mono text-xs font-semibold text-primary">VPC connectivity lab</p>
          <p className="mt-1 text-sm text-muted-foreground">Tắt từng mảnh cấu hình của demo và xem phép thử nào hỏng, vì sao.</p>
        </div>
        <button type="button" onClick={() => setConfig(initialConfig)} className="inline-flex items-center gap-1.5 border border-border bg-card px-3 py-2 text-xs font-semibold text-ink hover:border-primary">
          <RotateCcw size={13} /> Đặt lại
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <div className="border-b border-border p-4 lg:border-b-0 lg:border-r lg:p-5">
          <p className="font-mono text-xs font-semibold text-muted-foreground">Cấu hình</p>
          <ul className="mt-2 border border-border bg-card">
            {configItems.map((item) => (
              <li className="border-b border-border last:border-b-0" key={item.key}>
                <label className="flex cursor-pointer items-start gap-3 px-3 py-2.5" aria-label={item.label}>
                  <input
                    type="checkbox"
                    className="mt-1 accent-[var(--primary)]"
                    checked={config[item.key]}
                    onChange={() => setConfig((current) => ({ ...current, [item.key]: !current[item.key] }))}
                  />
                  <span className="min-w-0 text-xs leading-5">
                    <span className={`block font-semibold ${config[item.key] ? 'text-ink' : 'text-muted-foreground line-through'}`}>{item.label}</span>
                    <span className="font-mono text-[0.68rem] text-muted-foreground">{item.detail}</span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs leading-5 text-muted-foreground">
            Route <span className="font-mono">10.0.0.0/16 → local</span> có trong mọi route table và không xóa được, nên không có công tắc cho nó.
          </p>
        </div>

        <div className="p-4 lg:p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="font-mono text-xs font-semibold text-muted-foreground">Kết quả</p>
            <span className={`border px-2 py-0.5 font-mono text-[0.68rem] font-bold ${unexpected === 0 ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300'}`}>
              {unexpected === 0 ? 'Đúng thiết kế cả 6' : `${unexpected} phép thử khác thiết kế`}
            </span>
          </div>
          <ol className="mt-2 border border-border bg-card">
            {results.map(({ test, ok, reason }, index) => {
              const asDesigned = ok === test.expected;
              return (
                <li className={`border-b border-border px-3 py-2.5 last:border-b-0 ${asDesigned ? '' : 'bg-amber-500/10'}`} key={test.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 text-xs leading-5">
                      <span className="block font-semibold text-ink">
                        <span className="font-mono text-muted-foreground">{index + 1}.</span> {test.label}
                      </span>
                      <span className="block break-all font-mono text-[0.68rem] text-muted-foreground">{test.command}</span>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className={`block font-mono text-xs font-bold ${ok ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>{ok ? 'TỚI ĐƯỢC' : 'KHÔNG TỚI'}</span>
                      {!asDesigned ? <span className="block text-[0.65rem] font-semibold text-amber-700 dark:text-amber-300">khác thiết kế</span> : null}
                    </div>
                  </div>
                  <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{reason}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </div>
  );
}
