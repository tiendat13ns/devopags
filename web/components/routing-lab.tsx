'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

type RouterId = 'R1' | 'R2' | 'R3' | 'R4' | 'R5' | 'R6';
type Edge = { id: string; a: RouterId; b: RouterId; cost: number; down: boolean };

const routers: RouterId[] = ['R1', 'R2', 'R3', 'R4', 'R5', 'R6'];

const positions: Record<RouterId, { x: number; y: number }> = {
  R1: { x: 80, y: 200 },
  R2: { x: 270, y: 80 },
  R3: { x: 270, y: 320 },
  R4: { x: 500, y: 80 },
  R5: { x: 500, y: 320 },
  R6: { x: 690, y: 200 },
};

const initialEdges: Edge[] = [
  { id: 'R1-R2', a: 'R1', b: 'R2', cost: 2, down: false },
  { id: 'R1-R3', a: 'R1', b: 'R3', cost: 5, down: false },
  { id: 'R2-R3', a: 'R2', b: 'R3', cost: 2, down: false },
  { id: 'R2-R4', a: 'R2', b: 'R4', cost: 4, down: false },
  { id: 'R3-R5', a: 'R3', b: 'R5', cost: 3, down: false },
  { id: 'R4-R5', a: 'R4', b: 'R5', cost: 1, down: false },
  { id: 'R4-R6', a: 'R4', b: 'R6', cost: 2, down: false },
  { id: 'R5-R6', a: 'R5', b: 'R6', cost: 5, down: false },
];

type Metric = 'cost' | 'hops';

type Relaxation = { neighbour: RouterId; via: number; before: number; improved: boolean };
type DijkstraStep = {
  current: RouterId;
  distance: number;
  relaxations: Relaxation[];
  dist: Record<RouterId, number>;
  prev: Partial<Record<RouterId, RouterId>>;
  visited: RouterId[];
};

function weight(edge: Edge, metric: Metric) {
  return metric === 'hops' ? 1 : edge.cost;
}

function dijkstra(source: RouterId, edges: Edge[], metric: Metric) {
  const dist = Object.fromEntries(routers.map((router) => [router, Infinity])) as Record<RouterId, number>;
  const prev: Partial<Record<RouterId, RouterId>> = {};
  const visited: RouterId[] = [];
  const steps: DijkstraStep[] = [];
  dist[source] = 0;

  while (visited.length < routers.length) {
    // Lấy router chưa chốt có khoảng cách nhỏ nhất; hòa thì theo tên để kết quả ổn định.
    const current = routers.filter((router) => !visited.includes(router)).sort((left, right) => dist[left] - dist[right] || left.localeCompare(right))[0];
    if (dist[current] === Infinity) break;
    visited.push(current);

    const relaxations: Relaxation[] = [];
    for (const edge of edges) {
      if (edge.down || (edge.a !== current && edge.b !== current)) continue;
      const neighbour = edge.a === current ? edge.b : edge.a;
      if (visited.includes(neighbour)) continue;
      const via = dist[current] + weight(edge, metric);
      const before = dist[neighbour];
      const improved = via < before;
      if (improved) {
        dist[neighbour] = via;
        prev[neighbour] = current;
      }
      relaxations.push({ neighbour, via, before, improved });
    }

    steps.push({ current, distance: dist[current], relaxations, dist: { ...dist }, prev: { ...prev }, visited: [...visited] });
  }

  return { dist, prev, steps };
}

function pathTo(destination: RouterId, source: RouterId, prev: Partial<Record<RouterId, RouterId>>) {
  if (destination === source) return [source];
  const path: RouterId[] = [destination];
  let node = prev[destination];
  while (node) {
    path.unshift(node);
    if (node === source) return path;
    node = prev[node];
  }
  return null;
}

function routeTable(source: RouterId, edges: Edge[], metric: Metric) {
  const { dist, prev } = dijkstra(source, edges, metric);
  return routers
    .filter((router) => router !== source)
    .map((destination) => {
      const path = pathTo(destination, source, prev);
      return { destination, path, nextHop: path?.[1] ?? null, cost: dist[destination] };
    });
}

const edgeKey = (a: RouterId, b: RouterId) => [a, b].sort().join('-');

export function RoutingLab() {
  const [edges, setEdges] = useState(initialEdges);
  const [metric, setMetric] = useState<Metric>('cost');
  const [source, setSource] = useState<RouterId>('R1');
  const [destination, setDestination] = useState<RouterId>('R6');
  const [selectedEdge, setSelectedEdge] = useState<string>('R2-R4');
  const [mode, setMode] = useState<'result' | 'steps'>('result');
  const [stepIndex, setStepIndex] = useState(0);
  const [changes, setChanges] = useState<string[]>([]);

  const { dist, prev, steps } = dijkstra(source, edges, metric);
  const table = routeTable(source, edges, metric);
  const path = pathTo(destination, source, prev);
  const pathEdges = new Set(path ? path.slice(1).map((node, index) => edgeKey(path[index], node)) : []);
  const treeEdges = new Set(routers.flatMap((router) => (prev[router] ? [edgeKey(router, prev[router]!)] : [])));
  const step = mode === 'steps' ? steps[Math.min(stepIndex, steps.length - 1)] : undefined;
  const edge = edges.find((item) => item.id === selectedEdge)!;

  // Sau mỗi thay đổi topology, so bảng định tuyến cũ và mới để thấy mạng "hội tụ" lại thế nào.
  function updateEdges(nextEdges: Edge[]) {
    const before = routeTable(source, edges, metric);
    const after = routeTable(source, nextEdges, metric);
    setChanges(
      after.flatMap((route) => {
        const old = before.find((item) => item.destination === route.destination)!;
        if (old.path?.join() === route.path?.join() && old.cost === route.cost) return [];
        const describe = (item: typeof route) => (item.path ? `${item.path.join(' → ')} (${item.cost})` : 'không tới được');
        return [`${route.destination}: ${describe(old)} ⇒ ${describe(route)}`];
      }),
    );
    setEdges(nextEdges);
    setStepIndex(0);
  }

  function patchEdge(patch: Partial<Edge>) {
    updateEdges(edges.map((item) => (item.id === selectedEdge ? { ...item, ...patch } : item)));
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-4">
        <div className="border border-border bg-card">
          <div className="flex flex-wrap items-end gap-3 border-b border-border px-4 py-3 text-xs">
            <label className="font-semibold text-ink">
              Router nguồn
              <select value={source} onChange={(event) => { setSource(event.target.value as RouterId); setStepIndex(0); setChanges([]); }} className="mt-1 block h-9 border border-border bg-background px-2 text-sm text-ink outline-none focus:border-primary">
                {routers.map((router) => <option key={router}>{router}</option>)}
              </select>
            </label>
            <label className="font-semibold text-ink">
              Đích
              <select value={destination} onChange={(event) => setDestination(event.target.value as RouterId)} className="mt-1 block h-9 border border-border bg-background px-2 text-sm text-ink outline-none focus:border-primary">
                {routers.map((router) => <option key={router}>{router}</option>)}
              </select>
            </label>
            <div className="font-semibold text-ink">
              Metric
              <div className="mt-1 flex">
                {([
                  ['cost', 'Cost (OSPF)'],
                  ['hops', 'Số hop (RIP)'],
                ] as const).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => { setMetric(value); setChanges([]); setStepIndex(0); }}
                    aria-pressed={metric === value}
                    className={`h-9 border px-3 text-xs font-semibold ${metric === value ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background text-ink hover:border-primary'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <button type="button" onClick={() => { setEdges(initialEdges); setChanges([]); setStepIndex(0); }} className="ml-auto inline-flex h-9 items-center gap-1.5 border border-border px-3 font-semibold text-ink hover:border-primary">
              <RotateCcw size={13} /> Đặt lại
            </button>
          </div>

          <svg viewBox="0 0 770 400" className="block w-full">
            <title>Đồ thị 6 router, cạnh ghi cost của link</title>
            {edges.map((item) => {
              const from = positions[item.a];
              const to = positions[item.b];
              const onPath = mode === 'result' && pathEdges.has(item.id);
              const inTree = treeEdges.has(item.id);
              const selected = item.id === selectedEdge;
              const midX = (from.x + to.x) / 2;
              const midY = (from.y + to.y) / 2;
              return (
                <g key={item.id} onClick={() => setSelectedEdge(item.id)} className="cursor-pointer">
                  <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="transparent" strokeWidth={20} />
                  <line
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    strokeWidth={onPath ? 5 : inTree ? 3 : 1.5}
                    strokeDasharray={item.down ? '6 6' : undefined}
                    className={item.down ? 'stroke-rose-500' : onPath ? 'stroke-primary' : inTree ? 'stroke-primary/45' : 'stroke-border'}
                  />
                  <rect x={midX - 15} y={midY - 12} width={30} height={24} strokeWidth={selected ? 2 : 1} className={`fill-card ${selected ? 'stroke-primary' : 'stroke-border'}`} />
                  <text x={midX} y={midY + 4} textAnchor="middle" className={`font-mono text-[12px] font-bold ${item.down ? 'fill-rose-500' : 'fill-ink'}`}>
                    {item.down ? '✕' : weight(item, metric)}
                  </text>
                </g>
              );
            })}

            {routers.map((router) => {
              const { x, y } = positions[router];
              const isCurrent = step?.current === router;
              const isVisited = step ? step.visited.includes(router) : true;
              const shownDist = step ? step.dist[router] : dist[router];
              return (
                <g key={router} onClick={() => setDestination(router)} className="cursor-pointer">
                  <circle cx={x} cy={y} r={30} strokeWidth={router === source || isCurrent ? 3 : 1.5} className={`${router === source ? 'fill-primary-soft stroke-primary' : isCurrent ? 'fill-amber-500/15 stroke-amber-500' : 'fill-card stroke-border'} ${isVisited ? '' : 'opacity-60'}`} />
                  <text x={x} y={y + 2} textAnchor="middle" className="fill-ink text-[13px] font-bold">{router}</text>
                  <text x={x} y={y + 50} textAnchor="middle" className="fill-muted-foreground font-mono text-[11px]">
                    {shownDist === Infinity ? '∞' : `d=${shownDist}`}
                  </text>
                </g>
              );
            })}

            {mode === 'result' && path && path.length > 1 ? (
              <circle key={`${source}-${destination}-${path.join()}`} r={8} className="fill-primary">
                <animateMotion dur={`${path.length * 0.6}s`} repeatCount="indefinite" path={path.map((node, index) => `${index === 0 ? 'M' : 'L'} ${positions[node].x} ${positions[node].y}`).join(' ')} />
              </circle>
            ) : null}
          </svg>
          <div className="flex flex-wrap gap-4 border-t border-border px-4 py-2 text-[0.7rem] text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="inline-block h-1 w-6 bg-primary" /> Đường tới đích</span>
            <span className="flex items-center gap-1.5"><span className="inline-block h-0.5 w-6 bg-primary/45" /> Cây đường ngắn nhất</span>
            <span>Bấm vào cạnh để sửa cost hoặc cắt link; bấm vào router để chọn làm đích.</span>
          </div>
        </div>

        <div className="border border-border bg-card">
          <div className="grid grid-cols-2 border-b border-border">
            {([
              ['result', 'Bảng định tuyến'],
              ['steps', 'Dijkstra từng bước'],
            ] as const).map(([value, label]) => (
              <button key={value} type="button" onClick={() => setMode(value)} aria-pressed={mode === value} className={`py-2.5 text-xs font-semibold ${mode === value ? 'bg-primary text-primary-foreground' : 'text-ink hover:bg-accent'}`}>
                {label}
              </button>
            ))}
          </div>

          {mode === 'result' ? (
            <div className="p-4">
              <p className="text-sm text-muted-foreground">
                Bảng định tuyến của <span className="font-semibold text-ink">{source}</span>: với mỗi đích, router chỉ cần nhớ <em>next hop</em>, không cần nhớ cả đường đi. Mỗi router phía sau tự tính tiếp phần còn lại.
              </p>
              <table className="mt-3 w-full border border-border text-left text-xs">
                <thead className="bg-surface font-mono text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2">Đích</th>
                    <th className="px-3 py-2">Next hop</th>
                    <th className="px-3 py-2">Metric</th>
                    <th className="px-3 py-2">Đường đầy đủ</th>
                  </tr>
                </thead>
                <tbody className="font-mono">
                  {table.map((route) => (
                    <tr key={route.destination} onClick={() => setDestination(route.destination)} className={`cursor-pointer border-t border-border ${route.destination === destination ? 'bg-primary-soft' : 'hover:bg-accent'}`}>
                      <td className="px-3 py-2 font-bold text-ink">{route.destination}</td>
                      <td className="px-3 py-2 text-ink">{route.nextHop ?? '—'}</td>
                      <td className="px-3 py-2 text-ink">{route.cost === Infinity ? '∞' : route.cost}</td>
                      <td className="px-3 py-2 text-muted-foreground">{route.path ? route.path.join(' → ') : 'không tới được'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-mono text-xs text-muted-foreground">Bước {Math.min(stepIndex, steps.length - 1) + 1}/{steps.length}</p>
                <div className="flex gap-1">
                  <button type="button" onClick={() => setStepIndex((value) => Math.max(0, value - 1))} disabled={stepIndex === 0} className="grid size-8 place-items-center border border-border text-ink hover:border-primary disabled:opacity-30" aria-label="Bước trước"><ChevronLeft size={15} /></button>
                  <button type="button" onClick={() => setStepIndex((value) => Math.min(steps.length - 1, value + 1))} disabled={stepIndex >= steps.length - 1} className="grid size-8 place-items-center border border-border text-ink hover:border-primary disabled:opacity-30" aria-label="Bước sau"><ChevronRight size={15} /></button>
                </div>
              </div>
              {step ? (
                <>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Chốt <span className="font-semibold text-ink">{step.current}</span> với khoảng cách {step.distance}: trong các router chưa chốt, nó gần {source} nhất, nên không còn đường nào ngắn hơn tới nó. Giờ xét các hàng xóm của {step.current}:
                  </p>
                  <ul className="mt-2 space-y-1 font-mono text-xs">
                    {step.relaxations.length > 0 ? (
                      step.relaxations.map((relaxation) => (
                        <li key={relaxation.neighbour} className={relaxation.improved ? 'text-emerald-700 dark:text-emerald-300' : 'text-muted-foreground'}>
                          {relaxation.neighbour}: qua {step.current} = {relaxation.via} {relaxation.improved ? `< ${relaxation.before === Infinity ? '∞' : relaxation.before} → cập nhật` : `≥ ${relaxation.before} → giữ nguyên`}
                        </li>
                      ))
                    ) : (
                      <li className="text-muted-foreground">Không còn hàng xóm nào chưa chốt.</li>
                    )}
                  </ul>
                  <table className="mt-3 w-full border border-border text-center font-mono text-xs">
                    <thead className="bg-surface text-muted-foreground">
                      <tr>
                        <th className="px-2 py-1.5 text-left">Router</th>
                        {routers.map((router) => <th key={router} className="px-2 py-1.5">{router}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t border-border">
                        <td className="px-2 py-1.5 text-left text-muted-foreground">Khoảng cách</td>
                        {routers.map((router) => (
                          <td key={router} className={`px-2 py-1.5 ${step.visited.includes(router) ? 'font-bold text-ink' : 'text-muted-foreground'}`}>
                            {step.dist[router] === Infinity ? '∞' : step.dist[router]}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-t border-border">
                        <td className="px-2 py-1.5 text-left text-muted-foreground">Đi qua</td>
                        {routers.map((router) => <td key={router} className="px-2 py-1.5 text-ink">{step.prev[router] ?? '—'}</td>)}
                      </tr>
                    </tbody>
                  </table>
                  <p className="mt-2 text-xs text-muted-foreground">Chữ đậm là router đã chốt. Router chưa chốt có thể còn được cập nhật ở bước sau.</p>
                </>
              ) : null}
            </div>
          )}
        </div>
      </div>

      <aside className="space-y-4">
        <div className="border border-border bg-card p-4 text-xs">
          <p className="font-mono font-semibold uppercase tracking-[0.08em] text-muted-foreground">Link đang chọn</p>
          <p className="mt-1 text-base font-bold text-ink">{edge.a} ↔ {edge.b}</p>
          <label className="mt-3 block font-semibold text-ink">
            Cost: <span className="font-mono">{edge.cost}</span>
            <input type="range" min={1} max={10} value={edge.cost} onChange={(event) => patchEdge({ cost: Number(event.target.value) })} disabled={edge.down} className="mt-1 block w-full accent-[var(--primary)]" />
          </label>
          <p className="mt-1 text-muted-foreground">Trong OSPF, cost thường tỷ lệ nghịch với băng thông: link 10 Gbps có cost nhỏ hơn link 100 Mbps.</p>
          <button type="button" onClick={() => patchEdge({ down: !edge.down })} className={`mt-3 w-full border py-2 font-semibold ${edge.down ? 'border-emerald-500/50 text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-300' : 'border-rose-500/50 text-rose-700 hover:bg-rose-500/10 dark:text-rose-300'}`}>
            {edge.down ? 'Nối lại link' : 'Cắt link này'}
          </button>
        </div>

        <div className="border border-border bg-card p-4 text-xs">
          <p className="font-mono font-semibold uppercase tracking-[0.08em] text-muted-foreground">Hội tụ sau thay đổi gần nhất</p>
          {changes.length > 0 ? (
            <ul className="mt-2 space-y-1.5 font-mono leading-5 text-ink">
              {changes.map((change) => <li key={change}>{change}</li>)}
            </ul>
          ) : (
            <p className="mt-2 leading-5 text-muted-foreground">Chưa có đường nào của {source} thay đổi. Thử cắt link R2–R4 hoặc tăng cost của nó.</p>
          )}
        </div>

        <div className="border border-border bg-card p-4 text-xs leading-5 text-muted-foreground">
          <p className="font-semibold text-ink">Đang mô phỏng gì?</p>
          <p className="mt-1">
            OSPF là giao thức <em>link-state</em>: mọi router nhận được bản đồ đầy đủ của mạng (các link và cost), rồi tự chạy Dijkstra để tìm đường ngắn nhất từ chính nó. Khi một link đứt, tin báo lan khắp mạng và mọi router tính lại: đó là quá trình hội tụ.
          </p>
          <p className="mt-2">
            Đổi metric sang số hop để thấy cách RIP chọn đường: ít chặng nhất, bất kể link đó chậm hay nhanh.
          </p>
        </div>
      </aside>
    </div>
  );
}
