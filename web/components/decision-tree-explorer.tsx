'use client';

import { useMemo, useState } from 'react';

const depthCurve = [
  60, 70, 78, 82, 84, 83, 82, 80, 78, 76,
  74, 72, 70, 68, 67, 65, 64, 63, 62, 61,
].map((validation, index) => ({
  depth: index + 1,
  train: Math.min(100, Math.round(58 + 43 * (1 - Math.exp(-(index + 1) / 4)))),
  validation,
}));

function edgeColor(active: boolean) {
  return active ? 'var(--primary)' : 'var(--border)';
}

export function DecisionTreeExplorer() {
  const [width, setWidth] = useState(5.5);
  const [height, setHeight] = useState(12);
  const [depth, setDepth] = useState(5);

  const goesLeft = width < 7.5;
  const secondQuestion = !goesLeft;
  const goesOrange = secondQuestion && height < 9;
  const fruit = goesOrange ? 'Orange' : 'Lemon';

  const selectedDepth = depthCurve[depth - 1];
  const regime = depth <= 2
    ? {
        label: 'High bias · underfitting',
        note: 'Cây quá nông, cả train và validation đều thấp vì chưa đủ rule để mô tả pattern.',
      }
    : depth <= 7
      ? {
          label: 'Vùng cân bằng',
          note: 'Validation đạt vùng tốt nhất trước khi cây bắt đầu ghi nhớ các chi tiết riêng của training set.',
        }
      : {
          label: 'High variance · overfitting',
          note: 'Training tiếp tục tăng nhưng validation giảm; cây đang học cả noise của sample hiện tại.',
        };

  const curvePoints = useMemo(
    () => ({
      train: depthCurve.map((item) => `${42 + (item.depth - 1) * 27},${228 - (item.train - 55) * 3.4}`).join(' '),
      validation: depthCurve.map((item) => `${42 + (item.depth - 1) * 27},${228 - (item.validation - 55) * 3.4}`).join(' '),
    }),
    [],
  );

  const markerX = 42 + (depth - 1) * 27;
  const markerTrainY = 228 - (selectedDepth.train - 55) * 3.4;
  const markerValidationY = 228 - (selectedDepth.validation - 55) * 3.4;

  return (
    <div className="my-8 border border-border bg-surface">
      <div className="border-b border-border px-4 py-3 sm:px-5">
        <p className="font-mono text-xs font-semibold text-primary">Decision Tree explorer</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Theo một prediction từ root tới leaf, sau đó đổi độ sâu để đọc bias và variance.
        </p>
      </div>

      <section className="grid lg:grid-cols-[0.85fr_1.15fr]">
        <div className="border-b border-border p-4 lg:border-b-0 lg:border-r lg:p-5">
          <p className="text-sm font-semibold text-ink">Một quả mới đi qua cây như thế nào?</p>
          <div className="mt-5 space-y-5">
            <label className="block">
              <span className="flex items-center justify-between gap-4 text-sm">
                <span className="text-muted-foreground">Width</span>
                <strong className="font-mono text-primary">{width.toFixed(1)} cm</strong>
              </span>
              <input className="mt-2 w-full accent-[var(--primary)]" type="range" min="4" max="11" step="0.5" value={width} onChange={(event) => setWidth(Number(event.target.value))} />
            </label>
            <label className="block">
              <span className="flex items-center justify-between gap-4 text-sm">
                <span className="text-muted-foreground">Height</span>
                <strong className="font-mono text-primary">{height.toFixed(1)} cm</strong>
              </span>
              <input className="mt-2 w-full accent-[var(--primary)]" type="range" min="5" max="13" step="0.5" value={height} onChange={(event) => setHeight(Number(event.target.value))} />
            </label>
          </div>

          <div className="mt-6 border border-border bg-card p-4">
            <p className="font-mono text-xs text-muted-foreground">PATH</p>
            <ol className="mt-3 space-y-2 text-sm leading-6">
              <li>1. Width &lt; 7.5? <strong className="text-primary">{goesLeft ? 'Có' : 'Không'}</strong></li>
              {!goesLeft && <li>2. Height &lt; 9? <strong className="text-primary">{goesOrange ? 'Có' : 'Không'}</strong></li>}
            </ol>
            <p className="mt-4 border-l-2 border-primary pl-3 text-base font-semibold text-ink">Prediction: {fruit}</p>
          </div>
        </div>

        <div className="p-4 lg:p-5">
          <svg viewBox="0 0 620 330" className="w-full border border-border bg-card" role="img" aria-label={`Cây quyết định dự đoán ${fruit} từ width và height`}>
            <line x1="310" y1="78" x2="150" y2="158" stroke={edgeColor(goesLeft)} strokeWidth={goesLeft ? 4 : 2} />
            <line x1="310" y1="78" x2="455" y2="158" stroke={edgeColor(secondQuestion)} strokeWidth={secondQuestion ? 4 : 2} />
            <line x1="455" y1="202" x2="385" y2="275" stroke={edgeColor(goesOrange)} strokeWidth={goesOrange ? 4 : 2} />
            <line x1="455" y1="202" x2="535" y2="275" stroke={edgeColor(secondQuestion && !goesOrange)} strokeWidth={secondQuestion && !goesOrange ? 4 : 2} />
            <text x="215" y="112" fill="var(--muted-foreground)" fontSize="12">Có</text>
            <text x="390" y="112" fill="var(--muted-foreground)" fontSize="12">Không</text>
            <text x="401" y="238" fill="var(--muted-foreground)" fontSize="12">Có</text>
            <text x="510" y="238" fill="var(--muted-foreground)" fontSize="12">Không</text>
            <g>
              <rect x="230" y="36" width="160" height="48" fill="var(--primary-soft)" stroke="var(--primary)" />
              <text x="310" y="65" textAnchor="middle" fill="var(--ink)" fontSize="14" fontWeight="700">Width &lt; 7.5?</text>
            </g>
            <g>
              <rect x="80" y="155" width="140" height="48" fill={goesLeft ? 'var(--primary)' : 'var(--card)'} stroke="var(--primary)" />
              <text x="150" y="184" textAnchor="middle" fill={goesLeft ? 'var(--primary-foreground)' : 'var(--ink)'} fontSize="14" fontWeight="700">Lemon</text>
            </g>
            <g>
              <rect x="380" y="155" width="150" height="48" fill={secondQuestion ? 'var(--primary-soft)' : 'var(--card)'} stroke="var(--primary)" />
              <text x="455" y="184" textAnchor="middle" fill="var(--ink)" fontSize="14" fontWeight="700">Height &lt; 9?</text>
            </g>
            <g>
              <rect x="325" y="270" width="120" height="44" fill={goesOrange ? 'var(--primary)' : 'var(--card)'} stroke="var(--primary)" />
              <text x="385" y="297" textAnchor="middle" fill={goesOrange ? 'var(--primary-foreground)' : 'var(--ink)'} fontSize="14" fontWeight="700">Orange</text>
            </g>
            <g>
              <rect x="475" y="270" width="120" height="44" fill={secondQuestion && !goesOrange ? 'var(--primary)' : 'var(--card)'} stroke="var(--primary)" />
              <text x="535" y="297" textAnchor="middle" fill={secondQuestion && !goesOrange ? 'var(--primary-foreground)' : 'var(--ink)'} fontSize="14" fontWeight="700">Lemon</text>
            </g>
          </svg>
          <div className="mt-3 grid grid-cols-4 gap-px border border-border bg-border text-center text-xs">
            <div className="bg-card px-2 py-3"><strong className="block text-ink">Root</strong><span className="text-muted-foreground">câu đầu</span></div>
            <div className="bg-card px-2 py-3"><strong className="block text-ink">Node</strong><span className="text-muted-foreground">phép chia</span></div>
            <div className="bg-card px-2 py-3"><strong className="block text-ink">Branch</strong><span className="text-muted-foreground">Có / Không</span></div>
            <div className="bg-card px-2 py-3"><strong className="block text-ink">Leaf</strong><span className="text-muted-foreground">kết quả</span></div>
          </div>
        </div>
      </section>

      <section className="border-t border-border p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-ink">max_depth là núm chỉnh độ phức tạp</p>
            <p className="mt-1 text-sm text-muted-foreground">Kéo từ cây rất nông tới cây ghi nhớ training set.</p>
          </div>
          <div className="border border-border bg-card px-4 py-2 text-right">
            <span className="font-mono text-xs text-muted-foreground">max_depth</span>
            <strong className="ml-3 font-mono text-xl text-primary">{depth}</strong>
          </div>
        </div>

        <input className="mt-5 w-full accent-[var(--primary)]" type="range" min="1" max="20" step="1" value={depth} onChange={(event) => setDepth(Number(event.target.value))} aria-label="Chọn độ sâu cây" />

        <div className="mt-5 grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
          <svg viewBox="0 0 590 260" className="w-full border border-border bg-card" role="img" aria-label="Training và validation accuracy theo độ sâu cây">
            {[60, 70, 80, 90, 100].map((value) => {
              const y = 228 - (value - 55) * 3.4;
              return (
                <g key={value}>
                  <line x1="42" y1={y} x2="555" y2={y} stroke="var(--border)" />
                  <text x="24" y={y + 4} textAnchor="middle" fill="var(--muted-foreground)" fontSize="10">{value}%</text>
                </g>
              );
            })}
            <line x1={markerX} y1="24" x2={markerX} y2="228" stroke="var(--primary)" strokeDasharray="5 4" />
            <polyline points={curvePoints.train} fill="none" stroke="var(--muted-foreground)" strokeWidth="2.5" strokeDasharray="7 5" />
            <polyline points={curvePoints.validation} fill="none" stroke="var(--primary)" strokeWidth="3" />
            <circle cx={markerX} cy={markerTrainY} r="6" fill="var(--muted-foreground)" stroke="var(--background)" strokeWidth="2" />
            <circle cx={markerX} cy={markerValidationY} r="7" fill="var(--primary)" stroke="var(--background)" strokeWidth="2" />
            <text x="445" y="28" fill="var(--muted-foreground)" fontSize="11">Training</text>
            <text x="445" y="46" fill="var(--primary)" fontSize="11">Validation</text>
            {[1, 5, 10, 15, 20].map((value) => <text key={value} x={42 + (value - 1) * 27} y="248" textAnchor="middle" fill="var(--muted-foreground)" fontSize="10">{value}</text>)}
          </svg>

          <div className="border border-border bg-card p-4">
            <p className="font-mono text-xs font-semibold text-primary">{regime.label}</p>
            <dl className="mt-4 grid grid-cols-2 gap-3">
              <div className="border border-border p-3"><dt className="text-xs text-muted-foreground">Train</dt><dd className="mt-1 font-mono text-xl text-ink">{selectedDepth.train}%</dd></div>
              <div className="border border-border p-3"><dt className="text-xs text-muted-foreground">Validation</dt><dd className="mt-1 font-mono text-xl text-primary">{selectedDepth.validation}%</dd></div>
            </dl>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">{regime.note}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
