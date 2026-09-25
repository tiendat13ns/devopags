'use client';

import { useEffect, useState } from 'react';

type Mode = 'encoder' | 'decoder' | 'full';

const flows: Record<Mode, {
  label: string;
  summary: string;
  steps: Array<{ name: string; io: string; detail: string }>;
}> = {
  encoder: {
    label: 'Encoder',
    summary: 'Biến toàn bộ chuỗi đầu vào thành các contextual embedding.',
    steps: [
      { name: 'Token + Position', io: '[B, T] → [B, T, D]', detail: 'Embedding mang nội dung token; positional encoding bổ sung thứ tự.' },
      { name: 'Self-attention', io: 'T token ↔ T token', detail: 'Mỗi token đọc thông tin từ toàn bộ chuỗi đầu vào.' },
      { name: 'Add & Norm', io: 'shape không đổi', detail: 'Residual giữ đường truyền tín hiệu; normalization ổn định activation.' },
      { name: 'Feed-forward', io: 'D → Dff → D', detail: 'Cùng một MLP được áp dụng độc lập lên từng vị trí.' },
      { name: 'Encoder output', io: '[B, T, D]', detail: 'Mỗi vector đã chứa ngữ cảnh của các token liên quan.' },
    ],
  },
  decoder: {
    label: 'Decoder-only',
    summary: 'Dự đoán token kế tiếp nhưng không được nhìn thấy tương lai.',
    steps: [
      { name: 'Token + Position', io: '[B, T] → [B, T, D]', detail: 'Chuỗi prompt và token đã sinh được đổi thành vector.' },
      { name: 'Masked attention', io: 'chỉ nhìn ≤ t', detail: 'Causal mask chặn các token nằm bên phải vị trí đang dự đoán.' },
      { name: 'Add & Norm', io: 'shape không đổi', detail: 'Residual và normalization giữ việc train mạng sâu ổn định.' },
      { name: 'Feed-forward', io: 'D → Dff → D', detail: 'MLP xử lý representation của từng token sau attention.' },
      { name: 'Linear + Softmax', io: 'D → vocabulary', detail: 'Tạo phân phối xác suất cho token kế tiếp.' },
    ],
  },
  full: {
    label: 'Encoder–decoder',
    summary: 'Encoder đọc input; decoder sinh output và dùng cross-attention để đọc encoder memory.',
    steps: [
      { name: 'Source encoder', io: 'source → memory', detail: 'Self-attention mã hóa toàn bộ chuỗi nguồn.' },
      { name: 'Target decoder', io: 'target prefix', detail: 'Masked attention xử lý các token đích đã có.' },
      { name: 'Cross-attention', io: 'Q: decoder · K,V: encoder', detail: 'Decoder hỏi encoder memory để lấy thông tin nguồn cần thiết.' },
      { name: 'Feed-forward', io: 'D → Dff → D', detail: 'MLP tiếp tục biến đổi representation tại từng vị trí.' },
      { name: 'Next token', io: 'logits → token', detail: 'Chọn token rồi đưa lại vào decoder cho bước tiếp theo.' },
    ],
  },
};

export function TransformerFlowExplorer() {
  const [mode, setMode] = useState<Mode>('decoder');
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);
  const flow = flows[mode];

  useEffect(() => {
    setStep(0);
  }, [mode]);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => {
      setStep((current) => (current + 1) % flow.steps.length);
    }, 1400);
    return () => window.clearInterval(timer);
  }, [flow.steps.length, paused]);

  return (
    <div
      className="my-8 border border-border bg-surface"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div>
          <p className="font-mono text-xs font-semibold text-primary">Transformer flow explorer</p>
          <p className="mt-1 text-sm text-muted-foreground">Chọn họ kiến trúc rồi bấm từng block để theo dõi luồng dữ liệu.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(flows) as Mode[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setMode(key)}
              className={`border px-3 py-2 text-xs font-semibold transition-colors ${
                mode === key
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-ink hover:border-primary hover:text-primary'
              }`}
            >
              {flows[key].label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPaused((value) => !value)}
            className="border border-border bg-card px-3 py-2 text-xs font-semibold text-ink hover:border-primary hover:text-primary"
            aria-pressed={paused}
          >
            {paused ? 'Chạy tiếp' : 'Tạm dừng'}
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <p className="text-sm leading-6 text-muted-foreground">{flow.summary}</p>
        <div className="mt-5 overflow-x-auto pb-2">
          <div className="flex min-w-[780px] items-stretch gap-2">
            {flow.steps.map((item, index) => (
              <div key={item.name} className="contents">
                <button
                  type="button"
                  onClick={() => setStep(index)}
                  className={`min-h-32 min-w-32 flex-1 border p-3 text-left transition-colors ${
                    step === index
                      ? 'border-primary bg-primary-soft shadow-[inset_0_0_0_1px_var(--primary)]'
                      : index < step
                        ? 'border-primary/50 bg-card'
                        : 'border-border bg-card'
                  }`}
                >
                  <span className={`font-mono text-xs ${step === index ? 'font-bold text-primary-dark' : 'text-muted-foreground'}`}>0{index + 1}</span>
                  <strong className="mt-3 block text-sm leading-5 text-ink">{item.name}</strong>
                  <span className="mt-2 block font-mono text-xs leading-5 text-muted-foreground">{item.io}</span>
                </button>
                {index < flow.steps.length - 1 ? (
                  <span className={`grid place-items-center font-mono ${index < step ? 'text-primary' : 'text-border'}`}>→</span>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid border-t border-border lg:grid-cols-[1fr_auto]">
        <div className="p-4">
          <p className="font-mono text-xs text-muted-foreground">Block đang chạy · {flow.steps[step].name}</p>
          <p className="mt-2 text-sm leading-6 text-ink">{flow.steps[step].detail}</p>
        </div>
        <div className="border-t border-border bg-primary-soft px-5 py-4 lg:min-w-56 lg:border-l lg:border-t-0">
          <p className="font-mono text-xs text-primary-dark">Shape / kết nối</p>
          <p className="mt-2 font-mono text-sm font-semibold text-primary-dark">{flow.steps[step].io}</p>
        </div>
      </div>
    </div>
  );
}
