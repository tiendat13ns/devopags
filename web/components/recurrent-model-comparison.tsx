'use client';

import { useMemo, useState } from 'react';

type ModelKey = 'RNN' | 'LSTM' | 'GRU';
type DatasetKey = 'sunspot' | 'covid' | 'oxygen';

const models: Record<ModelKey, {
  gates: string[];
  state: string;
  idea: string;
  strength: string;
  limitation: string;
  relativeCost: number;
}> = {
  RNN: {
    gates: [],
    state: 'Hidden state hₜ',
    idea: 'Trộn input hiện tại với hidden state trước bằng một phép biến đổi đơn giản.',
    strength: 'Ít parameter, train nhanh, hợp với chuỗi ngắn và baseline.',
    limitation: 'Khó giữ tín hiệu xa vì vanishing hoặc exploding gradient.',
    relativeCost: 1,
  },
  LSTM: {
    gates: ['Forget', 'Input', 'Output'],
    state: 'Hidden state hₜ + cell state cₜ',
    idea: 'Dùng cell state làm đường truyền memory và ba gate để kiểm soát đọc, ghi, quên.',
    strength: 'Kiểm soát memory chi tiết, thường ổn định khi dependency dài.',
    limitation: 'Nhiều parameter, dùng nhiều memory và tốn thời gian tính hơn.',
    relativeCost: 4,
  },
  GRU: {
    gates: ['Update', 'Reset'],
    state: 'Hidden state hₜ',
    idea: 'Gộp cell state vào hidden state và dùng hai gate để đơn giản hóa LSTM.',
    strength: 'Cân bằng giữa khả năng nhớ và chi phí; thường hội tụ nhanh.',
    limitation: 'Ít khả năng kiểm soát memory riêng biệt hơn LSTM.',
    relativeCost: 3,
  },
};

const benchmark: Record<DatasetKey, {
  label: string;
  context: string;
  values: Record<ModelKey, { mae: number; mape: number; rmse: number }>;
}> = {
  sunspot: {
    label: 'Sunspot',
    context: '3.625 quan sát theo tháng, có tính chu kỳ.',
    values: {
      RNN: { mae: 18.876, mape: 50.941, rmse: 25.678 },
      LSTM: { mae: 17.176, mape: 38.5, rmse: 23.557 },
      GRU: { mae: 17.367, mape: 38.569, rmse: 23.814 },
    },
  },
  covid: {
    label: 'COVID-19',
    context: '634 quan sát ca nhiễm mới theo ngày tại Jakarta.',
    values: {
      RNN: { mae: 1.208, mape: 12.901, rmse: 1.592 },
      LSTM: { mae: 0.903, mape: 9.036, rmse: 1.164 },
      GRU: { mae: 0.903, mape: 9.349, rmse: 1.149 },
    },
  },
  oxygen: {
    label: 'Dissolved oxygen',
    context: '1.033 quan sát nồng độ oxy hòa tan theo ngày.',
    values: {
      RNN: { mae: 3.322, mape: 8.251, rmse: 4.455 },
      LSTM: { mae: 3.258, mape: 8.152, rmse: 4.358 },
      GRU: { mae: 3.175, mape: 7.987, rmse: 4.204 },
    },
  },
};

const modelOrder: ModelKey[] = ['RNN', 'LSTM', 'GRU'];

export function RecurrentModelComparison() {
  const [activeModel, setActiveModel] = useState<ModelKey>('GRU');
  const [dataset, setDataset] = useState<DatasetKey>('sunspot');
  const selected = models[activeModel];
  const selectedDataset = benchmark[dataset];

  const minimums = useMemo(() => ({
    mae: Math.min(...modelOrder.map((model) => selectedDataset.values[model].mae)),
    mape: Math.min(...modelOrder.map((model) => selectedDataset.values[model].mape)),
    rmse: Math.min(...modelOrder.map((model) => selectedDataset.values[model].rmse)),
  }), [selectedDataset]);

  return (
    <div className="my-8 border border-border bg-surface">
      <div className="border-b border-border px-4 py-3">
        <p className="font-mono text-xs font-semibold text-primary">Recurrent architecture lab</p>
        <p className="mt-1 text-sm text-muted-foreground">So sánh cấu trúc trước, sau đó đối chiếu với kết quả của nghiên cứu.</p>
      </div>

      <div className="grid lg:grid-cols-[0.8fr_1.2fr]">
        <div className="border-b border-border p-4 lg:border-b-0 lg:border-r lg:p-5">
          <div className="grid grid-cols-3 gap-2">
            {modelOrder.map((model) => (
              <button
                key={model}
                type="button"
                onClick={() => setActiveModel(model)}
                className={`border px-3 py-2 text-sm font-semibold transition-colors ${
                  activeModel === model
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-ink hover:border-primary hover:text-primary'
                }`}
              >
                {model}
              </button>
            ))}
          </div>

          <div className="mt-5 border border-border bg-card p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-xs font-semibold text-primary">{activeModel} cell</span>
              <span className="font-mono text-xs text-muted-foreground">chi phí tương đối ×{selected.relativeCost}</span>
            </div>
            <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
              <div className="border border-border bg-surface px-3 py-4 text-center">
                <span className="font-mono text-xs text-muted-foreground">xₜ</span>
                <strong className="mt-1 block text-sm text-ink">Input</strong>
              </div>
              <span className="font-mono text-primary">→</span>
              <div className="border-2 border-primary bg-primary-soft px-3 py-4 text-center">
                <span className="font-mono text-xs text-primary-dark">{activeModel}</span>
                <strong className="mt-1 block text-sm text-primary-dark">{selected.gates.length || 0} gate</strong>
              </div>
            </div>
            <div className="mt-3 border-l-2 border-primary pl-3">
              <p className="font-mono text-xs text-muted-foreground">State được truyền tiếp</p>
              <p className="mt-1 text-sm font-semibold text-ink">{selected.state}</p>
            </div>
          </div>
        </div>

        <div className="p-4 lg:p-5">
          <div>
            <p className="font-mono text-xs text-muted-foreground">Cách hoạt động</p>
            <p className="mt-2 text-sm leading-6 text-ink">{selected.idea}</p>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="border border-border bg-card p-3">
              <span className="font-mono text-xs font-semibold text-primary">Điểm mạnh</span>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{selected.strength}</p>
            </div>
            <div className="border border-border bg-card p-3">
              <span className="font-mono text-xs font-semibold text-primary">Đổi lại</span>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{selected.limitation}</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="font-mono text-xs text-muted-foreground">Gate trong cell</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {selected.gates.length ? selected.gates.map((gate) => (
                <span key={gate} className="border border-primary/40 bg-primary-soft px-3 py-1.5 font-mono text-xs font-semibold text-primary-dark">{gate}</span>
              )) : (
                <span className="border border-border bg-card px-3 py-1.5 font-mono text-xs text-muted-foreground">Không có gate</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-ink">Kết quả ba kiến trúc đơn trong nghiên cứu</p>
            <p className="mt-1 text-xs text-muted-foreground">Mean của 100 lần chạy · metric càng thấp càng tốt</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(benchmark) as DatasetKey[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setDataset(key)}
                className={`border px-3 py-2 text-xs font-semibold transition-colors ${
                  dataset === key
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-ink hover:border-primary hover:text-primary'
                }`}
              >
                {benchmark[key].label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 lg:p-5">
          <p className="mb-4 text-sm text-muted-foreground">{selectedDataset.context}</p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[580px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border font-mono text-xs text-muted-foreground">
                  <th className="pb-2 font-medium">Model</th>
                  <th className="pb-2 font-medium">MAE</th>
                  <th className="pb-2 font-medium">MAPE</th>
                  <th className="pb-2 font-medium">RMSE</th>
                  <th className="pb-2 text-right font-medium">Parameter trong paper</th>
                </tr>
              </thead>
              <tbody>
                {modelOrder.map((model) => {
                  const values = selectedDataset.values[model];
                  const paperParameters = { RNN: '16.833', LSTM: '66.369', GRU: '50.241' }[model];
                  return (
                    <tr key={model} className="border-b border-border last:border-0">
                      <td className="py-3 font-semibold text-ink">{model}</td>
                      <td className={`py-3 font-mono ${values.mae === minimums.mae ? 'font-bold text-primary' : 'text-muted-foreground'}`}>{values.mae.toFixed(3)}</td>
                      <td className={`py-3 font-mono ${values.mape === minimums.mape ? 'font-bold text-primary' : 'text-muted-foreground'}`}>{values.mape.toFixed(3)}%</td>
                      <td className={`py-3 font-mono ${values.rmse === minimums.rmse ? 'font-bold text-primary' : 'text-muted-foreground'}`}>{values.rmse.toFixed(3)}</td>
                      <td className="py-3 text-right font-mono text-muted-foreground">{paperParameters}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-4 border-l-2 border-primary bg-primary-soft px-4 py-3 text-sm leading-6 text-primary-dark">
            Friedman test trên cả 9 kiến trúc: χ² = 12.593, df = 8, p = 0.127. Không đủ bằng chứng để nói các kiến trúc khác nhau có ý nghĩa thống kê.
          </div>
        </div>
      </div>
    </div>
  );
}
