'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

type NodeId = 'client' | 'resolver' | 'root' | 'tld' | 'auth';

type Domain = {
  name: string;
  zone: string;
  tld: string;
  tldHint: string;
  auth: string;
  ip: string;
  ttl: number;
};

type Step = {
  from: NodeId;
  to: NodeId;
  title: string;
  query: string;
  response: string;
  ms: number;
};

const domains: Domain[] = [
  { name: 'www.example.com', zone: 'example.com', tld: '.com', tldHint: 'ví dụ a.gtld-servers.net', auth: 'ns1.example.com', ip: '203.0.113.10', ttl: 300 },
  { name: 'app.example.vn', zone: 'example.vn', tld: '.vn', tldHint: 'tôi gửi kèm danh sách NS và IP của .vn', auth: 'ns1.example.vn', ip: '198.51.100.40', ttl: 600 },
];

const nodeLabels: Record<NodeId, [string, string]> = {
  client: ['Máy bạn', 'Browser + stub resolver'],
  resolver: ['Recursive resolver', 'ISP, 8.8.8.8, 1.1.1.1'],
  root: ['Root server', 'Dấu chấm “.”'],
  tld: ['TLD server', '.com, .vn, .org …'],
  auth: ['Authoritative', 'Giữ bản ghi thật'],
};

const caches = [
  { id: 'cold', label: 'Chưa có gì trong cache', command: 'dig +trace' },
  { id: 'ns', label: 'Resolver nhớ NS của zone', command: 'dig' },
  { id: 'answer', label: 'Resolver nhớ cả câu trả lời', command: 'dig' },
  { id: 'browser', label: 'Browser đã nhớ', command: '(không có truy vấn nào)' },
] as const;

type CacheId = (typeof caches)[number]['id'];

function buildSteps(cache: CacheId, d: Domain): Step[] {
  const ask = `${d.name}  A  ?`;
  const toResolver: Step = {
    from: 'client',
    to: 'resolver',
    title: 'Máy bạn hỏi resolver',
    query: ask,
    response: '(chờ resolver tìm giúp — cờ RD: recursion desired)',
    ms: 1,
  };
  const answerBack: Step = {
    from: 'resolver',
    to: 'client',
    title: 'Resolver trả kết quả về',
    query: '',
    response: `${d.name}  A  ${d.ip}  (TTL ${d.ttl}s)`,
    ms: 1,
  };

  if (cache === 'browser') {
    return [
      {
        from: 'client',
        to: 'client',
        title: 'Cache cục bộ trả lời ngay',
        query: ask,
        response: `${d.name}  A  ${d.ip}  (lấy từ cache của browser hoặc OS)`,
        ms: 0,
      },
    ];
  }

  if (cache === 'answer') {
    return [
      toResolver,
      {
        from: 'resolver',
        to: 'resolver',
        title: 'Resolver tra cache',
        query: ask,
        response: `Có sẵn: ${d.ip}, TTL còn 187s → trả lời luôn, không hỏi ai`,
        ms: 1,
      },
      answerBack,
    ];
  }

  const authStep: Step = {
    from: 'resolver',
    to: 'auth',
    title: `Hỏi authoritative server của ${d.zone}`,
    query: ask,
    response: `${d.name}  A  ${d.ip}  TTL ${d.ttl}  (cờ aa: câu trả lời chính thức)`,
    ms: 25,
  };

  if (cache === 'ns') {
    return [
      toResolver,
      {
        ...authStep,
        title: 'Bỏ qua root và TLD, hỏi thẳng authoritative',
        query: `${ask}   → gửi tới ${d.auth}`,
      },
      answerBack,
    ];
  }

  return [
    toResolver,
    {
      from: 'resolver',
      to: 'root',
      title: 'Hỏi root server',
      query: ask,
      response: `Tôi không biết ${d.name}. Hãy hỏi TLD server của ${d.tld} (${d.tldHint}). (referral)`,
      ms: 12,
    },
    {
      from: 'resolver',
      to: 'tld',
      title: `Hỏi TLD server của ${d.tld}`,
      query: ask,
      response: `Tôi không có bản ghi A, nhưng ${d.zone} do ${d.auth} quản lý. Hãy hỏi họ. (NS + glue)`,
      ms: 18,
    },
    authStep,
    answerBack,
  ];
}

export function DnsResolutionWalk() {
  const [domainIndex, setDomainIndex] = useState(0);
  const [cache, setCache] = useState<CacheId>('cold');
  const [index, setIndex] = useState(0);

  const domain = domains[domainIndex];
  const steps = buildSteps(cache, domain);
  const current = steps[index];
  const elapsed = steps.slice(0, index + 1).reduce((sum, step) => sum + step.ms, 0);
  const total = steps.reduce((sum, step) => sum + step.ms, 0);
  const visited = new Set<NodeId>(steps.slice(0, index + 1).flatMap((step) => [step.from, step.to]));
  const nodeOrder: NodeId[] = ['client', 'resolver', 'root', 'tld', 'auth'];
  const command = caches.find((item) => item.id === cache)?.command ?? 'dig';

  function pick(nextDomain: number, nextCache: CacheId) {
    setDomainIndex(nextDomain);
    setCache(nextCache);
    setIndex(0);
  }

  return (
    <div className="my-8 border border-border bg-surface">
      <div className="border-b border-border px-4 py-3">
        <p className="font-mono text-xs font-semibold text-primary">DNS resolution walk</p>
        <p className="mt-1 text-sm text-muted-foreground">Chọn tên miền và tình trạng cache, rồi đi từng bước để xem ai hỏi ai.</p>
      </div>

      <div className="grid gap-4 border-b border-border p-4 md:grid-cols-[1fr_1.4fr]">
        <div>
          <p className="font-mono text-xs font-semibold text-muted-foreground">Tên miền</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {domains.map((item, itemIndex) => (
              <button
                key={item.name}
                type="button"
                onClick={() => pick(itemIndex, cache)}
                aria-pressed={domainIndex === itemIndex}
                className={`border px-3 py-2 font-mono text-xs font-semibold ${domainIndex === itemIndex ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-ink hover:border-primary'}`}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="font-mono text-xs font-semibold text-muted-foreground">Tình trạng cache</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {caches.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => pick(domainIndex, item.id)}
                aria-pressed={cache === item.id}
                className={`border px-3 py-2 text-xs font-semibold ${cache === item.id ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-ink hover:border-primary'}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto border-b border-border p-4">
        <div className="grid min-w-[620px] grid-cols-5 gap-2">
          {nodeOrder.map((id) => {
            const isActive = current.from === id || current.to === id;
            const wasVisited = visited.has(id);
            return (
              <div
                key={id}
                className={`border p-3 text-center transition-colors ${isActive ? 'border-primary bg-primary-soft' : wasVisited ? 'border-primary/40 bg-card' : 'border-border bg-card opacity-60'}`}
              >
                <strong className={`block text-xs ${isActive ? 'text-primary' : 'text-ink'}`}>{nodeLabels[id][0]}</strong>
                <span className="mt-1 block text-[0.68rem] leading-4 text-muted-foreground">{nodeLabels[id][1]}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 p-4 lg:grid-cols-[1.5fr_1fr] lg:p-5">
        <div>
          <p className="font-mono text-xs font-semibold text-primary">Bước {index + 1}/{steps.length}</p>
          <h3 className="mt-1 font-bold text-ink">{current.title}</h3>
          <div className="mt-3 space-y-2 font-mono text-xs leading-6">
            {current.query ? (
              <div className="border border-border bg-card px-3 py-2">
                <span className="text-muted-foreground">Hỏi → </span>
                <span className="break-all text-ink">{current.query}</span>
              </div>
            ) : null}
            <div className="border border-primary/30 bg-primary-soft px-3 py-2">
              <span className="text-muted-foreground">Đáp ← </span>
              <span className="break-words text-ink">{current.response}</span>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="border border-border bg-card p-3">
            <span className="text-xs text-muted-foreground">Thời gian cộng dồn (minh họa)</span>
            <strong className="mt-1 block font-mono text-xl text-ink">{elapsed} ms</strong>
            <span className="text-xs text-muted-foreground">Cả quá trình: khoảng {total} ms</span>
          </div>
          <div className="border border-border bg-card p-3">
            <span className="text-xs text-muted-foreground">Lệnh tương ứng</span>
            <strong className="mt-1 block break-all font-mono text-xs text-ink">{command} {cache === 'browser' ? '' : domain.name}</strong>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-border px-4 py-3">
        <button type="button" onClick={() => setIndex((value) => Math.max(0, value - 1))} disabled={index === 0} className="inline-flex h-9 items-center gap-1 border border-border bg-card px-3 text-xs font-semibold text-ink hover:border-primary disabled:opacity-40">
          <ChevronLeft size={15} /> Lùi
        </button>
        <button type="button" onClick={() => setIndex((value) => Math.min(steps.length - 1, value + 1))} disabled={index === steps.length - 1} className="inline-flex h-9 items-center gap-1 border border-primary bg-primary px-3 text-xs font-semibold text-primary-foreground disabled:opacity-40">
          Tiếp <ChevronRight size={15} />
        </button>
        <button type="button" onClick={() => setIndex(0)} className="inline-flex size-9 items-center justify-center border border-border bg-card text-ink hover:border-primary" aria-label="Đặt lại">
          <RotateCcw size={15} />
        </button>
      </div>
    </div>
  );
}
