'use client';

import { useState } from 'react';
import { TriangleAlert } from 'lucide-react';

// Traffic (request/giây) theo từng giờ trong ngày của một web bán hàng: thấp lúc đêm, đỉnh buổi tối.
const traffic = [120, 90, 70, 60, 60, 80, 150, 300, 520, 650, 700, 720, 760, 700, 650, 620, 640, 700, 820, 900, 760, 500, 300, 180];
const CAPACITY = 200; // request/giây một máy xử lý được ở 100% CPU
const FAILURE_HOUR = 13;
const OVERLOAD = 90;

type Hour = { hour: number; load: number; instances: number; cpu: number; event?: string };

function simulate(target: number, min: number, max: number, azFailure: boolean): Hour[] {
  const hours: Hour[] = [];
  let instances = min;

  traffic.forEach((load, hour) => {
    let event: string | undefined;
    if (azFailure && hour === FAILURE_HOUR) {
      const lost = Math.floor(instances / 2);
      instances -= lost;
      event = `AZ-a sự cố: mất ${lost} máy`;
    }

    const cpu = Math.round((load / (instances * CAPACITY)) * 100);
    hours.push({ hour, load, instances, cpu, event });

    // Target tracking: tính số máy cần để CPU về đúng mục tiêu. Máy mới chỉ nhận traffic từ giờ sau (warm-up);
    // scale in thận trọng, mỗi giờ bớt tối đa một máy.
    const desired = Math.min(max, Math.max(min, Math.ceil(load / (CAPACITY * (target / 100)))));
    instances = desired > instances ? desired : Math.max(desired, instances - 1);
  });

  return hours;
}

function Stepper({ label, value, onChange, lower, upper }: { label: string; value: number; onChange: (value: number) => void; lower: number; upper: number }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="font-semibold text-ink">{label}</span>
      <button type="button" onClick={() => onChange(value - 1)} disabled={value <= lower} className="grid size-7 place-items-center border border-border bg-card text-ink hover:border-primary disabled:opacity-30" aria-label={`Giảm ${label}`}>−</button>
      <span className="w-5 text-center font-mono font-bold text-ink">{value}</span>
      <button type="button" onClick={() => onChange(value + 1)} disabled={value >= upper} className="grid size-7 place-items-center border border-border bg-card text-ink hover:border-primary disabled:opacity-30" aria-label={`Tăng ${label}`}>+</button>
    </div>
  );
}

export function AutoScalingSim() {
  const [target, setTarget] = useState(50);
  const [min, setMin] = useState(2);
  const [max, setMax] = useState(10);
  const [azFailure, setAzFailure] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);

  const hours = simulate(target, min, max, azFailure);
  const instanceHours = hours.reduce((sum, hour) => sum + hour.instances, 0);
  const overloaded = hours.filter((hour) => hour.cpu > OVERLOAD).length;
  const peakLoad = Math.max(...traffic);
  const active = hovered === null ? null : hours[hovered];

  return (
    <div className="my-8 border border-border bg-surface">
      <div className="border-b border-border px-4 py-3">
        <p className="font-mono text-xs font-semibold text-primary">Auto Scaling simulator</p>
        <p className="mt-1 text-sm text-muted-foreground">Một ngày traffic, mỗi máy chịu tối đa {CAPACITY} request/giây. Chỉnh mục tiêu CPU và giới hạn số máy để thấy đánh đổi giữa chi phí và quá tải.</p>
        <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-3">
          <label className="flex items-center gap-2 text-xs font-semibold text-ink">
            Mục tiêu CPU
            <input type="range" min={30} max={80} step={5} value={target} onChange={(event) => setTarget(Number(event.target.value))} className="w-28 accent-[var(--primary)]" />
            <span className="w-9 font-mono">{target}%</span>
          </label>
          <Stepper label="Min" value={min} onChange={setMin} lower={1} upper={Math.min(max, 6)} />
          <Stepper label="Max" value={max} onChange={setMax} lower={Math.max(min, 2)} upper={12} />
          <label className="flex items-center gap-2 text-xs font-semibold text-ink">
            <input type="checkbox" checked={azFailure} onChange={() => setAzFailure((value) => !value)} className="accent-[var(--primary)]" />
            Sự cố một AZ lúc {FAILURE_HOUR}h
          </label>
        </div>
      </div>

      <div className="p-4 lg:p-5">
        <div className="grid grid-cols-3 gap-px border border-border bg-border text-xs">
          <div className="bg-card p-3">
            <span className="block text-muted-foreground">Instance-giờ (chi phí)</span>
            <span className="font-mono text-lg font-bold text-ink">{instanceHours}</span>
          </div>
          <div className="bg-card p-3">
            <span className="block text-muted-foreground">Giờ quá tải (CPU &gt; {OVERLOAD}%)</span>
            <span className="font-mono text-lg font-bold text-ink">{overloaded}</span>
          </div>
          <div className="bg-card p-3">
            <span className="block text-muted-foreground">Nếu chạy cố định {max} máy</span>
            <span className="font-mono text-lg font-bold text-ink">{max * 24}</span>
          </div>
        </div>

        <div className="relative mt-4" onMouseLeave={() => setHovered(null)}>
          <p className="text-xs font-semibold text-muted-foreground">Traffic (request/giây)</p>
          <div className="mt-1 flex h-16 items-end gap-[2px] border-b border-border">
            {hours.map((hour) => (
              <div className="flex h-full flex-1 items-end" key={`load-${hour.hour}`} onMouseEnter={() => setHovered(hour.hour)}>
                <div className={`w-full ${hovered === hour.hour ? 'bg-muted-foreground' : 'bg-muted-foreground/45'}`} style={{ height: `${(hour.load / peakLoad) * 100}%` }} />
              </div>
            ))}
          </div>

          <p className="mt-3 text-xs font-semibold text-muted-foreground">Số máy đang chạy</p>
          <div className="mt-1 flex h-28 items-end gap-[2px] border-b border-border">
            {hours.map((hour) => (
              <div className="flex h-full flex-1 items-end" key={`inst-${hour.hour}`} onMouseEnter={() => setHovered(hour.hour)}>
                <div className={`w-full ${hovered === hour.hour ? 'bg-primary' : 'bg-primary/70'}`} style={{ height: `${(hour.instances / 12) * 100}%` }} />
              </div>
            ))}
          </div>
          <div className="mt-1 flex gap-[2px]" aria-hidden="true">
            {hours.map((hour) => (
              <div className="flex flex-1 justify-center" key={`flag-${hour.hour}`}>
                {hour.cpu > OVERLOAD ? <TriangleAlert className="text-rose-600 dark:text-rose-400" size={11} /> : null}
              </div>
            ))}
          </div>
          <div className="flex justify-between font-mono text-[0.65rem] text-muted-foreground">
            <span>0h</span>
            <span>6h</span>
            <span>12h</span>
            <span>18h</span>
            <span>23h</span>
          </div>

          {active ? (
            <div
              className="pointer-events-none absolute top-0 z-10 w-48 border border-border bg-card p-2.5 text-xs leading-5 shadow-lg"
              style={{ left: `clamp(0px, calc(${(active.hour / 23) * 100}% - 6rem), calc(100% - 12rem))` }}
            >
              <p className="font-mono font-bold text-ink">{active.hour}:00</p>
              <p className="text-muted-foreground">Traffic: <span className="font-mono text-ink">{active.load} req/s</span></p>
              <p className="text-muted-foreground">Số máy: <span className="font-mono text-ink">{active.instances}</span></p>
              <p className="text-muted-foreground">CPU trung bình: <span className="font-mono text-ink">{active.cpu}%</span>{active.cpu > OVERLOAD ? ' · quá tải' : ''}</p>
              {active.event ? <p className="mt-1 font-semibold text-ink">{active.event}</p> : null}
            </div>
          ) : null}
        </div>

        <p className="mt-3 flex items-center gap-1.5 text-xs leading-5 text-muted-foreground">
          <TriangleAlert className="shrink-0 text-rose-600 dark:text-rose-400" size={12} /> đánh dấu giờ quá tải: request chậm hoặc lỗi 5xx.
        </p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          Mục tiêu CPU thấp thì dư sức chịu đột biến nhưng tốn tiền; mục tiêu cao thì tiết kiệm nhưng máy mới cần thời gian khởi động, nên những giờ traffic tăng vọt dễ bị quá tải. Bật sự cố AZ để thấy ASG tự bù số máy bị mất ngay giờ sau.
        </p>

        <details className="mt-3 text-xs">
          <summary className="cursor-pointer font-semibold text-ink">Xem dạng bảng</summary>
          <div className="mt-2 overflow-x-auto border border-border bg-card">
            <table className="w-full min-w-[420px] text-left">
              <thead className="bg-surface font-mono text-[0.68rem] uppercase text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Giờ</th>
                  <th className="px-3 py-2">Traffic</th>
                  <th className="px-3 py-2">Số máy</th>
                  <th className="px-3 py-2">CPU</th>
                  <th className="px-3 py-2">Ghi chú</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                {hours.map((hour) => (
                  <tr className="border-t border-border" key={`row-${hour.hour}`}>
                    <td className="px-3 py-1.5">{hour.hour}h</td>
                    <td className="px-3 py-1.5">{hour.load}</td>
                    <td className="px-3 py-1.5">{hour.instances}</td>
                    <td className="px-3 py-1.5">{hour.cpu}%</td>
                    <td className="px-3 py-1.5 font-sans">{[hour.cpu > OVERLOAD ? 'quá tải' : '', hour.event ?? ''].filter(Boolean).join(' · ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </div>
    </div>
  );
}
