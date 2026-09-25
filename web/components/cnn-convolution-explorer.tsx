'use client';

import { useEffect, useMemo, useState } from 'react';

const input = [
  [0, 0, 0, 0, 0, 0, 0],
  [0, 1, 1, 1, 0, 0, 0],
  [0, 1, 1, 1, 0, 1, 0],
  [0, 1, 1, 1, 0, 1, 0],
  [0, 0, 0, 0, 0, 1, 0],
  [0, 0, 1, 1, 1, 1, 0],
  [0, 0, 0, 0, 0, 0, 0],
];

const kernels = [
  {
    id: 'vertical',
    label: 'Cạnh dọc',
    matrix: [
      [-1, 0, 1],
      [-1, 0, 1],
      [-1, 0, 1],
    ],
    note: 'Phản ứng mạnh tại nơi giá trị thay đổi theo chiều ngang.',
  },
  {
    id: 'horizontal',
    label: 'Cạnh ngang',
    matrix: [
      [-1, -1, -1],
      [0, 0, 0],
      [1, 1, 1],
    ],
    note: 'Làm nổi bật đường biên chạy theo chiều ngang.',
  },
  {
    id: 'sharpen',
    label: 'Làm sắc nét',
    matrix: [
      [0, -1, 0],
      [-1, 5, -1],
      [0, -1, 0],
    ],
    note: 'Giữ tâm và trừ bớt vùng lân cận để tăng độ tương phản.',
  },
];

function convolve(matrix: number[][], kernel: number[][]) {
  const size = matrix.length - kernel.length + 1;
  return Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, column) =>
      kernel.reduce(
        (sum, kernelRow, kernelY) =>
          sum + kernelRow.reduce((rowSum, weight, kernelX) => rowSum + weight * matrix[row + kernelY][column + kernelX], 0),
        0,
      ),
    ),
  );
}

function GridCell({
  value,
  active = false,
  strong = false,
  onClick,
  label,
}: {
  value: number;
  active?: boolean;
  strong?: boolean;
  onClick?: () => void;
  label?: string;
}) {
  const Element = onClick ? 'button' : 'div';
  return (
    <Element
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      aria-label={label}
      className={`grid aspect-square min-w-0 place-items-center border-r border-b border-[var(--border)] font-mono text-xs transition-colors sm:text-sm ${
        active
          ? 'bg-primary text-primary-foreground'
          : strong
            ? 'bg-primary-soft text-primary-dark'
            : 'bg-card text-muted-foreground'
      } ${onClick ? 'cursor-pointer hover:bg-primary-soft hover:text-primary-dark' : ''}`}
    >
      {value}
    </Element>
  );
}

export function CnnConvolutionExplorer() {
  const [kernelId, setKernelId] = useState('vertical');
  const [position, setPosition] = useState(0);
  const [paused, setPaused] = useState(false);
  const kernel = kernels.find((item) => item.id === kernelId) ?? kernels[0];
  const output = useMemo(() => convolve(input, kernel.matrix), [kernel]);
  const outputSize = output.length;
  const activeRow = Math.floor(position / outputSize);
  const activeColumn = position % outputSize;
  const activePatch = input.slice(activeRow, activeRow + 3).map((row) => row.slice(activeColumn, activeColumn + 3));

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => {
      setPosition((current) => (current + 1) % (outputSize * outputSize));
    }, 900);
    return () => window.clearInterval(timer);
  }, [outputSize, paused]);

  useEffect(() => {
    setPosition(0);
  }, [kernelId]);

  const terms = activePatch.flatMap((row, y) => row.map((value, x) => `${value}×${kernel.matrix[y][x]}`));
  const currentValue = output[activeRow][activeColumn];

  return (
    <div
      className="my-8 border border-border bg-surface"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div>
          <p className="font-mono text-xs font-semibold text-primary">Convolution explorer</p>
          <p className="mt-1 text-sm text-muted-foreground">Kernel tự quét qua ảnh; rê chuột vào để tạm dừng.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {kernels.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setKernelId(item.id)}
              className={`border px-3 py-2 text-xs font-semibold transition-colors ${
                item.id === kernel.id
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-ink hover:border-primary hover:text-primary'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-8 p-4 lg:grid-cols-[1.15fr_0.62fr_1fr] lg:items-center lg:p-6">
        <section>
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-ink">Input</p>
              <p className="mt-1 font-mono text-xs text-muted-foreground">7 × 7 × 1</p>
            </div>
            <span className="font-mono text-xs text-primary">vùng đang đọc: 3 × 3</span>
          </div>
          <div className="grid grid-cols-7 border-l border-t border-border">
            {input.flatMap((row, rowIndex) =>
              row.map((value, columnIndex) => {
                const active =
                  rowIndex >= activeRow &&
                  rowIndex < activeRow + 3 &&
                  columnIndex >= activeColumn &&
                  columnIndex < activeColumn + 3;
                return <GridCell key={`${rowIndex}-${columnIndex}`} value={value} active={active} strong={value === 1} />;
              }),
            )}
          </div>
        </section>

        <section>
          <p className="text-sm font-semibold text-ink">Kernel</p>
          <p className="mt-1 font-mono text-xs text-muted-foreground">3 × 3</p>
          <div className="mt-3 grid grid-cols-3 border-l border-t border-border">
            {kernel.matrix.flatMap((row, rowIndex) =>
              row.map((value, columnIndex) => (
                <GridCell key={`${rowIndex}-${columnIndex}`} value={value} active={value !== 0} />
              )),
            )}
          </div>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{kernel.note}</p>
        </section>

        <section>
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-ink">Feature map</p>
              <p className="mt-1 font-mono text-xs text-muted-foreground">5 × 5 × 1</p>
            </div>
            <span className="font-mono text-xs text-primary">chọn một ô</span>
          </div>
          <div className="grid grid-cols-5 border-l border-t border-border">
            {output.flatMap((row, rowIndex) =>
              row.map((value, columnIndex) => {
                const cellPosition = rowIndex * outputSize + columnIndex;
                return (
                  <GridCell
                    key={`${rowIndex}-${columnIndex}`}
                    value={value}
                    active={cellPosition === position}
                    strong={Math.abs(value) >= 2}
                    onClick={() => setPosition(cellPosition)}
                    label={`Chọn feature map hàng ${rowIndex + 1}, cột ${columnIndex + 1}, giá trị ${value}`}
                  />
                );
              }),
            )}
          </div>
        </section>
      </div>

      <div className="grid border-t border-border lg:grid-cols-[1fr_auto]">
        <div className="min-w-0 p-4">
          <p className="font-mono text-xs text-muted-foreground">Phép tính tại ô ({activeRow + 1}, {activeColumn + 1})</p>
          <p className="mt-2 break-words font-mono text-xs leading-6 text-ink sm:text-sm">
            {terms.join(' + ')} = <strong className="text-primary">{currentValue}</strong>
          </p>
        </div>
        <div className="border-t border-border bg-primary-soft px-5 py-4 lg:min-w-44 lg:border-l lg:border-t-0">
          <p className="font-mono text-xs text-primary-dark">Output hiện tại</p>
          <p className="mt-1 font-mono text-2xl font-semibold text-primary-dark">{currentValue}</p>
        </div>
      </div>
    </div>
  );
}
