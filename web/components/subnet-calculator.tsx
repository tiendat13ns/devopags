'use client';

import { useState } from 'react';
import { formatIp, inCidr, maskOf, networkOf, parseIp, toBits } from '@/lib/ip';

const presets = [
  { label: '192.168.1.0/24', ip: '192.168.1.0', prefix: 24 },
  { label: '10.0.0.0/16', ip: '10.0.0.0', prefix: 16 },
  { label: '172.16.5.130/26', ip: '172.16.5.130', prefix: 26 },
  { label: '203.0.113.77/28', ip: '203.0.113.77', prefix: 28 },
  { label: '10.0.1.15/32', ip: '10.0.1.15', prefix: 32 },
];

const ranges: [string, string][] = [
  ['10.0.0.0/8', 'Private (RFC 1918)'],
  ['172.16.0.0/12', 'Private (RFC 1918)'],
  ['192.168.0.0/16', 'Private (RFC 1918)'],
  ['127.0.0.0/8', 'Loopback'],
  ['169.254.0.0/16', 'Link-local (tự cấp khi không có DHCP)'],
  ['100.64.0.0/10', 'Shared address space (CGNAT)'],
  ['192.0.2.0/24', 'Dải ví dụ cho tài liệu (TEST-NET-1)'],
  ['198.51.100.0/24', 'Dải ví dụ cho tài liệu (TEST-NET-2)'],
  ['203.0.113.0/24', 'Dải ví dụ cho tài liệu (TEST-NET-3)'],
  ['224.0.0.0/4', 'Multicast'],
  ['0.0.0.0/8', '“Mạng này” (không dùng làm địa chỉ host)'],
];

function describe(ip: number) {
  const match = ranges.find(([cidr]) => inCidr(ip, cidr));
  return match ? match[1] : 'Public (định tuyến được trên Internet)';
}

function BitRow({ label, bits, split, tone }: { label: string; bits: string; split: number; tone: 'ip' | 'plain' }) {
  const octets = [0, 1, 2, 3].map((index) => bits.slice(index * 8, index * 8 + 8));

  return (
    <div className="grid items-center gap-2 sm:grid-cols-[88px_1fr]">
      <span className="font-mono text-xs font-semibold text-muted-foreground">{label}</span>
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {octets.map((octet, octetIndex) => (
          <div className="flex" key={octetIndex}>
            {octet.split('').map((bit, bitIndex) => {
              const position = octetIndex * 8 + bitIndex;
              const isNetwork = position < split;
              return (
                <span
                  className={`grid h-7 w-[1.15rem] place-items-center border font-mono text-xs ${
                    isNetwork
                      ? 'border-primary/40 bg-primary/15 text-primary'
                      : tone === 'plain'
                        ? 'border-border bg-card text-muted-foreground/60'
                        : 'border-amber-500/40 bg-amber-500/15 text-amber-700 dark:text-amber-300'
                  }`}
                  key={bitIndex}
                >
                  {bit}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SubnetCalculator() {
  const [ipText, setIpText] = useState('192.168.1.130');
  const [prefix, setPrefix] = useState(26);

  const ip = parseIp(ipText);
  const mask = maskOf(prefix);

  let result: {
    network: number;
    broadcast: number;
    total: number;
    usable: number;
    first: number;
    last: number;
  } | null = null;

  if (ip !== null) {
    const network = networkOf(ip, prefix);
    const broadcast = (network | ~mask) >>> 0;
    const total = 2 ** (32 - prefix);
    const hasHosts = prefix <= 30;
    result = {
      network,
      broadcast,
      total,
      usable: prefix === 32 ? 1 : prefix === 31 ? 2 : total - 2,
      first: hasHosts ? network + 1 : network,
      last: hasHosts ? broadcast - 1 : broadcast,
    };
  }

  const cells: [string, string][] = result && ip !== null
    ? [
        ['Network address', formatIp(result.network)],
        ['Broadcast', prefix >= 31 ? '— (không dùng)' : formatIp(result.broadcast)],
        ['Subnet mask', formatIp(mask)],
        ['Wildcard', formatIp(~mask >>> 0)],
        ['Host đầu tiên', formatIp(result.first)],
        ['Host cuối cùng', formatIp(result.last)],
        ['Tổng địa chỉ', result.total.toLocaleString('vi-VN')],
        ['Host dùng được', result.usable.toLocaleString('vi-VN')],
      ]
    : [];

  return (
    <div className="my-8 border border-border bg-surface">
      <div className="border-b border-border px-4 py-3">
        <p className="font-mono text-xs font-semibold text-primary">Subnet calculator</p>
        <p className="mt-1 text-sm text-muted-foreground">Nhập một địa chỉ IP và độ dài prefix, bảng bit bên dưới sẽ cho thấy phần nào là network, phần nào là host.</p>
      </div>

      <div className="space-y-4 border-b border-border p-4">
        <div className="grid gap-4 sm:grid-cols-[1fr_1.2fr]">
          <label className="block">
            <span className="font-mono text-xs font-semibold text-muted-foreground">Địa chỉ IP</span>
            <input
              className={`mt-1 h-11 w-full border bg-card px-3 font-mono text-sm text-ink outline-none focus:ring-1 ${ip === null ? 'border-destructive focus:border-destructive focus:ring-destructive' : 'border-border focus:border-primary focus:ring-primary'}`}
              value={ipText}
              onChange={(event) => setIpText(event.target.value)}
              spellCheck={false}
              inputMode="decimal"
              aria-invalid={ip === null}
            />
            {ip === null ? <span className="mt-1 block text-xs text-destructive">Cần 4 số từ 0 đến 255, ngăn cách bằng dấu chấm.</span> : null}
          </label>
          <label className="block">
            <span className="font-mono text-xs font-semibold text-muted-foreground">Prefix: /{prefix}</span>
            <input
              className="mt-3 w-full accent-[var(--primary)]"
              type="range"
              min={0}
              max={32}
              value={prefix}
              onChange={(event) => setPrefix(Number(event.target.value))}
              aria-label="Độ dài prefix"
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                setIpText(preset.ip);
                setPrefix(preset.prefix);
              }}
              className="border border-border bg-card px-3 py-1.5 font-mono text-xs font-semibold text-ink hover:border-primary hover:text-primary"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {ip !== null && result ? (
        <>
          <div className="space-y-3 border-b border-border p-4">
            <BitRow label="IP" bits={toBits(ip)} split={prefix} tone="ip" />
            <BitRow label="Mask" bits={toBits(mask)} split={prefix} tone="plain" />
            <BitRow label="IP AND mask" bits={toBits(result.network)} split={prefix} tone="plain" />
            <p className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              <span><span className="mr-1 inline-block size-2.5 border border-primary/40 bg-primary/15" />{prefix} bit network</span>
              <span><span className="mr-1 inline-block size-2.5 border border-amber-500/40 bg-amber-500/15" />{32 - prefix} bit host</span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-px bg-border sm:grid-cols-4">
            {cells.map(([label, value]) => (
              <div className="bg-card p-3" key={label}>
                <span className="text-xs text-muted-foreground">{label}</span>
                <strong className="mt-1 block break-all font-mono text-sm text-ink">{value}</strong>
              </div>
            ))}
          </div>
          <p className="border-t border-border px-4 py-3 text-sm text-muted-foreground">
            <span className="font-semibold text-ink">Loại địa chỉ: </span>{describe(ip)}
          </p>
        </>
      ) : (
        <p className="p-4 text-sm text-muted-foreground">Nhập một địa chỉ IPv4 hợp lệ để xem kết quả.</p>
      )}
    </div>
  );
}

export function SameSubnetChecker() {
  const [a, setA] = useState('192.168.1.10');
  const [b, setB] = useState('192.168.1.200');
  const [prefix, setPrefix] = useState(24);

  const ipA = parseIp(a);
  const ipB = parseIp(b);
  const valid = ipA !== null && ipB !== null;
  const netA = valid ? networkOf(ipA, prefix) : 0;
  const netB = valid ? networkOf(ipB, prefix) : 0;
  const same = valid && netA === netB;

  return (
    <div className="my-8 border border-border bg-surface">
      <div className="border-b border-border px-4 py-3">
        <p className="font-mono text-xs font-semibold text-primary">Cùng subnet không?</p>
        <p className="mt-1 text-sm text-muted-foreground">Đây chính là phép kiểm tra máy A làm trước khi gửi gói tin cho máy B.</p>
      </div>
      <div className="grid gap-3 p-4 sm:grid-cols-3">
        {([['Máy A', a, setA], ['Máy B', b, setB]] as const).map(([label, value, setter]) => (
          <label className="block" key={label}>
            <span className="font-mono text-xs font-semibold text-muted-foreground">{label}</span>
            <input
              className="mt-1 h-11 w-full border border-border bg-card px-3 font-mono text-sm text-ink outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              value={value}
              onChange={(event) => setter(event.target.value)}
              spellCheck={false}
            />
          </label>
        ))}
        <label className="block">
          <span className="font-mono text-xs font-semibold text-muted-foreground">Prefix của A: /{prefix}</span>
          <input
            className="mt-4 w-full accent-[var(--primary)]"
            type="range"
            min={8}
            max={30}
            value={prefix}
            onChange={(event) => setPrefix(Number(event.target.value))}
            aria-label="Prefix của máy A"
          />
        </label>
      </div>
      <div className={`border-t border-border px-4 py-4 text-sm leading-6 ${!valid ? 'text-muted-foreground' : same ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300' : 'bg-amber-500/10 text-amber-800 dark:text-amber-300'}`}>
        {!valid ? (
          'Nhập hai địa chỉ IPv4 hợp lệ.'
        ) : (
          <>
            <p className="font-mono text-xs">
              {formatIp(netA)}/{prefix} {same ? '=' : '≠'} {formatIp(netB)}/{prefix}
            </p>
            <p className="mt-1 font-semibold">
              {same
                ? 'Cùng subnet: A hỏi ARP để lấy MAC của B rồi gửi trực tiếp, không cần qua router.'
                : 'Khác subnet: A không gửi thẳng cho B mà chuyển gói tin tới default gateway để router lo phần còn lại.'}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
