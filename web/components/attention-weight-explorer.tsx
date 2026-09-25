'use client';

import { useState } from 'react';

const tokens = ['deploy', 'service', 'sau', 'database', 'migration'];

const weights = [
  [0.13, 0.2, 0.08, 0.23, 0.36],
  [0.24, 0.14, 0.08, 0.34, 0.2],
  [0.08, 0.12, 0.15, 0.27, 0.38],
  [0.1, 0.15, 0.07, 0.22, 0.46],
  [0.11, 0.12, 0.08, 0.47, 0.22],
];

const interpretations = [
  'Khi cập nhật “deploy”, attention lấy nhiều ngữ cảnh từ thao tác migration và database.',
  '“service” liên hệ với hành động deploy và hệ thống database mà nó phụ thuộc.',
  'Từ “sau” cần hai mốc sự kiện để biểu diễn quan hệ thứ tự.',
  '“database” tập trung mạnh vào sự kiện migration đứng gần nó.',
  '“migration” nhìn lại database để xác định đối tượng được thay đổi.',
];

export function AttentionWeightExplorer() {
  const [queryIndex, setQueryIndex] = useState(3);
  const activeWeights = weights[queryIndex];

  return (
    <div className="my-8 border border-border bg-surface">
      <div className="border-b border-border px-4 py-3">
        <p className="font-mono text-xs font-semibold text-primary">Self-attention explorer</p>
        <p className="mt-1 text-sm text-muted-foreground">Chọn token đóng vai trò Query để xem nó đọc thông tin từ các Key khác nhau.</p>
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex flex-wrap gap-2">
          {tokens.map((token, index) => (
            <button
              key={token}
              type="button"
              onClick={() => setQueryIndex(index)}
              className={`border px-3 py-2 font-mono text-sm transition-colors ${
                queryIndex === index
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-ink hover:border-primary hover:text-primary'
              }`}
            >
              {token}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
          <div className="border border-border bg-card p-4">
            <p className="font-mono text-xs text-muted-foreground">Query hiện tại</p>
            <p className="mt-2 text-xl font-semibold text-ink">{tokens[queryIndex]}</p>
            <div className="mt-5 grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2 text-center">
              <div className="border border-border bg-surface px-2 py-3">
                <span className="font-mono text-xs text-primary">Q</span>
                <strong className="mt-1 block text-sm text-ink">Tìm gì?</strong>
              </div>
              <span className="font-mono text-primary">×</span>
              <div className="border border-border bg-surface px-2 py-3">
                <span className="font-mono text-xs text-primary">K</span>
                <strong className="mt-1 block text-sm text-ink">Có gì?</strong>
              </div>
              <span className="font-mono text-primary">→</span>
              <div className="border border-primary bg-primary-soft px-2 py-3">
                <span className="font-mono text-xs text-primary-dark">V</span>
                <strong className="mt-1 block text-sm text-primary-dark">Lấy gì?</strong>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">{interpretations[queryIndex]}</p>
          </div>

          <div className="space-y-3">
            {tokens.map((token, index) => {
              const value = activeWeights[index];
              return (
                <button
                  key={`${tokens[queryIndex]}-${token}`}
                  type="button"
                  onClick={() => setQueryIndex(index)}
                  className="grid w-full grid-cols-[92px_1fr_48px] items-center gap-3 text-left"
                  aria-label={`${tokens[queryIndex]} attention tới ${token}: ${Math.round(value * 100)} phần trăm`}
                >
                  <span className={`font-mono text-sm ${index === queryIndex ? 'font-semibold text-primary' : 'text-ink'}`}>{token}</span>
                  <span className="h-7 border border-border bg-card p-1">
                    <span
                      className="block h-full bg-primary transition-[width] duration-500"
                      style={{ width: `${value * 100}%`, opacity: 0.48 + value }}
                    />
                  </span>
                  <span className="text-right font-mono text-xs text-muted-foreground">{Math.round(value * 100)}%</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid border-t border-border md:grid-cols-[1fr_auto]">
        <div className="min-w-0 p-4">
          <p className="font-mono text-xs text-muted-foreground">Scaled dot-product attention</p>
          <p className="mt-2 overflow-x-auto font-mono text-sm text-ink">softmax(QKᵀ / √dₖ) V</p>
        </div>
        <div className="border-t border-border bg-primary-soft px-5 py-4 md:min-w-64 md:border-l md:border-t-0">
          <p className="font-mono text-xs text-primary-dark">Tổng attention weight</p>
          <p className="mt-1 font-mono text-lg font-semibold text-primary-dark">1.00</p>
        </div>
      </div>
    </div>
  );
}
