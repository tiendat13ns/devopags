'use client';

import { useState, type ReactNode } from 'react';

type Representation = 'vector' | 'tensor' | 'token' | 'embedding' | 'graph';

const tabs: { key: Representation; label: string; shape: string }[] = [
  { key: 'vector', label: 'Vector', shape: '[features]' },
  { key: 'tensor', label: 'Tensor', shape: '[batch, channel, height, width]' },
  { key: 'token', label: 'Token', shape: '[sequence]' },
  { key: 'embedding', label: 'Embedding', shape: '[sequence, dimension]' },
  { key: 'graph', label: 'Graph', shape: 'nodes + edges + features' },
];

const details: Record<Representation, { title: string; description: string; note: string }> = {
  vector: {
    title: 'Vector là một hàng số có thứ tự',
    description: 'Mỗi vị trí mang một feature: tuổi, số request, error rate hoặc một đặc trưng đã được trích xuất.',
    note: 'Model chỉ thấy các con số và vị trí của chúng, không tự biết 0.81 có nghĩa là error rate nếu pipeline không quy ước điều đó.',
  },
  tensor: {
    title: 'Tensor là mảng nhiều chiều',
    description: 'Scalar là tensor 0 chiều, vector là tensor 1 chiều, matrix là tensor 2 chiều; ảnh theo batch thường là tensor 4 chiều.',
    note: 'Shape là hợp đồng giữa data pipeline và model. Sai thứ tự channel hoặc thiếu batch dimension đều có thể làm model lỗi hoặc học sai.',
  },
  token: {
    title: 'Token biến văn bản thành các đơn vị rời rạc',
    description: 'Tokenizer chia chuỗi thành token rồi ánh xạ mỗi token sang một integer ID trong vocabulary.',
    note: 'Token ID chỉ là khóa tra cứu. Con số 421 không có nghĩa lớn hơn hay gần 87 về mặt ngữ nghĩa.',
  },
  embedding: {
    title: 'Embedding biến ID thành vector liên tục',
    description: 'Mỗi token, user hoặc item được ánh xạ sang một vector dày đặc mà model có thể học và so sánh.',
    note: 'Hai embedding gần nhau trong không gian thường biểu diễn các đối tượng model xem là tương tự theo mục tiêu training.',
  },
  graph: {
    title: 'Graph giữ lại cả đối tượng lẫn quan hệ',
    description: 'Node chứa feature, edge mô tả kết nối; GNN truyền và tổng hợp thông tin giữa các node lân cận.',
    note: 'Thứ tự node không nên làm thay đổi ý nghĩa của graph. Điều quan trọng là cấu trúc edge và feature đi kèm.',
  },
};

export function DataRepresentationExplorer() {
  const [selected, setSelected] = useState<Representation>('vector');
  const detail = details[selected];

  return (
    <div className="border border-border bg-card/65">
      <div className="flex flex-wrap border-b border-border" role="group" aria-label="Chọn dạng biểu diễn dữ liệu">
        {tabs.map((tab) => {
          const active = tab.key === selected;
          return (
            <button
              className={`border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${active ? 'border-primary bg-primary-soft text-primary' : 'border-transparent text-muted-foreground hover:bg-accent hover:text-ink'}`}
              key={tab.key}
              type="button"
              onClick={() => setSelected(tab.key)}
              aria-pressed={active}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="min-h-[300px] p-4 sm:p-5">
        <RepresentationView selected={selected} />
      </div>

      <div className="grid gap-px border-t border-border bg-border sm:grid-cols-[1fr_220px]">
        <div className="bg-surface p-4">
          <h3 className="font-semibold text-ink">{detail.title}</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{detail.description}</p>
          <p className="mt-2 text-xs leading-5 text-primary">{detail.note}</p>
        </div>
        <div className="bg-surface p-4">
          <span className="font-mono text-[10px] text-muted-foreground">SHAPE / STRUCTURE</span>
          <code className="mt-3 block break-words font-mono text-xs leading-5 text-primary">{tabs.find((tab) => tab.key === selected)?.shape}</code>
        </div>
      </div>
    </div>
  );
}

function RepresentationView({ selected }: { selected: Representation }) {
  if (selected === 'vector') return <VectorView />;
  if (selected === 'tensor') return <TensorView />;
  if (selected === 'token') return <TokenView />;
  if (selected === 'embedding') return <EmbeddingView />;
  return <GraphView />;
}

function Frame({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="font-mono text-xs font-semibold text-primary">{label}</p>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function VectorView() {
  const values = [0.12, -0.43, 0.88, 0.31, -0.16, 0.67];
  return (
    <Frame label="server_metrics → feature vector">
      <div className="grid gap-4 sm:grid-cols-[1fr_1.2fr] sm:items-center">
        <code className="border border-border bg-background p-4 font-mono text-sm text-ink">[{values.join(', ')}]</code>
        <div className="space-y-3">
          {values.map((value, index) => (
            <div className="grid grid-cols-[32px_1fr_46px] items-center gap-3" key={index}>
              <span className="font-mono text-[10px] text-muted-foreground">x{index + 1}</span>
              <div className="relative h-3 bg-muted">
                <span className="absolute left-1/2 top-0 h-full w-px bg-border" />
                <span
                  className="absolute top-0 h-full bg-primary"
                  style={value >= 0 ? { left: '50%', width: `${Math.abs(value) * 50}%` } : { right: '50%', width: `${Math.abs(value) * 50}%` }}
                />
              </div>
              <span className="font-mono text-xs text-primary">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

function TensorView() {
  const pixels = [
    [0.1, 0.3, 0.8, 0.2],
    [0.2, 0.9, 1.0, 0.4],
    [0.1, 0.7, 0.6, 0.3],
    [0.0, 0.2, 0.3, 0.1],
  ];
  return (
    <Frame label="image batch → tensor [8, 3, 224, 224]">
      <div className="grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center">
        <div className="grid grid-cols-4 gap-1 border border-border bg-background p-3">
          {pixels.flat().map((value, index) => <span className="size-11 border border-primary/15 bg-primary" key={index} style={{ opacity: 0.15 + value * 0.85 }} />)}
        </div>
        <div className="grid gap-px border border-border bg-border sm:grid-cols-2">
          {[
            ['8', 'batch size'],
            ['3', 'RGB channels'],
            ['224', 'height'],
            ['224', 'width'],
          ].map(([value, label]) => (
            <div className="bg-surface p-4" key={label}><strong className="font-mono text-xl text-primary">{value}</strong><span className="ml-2 text-sm text-muted-foreground">{label}</span></div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

function TokenView() {
  const tokens = [['Deep', 6721], [' learning', 6975], [' đi', 428], [' vào', 931], [' model', 2741]];
  return (
    <Frame label="text → tokenizer → token IDs">
      <div className="border border-border bg-background p-4 text-base text-ink">Deep learning đi vào model</div>
      <div className="mt-5 flex flex-wrap gap-2">
        {tokens.map(([token, id], index) => (
          <div className="border border-primary/30 bg-primary-soft" key={String(token)}>
            <span className="block border-b border-primary/20 px-3 py-2 text-sm font-semibold text-ink">{String(token)}</span>
            <span className="block px-3 py-1.5 text-center font-mono text-[10px] text-primary">id {Number(id)}</span>
            {index < tokens.length - 1 ? null : null}
          </div>
        ))}
      </div>
      <code className="mt-5 block font-mono text-xs text-muted-foreground">input_ids = [6721, 6975, 428, 931, 2741]</code>
    </Frame>
  );
}

function EmbeddingView() {
  const rows = [
    { token: 'Deep', values: [0.82, -0.15, 0.44, 0.71, -0.31, 0.18] },
    { token: 'learning', values: [0.76, -0.08, 0.51, 0.65, -0.22, 0.29] },
    { token: 'model', values: [0.35, 0.41, -0.17, 0.73, 0.12, -0.48] },
  ];
  return (
    <Frame label="token IDs → embedding matrix lookup">
      <div className="space-y-3">
        {rows.map((row) => (
          <div className="grid grid-cols-[80px_1fr] items-center gap-3" key={row.token}>
            <span className="font-mono text-xs font-semibold text-ink">{row.token}</span>
            <div className="grid grid-cols-6 gap-1">
              {row.values.map((value, index) => (
                <span className="grid h-12 place-items-center border border-primary/15 bg-primary font-mono text-[10px] text-primary-foreground" key={index} style={{ opacity: 0.35 + Math.abs(value) * 0.65 }}>
                  {value.toFixed(2)}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-5 font-mono text-xs text-muted-foreground">Ví dụ rút gọn: embedding dimension = 6. Model thật thường dùng dimension lớn hơn.</p>
    </Frame>
  );
}

function GraphView() {
  return (
    <Frame label="users + relationships → graph">
      <div className="grid gap-5 sm:grid-cols-[1.2fr_0.8fr] sm:items-center">
        <svg className="h-auto w-full" viewBox="0 0 420 220" role="img" aria-label="Đồ thị gồm năm node và các cạnh kết nối">
          <g stroke="var(--primary)" strokeOpacity="0.45" strokeWidth="2">
            <line x1="75" y1="110" x2="190" y2="55" /><line x1="75" y1="110" x2="190" y2="165" />
            <line x1="190" y1="55" x2="315" y2="75" /><line x1="190" y1="165" x2="315" y2="145" />
            <line x1="190" y1="55" x2="190" y2="165" /><line x1="315" y1="75" x2="315" y2="145" />
            <line x1="190" y1="165" x2="315" y2="75" />
          </g>
          {[[75,110,'A'],[190,55,'B'],[190,165,'C'],[315,75,'D'],[315,145,'E']].map(([x, y, label]) => (
            <g key={String(label)}>
              <circle cx={Number(x)} cy={Number(y)} r="25" fill="var(--background)" stroke="var(--primary)" strokeWidth="2" />
              <text x={Number(x)} y={Number(y) + 5} textAnchor="middle" fill="var(--primary)" fontSize="13" fontWeight="700">{String(label)}</text>
            </g>
          ))}
        </svg>
        <div className="border border-border bg-background p-4 font-mono text-xs leading-6">
          <p className="text-primary">x.shape = [5, 3]</p>
          <p className="text-muted-foreground">5 node · 3 features/node</p>
          <p className="mt-3 text-primary">edge_index.shape = [2, 7]</p>
          <p className="text-muted-foreground">7 cạnh có hướng</p>
        </div>
      </div>
    </Frame>
  );
}
