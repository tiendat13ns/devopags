'use client';

import { useMemo, useState } from 'react';

type ActivationKey = 'relu' | 'leaky-relu' | 'sigmoid' | 'tanh' | 'gelu';

const activations: Record<ActivationKey, {
  label: string;
  formula: string;
  range: [number, number];
  description: string;
  note: string;
  fn: (x: number) => number;
}> = {
  relu: {
    label: 'ReLU',
    formula: 'f(x) = max(0, x)',
    range: [-1, 6],
    description: 'Giữ phần dương và đưa phần âm về 0. Đây là baseline đơn giản, nhanh và phổ biến cho hidden layer.',
    note: 'Điểm cần nhớ: neuron có thể “chết” nếu liên tục rơi vào vùng x < 0.',
    fn: (x) => Math.max(0, x),
  },
  'leaky-relu': {
    label: 'Leaky ReLU',
    formula: 'f(x) = max(0.01x, x)',
    range: [-1, 6],
    description: 'Giống ReLU nhưng vẫn cho một gradient nhỏ đi qua vùng âm.',
    note: 'Hữu ích khi muốn giảm nguy cơ dying ReLU mà vẫn giữ phép tính đơn giản.',
    fn: (x) => (x >= 0 ? x : 0.01 * x),
  },
  sigmoid: {
    label: 'Sigmoid',
    formula: 'f(x) = 1 / (1 + e⁻ˣ)',
    range: [-0.15, 1.15],
    description: 'Nén mọi giá trị về khoảng 0–1, phù hợp để diễn giải như xác suất nhị phân.',
    note: 'Hai đầu đồ thị bão hòa khiến gradient rất nhỏ, vì vậy ít dùng cho hidden layer sâu.',
    fn: (x) => 1 / (1 + Math.exp(-x)),
  },
  tanh: {
    label: 'Tanh',
    formula: 'f(x) = tanh(x)',
    range: [-1.25, 1.25],
    description: 'Nén giá trị về khoảng -1 đến 1 và có tâm tại 0.',
    note: 'Tốt hơn sigmoid ở tính zero-centered nhưng vẫn gặp bão hòa ở hai đầu.',
    fn: (x) => Math.tanh(x),
  },
  gelu: {
    label: 'GELU',
    formula: 'f(x) ≈ 0.5x[1 + tanh(√(2/π)(x + 0.044715x³))]',
    range: [-1, 6],
    description: 'Giữ tín hiệu theo một cổng mềm thay vì cắt phần âm đột ngột như ReLU.',
    note: 'Thường gặp trong Transformer và các model ngôn ngữ hiện đại.',
    fn: (x) => 0.5 * x * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * x ** 3))),
  },
};

const plot = { width: 720, height: 300, left: 48, right: 24, top: 20, bottom: 38 };

export function ActivationFunctionVisualizer() {
  const [selectedKey, setSelectedKey] = useState<ActivationKey>('relu');
  const selected = activations[selectedKey];

  const geometry = useMemo(() => {
    const xMin = -6;
    const xMax = 6;
    const [yMin, yMax] = selected.range;
    const chartWidth = plot.width - plot.left - plot.right;
    const chartHeight = plot.height - plot.top - plot.bottom;
    const xToSvg = (x: number) => plot.left + ((x - xMin) / (xMax - xMin)) * chartWidth;
    const yToSvg = (y: number) => plot.top + ((yMax - y) / (yMax - yMin)) * chartHeight;
    const points = Array.from({ length: 161 }, (_, index) => {
      const x = xMin + (index / 160) * (xMax - xMin);
      return `${index === 0 ? 'M' : 'L'} ${xToSvg(x).toFixed(2)} ${yToSvg(selected.fn(x)).toFixed(2)}`;
    }).join(' ');

    return { points, xToSvg, yToSvg, yMin, yMax };
  }, [selected]);

  return (
    <div className="border border-border bg-card/65">
      <div className="flex flex-wrap border-b border-border" role="group" aria-label="Chọn hàm kích hoạt">
        {(Object.entries(activations) as [ActivationKey, (typeof activations)[ActivationKey]][]).map(([key, activation]) => {
          const active = key === selectedKey;
          return (
            <button
              className={`border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${active ? 'border-primary bg-primary-soft text-primary' : 'border-transparent text-muted-foreground hover:bg-accent hover:text-ink'}`}
              key={key}
              type="button"
              onClick={() => setSelectedKey(key)}
              aria-pressed={active}
            >
              {activation.label}
            </button>
          );
        })}
      </div>

      <div className="overflow-x-auto p-3 sm:p-5">
        <svg className="h-auto w-full min-w-[620px]" viewBox={`0 0 ${plot.width} ${plot.height}`} role="img" aria-label={`Đồ thị hàm ${selected.label}`}>
          <g stroke="var(--border)" strokeWidth="1">
            {[-6, -4, -2, 0, 2, 4, 6].map((x) => <line key={`x-${x}`} x1={geometry.xToSvg(x)} y1={plot.top} x2={geometry.xToSvg(x)} y2={plot.height - plot.bottom} />)}
            {[geometry.yMin, (geometry.yMin + geometry.yMax) / 2, geometry.yMax].map((y) => <line key={`y-${y}`} x1={plot.left} y1={geometry.yToSvg(y)} x2={plot.width - plot.right} y2={geometry.yToSvg(y)} />)}
          </g>
          <g stroke="var(--muted-foreground)" strokeWidth="1.2">
            <line x1={plot.left} y1={geometry.yToSvg(0)} x2={plot.width - plot.right} y2={geometry.yToSvg(0)} />
            <line x1={geometry.xToSvg(0)} y1={plot.top} x2={geometry.xToSvg(0)} y2={plot.height - plot.bottom} />
          </g>
          <g fill="var(--muted-foreground)" fontSize="11" fontFamily="var(--font-mono)">
            {[-6, -4, -2, 0, 2, 4, 6].map((x) => <text key={x} x={geometry.xToSvg(x)} y={plot.height - 14} textAnchor="middle">{x}</text>)}
            <text x={plot.width - plot.right} y={geometry.yToSvg(0) - 7} textAnchor="end">x</text>
            <text x={geometry.xToSvg(0) + 8} y={plot.top + 11}>f(x)</text>
          </g>
          <path d={geometry.points} fill="none" stroke="var(--primary)" strokeWidth="3" vectorEffect="non-scaling-stroke" />
          {[-2, 0, 2].map((x) => (
            <circle key={x} cx={geometry.xToSvg(x)} cy={geometry.yToSvg(selected.fn(x))} r="4" fill="var(--background)" stroke="var(--primary)" strokeWidth="2" />
          ))}
        </svg>
      </div>

      <div className="grid gap-px border-t border-border bg-border sm:grid-cols-[220px_1fr]">
        <div className="bg-surface p-4">
          <p className="font-mono text-xs text-primary">{selected.formula}</p>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            {[-2, 0, 2].map((x) => (
              <div className="border border-border bg-background px-2 py-2" key={x}>
                <span className="block font-mono text-[10px] text-muted-foreground">x = {x}</span>
                <strong className="mt-1 block font-mono text-xs text-ink">{selected.fn(x).toFixed(2)}</strong>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-surface p-4">
          <h3 className="font-semibold text-ink">{selected.label}</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{selected.description}</p>
          <p className="mt-2 text-xs leading-5 text-primary">{selected.note}</p>
        </div>
      </div>
    </div>
  );
}
