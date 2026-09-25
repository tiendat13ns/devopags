'use client';

import { useMemo, useState } from 'react';

type Counts = { tp: number; fp: number; fn: number; tn: number };

const presets: { label: string; values: Counts }[] = [
  { label: 'Khá cân bằng', values: { tp: 72, fp: 8, fn: 18, tn: 102 } },
  { label: 'Bỏ sót nhiều', values: { tp: 35, fp: 5, fn: 55, tn: 105 } },
  { label: 'Cảnh báo giả nhiều', values: { tp: 80, fp: 50, fn: 10, tn: 60 } },
  { label: 'Dữ liệu lệch lớp', values: { tp: 6, fp: 4, fn: 4, tn: 186 } },
];

function safeDivide(numerator: number, denominator: number) {
  return denominator === 0 ? 0 : numerator / denominator;
}

function percent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

export function ClassificationMetricsLab() {
  const [counts, setCounts] = useState<Counts>(presets[0].values);

  const metrics = useMemo(() => {
    const total = counts.tp + counts.fp + counts.fn + counts.tn;
    const accuracy = safeDivide(counts.tp + counts.tn, total);
    const precision = safeDivide(counts.tp, counts.tp + counts.fp);
    const recall = safeDivide(counts.tp, counts.tp + counts.fn);
    const f1 = safeDivide(2 * precision * recall, precision + recall);
    return { total, accuracy, precision, recall, f1 };
  }, [counts]);

  function update(key: keyof Counts, value: number) {
    setCounts((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="border border-border bg-card/65">
      <div className="flex flex-wrap border-b border-border">
        {presets.map((preset) => (
          <button
            className="border-b-2 border-transparent px-4 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary hover:bg-accent hover:text-primary"
            key={preset.label}
            type="button"
            onClick={() => setCounts(preset.values)}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 p-4 sm:p-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="font-mono text-xs font-semibold text-primary">Confusion matrix · {metrics.total} samples</p>
          <div className="mt-4 grid grid-cols-[80px_1fr_1fr] gap-px bg-border text-center text-sm">
            <div className="bg-surface p-3" />
            <div className="bg-surface p-3 font-semibold text-ink">Pred +</div>
            <div className="bg-surface p-3 font-semibold text-ink">Pred −</div>

            <div className="grid place-items-center bg-surface p-3 font-semibold text-ink">Actual +</div>
            <div className="bg-primary-soft p-4">
              <span className="font-mono text-[10px] text-primary">TRUE POSITIVE</span>
              <strong className="mt-2 block text-2xl text-ink">{counts.tp}</strong>
            </div>
            <div className="bg-card p-4">
              <span className="font-mono text-[10px] text-primary">FALSE NEGATIVE</span>
              <strong className="mt-2 block text-2xl text-ink">{counts.fn}</strong>
            </div>

            <div className="grid place-items-center bg-surface p-3 font-semibold text-ink">Actual −</div>
            <div className="bg-card p-4">
              <span className="font-mono text-[10px] text-primary">FALSE POSITIVE</span>
              <strong className="mt-2 block text-2xl text-ink">{counts.fp}</strong>
            </div>
            <div className="bg-primary-soft p-4">
              <span className="font-mono text-[10px] text-primary">TRUE NEGATIVE</span>
              <strong className="mt-2 block text-2xl text-ink">{counts.tn}</strong>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {([
            ['tp', 'True Positive', counts.tp],
            ['fp', 'False Positive', counts.fp],
            ['fn', 'False Negative', counts.fn],
            ['tn', 'True Negative', counts.tn],
          ] as [keyof Counts, string, number][]).map(([key, label, value]) => (
            <label className="block" key={key}>
              <span className="flex items-center justify-between gap-4 text-sm">
                <span className="font-semibold text-ink">{label}</span>
                <span className="font-mono text-xs text-primary">{value}</span>
              </span>
              <input
                className="mt-2 h-2 w-full cursor-pointer accent-[var(--primary)]"
                type="range"
                min="0"
                max="200"
                value={value}
                onChange={(event) => update(key, Number(event.target.value))}
              />
            </label>
          ))}
        </div>
      </div>

      <div className="grid gap-px border-t border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['Accuracy', metrics.accuracy, '(TP + TN) / All'],
          ['Precision', metrics.precision, 'TP / (TP + FP)'],
          ['Recall', metrics.recall, 'TP / (TP + FN)'],
          ['F1', metrics.f1, '2PR / (P + R)'],
        ].map(([label, value, formula]) => (
          <div className="bg-surface p-4" key={label as string}>
            <span className="text-sm font-semibold text-ink">{label as string}</span>
            <strong className="mt-2 block text-2xl text-primary">{percent(value as number)}</strong>
            <span className="mt-2 block font-mono text-[10px] text-muted-foreground">{formula as string}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
