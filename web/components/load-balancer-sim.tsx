'use client';

import { useState } from 'react';
import { RotateCcw } from 'lucide-react';

type Algorithm = 'round-robin' | 'least-conn' | 'ip-hash';

type ServerState = {
  up: boolean;
  total: number;
  active: number[];
};

type State = {
  servers: ServerState[];
  last: number;
  seq: number;
  failures: number;
  log: string[];
};

const serverInfo = [
  { name: 'app-1', slowness: 1, note: 'bình thường' },
  { name: 'app-2', slowness: 1, note: 'bình thường' },
  { name: 'app-3', slowness: 2, note: 'cấu hình yếu, chậm gấp đôi' },
];

const clients = ['198.51.100.11', '198.51.100.27', '198.51.100.43', '198.51.100.58', '198.51.100.72', '198.51.100.90'];
const durations = [3, 1, 5, 2, 4, 1, 6, 2, 3, 1];

const algorithms: { id: Algorithm; label: string; config: string; text: string; good: string; bad: string }[] = [
  {
    id: 'round-robin',
    label: 'Round robin',
    config: '(mặc định của Nginx)',
    text: 'Lần lượt từng server, lặp vòng. Không quan tâm server đang bận hay rảnh.',
    good: 'Đơn giản, công bằng khi request nhẹ và đều nhau.',
    bad: 'Server yếu hoặc đang xử lý request nặng vẫn nhận phần như mọi server.',
  },
  {
    id: 'least-conn',
    label: 'Least connections',
    config: 'least_conn;',
    text: 'Gửi cho server đang có ít kết nối đang xử lý nhất.',
    good: 'Tự cân bằng khi request dài ngắn khác nhau hoặc server mạnh yếu khác nhau.',
    bad: 'Phải theo dõi số kết nối; server mới thêm vào có thể bị dồn tải đột ngột.',
  },
  {
    id: 'ip-hash',
    label: 'IP hash',
    config: 'ip_hash;',
    text: 'Băm IP của client để chọn server, nên cùng một client luôn rơi vào cùng một server.',
    good: 'Có “dính phiên” (sticky) mà không cần cookie, tốt cho cache cục bộ.',
    bad: 'Phân phối lệch nếu ít client; khi một server sập, nhiều client bị chuyển sang server khác.',
  },
];

function initial(): State {
  return {
    servers: serverInfo.map(() => ({ up: true, total: 0, active: [] })),
    last: -1,
    seq: 0,
    failures: 0,
    log: [],
  };
}

function hashIp(ip: string) {
  return ip.split('.').reduce((sum, octet) => sum + Number(octet), 0);
}

function dispatch(state: State, algorithm: Algorithm, client: string): State {
  // Mỗi request đến cách nhau 1 đơn vị thời gian: các kết nối đang xử lý tiến thêm một nhịp.
  const servers = state.servers.map((server) => ({
    ...server,
    active: server.active.map((remaining) => remaining - 1).filter((remaining) => remaining > 0),
  }));
  const seq = state.seq + 1;
  const available = servers.flatMap((server, index) => (server.up ? [index] : []));

  if (available.length === 0) {
    return {
      ...state,
      servers,
      seq,
      failures: state.failures + 1,
      log: [`#${seq} ${client} → 503: không còn server khỏe`, ...state.log].slice(0, 8),
    };
  }

  let chosen = available[0];
  if (algorithm === 'round-robin') {
    for (let step = 1; step <= servers.length; step += 1) {
      const index = (state.last + step) % servers.length;
      if (servers[index].up) {
        chosen = index;
        break;
      }
    }
  } else if (algorithm === 'least-conn') {
    chosen = available.reduce((best, index) => (servers[index].active.length < servers[best].active.length ? index : best), available[0]);
  } else {
    chosen = available[hashIp(client) % available.length];
  }

  servers[chosen].total += 1;
  servers[chosen].active.push(durations[(seq - 1) % durations.length] * serverInfo[chosen].slowness);

  return {
    ...state,
    servers,
    last: chosen,
    seq,
    log: [`#${seq} ${client} → ${serverInfo[chosen].name}`, ...state.log].slice(0, 8),
  };
}

export function LoadBalancerSim() {
  const [algorithm, setAlgorithm] = useState<Algorithm>('round-robin');
  const [client, setClient] = useState(clients[0]);
  const [state, setState] = useState<State>(initial);

  const current = algorithms.find((item) => item.id === algorithm) ?? algorithms[0];
  const grandTotal = state.servers.reduce((sum, server) => sum + server.total, 0);

  function send(count: number) {
    setState((previous) => {
      let next = previous;
      for (let i = 0; i < count; i += 1) {
        const source = count === 1 ? client : clients[(next.seq + i) % clients.length];
        next = dispatch(next, algorithm, source);
      }
      return next;
    });
  }

  function toggleServer(index: number) {
    setState((previous) => ({
      ...previous,
      servers: previous.servers.map((server, i) => (i === index ? { ...server, up: !server.up, active: server.up ? [] : server.active } : server)),
    }));
  }

  function changeAlgorithm(next: Algorithm) {
    setAlgorithm(next);
    setState(initial());
  }

  return (
    <div className="my-8 border border-border bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div>
          <p className="font-mono text-xs font-semibold text-primary">Load balancer simulator</p>
          <p className="mt-1 text-sm text-muted-foreground">Gửi request, cho một server “sập”, và so sánh cách ba thuật toán chia việc.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {algorithms.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => changeAlgorithm(item.id)}
              aria-pressed={algorithm === item.id}
              className={`border px-3 py-2 text-xs font-semibold ${algorithm === item.id ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-ink hover:border-primary'}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="border-b border-border p-4">
        <p className="text-sm leading-6 text-ink">{current.text} <code className="inline-code">{current.config}</code></p>
        <div className="mt-2 grid gap-2 text-xs leading-5 sm:grid-cols-2">
          <p><span className="font-bold text-emerald-700 dark:text-emerald-300">Tốt khi: </span>{current.good}</p>
          <p><span className="font-bold text-rose-700 dark:text-rose-300">Hạn chế: </span>{current.bad}</p>
        </div>
      </div>

      <div className="grid gap-px border-b border-border bg-border md:grid-cols-3">
        {state.servers.map((server, index) => {
          const info = serverInfo[index];
          const share = grandTotal === 0 ? 0 : Math.round((server.total / grandTotal) * 100);
          return (
            <div className={`bg-card p-4 ${server.up ? '' : 'opacity-60'}`} key={info.name}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <strong className="font-mono text-sm text-ink">{info.name}</strong>
                  <p className="text-[0.7rem] text-muted-foreground">{info.note}</p>
                </div>
                <span className={`border px-2 py-0.5 font-mono text-[0.65rem] font-bold ${server.up ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300'}`}>
                  {server.up ? 'UP' : 'DOWN'}
                </span>
              </div>

              <div className="mt-3 h-3 border border-border bg-surface">
                <div className="h-full bg-primary transition-all" style={{ width: `${share}%` }} />
              </div>
              <p className="mt-1 flex justify-between font-mono text-xs text-muted-foreground">
                <span>{server.total} request</span>
                <span>{share}%</span>
              </p>

              <div className="mt-3">
                <p className="text-[0.7rem] text-muted-foreground">Đang xử lý ({server.active.length}):</p>
                <div className="mt-1 flex min-h-5 flex-wrap gap-1">
                  {server.active.map((remaining, i) => (
                    <span className="grid size-5 place-items-center border border-primary/50 bg-primary/15 font-mono text-[0.6rem] text-primary" key={i} title={`còn ${remaining} nhịp`}>
                      {remaining}
                    </span>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => toggleServer(index)}
                className="mt-3 w-full border border-border bg-surface px-2 py-1.5 text-xs font-semibold text-ink hover:border-primary"
              >
                {server.up ? 'Giả lập server sập' : 'Khôi phục server'}
              </button>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 p-4 lg:grid-cols-[1fr_1.2fr] lg:p-5">
        <div className="space-y-3">
          <label className="block">
            <span className="font-mono text-xs font-semibold text-muted-foreground">Client cho nút “Gửi 1”</span>
            <select
              className="mt-1 h-10 w-full border border-border bg-card px-2 font-mono text-sm text-ink outline-none focus:border-primary"
              value={client}
              onChange={(event) => setClient(event.target.value)}
            >
              {clients.map((ip) => (
                <option key={ip} value={ip}>{ip}</option>
              ))}
            </select>
          </label>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => send(1)} className="border border-primary bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">Gửi 1 request</button>
            <button type="button" onClick={() => send(10)} className="border border-border bg-card px-4 py-2 text-xs font-semibold text-ink hover:border-primary">Gửi 10 (nhiều client)</button>
            <button type="button" onClick={() => setState(initial())} className="inline-flex items-center gap-1.5 border border-border bg-card px-3 py-2 text-xs font-semibold text-ink hover:border-primary">
              <RotateCcw size={13} /> Reset
            </button>
          </div>
          {state.failures > 0 ? (
            <p className="text-xs font-semibold text-rose-700 dark:text-rose-300">{state.failures} request trả 503 vì không còn server nào khỏe.</p>
          ) : null}
        </div>

        <div>
          <p className="font-mono text-xs font-semibold text-muted-foreground">Nhật ký (mới nhất ở trên)</p>
          <div className="mt-1 min-h-28 border border-code-border bg-code p-3 font-mono text-xs leading-6 text-code-foreground">
            {state.log.length === 0 ? <span className="text-white/40">(chưa có request nào)</span> : state.log.map((line) => <div key={line}>{line}</div>)}
          </div>
        </div>
      </div>
    </div>
  );
}
