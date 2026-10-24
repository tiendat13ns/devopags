'use client';

import { useState } from 'react';
import { RotateCcw } from 'lucide-react';

type Algorithm = 'reno' | 'tahoe';
type LossType = 'dupack' | 'timeout';
type Phase = 'slow start' | 'congestion avoidance';

type Round = { round: number; cwnd: number; ssthresh: number; phase: Phase; loss?: LossType; auto?: boolean; note: string };

const ROUNDS = 40;
const INITIAL_SSTHRESH = 32;

const lossLabel: Record<LossType, string> = { dupack: '3 duplicate ACK', timeout: 'Timeout' };

function simulate(algorithm: Algorithm, losses: Record<number, LossType>, capacity: number | null): Round[] {
  const rounds: Round[] = [];
  let cwnd = 1;
  let ssthresh = INITIAL_SSTHRESH;

  for (let round = 0; round < ROUNDS; round++) {
    const phase: Phase = cwnd < ssthresh ? 'slow start' : 'congestion avoidance';
    // Vượt dung lượng đường truyền thì hàng đợi router tràn: coi như mất gói, phát hiện qua duplicate ACK.
    const auto = losses[round] === undefined && capacity !== null && cwnd > capacity;
    const loss = losses[round] ?? (auto ? 'dupack' : undefined);
    let note: string;
    let next: number;

    if (loss) {
      const half = Math.max(Math.floor(cwnd / 2), 2);
      if (loss === 'timeout' || algorithm === 'tahoe') {
        note = `${lossLabel[loss]}${auto ? ' (vượt dung lượng)' : ''}: ssthresh = ${cwnd}/2 = ${half}, cwnd về 1, bắt đầu lại slow start.`;
        next = 1;
      } else {
        note = `${lossLabel[loss]}${auto ? ' (vượt dung lượng)' : ''}: Reno fast recovery, ssthresh = ${cwnd}/2 = ${half}, cwnd = ${half} rồi tăng tuyến tính.`;
        next = half;
      }
      rounds.push({ round, cwnd, ssthresh, phase, loss, auto, note });
      ssthresh = half;
      cwnd = next;
      continue;
    }

    if (cwnd < ssthresh) {
      next = Math.min(cwnd * 2, ssthresh);
      note = `Slow start: mọi segment đều được ACK, cwnd nhân đôi ${cwnd} → ${next}${next === ssthresh ? ', chạm ssthresh' : ''}.`;
    } else {
      next = cwnd + 1;
      note = `Congestion avoidance: cwnd ≥ ssthresh nên chỉ tăng 1 MSS mỗi RTT (${cwnd} → ${next}).`;
    }
    rounds.push({ round, cwnd, ssthresh, phase, note });
    cwnd = next;
  }
  return rounds;
}

const presetLosses: Record<number, LossType> = { 14: 'dupack', 27: 'timeout' };

const WIDTH = 760;
const HEIGHT = 300;
const PAD = { left: 44, right: 16, top: 16, bottom: 34 };

export function TcpCongestionLab() {
  const [algorithm, setAlgorithm] = useState<Algorithm>('reno');
  const [losses, setLosses] = useState<Record<number, LossType>>(presetLosses);
  const [tool, setTool] = useState<LossType>('dupack');
  const [capacityOn, setCapacityOn] = useState(false);
  const [capacity, setCapacity] = useState(36);
  const [compare, setCompare] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);

  const rounds = simulate(algorithm, losses, capacityOn ? capacity : null);
  const other = compare ? simulate(algorithm === 'reno' ? 'tahoe' : 'reno', losses, capacityOn ? capacity : null) : null;
  const maxY = Math.max(INITIAL_SSTHRESH, ...rounds.map((round) => round.cwnd), ...(other ? other.map((round) => round.cwnd) : []), capacityOn ? capacity : 0) + 4;

  const x = (round: number) => PAD.left + (round / (ROUNDS - 1)) * (WIDTH - PAD.left - PAD.right);
  const y = (value: number) => HEIGHT - PAD.bottom - (value / maxY) * (HEIGHT - PAD.top - PAD.bottom);
  const line = (data: Round[], key: 'cwnd' | 'ssthresh') => data.map((round, index) => `${index === 0 ? 'M' : 'L'} ${x(round.round)} ${y(round[key])}`).join(' ');

  const sent = rounds.reduce((sum, round) => sum + round.cwnd, 0);
  const otherSent = other?.reduce((sum, round) => sum + round.cwnd, 0);
  const active = hovered === null ? null : rounds[hovered];
  const ticks = Array.from({ length: 5 }, (_, index) => Math.round((maxY / 4) * index));

  function toggleLoss(round: number) {
    setLosses((current) => {
      const next = { ...current };
      if (next[round] === tool) delete next[round];
      else next[round] = tool;
      return next;
    });
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="border border-border bg-card">
        <div className="flex flex-wrap items-end gap-4 border-b border-border px-4 py-3 text-xs">
          <div className="font-semibold text-ink">
            Thuật toán
            <div className="mt-1 flex">
              {([
                ['reno', 'TCP Reno'],
                ['tahoe', 'TCP Tahoe'],
              ] as const).map(([value, label]) => (
                <button key={value} type="button" onClick={() => setAlgorithm(value)} aria-pressed={algorithm === value} className={`h-9 border px-3 font-semibold ${algorithm === value ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background text-ink hover:border-primary'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="font-semibold text-ink">
            Bấm vào RTT để đặt
            <div className="mt-1 flex">
              {(['dupack', 'timeout'] as const).map((value) => (
                <button key={value} type="button" onClick={() => setTool(value)} aria-pressed={tool === value} className={`h-9 border px-3 font-semibold ${tool === value ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background text-ink hover:border-primary'}`}>
                  {lossLabel[value]}
                </button>
              ))}
            </div>
          </div>
          <label className="flex h-9 items-center gap-2 font-semibold text-ink">
            <input type="checkbox" checked={compare} onChange={() => setCompare((value) => !value)} className="accent-[var(--primary)]" />
            So sánh với {algorithm === 'reno' ? 'Tahoe' : 'Reno'}
          </label>
          <button type="button" onClick={() => { setLosses(presetLosses); setCapacityOn(false); setCompare(false); }} className="ml-auto inline-flex h-9 items-center gap-1.5 border border-border px-3 font-semibold text-ink hover:border-primary">
            <RotateCcw size={13} /> Đặt lại
          </button>
        </div>

        <div className="relative px-2 pt-2" onMouseLeave={() => setHovered(null)}>
          <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="block w-full">
            <title>Biểu đồ cwnd theo từng RTT</title>
            {ticks.map((tick) => (
              <g key={tick}>
                <line x1={PAD.left} x2={WIDTH - PAD.right} y1={y(tick)} y2={y(tick)} className="stroke-border" strokeWidth={1} />
                <text x={PAD.left - 8} y={y(tick) + 4} textAnchor="end" className="fill-muted-foreground font-mono text-[10px]">{tick}</text>
              </g>
            ))}
            {[0, 10, 20, 30, 39].map((round) => (
              <text key={round} x={x(round)} y={HEIGHT - 12} textAnchor="middle" className="fill-muted-foreground font-mono text-[10px]">{round}</text>
            ))}
            <text x={WIDTH - PAD.right} y={HEIGHT - 1} textAnchor="end" className="fill-muted-foreground text-[10px]">RTT</text>
            <text x={4} y={PAD.top - 4} className="fill-muted-foreground text-[10px]">MSS</text>

            {capacityOn ? <line x1={PAD.left} x2={WIDTH - PAD.right} y1={y(capacity)} y2={y(capacity)} strokeWidth={1.5} strokeDasharray="2 4" className="stroke-rose-500" /> : null}
            {!other ? <path d={line(rounds, 'ssthresh')} fill="none" strokeWidth={1.5} strokeDasharray="6 5" className="stroke-muted-foreground" /> : null}
            {other ? <path d={line(other, 'cwnd')} fill="none" strokeWidth={2} strokeDasharray="5 4" className="stroke-muted-foreground" /> : null}
            <path d={line(rounds, 'cwnd')} fill="none" strokeWidth={2} className="stroke-primary" />

            {hovered !== null ? <line x1={x(hovered)} x2={x(hovered)} y1={PAD.top} y2={HEIGHT - PAD.bottom} className="stroke-muted-foreground" strokeWidth={1} /> : null}

            {rounds.map((round) =>
              round.loss ? (
                <g key={`loss-${round.round}`}>
                  <circle cx={x(round.round)} cy={y(round.cwnd)} r={6} strokeWidth={2} className={`stroke-card ${round.loss === 'timeout' ? 'fill-rose-600' : 'fill-amber-500'}`} />
                  <text x={x(round.round)} y={y(round.cwnd) - 11} textAnchor="middle" className="fill-ink text-[10px] font-bold">{round.loss === 'timeout' ? 'TO' : '3×ACK'}</text>
                </g>
              ) : null,
            )}

            {rounds.map((round) => (
              <rect
                key={`hit-${round.round}`}
                x={x(round.round) - (WIDTH - PAD.left - PAD.right) / (ROUNDS - 1) / 2}
                y={PAD.top}
                width={(WIDTH - PAD.left - PAD.right) / (ROUNDS - 1)}
                height={HEIGHT - PAD.top - PAD.bottom}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHovered(round.round)}
                onClick={() => toggleLoss(round.round)}
              />
            ))}
          </svg>

          {active ? (
            <div
              className="pointer-events-none absolute top-3 z-10 w-56 border border-border bg-card p-2.5 text-xs leading-5 shadow-lg"
              style={{ left: `clamp(0px, calc(${(active.round / (ROUNDS - 1)) * 100}% - 7rem), calc(100% - 14rem))` }}
            >
              <p className="font-mono font-bold text-ink">RTT {active.round} · {active.phase}</p>
              <p className="text-muted-foreground">cwnd <span className="font-mono text-ink">{active.cwnd}</span> · ssthresh <span className="font-mono text-ink">{active.ssthresh}</span></p>
              {other ? <p className="text-muted-foreground">{algorithm === 'reno' ? 'Tahoe' : 'Reno'}: cwnd <span className="font-mono text-ink">{other[active.round].cwnd}</span></p> : null}
              <p className="mt-1 text-ink">{active.note}</p>
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-4 border-t border-border px-4 py-2 text-[0.7rem] text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="inline-block h-0.5 w-6 bg-primary" /> cwnd ({algorithm === 'reno' ? 'Reno' : 'Tahoe'})</span>
          {other ? (
            <span className="flex items-center gap-1.5"><span className="inline-block h-0 w-6 border-t-2 border-dashed border-muted-foreground" /> cwnd ({algorithm === 'reno' ? 'Tahoe' : 'Reno'})</span>
          ) : (
            <span className="flex items-center gap-1.5"><span className="inline-block h-0 w-6 border-t-2 border-dashed border-muted-foreground" /> ssthresh</span>
          )}
          <span className="flex items-center gap-1.5"><span className="inline-block size-2.5 rounded-full bg-amber-500" /> 3×ACK: mất gói, phát hiện qua duplicate ACK</span>
          <span className="flex items-center gap-1.5"><span className="inline-block size-2.5 rounded-full bg-rose-600" /> TO: timeout</span>
          {capacityOn ? <span className="flex items-center gap-1.5"><span className="inline-block h-0 w-6 border-t-2 border-dotted border-rose-500" /> Dung lượng đường truyền</span> : null}
        </div>
      </div>

      <aside className="space-y-4 text-xs">
        <div className="grid grid-cols-2 gap-px border border-border bg-border">
          <div className="bg-card p-3">
            <span className="block text-muted-foreground">Segment đã gửi trong {ROUNDS} RTT</span>
            <span className="font-mono text-lg font-bold text-ink">{sent}</span>
          </div>
          <div className="bg-card p-3">
            <span className="block text-muted-foreground">{other ? `${algorithm === 'reno' ? 'Tahoe' : 'Reno'} gửi được` : 'Trung bình mỗi RTT'}</span>
            <span className="font-mono text-lg font-bold text-ink">{other ? otherSent : (sent / ROUNDS).toFixed(1)}</span>
          </div>
        </div>

        <div className="border border-border bg-card p-4">
          <label className="flex items-center gap-2 font-semibold text-ink">
            <input type="checkbox" checked={capacityOn} onChange={() => setCapacityOn((value) => !value)} className="accent-[var(--primary)]" />
            Mất gói khi cwnd vượt dung lượng đường truyền
          </label>
          <label className={`mt-3 block font-semibold ${capacityOn ? 'text-ink' : 'text-muted-foreground'}`}>
            Dung lượng: <span className="font-mono">{capacity} MSS</span>
            <input type="range" min={12} max={60} value={capacity} disabled={!capacityOn} onChange={(event) => setCapacity(Number(event.target.value))} className="mt-1 block w-full accent-[var(--primary)]" />
          </label>
          <p className="mt-2 leading-5 text-muted-foreground">Bật lên để thấy hình răng cưa kinh điển của TCP: tăng dần tới khi tràn, giảm một nửa, rồi lại tăng.</p>
        </div>

        <div className="border border-border bg-card p-4 leading-5 text-muted-foreground">
          <p className="font-semibold text-ink">Đọc biểu đồ</p>
          <ul className="mt-1 list-disc space-y-1.5 pl-4">
            <li><span className="font-semibold text-ink">cwnd</span> (congestion window): số segment được gửi mà chưa cần chờ ACK. Mỗi RTT gửi được khoảng cwnd segment, nên cwnd chính là tốc độ.</li>
            <li><span className="font-semibold text-ink">Slow start</span>: bắt đầu từ 1 và nhân đôi mỗi RTT, “chậm” chỉ ở điểm khởi đầu.</li>
            <li><span className="font-semibold text-ink">Congestion avoidance</span>: qua ssthresh thì chỉ cộng 1 mỗi RTT để dò dung lượng thận trọng.</li>
            <li><span className="font-semibold text-ink">3 duplicate ACK</span> nghĩa là một gói mất nhưng các gói sau vẫn tới: mạng còn chạy. Reno chỉ giảm một nửa; Tahoe vẫn về 1.</li>
            <li><span className="font-semibold text-ink">Timeout</span> nghĩa là không ACK nào về: tắc nghẽn nặng, cả hai thuật toán đều về 1.</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
