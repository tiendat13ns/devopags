'use client';

import { useState } from 'react';

const families: Record<string, string> = {
  t: 'Burstable: CPU nền thấp, “bùng” lên khi cần nhờ CPU credit. Hợp web nhỏ, môi trường dev',
  m: 'General purpose: cân bằng CPU và RAM, lựa chọn mặc định an toàn',
  c: 'Compute optimized: nhiều CPU so với RAM. Hợp batch, encode video, server game',
  r: 'Memory optimized: nhiều RAM so với CPU. Hợp database, cache',
  x: 'Memory rất lớn: SAP HANA, database in-memory',
  z: 'Tần số CPU cao: phần mềm tính phí theo core',
  i: 'Storage optimized: ổ NVMe cục bộ rất nhanh. Hợp database NoSQL, data warehouse',
  d: 'Dense storage: nhiều ổ HDD cục bộ dung lượng lớn',
  g: 'GPU cho đồ họa và ML inference',
  p: 'GPU mạnh cho huấn luyện ML',
  inf: 'Chip AWS Inferentia cho ML inference',
  trn: 'Chip AWS Trainium cho huấn luyện ML',
  hpc: 'High performance computing',
  mac: 'Máy Mac thật (dedicated host) để build ứng dụng Apple',
};

const attributes: Record<string, string> = {
  a: 'CPU AMD',
  g: 'CPU AWS Graviton (ARM): thường giá tốt hơn, cần phần mềm build cho arm64',
  i: 'CPU Intel',
  d: 'Có ổ NVMe instance store gắn trực tiếp',
  n: 'Mạng băng thông cao hơn',
  e: 'Thêm RAM hoặc thêm storage',
  z: 'Tần số CPU cao',
  b: 'Tối ưu băng thông tới EBS',
  flex: 'Flex: rẻ hơn bản thường, hợp workload không cần dùng hết CPU liên tục',
};

// Tỷ lệ GiB RAM trên mỗi vCPU của các họ phổ biến, dùng để ước tính cấu hình.
const memoryPerVcpu: Record<string, number> = { c: 2, m: 4, r: 8 };
const burstable: Record<string, [number, number]> = {
  nano: [2, 0.5],
  micro: [2, 1],
  small: [2, 2],
  medium: [2, 4],
  large: [2, 8],
  xlarge: [4, 16],
  '2xlarge': [8, 32],
};

const presets = ['t3.micro', 'm7g.large', 'c7i.2xlarge', 'r6id.xlarge', 'm7i-flex.large', 'g5.xlarge'];

function vcpuForSize(size: string) {
  if (size === 'medium') return 1;
  if (size === 'large') return 2;
  if (size === 'xlarge') return 4;
  const match = size.match(/^(\d+)xlarge$/);
  return match ? Number(match[1]) * 4 : null;
}

function decode(value: string) {
  const match = value.trim().toLowerCase().match(/^([a-z]+?)(\d+)([a-z]*)(-flex)?\.([a-z0-9]+)$/);
  if (!match) return null;

  const [, family, generation, attrs, flex, size] = match;
  const parts = [
    { token: family, label: 'Họ (family)', text: families[family] ?? 'Họ chuyên biệt, xem bảng thông số của AWS' },
    { token: generation, label: 'Thế hệ', text: `Thế hệ ${generation}. Số lớn hơn thường mới hơn, nhanh hơn và rẻ hơn trên mỗi đơn vị hiệu năng` },
    ...attrs.split('').map((attr) => ({ token: attr, label: 'Thuộc tính', text: attributes[attr] ?? 'Thuộc tính chuyên biệt' })),
    ...(flex ? [{ token: flex, label: 'Biến thể', text: attributes.flex }] : []),
    { token: `.${size}`, label: 'Kích cỡ', text: size === 'metal' ? 'Bare metal: cả máy chủ vật lý, không có hypervisor chia sẻ' : 'Mỗi bậc lớn hơn (large → xlarge → 2xlarge…) thường gấp đôi CPU, RAM và giá' },
  ];

  let estimate: string | null = null;
  if (family === 't' && burstable[size]) {
    const [vcpu, memory] = burstable[size];
    estimate = `${vcpu} vCPU · ${memory} GiB RAM (CPU nền chỉ là một phần của ${vcpu} vCPU)`;
  } else if (memoryPerVcpu[family]) {
    const vcpu = vcpuForSize(size);
    if (vcpu) estimate = `${vcpu} vCPU · ${vcpu * memoryPerVcpu[family]} GiB RAM`;
  }

  return { parts, estimate };
}

export function Ec2InstanceTypeDecoder() {
  const [value, setValue] = useState('m7g.large');
  const result = decode(value);

  return (
    <div className="my-8 border border-border bg-surface">
      <div className="border-b border-border px-4 py-3">
        <p className="font-mono text-xs font-semibold text-primary">Instance type decoder</p>
        <p className="mt-1 text-sm text-muted-foreground">Gõ một instance type hoặc chọn ví dụ để xem từng ký tự có nghĩa gì.</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor="instance-type">Instance type</label>
          <input
            id="instance-type"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            spellCheck={false}
            className="h-9 w-44 border border-border bg-card px-3 font-mono text-sm text-ink outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
          {presets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setValue(preset)}
              aria-pressed={preset === value}
              className={`border px-2.5 py-1.5 font-mono text-xs font-semibold ${preset === value ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-ink hover:border-primary'}`}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 lg:p-5">
        {result ? (
          <>
            <div className="flex flex-wrap gap-1 font-mono text-2xl font-bold">
              {result.parts.map((part, index) => (
                <span className={`border px-2 py-1 ${index % 2 === 0 ? 'border-primary/40 bg-primary-soft text-primary-dark' : 'border-border bg-card text-ink'}`} key={`${index}-${part.token}`}>
                  {part.token}
                </span>
              ))}
            </div>
            <ol className="mt-4 border border-border bg-card">
              {result.parts.map((part, index) => (
                <li className="grid gap-1 border-b border-border px-3 py-2.5 text-xs leading-5 last:border-b-0 sm:grid-cols-[7rem_5rem_1fr] sm:gap-3" key={`${index}-${part.token}-row`}>
                  <span className="font-mono font-bold text-primary">{part.token}</span>
                  <span className="font-semibold text-ink">{part.label}</span>
                  <span className="text-muted-foreground">{part.text}</span>
                </li>
              ))}
            </ol>
            <p className="mt-3 text-xs leading-5 text-muted-foreground">
              {result.estimate ? (
                <>Ước tính cấu hình: <span className="font-mono font-semibold text-ink">{result.estimate}</span>. Luôn đối chiếu bảng thông số chính thức trước khi chọn.</>
              ) : (
                'Họ này không theo tỷ lệ CPU/RAM cố định; xem bảng thông số chính thức của AWS.'
              )}
            </p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Không đọc được. Định dạng là họ + thế hệ + thuộc tính + “.” + kích cỡ, ví dụ <span className="font-mono">c7g.xlarge</span>.</p>
        )}
      </div>
    </div>
  );
}
