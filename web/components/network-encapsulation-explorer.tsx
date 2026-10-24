'use client';

import { useState } from 'react';
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

type Layer = {
  name: string;
  pdu: string;
  header: string;
  fields: string;
  reader: string;
  color: string;
};

const layers: Layer[] = [
  {
    name: 'Ứng dụng · L7',
    pdu: 'Data',
    header: 'GET /index.html HTTP/1.1',
    fields: 'Nội dung mà ứng dụng muốn gửi: ở đây là một HTTP request.',
    reader: 'Web server (Nginx, Node.js…)',
    color: 'border-emerald-500/50 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  },
  {
    name: 'Giao vận · L4',
    pdu: 'Segment',
    header: 'TCP 52814 → 443',
    fields: 'Port nguồn và đích, số thứ tự (seq/ack), cờ SYN/ACK/FIN, kích thước cửa sổ.',
    reader: 'TCP stack trong kernel của máy đích',
    color: 'border-amber-500/50 bg-amber-500/15 text-amber-700 dark:text-amber-300',
  },
  {
    name: 'Mạng · L3',
    pdu: 'Packet',
    header: 'IP 192.168.1.10 → 198.51.100.20',
    fields: 'IP nguồn và đích, TTL, trường protocol (6 = TCP).',
    reader: 'Router trên đường đi',
    color: 'border-sky-500/50 bg-sky-500/15 text-sky-700 dark:text-sky-300',
  },
  {
    name: 'Liên kết dữ liệu · L2',
    pdu: 'Frame',
    header: 'Ethernet MAC-router ← MAC-máy-bạn',
    fields: 'MAC nguồn và đích của chặng kế tiếp, EtherType 0x0800 (IPv4), FCS ở cuối frame để phát hiện lỗi.',
    reader: 'Switch và card mạng (NIC)',
    color: 'border-violet-500/50 bg-violet-500/15 text-violet-700 dark:text-violet-300',
  },
  {
    name: 'Vật lý · L1',
    pdu: 'Bit',
    header: '1010 0110 0100 0111 …',
    fields: 'Frame được đổi thành tín hiệu điện, ánh sáng hoặc sóng radio trên đường truyền.',
    reader: 'Cáp đồng, cáp quang, sóng Wi-Fi',
    color: 'border-rose-500/50 bg-rose-500/15 text-rose-700 dark:text-rose-300',
  },
];

// Độ rộng tương đối của từng phần trong frame, chỉ mang tính minh họa.
const barWeights = { eth: 14, ip: 20, tcp: 20, data: 46, fcs: 8 };

export function NetworkEncapsulationExplorer() {
  const [direction, setDirection] = useState<'send' | 'receive'>('send');
  const [position, setPosition] = useState(0);

  const attached = direction === 'send' ? position : 4 - position;
  const activeLayer = layers[attached];
  const verb = direction === 'send' ? 'đóng gói' : 'bóc';

  function changeDirection(next: 'send' | 'receive') {
    setDirection(next);
    setPosition(0);
  }

  const segments = [
    { key: 'eth', label: 'Eth header', show: attached >= 3, weight: barWeights.eth, layer: layers[3] },
    { key: 'ip', label: 'IP header', show: attached >= 2, weight: barWeights.ip, layer: layers[2] },
    { key: 'tcp', label: 'TCP header', show: attached >= 1, weight: barWeights.tcp, layer: layers[1] },
    { key: 'data', label: 'HTTP data', show: true, weight: barWeights.data, layer: layers[0] },
    { key: 'fcs', label: 'FCS', show: attached >= 3, weight: barWeights.fcs, layer: layers[3] },
  ].filter((segment) => segment.show);

  return (
    <div className="my-8 border border-border bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div>
          <p className="font-mono text-xs font-semibold text-primary">Encapsulation explorer</p>
          <p className="mt-1 text-sm text-muted-foreground">Xem dữ liệu được thêm header khi đi xuống và bị bóc header khi đi lên.</p>
        </div>
        <div className="flex gap-2">
          {([['send', 'Máy gửi', ArrowDown], ['receive', 'Máy nhận', ArrowUp]] as const).map(([value, label, Icon]) => (
            <button
              key={value}
              type="button"
              onClick={() => changeDirection(value)}
              aria-pressed={direction === value}
              className={`inline-flex items-center gap-1.5 border px-3 py-2 text-xs font-semibold ${direction === value ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-ink hover:border-primary'}`}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>
      </div>

      <div className="border-b border-border p-4">
        <p className="mb-2 font-mono text-xs text-muted-foreground">
          {attached === 4 ? 'Trên dây: chuỗi bit của cả frame' : `Gói tin hiện tại: ${activeLayer.pdu}`}
        </p>
        <div className="flex min-h-14 gap-1 overflow-x-auto">
          {segments.map((segment) => (
            <div
              key={segment.key}
              className={`grid min-w-16 place-items-center border px-2 py-3 text-center font-mono text-[0.7rem] font-semibold transition-all ${segment.layer.color}`}
              style={{ flex: segment.weight }}
            >
              {segment.label}
            </div>
          ))}
        </div>
        {attached === 4 ? (
          <p className="mt-3 break-all font-mono text-xs leading-6 text-rose-700 dark:text-rose-300">
            10101000 00000010 00001100 … 01100111 01000101 00101110 …
          </p>
        ) : null}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr]">
        <ol className="border-b border-border lg:border-b-0 lg:border-r">
          {layers.map((layer, index) => {
            const isActive = index === attached;
            return (
              <li key={layer.name}>
                <button
                  type="button"
                  onClick={() => setPosition(direction === 'send' ? index : 4 - index)}
                  aria-current={isActive ? 'step' : undefined}
                  className={`flex w-full items-center justify-between gap-3 border-b border-border px-4 py-3 text-left text-sm last:border-b-0 ${isActive ? 'bg-primary-soft font-semibold text-primary' : 'text-ink hover:bg-accent'}`}
                >
                  <span>{layer.name}</span>
                  <span className="font-mono text-xs text-muted-foreground">{layer.pdu}</span>
                </button>
              </li>
            );
          })}
        </ol>

        <div className="p-4 lg:p-5">
          <p className="font-mono text-xs font-semibold text-primary">
            {attached === 0 && direction === 'send' ? 'Bắt đầu' : attached === 0 ? 'Đã bóc xong' : `Tầng ${activeLayer.name} ${verb}`}
          </p>
          <p className="mt-2 font-mono text-sm font-semibold text-ink">{activeLayer.header}</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{activeLayer.fields}</p>
          <div className="mt-4 border border-border bg-card p-3 text-sm">
            <span className="font-semibold text-ink">Ai đọc phần này? </span>
            <span className="text-muted-foreground">{activeLayer.reader}</span>
          </div>

          <div className="mt-5 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPosition((value) => Math.max(0, value - 1))}
              disabled={position === 0}
              className="inline-flex size-9 items-center justify-center border border-border bg-card text-ink hover:border-primary disabled:opacity-40"
              aria-label="Bước trước"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => setPosition((value) => Math.min(4, value + 1))}
              disabled={position === 4}
              className="inline-flex size-9 items-center justify-center border border-border bg-card text-ink hover:border-primary disabled:opacity-40"
              aria-label="Bước tiếp theo"
            >
              <ChevronRight size={16} />
            </button>
            <button
              type="button"
              onClick={() => setPosition(0)}
              className="inline-flex size-9 items-center justify-center border border-border bg-card text-ink hover:border-primary"
              aria-label="Đặt lại"
            >
              <RotateCcw size={15} />
            </button>
            <span className="ml-1 font-mono text-xs text-muted-foreground">bước {position + 1}/5</span>
          </div>
        </div>
      </div>
    </div>
  );
}
