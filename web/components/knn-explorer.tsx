'use client';

import { useMemo, useState } from 'react';

type Point = { id: string; x: number; y: number; label: 'A' | 'B' };

const points: Point[] = [
  { id: 'x1', x: 2, y: 3, label: 'A' },
  { id: 'x2', x: 5, y: 4, label: 'B' },
  { id: 'x3', x: 4, y: 2, label: 'A' },
  { id: 'x4', x: 6, y: 5, label: 'B' },
  { id: 'x5', x: 3, y: 5, label: 'A' },
];

const query = { x: 4, y: 4 };
const candidateK = [1, 3, 5];
const curve = [
  { k: 1, train: 100, validation: 71 },
  { k: 3, train: 92, validation: 79 },
  { k: 5, train: 87, validation: 84 },
  { k: 7, train: 84, validation: 83 },
  { k: 9, train: 82, validation: 80 },
  { k: 11, train: 80, validation: 77 },
  { k: 15, train: 77, validation: 72 },
];

function distance(point: Point) {
  return Math.sqrt((query.x - point.x) ** 2 + (query.y - point.y) ** 2);
}

export function KnnExplorer() {
  const [mode, setMode] = useState<'prediction' | 'validation'>('prediction');
  const [k, setK] = useState(3);
  const [curveK, setCurveK] = useState(5);

  const ranked = useMemo(
    () => points.map((point) => ({ ...point, distance: distance(point) })).sort((a, b) => a.distance - b.distance),
    [],
  );
  const neighbours = ranked.slice(0, k);
  const votes = neighbours.reduce((result, point) => ({ ...result, [point.label]: result[point.label] + 1 }), { A: 0, B: 0 });
  const prediction = votes.A > votes.B ? 'A' : 'B';
  const selectedCurve = curve.find((item) => item.k === curveK) ?? curve[2];

  const plotX = (value: number) => 38 + value * 42;
  const plotY = (value: number) => 292 - value * 38;
  const curveX = (index: number) => 48 + index * 88;
  const curveY = (value: number) => 245 - (value - 65) * 5;

  return (
    <div className="my-8 border border-border bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div>
          <p className="font-mono text-xs font-semibold text-primary">KNN explorer</p>
          <p className="mt-1 text-sm text-muted-foreground">Dự đoán một điểm mới và chọn K bằng validation.</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode('prediction')}
            className={`border px-3 py-2 text-xs font-semibold ${mode === 'prediction' ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-ink hover:border-primary'}`}
          >
            Dự đoán
          </button>
          <button
            type="button"
            onClick={() => setMode('validation')}
            className={`border px-3 py-2 text-xs font-semibold ${mode === 'validation' ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-ink hover:border-primary'}`}
          >
            Chọn K
          </button>
        </div>
      </div>

      {mode === 'prediction' ? (
        <div className="grid lg:grid-cols-[1fr_0.9fr]">
          <div className="border-b border-border p-4 lg:border-b-0 lg:border-r lg:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-ink">Query Q = (4, 4)</p>
                <p className="mt-1 text-xs text-muted-foreground">Điểm gần nhất được nối với Q.</p>
              </div>
              <div className="flex gap-2">
                {candidateK.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setK(value)}
                    className={`grid size-9 place-items-center border font-mono text-xs font-bold ${k === value ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-ink hover:border-primary'}`}
                    aria-label={`Chọn K bằng ${value}`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>

            <svg viewBox="0 0 340 330" className="w-full border border-border bg-card" role="img" aria-label={`KNN với K bằng ${k}, dự đoán lớp ${prediction}`}>
              {[1, 2, 3, 4, 5, 6, 7].map((value) => (
                <g key={value}>
                  <line x1={plotX(value)} y1="24" x2={plotX(value)} y2="292" stroke="var(--border)" strokeWidth="1" />
                  <line x1="38" y1={plotY(value)} x2="316" y2={plotY(value)} stroke="var(--border)" strokeWidth="1" />
                  <text x={plotX(value)} y="312" textAnchor="middle" fill="var(--muted-foreground)" fontSize="10">{value}</text>
                  <text x="22" y={plotY(value) + 4} textAnchor="middle" fill="var(--muted-foreground)" fontSize="10">{value}</text>
                </g>
              ))}

              {neighbours.map((point) => (
                <line
                  key={`line-${point.id}`}
                  x1={plotX(query.x)}
                  y1={plotY(query.y)}
                  x2={plotX(point.x)}
                  y2={plotY(point.y)}
                  stroke="var(--primary)"
                  strokeOpacity="0.55"
                  strokeDasharray="5 4"
                />
              ))}

              {points.map((point) => {
                const selected = neighbours.some((item) => item.id === point.id);
                return (
                  <g key={point.id}>
                    <circle
                      cx={plotX(point.x)}
                      cy={plotY(point.y)}
                      r={selected ? 14 : 11}
                      fill={point.label === 'A' ? 'var(--primary)' : 'var(--card)'}
                      stroke={selected ? 'var(--primary-dark)' : 'var(--muted-foreground)'}
                      strokeWidth={selected ? 3 : 1.5}
                    />
                    <text x={plotX(point.x)} y={plotY(point.y) + 4} textAnchor="middle" fill={point.label === 'A' ? 'var(--primary-foreground)' : 'var(--ink)'} fontSize="10" fontWeight="700">{point.label}</text>
                    <text x={plotX(point.x)} y={plotY(point.y) - 19} textAnchor="middle" fill="var(--muted-foreground)" fontSize="10">{point.id}</text>
                  </g>
                );
              })}

              <circle cx={plotX(query.x)} cy={plotY(query.y)} r="10" fill="var(--ink)" stroke="var(--background)" strokeWidth="3" />
              <text x={plotX(query.x) + 15} y={plotY(query.y) - 12} fill="var(--ink)" fontSize="11" fontWeight="700">Q</text>
            </svg>
          </div>

          <div className="p-4 lg:p-5">
            <div className="grid grid-cols-3 gap-2">
              <div className="border border-border bg-card p-3">
                <span className="font-mono text-xs text-muted-foreground">K</span>
                <strong className="mt-1 block text-xl text-ink">{k}</strong>
              </div>
              <div className="border border-border bg-card p-3">
                <span className="font-mono text-xs text-muted-foreground">Vote A</span>
                <strong className="mt-1 block text-xl text-primary">{votes.A}</strong>
              </div>
              <div className="border border-border bg-card p-3">
                <span className="font-mono text-xs text-muted-foreground">Vote B</span>
                <strong className="mt-1 block text-xl text-ink">{votes.B}</strong>
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[360px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-border font-mono text-xs text-muted-foreground">
                    <th className="pb-2 font-medium">Hạng</th>
                    <th className="pb-2 font-medium">Điểm</th>
                    <th className="pb-2 font-medium">Khoảng cách</th>
                    <th className="pb-2 text-right font-medium">Lớp</th>
                  </tr>
                </thead>
                <tbody>
                  {ranked.map((point, index) => (
                    <tr key={point.id} className={`border-b border-border last:border-0 ${index < k ? 'bg-primary-soft' : ''}`}>
                      <td className="py-2 font-mono text-muted-foreground">{index + 1}</td>
                      <td className="py-2 font-semibold text-ink">{point.id}</td>
                      <td className="py-2 font-mono text-muted-foreground">{point.distance.toFixed(2)}</td>
                      <td className="py-2 text-right font-mono font-bold text-primary">{point.label}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 border-l-2 border-primary bg-primary-soft px-4 py-3">
              <p className="font-mono text-xs text-primary-dark">K = {k}</p>
              <p className="mt-1 text-base font-semibold text-primary-dark">Dự đoán lớp {prediction}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-[1.35fr_0.65fr]">
          <div className="border-b border-border p-4 lg:border-b-0 lg:border-r lg:p-5">
            <svg viewBox="0 0 650 290" className="w-full border border-border bg-card" role="img" aria-label="Đường validation accuracy đạt cao nhất tại K bằng 5">
              {[70, 80, 90, 100].map((value) => (
                <g key={value}>
                  <line x1="48" y1={curveY(value)} x2="590" y2={curveY(value)} stroke="var(--border)" />
                  <text x="28" y={curveY(value) + 4} textAnchor="middle" fill="var(--muted-foreground)" fontSize="10">{value}%</text>
                </g>
              ))}
              <polyline points={curve.map((item, index) => `${curveX(index)},${curveY(item.train)}`).join(' ')} fill="none" stroke="var(--muted-foreground)" strokeWidth="2" strokeDasharray="6 4" />
              <polyline points={curve.map((item, index) => `${curveX(index)},${curveY(item.validation)}`).join(' ')} fill="none" stroke="var(--primary)" strokeWidth="3" />
              {curve.map((item, index) => (
                <g key={item.k} onClick={() => setCurveK(item.k)} className="cursor-pointer">
                  <circle cx={curveX(index)} cy={curveY(item.validation)} r={curveK === item.k ? 8 : 5} fill="var(--primary)" stroke="var(--background)" strokeWidth="2" />
                  <text x={curveX(index)} y="270" textAnchor="middle" fill="var(--muted-foreground)" fontSize="11">K={item.k}</text>
                </g>
              ))}
              <text x="510" y="30" fill="var(--primary)" fontSize="11">Validation</text>
              <text x="510" y="48" fill="var(--muted-foreground)" fontSize="11">Training</text>
            </svg>
          </div>

          <div className="p-4 lg:p-5">
            <p className="font-mono text-xs text-muted-foreground">Giá trị đang chọn</p>
            <p className="mt-2 text-2xl font-semibold text-ink">K = {selectedCurve.k}</p>
            <dl className="mt-5 space-y-3">
              <div className="border-b border-border pb-3">
                <dt className="text-xs text-muted-foreground">Training accuracy</dt>
                <dd className="mt-1 font-mono text-lg text-ink">{selectedCurve.train}%</dd>
              </div>
              <div className="border-b border-border pb-3">
                <dt className="text-xs text-muted-foreground">Validation accuracy</dt>
                <dd className="mt-1 font-mono text-lg font-bold text-primary">{selectedCurve.validation}%</dd>
              </div>
            </dl>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              {selectedCurve.k < 5 ? 'K nhỏ: variance cao, dễ bám noise.' : selectedCurve.k === 5 ? 'Validation đạt đỉnh: cân bằng bias và variance.' : 'K lớn: boundary quá mượt, local structure bị mất.'}
            </p>
            <p className="mt-3 font-mono text-xs text-muted-foreground">Số liệu minh họa từ lecture, không phải kết quả dataset thật.</p>
          </div>
        </div>
      )}
    </div>
  );
}
