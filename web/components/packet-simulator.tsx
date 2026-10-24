'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw, Send } from 'lucide-react';
import {
  defaultConfig,
  emptyState,
  interfaces,
  routingTable,
  simulatePing,
  type Frame,
  type HostId,
  type LinkId,
  type NetState,
  type NodeId,
  type SimConfig,
  type SimEvent,
} from '@/lib/packet-sim';

const positions: Record<NodeId, { x: number; y: number }> = {
  A: { x: 80, y: 80 },
  B: { x: 80, y: 300 },
  SW1: { x: 250, y: 190 },
  R1: { x: 450, y: 190 },
  S: { x: 450, y: 335 },
  ISP: { x: 660, y: 190 },
  W: { x: 850, y: 190 },
};

const links: { id: LinkId; from: NodeId; to: NodeId }[] = [
  { id: 'A-SW1', from: 'A', to: 'SW1' },
  { id: 'B-SW1', from: 'B', to: 'SW1' },
  { id: 'SW1-R1', from: 'SW1', to: 'R1' },
  { id: 'R1-S', from: 'R1', to: 'S' },
  { id: 'R1-ISP', from: 'R1', to: 'ISP' },
  { id: 'ISP-W', from: 'ISP', to: 'W' },
];

const hostIds: HostId[] = ['A', 'B', 'S', 'W'];
const hostNames: Record<HostId, string> = { A: 'PC-A', B: 'PC-B', S: 'Server S', W: 'Web (Internet)' };

type Scenario = { id: string; label: string; source: HostId; destination: string; patch?: (config: SimConfig) => SimConfig };

const scenarios: Scenario[] = [
  { id: 'lan', label: 'Cùng LAN: A → B', source: 'A', destination: '192.168.1.20' },
  { id: 'routed', label: 'Qua router: A → S', source: 'A', destination: '192.168.2.20' },
  { id: 'internet', label: 'Ra Internet: A → Web', source: 'A', destination: '198.51.100.10' },
  {
    id: 'bad-gateway',
    label: 'Lỗi: sai gateway',
    source: 'A',
    destination: '192.168.2.20',
    patch: (config) => ({ ...config, hosts: { ...config.hosts, A: { ...config.hosts.A, gateway: '192.168.1.254' } } }),
  },
  {
    id: 'bad-mask',
    label: 'Lỗi: sai subnet mask',
    source: 'A',
    destination: '192.168.2.20',
    patch: (config) => ({ ...config, hosts: { ...config.hosts, A: { ...config.hosts.A, prefix: 16 } } }),
  },
  { id: 'no-nat', label: 'Lỗi: tắt NAT', source: 'A', destination: '198.51.100.10', patch: (config) => ({ ...config, nat: false }) },
  { id: 'no-default', label: 'Lỗi: thiếu default route', source: 'A', destination: '198.51.100.10', patch: (config) => ({ ...config, defaultRoute: false }) },
  { id: 'cable', label: 'Lỗi: đứt dây switch–router', source: 'A', destination: '192.168.2.20', patch: (config) => ({ ...config, down: ['SW1-R1'] }) },
];

const eventTone: Record<SimEvent['kind'], string> = {
  think: 'text-muted-foreground',
  route: 'text-primary',
  nat: 'text-primary',
  arp: 'text-amber-700 dark:text-amber-300',
  frame: 'text-primary',
  deliver: 'text-emerald-700 dark:text-emerald-300',
  success: 'text-emerald-700 dark:text-emerald-300',
  drop: 'text-rose-700 dark:text-rose-300',
};

function pathData(path: NodeId[]) {
  return path.map((node, index) => `${index === 0 ? 'M' : 'L'} ${positions[node].x} ${positions[node].y}`).join(' ');
}

function previousFrame(events: SimEvent[], index: number): Frame | undefined {
  for (let i = index - 1; i >= 0; i--) {
    const frame = events[i].frame;
    if (frame?.type === 'IPv4') return frame;
  }
  return undefined;
}

export function PacketSimulator() {
  const [config, setConfig] = useState<SimConfig>(defaultConfig);
  const [baseline, setBaseline] = useState<NetState>(emptyState);
  const [source, setSource] = useState<HostId>('A');
  const [destination, setDestination] = useState('192.168.2.20');
  const [events, setEvents] = useState<SimEvent[]>([]);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [tab, setTab] = useState<'config' | 'tables'>('config');

  const current = events[index];
  const shownState = current?.state ?? baseline;
  const ifaces = interfaces(config);

  useEffect(() => {
    if (!playing) return;
    if (index >= events.length - 1) {
      const stop = setTimeout(() => setPlaying(false), 0);
      return () => clearTimeout(stop);
    }
    const timer = setTimeout(() => setIndex((value) => value + 1), 1500);
    return () => clearTimeout(timer);
  }, [playing, index, events.length]);

  function run(nextConfig = config, from = source, to = destination, state = baseline) {
    const result = simulatePing(nextConfig, state, from, to);
    setEvents(result.events);
    setBaseline(result.state);
    setIndex(0);
    setPlaying(true);
  }

  function runScenario(scenario: Scenario) {
    const nextConfig = scenario.patch ? scenario.patch(defaultConfig) : defaultConfig;
    setConfig(nextConfig);
    setSource(scenario.source);
    setDestination(scenario.destination);
    run(nextConfig, scenario.source, scenario.destination, emptyState);
  }

  function updateHost(host: HostId, field: 'ip' | 'gateway' | 'prefix', value: string) {
    setConfig((previous) => ({
      ...previous,
      hosts: { ...previous.hosts, [host]: { ...previous.hosts[host], [field]: field === 'prefix' ? Math.min(32, Math.max(0, Number(value) || 0)) : value } },
    }));
  }

  function toggleLink(id: LinkId) {
    setConfig((previous) => ({ ...previous, down: previous.down.includes(id) ? previous.down.filter((link) => link !== id) : [...previous.down, id] }));
  }

  function resetAll() {
    setConfig(defaultConfig);
    setBaseline(emptyState);
    setEvents([]);
    setIndex(0);
    setPlaying(false);
  }

  const quickTargets = [
    { label: 'B', ip: config.hosts.B.ip },
    { label: 'S', ip: config.hosts.S.ip },
    { label: 'Gateway', ip: '192.168.1.1' },
    { label: 'ISP', ip: '203.0.113.1' },
    { label: 'Web', ip: config.hosts.W.ip },
  ];

  const lastFrame = current ? previousFrame(events, index) : undefined;
  const changed = (field: keyof Frame) => current?.frame?.type === 'IPv4' && lastFrame !== undefined && current.frame[field] !== lastFrame[field];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {scenarios.map((scenario) => (
          <button
            key={scenario.id}
            type="button"
            onClick={() => runScenario(scenario)}
            className={`border px-3 py-1.5 text-xs font-semibold transition-colors ${scenario.patch ? 'border-rose-500/30 bg-rose-500/5 text-ink hover:border-rose-500/60' : 'border-border bg-card text-ink hover:border-primary'}`}
          >
            {scenario.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4">
          <div className="border border-border bg-card">
            <div className="flex flex-wrap items-end gap-3 border-b border-border px-4 py-3">
              <label className="text-xs font-semibold text-ink">
                Nguồn
                <select
                  value={source}
                  onChange={(event) => setSource(event.target.value as HostId)}
                  className="mt-1 block h-9 border border-border bg-background px-2 text-sm text-ink outline-none focus:border-primary"
                >
                  {hostIds.map((host) => (
                    <option key={host} value={host}>{hostNames[host]}</option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-semibold text-ink">
                ping
                <input
                  value={destination}
                  onChange={(event) => setDestination(event.target.value)}
                  spellCheck={false}
                  className="mt-1 block h-9 w-40 border border-border bg-background px-2 font-mono text-sm text-ink outline-none focus:border-primary"
                />
              </label>
              <button type="button" onClick={() => run()} className="inline-flex h-9 items-center gap-2 bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90">
                <Send size={14} /> Gửi ping
              </button>
              <div className="flex flex-wrap gap-1">
                {quickTargets.map((target) => (
                  <button key={target.label} type="button" onClick={() => setDestination(target.ip)} className="border border-border px-2 py-1 font-mono text-[0.68rem] text-muted-foreground hover:border-primary hover:text-primary">
                    {target.label}
                  </button>
                ))}
              </div>
            </div>

            <svg viewBox="0 0 930 390" className="block w-full">
              <title>Sơ đồ mạng: hai LAN, router R1, router của ISP và web server trên Internet</title>
              <rect x="20" y="30" width="300" height="320" fill="none" stroke="currentColor" strokeDasharray="4 6" className="text-border" />
              <text x="30" y="50" className="fill-muted-foreground font-mono text-[11px]">LAN 1 · 192.168.1.0/24</text>
              <text x="482" y="380" className="fill-muted-foreground font-mono text-[11px]">LAN 2 · 192.168.2.0/24</text>
              <text x="560" y="140" className="fill-muted-foreground font-mono text-[11px]">203.0.113.0/30</text>
              <text x="560" y="40" className="fill-muted-foreground font-mono text-[11px]">── Internet ──</text>

              {links.map((link) => {
                const down = config.down.includes(link.id);
                const from = positions[link.from];
                const to = positions[link.to];
                return (
                  <g key={link.id} onClick={() => toggleLink(link.id)} className="cursor-pointer">
                    <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="transparent" strokeWidth={18} />
                    <line
                      x1={from.x}
                      y1={from.y}
                      x2={to.x}
                      y2={to.y}
                      strokeWidth={2}
                      strokeDasharray={down ? '6 6' : undefined}
                      className={down ? 'stroke-rose-500' : 'stroke-border'}
                    />
                    <title>{down ? `Nối lại dây ${link.id}` : `Cắt dây ${link.id}`}</title>
                  </g>
                );
              })}

              {(Object.keys(positions) as NodeId[]).map((node) => {
                const { x, y } = positions[node];
                const active = current?.at === node;
                const isHost = hostIds.includes(node as HostId);
                const width = node === 'R1' ? 150 : node === 'SW1' ? 84 : 130;
                const lines = isHost
                  ? [`${config.hosts[node as HostId].ip}/${config.hosts[node as HostId].prefix}`]
                  : node === 'R1'
                    ? ['eth0 192.168.1.1', 'eth1 192.168.2.1', 'eth2 203.0.113.2']
                    : node === 'ISP'
                      ? ['wan 203.0.113.1', 'lan 198.51.100.1']
                      : ['Layer 2'];
                const height = 26 + lines.length * 14;
                const title = isHost ? hostNames[node as HostId] : node === 'SW1' ? 'Switch' : node === 'ISP' ? 'Router ISP' : 'Router R1';
                return (
                  <g key={node}>
                    <rect
                      x={x - width / 2}
                      y={y - height / 2}
                      width={width}
                      height={height}
                      strokeWidth={active ? 2.5 : 1.5}
                      className={`${active ? 'stroke-primary' : 'stroke-border'} ${current?.kind === 'drop' && active ? 'fill-rose-500/10' : 'fill-card'}`}
                    />
                    <text x={x} y={y - height / 2 + 17} textAnchor="middle" className="fill-ink text-[12px] font-bold">{title}</text>
                    {lines.map((line, lineIndex) => (
                      <text key={line} x={x} y={y - height / 2 + 32 + lineIndex * 14} textAnchor="middle" className="fill-muted-foreground font-mono text-[10px]">{line}</text>
                    ))}
                  </g>
                );
              })}

              {current?.paths.map((path, pathIndex) => (
                <circle key={`${index}-${pathIndex}`} r={7} className={current.frame?.type === 'ARP' ? 'fill-amber-500' : 'fill-primary'}>
                  <animateMotion dur="1.1s" fill="freeze" path={pathData(path)} />
                </circle>
              ))}
            </svg>
            <div className="flex flex-wrap items-center gap-4 border-t border-border px-4 py-2 text-[0.7rem] text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="inline-block size-2.5 rounded-full bg-primary" /> Frame IPv4 (ping)</span>
              <span className="flex items-center gap-1.5"><span className="inline-block size-2.5 rounded-full bg-amber-500" /> Frame ARP</span>
              <span className="flex items-center gap-1.5"><span className="inline-block h-0 w-5 border-t-2 border-dashed border-rose-500" /> Dây bị cắt (bấm vào dây để cắt hoặc nối)</span>
            </div>
          </div>

          <div className="border border-border bg-card">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-2.5">
              <p className="font-mono text-xs font-semibold text-muted-foreground">
                {events.length > 0 ? `Bước ${index + 1}/${events.length}` : 'Chọn một tình huống hoặc bấm Gửi ping'}
              </p>
              <div className="flex gap-1">
                <button type="button" onClick={() => { setPlaying(false); setIndex((value) => Math.max(0, value - 1)); }} disabled={index === 0} className="grid size-8 place-items-center border border-border text-ink hover:border-primary disabled:opacity-30" aria-label="Bước trước">
                  <ChevronLeft size={15} />
                </button>
                <button type="button" onClick={() => setPlaying((value) => !value)} disabled={events.length === 0} className="grid size-8 place-items-center border border-border text-ink hover:border-primary disabled:opacity-30" aria-label={playing ? 'Tạm dừng' : 'Chạy tiếp'}>
                  {playing ? <Pause size={15} /> : <Play size={15} />}
                </button>
                <button type="button" onClick={() => { setPlaying(false); setIndex((value) => Math.min(events.length - 1, value + 1)); }} disabled={index >= events.length - 1} className="grid size-8 place-items-center border border-border text-ink hover:border-primary disabled:opacity-30" aria-label="Bước sau">
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>

            {current ? (
              <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                <div>
                  <p className={`font-mono text-[0.68rem] font-bold uppercase tracking-[0.08em] ${eventTone[current.kind]}`}>{current.kind} · {current.at}</p>
                  <h3 className="mt-1 text-base font-bold text-ink">{current.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{current.detail}</p>
                </div>
                {current.frame ? (
                  <div className="border border-code-border bg-code font-mono text-[0.72rem] text-code-foreground">
                    <p className="border-b border-white/10 px-3 py-2 text-white/50">Frame {current.frame.type}</p>
                    {[
                      ['MAC nguồn', current.frame.srcMac, changed('srcMac')],
                      ['MAC đích', current.frame.dstMac, changed('dstMac')],
                      ...(current.frame.type === 'IPv4'
                        ? [
                            ['IP nguồn', current.frame.srcIp, changed('srcIp')],
                            ['IP đích', current.frame.dstIp, changed('dstIp')],
                            ['TTL', String(current.frame.ttl), changed('ttl')],
                          ]
                        : []),
                      ['Nội dung', current.frame.info, false],
                    ].map(([label, value, isChanged]) => (
                      <div className="grid grid-cols-[6.5rem_1fr] gap-2 border-b border-white/5 px-3 py-1.5 last:border-b-0" key={String(label)}>
                        <span className="text-white/50">{label}</span>
                        <span className={isChanged ? 'font-bold text-amber-300' : ''}>{value}{isChanged ? ' ← đổi' : ''}</span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="p-4 text-sm leading-6 text-muted-foreground">
                Mỗi lần ping, bộ mô phỏng tự tính đường đi từ cấu hình hiện tại: so subnet, hỏi ARP, switch học MAC, router tra bảng định tuyến, NAT đổi địa chỉ. Kết quả không viết sẵn, nên hãy thử sửa cấu hình ở cột bên phải và xem điều gì hỏng.
              </p>
            )}

            {events.length > 0 ? (
              <ol className="max-h-56 overflow-y-auto border-t border-border text-xs">
                {events.map((event, eventIndex) => (
                  <li key={`${eventIndex}-${event.title}`}>
                    <button
                      type="button"
                      onClick={() => { setPlaying(false); setIndex(eventIndex); }}
                      className={`flex w-full gap-3 px-4 py-1.5 text-left transition-colors ${eventIndex === index ? 'bg-primary-soft' : 'hover:bg-accent'}`}
                    >
                      <span className="w-5 shrink-0 font-mono text-muted-foreground">{eventIndex + 1}</span>
                      <span className={`w-14 shrink-0 font-mono font-semibold ${eventTone[event.kind]}`}>{event.kind}</span>
                      <span className="text-ink">{event.title}</span>
                    </button>
                  </li>
                ))}
              </ol>
            ) : null}
          </div>
        </div>

        <aside className="border border-border bg-card">
          <div className="grid grid-cols-2 border-b border-border">
            {(['config', 'tables'] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setTab(value)}
                aria-pressed={tab === value}
                className={`py-2.5 text-xs font-semibold ${tab === value ? 'bg-primary text-primary-foreground' : 'text-ink hover:bg-accent'}`}
              >
                {value === 'config' ? 'Cấu hình' : 'Bảng trạng thái'}
              </button>
            ))}
          </div>

          {tab === 'config' ? (
            <div className="space-y-4 p-4 text-xs">
              {hostIds.map((host) => (
                <fieldset key={host} className="border border-border p-3">
                  <legend className="px-1 font-semibold text-ink">{hostNames[host]}</legend>
                  <div className="grid grid-cols-[1fr_3.5rem] gap-2">
                    <label className="text-muted-foreground">
                      IP
                      <input value={config.hosts[host].ip} onChange={(event) => updateHost(host, 'ip', event.target.value)} spellCheck={false} className="mt-0.5 block h-8 w-full border border-border bg-background px-2 font-mono text-ink outline-none focus:border-primary" />
                    </label>
                    <label className="text-muted-foreground">
                      Prefix
                      <input type="number" min={0} max={32} value={config.hosts[host].prefix} onChange={(event) => updateHost(host, 'prefix', event.target.value)} className="mt-0.5 block h-8 w-full border border-border bg-background px-2 font-mono text-ink outline-none focus:border-primary" />
                    </label>
                  </div>
                  <label className="mt-2 block text-muted-foreground">
                    Default gateway
                    <input value={config.hosts[host].gateway} onChange={(event) => updateHost(host, 'gateway', event.target.value)} spellCheck={false} className="mt-0.5 block h-8 w-full border border-border bg-background px-2 font-mono text-ink outline-none focus:border-primary" />
                  </label>
                </fieldset>
              ))}

              <fieldset className="space-y-2 border border-border p-3">
                <legend className="px-1 font-semibold text-ink">Router R1</legend>
                <label className="flex items-center gap-2 text-ink">
                  <input type="checkbox" checked={config.nat} onChange={() => setConfig((previous) => ({ ...previous, nat: !previous.nat }))} className="accent-[var(--primary)]" />
                  NAT cho 192.168.0.0/16 ra eth2
                </label>
                <label className="flex items-center gap-2 text-ink">
                  <input type="checkbox" checked={config.defaultRoute} onChange={() => setConfig((previous) => ({ ...previous, defaultRoute: !previous.defaultRoute }))} className="accent-[var(--primary)]" />
                  Default route 0.0.0.0/0 → 203.0.113.1
                </label>
              </fieldset>

              <button type="button" onClick={resetAll} className="inline-flex w-full items-center justify-center gap-2 border border-border py-2 font-semibold text-ink hover:border-primary">
                <RotateCcw size={13} /> Khôi phục cấu hình và xóa cache
              </button>
            </div>
          ) : (
            <div className="space-y-4 p-4 text-xs">
              <StateTable
                title="Bảng định tuyến R1"
                head={['Đích', 'Ra', 'Next hop']}
                rows={routingTable('R1', config).map((route) => [route.cidr, route.iface, route.via ?? 'trực tiếp'])}
              />
              <StateTable
                title="MAC table của switch"
                head={['MAC', 'Cổng']}
                rows={Object.entries(shownState.macTable).map(([mac, port]) => [mac, port])}
                empty="Trống: switch chưa thấy frame nào."
              />
              {(['A', 'B', 'R1', 'S', 'ISP', 'W'] as NodeId[]).map((node) => (
                <StateTable
                  key={node}
                  title={`ARP cache của ${node}`}
                  head={['IP', 'MAC']}
                  rows={Object.entries(shownState.arp[node] ?? {}).map(([ip, mac]) => [ip, mac])}
                  empty="Trống"
                />
              ))}
              <StateTable
                title="Bảng NAT của R1"
                head={['Bên trong', 'Bên ngoài']}
                rows={shownState.nat.map((entry) => [`${entry.inside} id ${entry.insideId}`, `${ifaces.find((iface) => iface.name === 'eth2')?.ip} id ${entry.outsideId}`])}
                empty="Trống"
              />
              <p className="leading-5 text-muted-foreground">Bảng hiển thị trạng thái tại bước đang xem. Cache được giữ giữa các lần ping, nên ping lần hai sẽ không cần ARP nữa.</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function StateTable({ title, head, rows, empty = 'Trống' }: { title: string; head: string[]; rows: string[][]; empty?: string }) {
  return (
    <div>
      <p className="font-semibold text-ink">{title}</p>
      {rows.length > 0 ? (
        <table className="mt-1 w-full border border-border font-mono text-[0.68rem]">
          <thead className="bg-surface text-muted-foreground">
            <tr>
              {head.map((label) => (
                <th className="px-2 py-1 text-left font-semibold" key={label}>{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr className="border-t border-border" key={row.join('|')}>
                {row.map((cell, cellIndex) => (
                  <td className="break-all px-2 py-1 text-ink" key={cellIndex}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="mt-1 text-muted-foreground">{empty}</p>
      )}
    </div>
  );
}
