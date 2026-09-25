'use client';

import { useMemo, useState } from 'react';

type Preset = {
  id: string;
  label: string;
  sizes: number[];
  description: string;
};

const presets: Preset[] = [
  {
    id: 'mini',
    label: 'MLP nhỏ',
    sizes: [4, 5, 3],
    description: 'Một hidden layer — phù hợp để nhìn rõ cách các node kết nối.',
  },
  {
    id: 'tabular',
    label: 'Dữ liệu bảng',
    sizes: [8, 16, 8, 2],
    description: 'Ví dụ phân loại trạng thái server từ 8 chỉ số đầu vào.',
  },
  {
    id: 'classifier',
    label: 'Phân loại',
    sizes: [12, 24, 12, 4],
    description: 'Đầu ra gồm 4 logit, mỗi logit ứng với một lớp cần dự đoán.',
  },
  {
    id: 'deep',
    label: 'Nhiều layer',
    sizes: [10, 16, 16, 8, 3],
    description: 'Sâu hơn không đồng nghĩa tốt hơn; model cần đủ dữ liệu và regularization.',
  },
];

const WIDTH = 760;
const HEIGHT = 360;
const MAX_VISIBLE_NODES = 6;

function getNodePositions(size: number) {
  const count = Math.min(size, MAX_VISIBLE_NODES);
  const top = 76;
  const bottom = 284;
  if (count === 1) return [HEIGHT / 2];
  return Array.from({ length: count }, (_, index) => top + (index * (bottom - top)) / (count - 1));
}

function layerName(index: number, total: number) {
  if (index === 0) return 'Input';
  if (index === total - 1) return 'Output';
  return `Hidden ${index}`;
}

export function MlpArchitectureExplorer() {
  const [activeId, setActiveId] = useState('tabular');
  const active = presets.find((preset) => preset.id === activeId) ?? presets[1];

  const layers = useMemo(
    () =>
      active.sizes.map((size, index) => ({
        size,
        x: 74 + (index * (WIDTH - 148)) / (active.sizes.length - 1),
        ys: getNodePositions(size),
      })),
    [active],
  );

  const parameterRows = active.sizes.slice(0, -1).map((inputSize, index) => {
    const outputSize = active.sizes[index + 1];
    return {
      label: `${inputSize} → ${outputSize}`,
      weights: inputSize * outputSize,
      bias: outputSize,
      total: inputSize * outputSize + outputSize,
    };
  });
  const totalParameters = parameterRows.reduce((sum, row) => sum + row.total, 0);

  return (
    <div className="my-8 border border-[var(--border)] bg-[var(--surface)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3">
        <div>
          <p className="font-mono text-xs font-semibold text-[var(--primary)]">MLP architecture explorer</p>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">Chọn một cấu hình để xem mạng và số parameter thay đổi.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => setActiveId(preset.id)}
              className={`border px-3 py-2 text-xs font-semibold transition-colors ${
                activeId === preset.id
                  ? 'border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]'
                  : 'border-[var(--border)] text-[var(--ink)] hover:border-[var(--primary)] hover:text-[var(--primary)]'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto border-b border-[var(--border)]">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          role="img"
          aria-label={`Sơ đồ MLP có các layer ${active.sizes.join(', ')}`}
          className="min-w-[660px] w-full"
        >
          {layers.slice(0, -1).flatMap((layer, layerIndex) => {
            const nextLayer = layers[layerIndex + 1];
            return layer.ys.flatMap((y, sourceIndex) =>
              nextLayer.ys.map((nextY, targetIndex) => (
                <line
                  key={`${layerIndex}-${sourceIndex}-${targetIndex}`}
                  x1={layer.x + 14}
                  y1={y}
                  x2={nextLayer.x - 14}
                  y2={nextY}
                  stroke="var(--primary)"
                  strokeOpacity="0.18"
                  strokeWidth="1"
                />
              )),
            );
          })}

          {layers.map((layer, layerIndex) => (
            <g key={`${layer.x}-${layer.size}`}>
              <text
                x={layer.x}
                y="34"
                textAnchor="middle"
                fill="var(--ink)"
                fontSize="13"
                fontWeight="700"
              >
                {layerName(layerIndex, layers.length)}
              </text>
              <text x={layer.x} y="53" textAnchor="middle" fill="var(--muted-foreground)" fontSize="11">
                {layer.size} node{layer.size > 1 ? 's' : ''}
              </text>

              {layer.ys.map((y, nodeIndex) => (
                <g key={`${layerIndex}-${nodeIndex}`}>
                  <circle cx={layer.x} cy={y} r="17" fill="var(--card)" stroke="var(--primary)" strokeWidth="1.5" />
                  <circle
                    className="neural-node-pulse"
                    style={{ animationDelay: `${layerIndex * 0.65 + nodeIndex * 0.06}s` }}
                    cx={layer.x}
                    cy={y}
                    r="6"
                    fill="var(--primary)"
                  />
                </g>
              ))}

              {layer.size > MAX_VISIBLE_NODES && (
                <text x={layer.x + 29} y="291" fill="var(--muted-foreground)" fontSize="11">
                  × {layer.size}
                </text>
              )}
            </g>
          ))}

          <text x="18" y="337" fill="var(--muted-foreground)" fontSize="11">
            Mỗi đường nối là một weight có thể học
          </text>
          <text x={WIDTH - 18} y="337" textAnchor="end" fill="var(--primary)" fontSize="11" fontWeight="700">
            {active.sizes.join(' → ')}
          </text>
        </svg>
      </div>

      <div className="grid gap-0 lg:grid-cols-[1fr_1.25fr]">
        <div className="border-b border-[var(--border)] p-4 lg:border-b-0 lg:border-r">
          <p className="text-sm font-semibold text-[var(--ink)]">{active.label}</p>
          <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{active.description}</p>
          <div className="mt-4 border-l-2 border-[var(--primary)] pl-3">
            <span className="font-mono text-xs text-[var(--muted-foreground)]">Tổng parameter</span>
            <p className="mt-1 font-mono text-xl font-semibold text-[var(--primary)]">
              {totalParameters.toLocaleString('vi-VN')}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto p-4">
          <table className="w-full min-w-[400px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs text-[var(--muted-foreground)]">
                <th className="pb-2 font-medium">Layer</th>
                <th className="pb-2 font-medium">Weight</th>
                <th className="pb-2 font-medium">Bias</th>
                <th className="pb-2 text-right font-medium">Parameter</th>
              </tr>
            </thead>
            <tbody>
              {parameterRows.map((row) => (
                <tr key={row.label} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 font-mono text-[var(--primary)]">{row.label}</td>
                  <td className="py-2 text-[var(--muted-foreground)]">{row.weights}</td>
                  <td className="py-2 text-[var(--muted-foreground)]">{row.bias}</td>
                  <td className="py-2 text-right font-mono text-[var(--ink)]">{row.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 font-mono text-xs text-[var(--muted-foreground)]">in × out + out = weight + bias</p>
        </div>
      </div>
    </div>
  );
}
