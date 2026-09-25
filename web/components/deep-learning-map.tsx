'use client';

import { useState } from 'react';
import { ArrowDown, ArrowRight, CornerUpLeft } from 'lucide-react';

const nodes = [
  { id: 'data', step: '01', label: 'Dữ liệu', detail: 'Input có thể là ảnh, văn bản, âm thanh hoặc vector đặc trưng.', example: 'Một batch gồm 32 ảnh sản phẩm kích thước 224 × 224.' },
  { id: 'network', step: '02', label: 'Neural network', detail: 'Các layer dùng weight và bias để biến đổi input thành biểu diễn mới.', example: 'Có thể xem model như một function rất lớn với nhiều “núm chỉnh”.' },
  { id: 'prediction', step: '03', label: 'Dự đoán', detail: 'Forward pass tạo ra output hiện tại của model.', example: 'mèo 0.18 · chó 0.71 · chim 0.11' },
  { id: 'loss', step: '04', label: 'Tính loss', detail: 'Loss đo khoảng cách giữa dự đoán và đáp án mong muốn.', example: 'Dự đoán càng sai và càng tự tin thì loss thường càng lớn.' },
  { id: 'backprop', step: '05', label: 'Backprop', detail: 'Gradient cho biết mỗi parameter góp phần vào lỗi theo hướng nào.', example: 'Optimizer dùng gradient cùng learning rate để tính bước cập nhật.' },
  { id: 'update', step: '06', label: 'Update', detail: 'Optimizer cập nhật weight và bias rồi bắt đầu batch tiếp theo.', example: 'Vòng lặp tiếp tục cho tới khi đạt số epoch đã cấu hình.' },
];

export function DeepLearningMap() {
  const [selectedId, setSelectedId] = useState('network');
  const selected = nodes.find((node) => node.id === selectedId) ?? nodes[1];

  return (
    <div className="border border-border bg-card/65">
      <div className="flex flex-col gap-1 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <p className="font-mono text-xs font-semibold text-primary">Một training step</p>
        <p className="text-xs text-muted-foreground">Bấm vào từng node để xem giải thích</p>
      </div>

      <div className="overflow-x-auto p-4 sm:p-5">
        <div className="flex min-w-[744px] items-stretch">
          {nodes.map((node, index) => {
            const active = node.id === selectedId;
            return (
              <div className="contents" key={node.id}>
                <button
                  className={`group relative min-h-24 w-[104px] shrink-0 border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${active ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background text-ink hover:border-primary hover:text-primary'}`}
                  type="button"
                  onClick={() => setSelectedId(node.id)}
                  aria-pressed={active}
                >
                  <span className={`block font-mono text-[10px] ${active ? 'text-primary-foreground/75' : 'text-primary'}`}>{node.step}</span>
                  <span className="mt-4 block text-sm font-semibold leading-5">{node.label}</span>
                </button>
                {index < nodes.length - 1 ? (
                  <span className="grid w-6 shrink-0 place-items-center text-primary" aria-hidden="true"><ArrowRight size={17} /></span>
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex min-w-[744px] items-center border border-dashed border-primary/35 bg-primary-soft px-4 py-3 text-xs text-muted-foreground">
          <CornerUpLeft className="mr-3 shrink-0 text-primary" size={17} />
          <span><strong className="text-ink">Update xong, quay lại Neural network</strong> với batch tiếp theo. Một epoch kết thúc khi model đã đi qua toàn bộ tập training.</span>
        </div>
      </div>

      <div className="grid gap-3 border-t border-border bg-surface/70 px-4 py-4 sm:grid-cols-[130px_1fr] sm:px-5">
        <div>
          <span className="font-mono text-[10px] text-primary">NODE {selected.step}</span>
          <strong className="mt-1 block text-sm text-ink">{selected.label}</strong>
        </div>
        <div>
          <p className="text-sm leading-6 text-muted-foreground">{selected.detail}</p>
          <p className="mt-2 font-mono text-xs leading-5 text-primary">{selected.example}</p>
        </div>
      </div>

      <div className="grid gap-3 border-t border-border px-4 py-4 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center sm:px-5">
        <div className="border border-border bg-background p-3">
          <span className="font-mono text-[10px] text-primary">SAU TRAINING</span>
          <strong className="mt-1 block text-sm text-ink">Model checkpoint</strong>
        </div>
        <ArrowRight className="hidden text-primary sm:block" size={17} aria-hidden="true" />
        <ArrowDown className="mx-auto text-primary sm:hidden" size={17} aria-hidden="true" />
        <div className="border border-primary bg-primary-soft p-3">
          <span className="font-mono text-[10px] text-primary">RUNTIME</span>
          <strong className="mt-1 block text-sm text-ink">Inference</strong>
        </div>
        <ArrowRight className="hidden text-primary sm:block" size={17} aria-hidden="true" />
        <ArrowDown className="mx-auto text-primary sm:hidden" size={17} aria-hidden="true" />
        <div className="border border-border bg-background p-3">
          <span className="font-mono text-[10px] text-primary">OUTPUT</span>
          <strong className="mt-1 block text-sm text-ink">Prediction</strong>
        </div>
      </div>
    </div>
  );
}