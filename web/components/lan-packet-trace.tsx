'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

type Row = [label: string, value: string, changed?: boolean];

type Step = {
  title: string;
  text: string;
  nodes: string[];
  edges: Record<string, 'flow' | 'flood'>;
  frameTitle?: string;
  frame?: Row[];
  macTable: [mac: string, port: string][];
  arpCache: [ip: string, mac: string][];
};

const MAC = {
  a: '02:aa:00:00:00:0a',
  b: '02:bb:00:00:00:0b',
  r1: '02:cc:00:00:00:01',
  r2: '02:cc:00:00:00:02',
  s: '02:ee:00:00:00:0e',
};

const nodes = [
  { id: 'a', x: 20, y: 36, w: 124, h: 58, title: 'PC-A', lines: ['192.168.1.10/24'] },
  { id: 'b', x: 20, y: 206, w: 124, h: 58, title: 'PC-B', lines: ['192.168.1.20/24'] },
  { id: 'sw', x: 264, y: 122, w: 90, h: 56, title: 'Switch', lines: ['Layer 2'] },
  { id: 'r', x: 430, y: 106, w: 112, h: 88, title: 'Router', lines: ['eth0 192.168.1.1', 'eth1 192.168.2.1'] },
  { id: 's', x: 586, y: 121, w: 100, h: 58, title: 'Server S', lines: ['192.168.2.20/24'] },
];

const edges = [
  { id: 'a-sw', x1: 144, y1: 70, x2: 264, y2: 142 },
  { id: 'b-sw', x1: 144, y1: 230, x2: 264, y2: 158 },
  { id: 'sw-r', x1: 354, y1: 150, x2: 430, y2: 150 },
  { id: 'r-s', x1: 542, y1: 150, x2: 586, y2: 150 },
];

const scenarios: Record<'same' | 'routed', { label: string; hint: string; steps: Step[] }> = {
  same: {
    label: 'A → B (cùng LAN)',
    hint: 'PC-A gửi cho PC-B 192.168.1.20',
    steps: [
      {
        title: 'A tự hỏi: đích có cùng subnet không?',
        text: '192.168.1.20 AND mask /24 = 192.168.1.0, trùng với network của A. Vậy A gửi trực tiếp, không cần gateway. Nhưng để tạo frame Ethernet, A còn thiếu MAC của 192.168.1.20.',
        nodes: ['a'],
        edges: {},
        macTable: [],
        arpCache: [],
      },
      {
        title: 'ARP request: broadcast cả LAN',
        text: 'A hét lên cho cả LAN: “Ai có 192.168.1.20?”. Địa chỉ đích ff:ff:ff:ff:ff:ff nghĩa là mọi máy cùng nhận. Switch học được MAC của A nằm ở port 1, rồi flood frame ra mọi port còn lại.',
        nodes: ['a', 'sw'],
        edges: { 'a-sw': 'flow', 'b-sw': 'flood', 'sw-r': 'flood' },
        frameTitle: 'ARP request',
        frame: [
          ['Ethernet đích', 'ff:ff:ff:ff:ff:ff'],
          ['Ethernet nguồn', MAC.a],
          ['Hỏi', 'Ai có 192.168.1.20?'],
          ['Người hỏi', '192.168.1.10'],
        ],
        macTable: [[MAC.a, 'P1']],
        arpCache: [],
      },
      {
        title: 'ARP reply: chỉ B trả lời, unicast',
        text: 'Chỉ PC-B nhận ra địa chỉ IP của mình và trả lời thẳng cho A. Switch học thêm MAC của B nằm ở port 3. A lưu kết quả vào ARP cache để lần sau khỏi hỏi lại.',
        nodes: ['b', 'sw', 'a'],
        edges: { 'b-sw': 'flow', 'a-sw': 'flow' },
        frameTitle: 'ARP reply',
        frame: [
          ['Ethernet đích', MAC.a],
          ['Ethernet nguồn', MAC.b],
          ['Trả lời', '192.168.1.20 ở MAC ' + MAC.b],
        ],
        macTable: [[MAC.a, 'P1'], [MAC.b, 'P3']],
        arpCache: [['192.168.1.20', MAC.b]],
      },
      {
        title: 'Frame dữ liệu đi thẳng đến B',
        text: 'Giờ A đã đủ thông tin. Switch tra bảng MAC, thấy MAC của B ở port 3 và chỉ chuyển frame đến đó. Router không hề thấy frame này.',
        nodes: ['a', 'sw', 'b'],
        edges: { 'a-sw': 'flow', 'b-sw': 'flow' },
        frameTitle: 'Frame dữ liệu',
        frame: [
          ['Ethernet đích', MAC.b],
          ['Ethernet nguồn', MAC.a],
          ['IP nguồn', '192.168.1.10'],
          ['IP đích', '192.168.1.20'],
          ['TTL', '64'],
        ],
        macTable: [[MAC.a, 'P1'], [MAC.b, 'P3']],
        arpCache: [['192.168.1.20', MAC.b]],
      },
    ],
  },
  routed: {
    label: 'A → Server S (qua router)',
    hint: 'PC-A gửi cho Server S 192.168.2.20 ở subnet khác',
    steps: [
      {
        title: 'A tự hỏi: đích có cùng subnet không?',
        text: '192.168.2.20 AND mask /24 = 192.168.2.0, khác 192.168.1.0 của A. A không thể tự đưa gói tin tới đó, nên nó sẽ giao cho default gateway 192.168.1.1 và cần biết MAC của gateway.',
        nodes: ['a'],
        edges: {},
        macTable: [],
        arpCache: [],
      },
      {
        title: 'ARP request cho gateway',
        text: 'Lưu ý: A không ARP cho server mà ARP cho gateway, vì MAC chỉ có ý nghĩa trong cùng một LAN. Broadcast này đến mọi máy trong LAN, kể cả router.',
        nodes: ['a', 'sw'],
        edges: { 'a-sw': 'flow', 'b-sw': 'flood', 'sw-r': 'flood' },
        frameTitle: 'ARP request',
        frame: [
          ['Ethernet đích', 'ff:ff:ff:ff:ff:ff'],
          ['Ethernet nguồn', MAC.a],
          ['Hỏi', 'Ai có 192.168.1.1?'],
          ['Người hỏi', '192.168.1.10'],
        ],
        macTable: [[MAC.a, 'P1']],
        arpCache: [],
      },
      {
        title: 'Router trả lời bằng MAC của eth0',
        text: 'Router đáp lại với MAC ở cổng phía LAN. Switch học MAC này nằm ở port 2. A lưu: gateway 192.168.1.1 có MAC 02:cc:…:01.',
        nodes: ['r', 'sw', 'a'],
        edges: { 'sw-r': 'flow', 'a-sw': 'flow' },
        frameTitle: 'ARP reply',
        frame: [
          ['Ethernet đích', MAC.a],
          ['Ethernet nguồn', MAC.r1],
          ['Trả lời', '192.168.1.1 ở MAC ' + MAC.r1],
        ],
        macTable: [[MAC.a, 'P1'], [MAC.r1, 'P2']],
        arpCache: [['192.168.1.1', MAC.r1]],
      },
      {
        title: 'Frame 1: gửi cho router, nhưng nhắm tới server',
        text: 'Đây là điểm dễ nhầm nhất: Ethernet đích là MAC của router (chặng kế tiếp), còn IP đích vẫn là server S (đích cuối cùng). MAC chỉ ghi chặng tiếp theo; IP ghi nơi gói tin muốn đến.',
        nodes: ['a', 'sw', 'r'],
        edges: { 'a-sw': 'flow', 'sw-r': 'flow' },
        frameTitle: 'Frame 1 (trên LAN 192.168.1.0/24)',
        frame: [
          ['Ethernet đích', MAC.r1],
          ['Ethernet nguồn', MAC.a],
          ['IP nguồn', '192.168.1.10'],
          ['IP đích', '192.168.2.20'],
          ['TTL', '64'],
        ],
        macTable: [[MAC.a, 'P1'], [MAC.r1, 'P2']],
        arpCache: [['192.168.1.1', MAC.r1]],
      },
      {
        title: 'Router bóc frame, tra bảng định tuyến',
        text: 'Router bỏ header Ethernet, đọc IP đích 192.168.2.20, tra route table thấy 192.168.2.0/24 nằm ở eth1. Nó giảm TTL đi 1, ARP (nếu cần) để biết MAC của server, rồi đóng gói lại bằng header Ethernet mới.',
        nodes: ['r'],
        edges: {},
        frameTitle: 'Route table của router',
        frame: [
          ['192.168.1.0/24', 'dev eth0'],
          ['192.168.2.0/24', 'dev eth1'],
          ['Khớp với', '192.168.2.0/24'],
        ],
        macTable: [[MAC.a, 'P1'], [MAC.r1, 'P2']],
        arpCache: [['192.168.1.1', MAC.r1]],
      },
      {
        title: 'Frame 2: MAC đổi, IP giữ nguyên',
        text: 'So với frame 1: hai địa chỉ MAC và TTL đã thay đổi (tô vàng), hai địa chỉ IP thì không. Mỗi chặng dùng cặp MAC riêng của chặng đó, còn IP là “địa chỉ trên bao thư” đi suốt từ đầu đến cuối.',
        nodes: ['r', 's'],
        edges: { 'r-s': 'flow' },
        frameTitle: 'Frame 2 (trên LAN 192.168.2.0/24)',
        frame: [
          ['Ethernet đích', MAC.s, true],
          ['Ethernet nguồn', MAC.r2, true],
          ['IP nguồn', '192.168.1.10'],
          ['IP đích', '192.168.2.20'],
          ['TTL', '63', true],
        ],
        macTable: [[MAC.a, 'P1'], [MAC.r1, 'P2']],
        arpCache: [['192.168.1.1', MAC.r1]],
      },
    ],
  },
};

export function LanPacketTrace() {
  const [scenarioKey, setScenarioKey] = useState<'same' | 'routed'>('same');
  const [index, setIndex] = useState(0);

  const scenario = scenarios[scenarioKey];
  const step = scenario.steps[index];
  const lastIndex = scenario.steps.length - 1;

  function chooseScenario(key: 'same' | 'routed') {
    setScenarioKey(key);
    setIndex(0);
  }

  return (
    <div className="my-8 border border-border bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div>
          <p className="font-mono text-xs font-semibold text-primary">LAN packet trace</p>
          <p className="mt-1 text-sm text-muted-foreground">{scenario.hint}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(scenarios) as (keyof typeof scenarios)[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => chooseScenario(key)}
              aria-pressed={scenarioKey === key}
              className={`border px-3 py-2 text-xs font-semibold ${scenarioKey === key ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-ink hover:border-primary'}`}
            >
              {scenarios[key].label}
            </button>
          ))}
        </div>
      </div>

      <div className="border-b border-border p-3 sm:p-4">
        <svg viewBox="0 0 706 300" className="w-full border border-border bg-card" aria-hidden="true">
          {edges.map((edge) => {
            const state = step.edges[edge.id];
            return (
              <line
                key={edge.id}
                x1={edge.x1}
                y1={edge.y1}
                x2={edge.x2}
                y2={edge.y2}
                stroke={state ? 'var(--primary)' : 'var(--border)'}
                strokeWidth={state ? 3.5 : 2}
                strokeDasharray={state === 'flood' ? '6 5' : undefined}
              />
            );
          })}
          {[['P1', 250, 118], ['P3', 250, 196], ['P2', 360, 140]].map(([label, x, y]) => (
            <text key={label} x={x} y={y} fill="var(--muted-foreground)" fontSize="10" fontFamily="var(--font-mono)">{label}</text>
          ))}
          {nodes.map((node) => {
            const active = step.nodes.includes(node.id);
            return (
              <g key={node.id}>
                <rect
                  x={node.x}
                  y={node.y}
                  width={node.w}
                  height={node.h}
                  fill={active ? 'var(--primary-soft)' : 'var(--card)'}
                  stroke={active ? 'var(--primary)' : 'var(--border)'}
                  strokeWidth={active ? 2.5 : 1.5}
                />
                <text x={node.x + node.w / 2} y={node.y + 22} textAnchor="middle" fill="var(--ink)" fontSize="13" fontWeight="700">{node.title}</text>
                {node.lines.map((line, lineIndex) => (
                  <text key={line} x={node.x + node.w / 2} y={node.y + 40 + lineIndex * 15} textAnchor="middle" fill="var(--muted-foreground)" fontSize="10" fontFamily="var(--font-mono)">{line}</text>
                ))}
              </g>
            );
          })}
        </svg>
        <p className="sr-only">Sơ đồ mạng gồm hai PC, một switch, một router và một server.</p>
        <p className="mt-2 text-xs text-muted-foreground">Nét liền là đường gói tin thực sự đi; nét đứt là switch flood broadcast ra các port còn lại.</p>
      </div>

      <div className="grid gap-px bg-border lg:grid-cols-[1.15fr_1fr]">
        <div className="bg-surface p-4 lg:p-5">
          <p className="font-mono text-xs font-semibold text-primary">Bước {index + 1}/{scenario.steps.length}</p>
          <h3 className="mt-1 font-bold text-ink">{step.title}</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.text}</p>
          <div className="mt-4 flex items-center gap-2">
            <button type="button" onClick={() => setIndex((value) => Math.max(0, value - 1))} disabled={index === 0} className="inline-flex size-9 items-center justify-center border border-border bg-card text-ink hover:border-primary disabled:opacity-40" aria-label="Bước trước">
              <ChevronLeft size={16} />
            </button>
            <button type="button" onClick={() => setIndex((value) => Math.min(lastIndex, value + 1))} disabled={index === lastIndex} className="inline-flex size-9 items-center justify-center border border-border bg-card text-ink hover:border-primary disabled:opacity-40" aria-label="Bước tiếp theo">
              <ChevronRight size={16} />
            </button>
            <button type="button" onClick={() => setIndex(0)} className="inline-flex size-9 items-center justify-center border border-border bg-card text-ink hover:border-primary" aria-label="Đặt lại">
              <RotateCcw size={15} />
            </button>
          </div>
        </div>

        <div className="space-y-4 bg-surface p-4 lg:p-5">
          {step.frame ? (
            <div>
              <p className="font-mono text-xs font-semibold text-muted-foreground">{step.frameTitle}</p>
              <dl className="mt-2 border border-border bg-card text-sm">
                {step.frame.map(([label, value, changed]) => (
                  <div className={`flex justify-between gap-3 border-b border-border px-3 py-1.5 last:border-b-0 ${changed ? 'bg-amber-500/15' : ''}`} key={label}>
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd className="break-all text-right font-mono text-xs font-semibold text-ink">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="font-mono text-xs font-semibold text-muted-foreground">MAC table của switch</p>
              <div className="mt-2 min-h-12 border border-border bg-card px-3 py-2 font-mono text-[0.7rem] leading-5 text-ink">
                {step.macTable.length === 0 ? <span className="text-muted-foreground">(trống)</span> : step.macTable.map(([mac, port]) => <div key={mac}>{mac.slice(3, 5).toUpperCase()}…{mac.slice(-2)} → {port}</div>)}
              </div>
            </div>
            <div>
              <p className="font-mono text-xs font-semibold text-muted-foreground">ARP cache của PC-A</p>
              <div className="mt-2 min-h-12 border border-border bg-card px-3 py-2 font-mono text-[0.7rem] leading-5 text-ink">
                {step.arpCache.length === 0 ? <span className="text-muted-foreground">(trống)</span> : step.arpCache.map(([ip, mac]) => <div key={ip}>{ip} → …{mac.slice(-5)}</div>)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
