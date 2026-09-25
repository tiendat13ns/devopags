'use client';

import { useEffect, useState } from 'react';

type SequenceExample = {
  id: string;
  label: string;
  tokens: string[];
  memories: string[];
  outputs: string[];
};

const examples: SequenceExample[] = [
  {
    id: 'logs',
    label: 'Log hệ thống',
    tokens: ['API', 'timeout', 'sau', 'database', 'restart'],
    memories: [
      'dịch vụ API',
      'API đang timeout',
      'sự kiện xảy ra sau đó',
      'liên quan database',
      'database vừa restart',
    ],
    outputs: ['bình thường', 'cảnh báo', 'chờ ngữ cảnh', 'nguyên nhân khả dĩ', 'incident'],
  },
  {
    id: 'sentence',
    label: 'Câu tiếng Việt',
    tokens: ['Mình', 'đang', 'học', 'mạng', 'RNN'],
    memories: [
      'chủ thể: mình',
      'hành động đang diễn ra',
      'hành động: học',
      'đối tượng có thể là mạng',
      'chủ đề: mạng RNN',
    ],
    outputs: ['đại từ', 'trạng thái', 'động từ', 'danh từ', 'thực thể kỹ thuật'],
  },
  {
    id: 'metric',
    label: 'Chuỗi metric',
    tokens: ['42%', '48%', '61%', '79%', '94%'],
    memories: [
      'CPU ổn định',
      'tăng nhẹ',
      'xu hướng tăng',
      'tải cao',
      'nguy cơ quá tải',
    ],
    outputs: ['ổn', 'ổn', 'theo dõi', 'cảnh báo', 'critical'],
  },
];

export function RnnSequenceExplorer() {
  const [exampleId, setExampleId] = useState('logs');
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);
  const example = examples.find((item) => item.id === exampleId) ?? examples[0];

  useEffect(() => {
    setStep(0);
  }, [exampleId]);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => {
      setStep((current) => (current + 1) % example.tokens.length);
    }, 1250);
    return () => window.clearInterval(timer);
  }, [example.tokens.length, paused]);

  return (
    <div
      className="my-8 border border-border bg-surface"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div>
          <p className="font-mono text-xs font-semibold text-primary">RNN sequence explorer</p>
          <p className="mt-1 text-sm text-muted-foreground">Mỗi timestep nhận một token và hidden state từ bước trước.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {examples.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setExampleId(item.id)}
              className={`border px-3 py-2 text-xs font-semibold transition-colors ${
                item.id === example.id
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-ink hover:border-primary hover:text-primary'
              }`}
            >
              {item.label}
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

      <div className="overflow-x-auto p-4 sm:p-6">
        <div className="min-w-[760px]">
          <div className="grid grid-cols-5 gap-3">
            {example.tokens.map((token, index) => {
              const active = index === step;
              const visited = index <= step;
              return (
                <button
                  type="button"
                  key={`${example.id}-${token}-${index}`}
                  onClick={() => setStep(index)}
                  className="group text-left"
                  aria-label={`Xem timestep ${index + 1}: ${token}`}
                >
                  <div className={`border px-3 py-2 text-center font-mono text-sm font-semibold transition-colors ${
                    active
                      ? 'border-primary bg-primary text-primary-foreground'
                      : visited
                        ? 'border-primary/50 bg-primary-soft text-primary-dark'
                        : 'border-border bg-card text-muted-foreground'
                  }`}>
                    x<sub>{index + 1}</sub> · {token}
                  </div>

                  <div className="grid h-9 place-items-center">
                    <span className={`font-mono text-lg ${visited ? 'text-primary' : 'text-border'}`}>↓</span>
                  </div>

                  <div className={`relative border px-3 py-5 text-center transition-all ${
                    active
                      ? 'border-primary bg-primary-soft text-primary-dark shadow-[inset_0_0_0_1px_var(--primary)]'
                      : visited
                        ? 'border-primary/50 bg-card text-ink'
                        : 'border-border bg-card text-muted-foreground'
                  }`}>
                    <span className="font-mono text-xs">RNN cell</span>
                    <strong className="mt-2 block text-base">h<sub>{index + 1}</sub></strong>
                    {index < example.tokens.length - 1 ? (
                      <span className={`absolute -right-[13px] top-1/2 z-10 -translate-y-1/2 font-mono text-lg ${visited ? 'text-primary' : 'text-border'}`}>→</span>
                    ) : null}
                  </div>

                  <div className="grid h-9 place-items-center">
                    <span className={`font-mono text-lg ${visited ? 'text-primary' : 'text-border'}`}>↓</span>
                  </div>

                  <div className={`border px-3 py-2 text-center text-xs transition-colors ${
                    active ? 'border-primary bg-card font-semibold text-primary-dark' : 'border-border bg-card text-muted-foreground'
                  }`}>
                    y<sub>{index + 1}</sub> · {example.outputs[index]}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid border-t border-border lg:grid-cols-[1fr_1fr]">
        <div className="border-b border-border p-4 lg:border-b-0 lg:border-r">
          <p className="font-mono text-xs text-muted-foreground">Hidden state tại t = {step + 1}</p>
          <p className="mt-2 text-base font-semibold text-ink">{example.memories[step]}</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Đây là cách diễn giải để dễ hình dung; hidden state thật là một vector số.
          </p>
        </div>
        <div className="bg-primary-soft p-4">
          <p className="font-mono text-xs text-primary-dark">Cùng parameter ở mọi timestep</p>
          <p className="mt-2 font-mono text-sm leading-7 text-primary-dark">
            h<sub>t</sub> = tanh(W<sub>xh</sub>x<sub>t</sub> + W<sub>hh</sub>h<sub>t-1</sub> + b)
          </p>
        </div>
      </div>
    </div>
  );
}
