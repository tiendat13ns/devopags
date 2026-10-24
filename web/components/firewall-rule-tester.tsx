'use client';

import { useState } from 'react';
import { ArrowDown, ArrowUp, RotateCcw } from 'lucide-react';
import { inCidr, parseIp } from '@/lib/ip';

type Action = 'ACCEPT' | 'DROP';

type Rule = {
  id: string;
  action: Action;
  source: string;
  port: number;
  comment: string;
  enabled: boolean;
};

type Packet = {
  id: string;
  label: string;
  source: string;
  port: number;
  shouldAllow: boolean;
};

const initialRules: Rule[] = [
  { id: 'office-ssh', action: 'ACCEPT', source: '203.0.113.0/24', port: 22, comment: 'SSH từ văn phòng', enabled: true },
  { id: 'http', action: 'ACCEPT', source: 'any', port: 80, comment: 'HTTP', enabled: true },
  { id: 'https', action: 'ACCEPT', source: 'any', port: 443, comment: 'HTTPS', enabled: true },
  { id: 'block-ssh', action: 'DROP', source: 'any', port: 22, comment: 'Chặn SSH từ mọi nơi khác', enabled: true },
  { id: 'postgres', action: 'ACCEPT', source: '10.0.0.0/8', port: 5432, comment: 'Postgres từ mạng nội bộ', enabled: true },
];

const packets: Packet[] = [
  { id: 'p1', label: 'SSH từ văn phòng', source: '203.0.113.50', port: 22, shouldAllow: true },
  { id: 'p2', label: 'SSH từ Internet', source: '198.51.100.77', port: 22, shouldAllow: false },
  { id: 'p3', label: 'HTTP từ Internet', source: '198.51.100.77', port: 80, shouldAllow: true },
  { id: 'p4', label: 'HTTPS từ Internet', source: '198.51.100.77', port: 443, shouldAllow: true },
  { id: 'p5', label: 'Postgres từ app server', source: '10.0.1.15', port: 5432, shouldAllow: true },
  { id: 'p6', label: 'Postgres từ Internet', source: '198.51.100.77', port: 5432, shouldAllow: false },
  { id: 'p7', label: 'Redis từ Internet', source: '198.51.100.77', port: 6379, shouldAllow: false },
];

function matches(rule: Rule, packet: Packet) {
  if (!rule.enabled || rule.port !== packet.port) return false;
  if (rule.source === 'any') return true;
  const ip = parseIp(packet.source);
  return ip !== null && inCidr(ip, rule.source);
}

export function FirewallRuleTester() {
  const [rules, setRules] = useState<Rule[]>(initialRules);
  const [policy, setPolicy] = useState<Action>('DROP');

  function move(index: number, offset: number) {
    const target = index + offset;
    if (target < 0 || target >= rules.length) return;
    const next = [...rules];
    [next[index], next[target]] = [next[target], next[index]];
    setRules(next);
  }

  function toggle(id: string) {
    setRules((current) => current.map((rule) => (rule.id === id ? { ...rule, enabled: !rule.enabled } : rule)));
  }

  function reset() {
    setRules(initialRules);
    setPolicy('DROP');
  }

  function blockFirst() {
    const blocker = initialRules.find((rule) => rule.id === 'block-ssh');
    if (!blocker) return;
    setRules([blocker, ...initialRules.filter((rule) => rule.id !== 'block-ssh')]);
  }

  const results = packets.map((packet) => {
    const index = rules.findIndex((rule) => matches(rule, packet));
    const action: Action = index >= 0 ? rules[index].action : policy;
    return { packet, index, action, allowed: action === 'ACCEPT' };
  });

  const wrong = results.filter((result) => result.allowed !== result.packet.shouldAllow).length;

  const script = [
    `iptables -P INPUT ${policy}`,
    'iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT',
    ...rules
      .filter((rule) => rule.enabled)
      .map((rule) => `iptables -A INPUT -p tcp${rule.source === 'any' ? '' : ` -s ${rule.source}`} --dport ${rule.port} -j ${rule.action}`),
  ].join('\n');

  return (
    <div className="my-8 border border-border bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div>
          <p className="font-mono text-xs font-semibold text-primary">Firewall rule tester</p>
          <p className="mt-1 text-sm text-muted-foreground">Đổi thứ tự luật hoặc chính sách mặc định và xem 7 gói tin bị ảnh hưởng ra sao.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={blockFirst} className="border border-border bg-card px-3 py-2 text-xs font-semibold text-ink hover:border-primary">
            Thử: đưa luật DROP SSH lên đầu
          </button>
          <button type="button" onClick={reset} className="inline-flex items-center gap-1.5 border border-border bg-card px-3 py-2 text-xs font-semibold text-ink hover:border-primary">
            <RotateCcw size={13} /> Đặt lại
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="border-b border-border p-4 lg:border-b-0 lg:border-r lg:p-5">
          <p className="font-mono text-xs font-semibold text-muted-foreground">Luật, kiểm tra từ trên xuống dưới</p>
          <ol className="mt-2 border border-border bg-card">
            {rules.map((rule, index) => (
              <li className={`flex items-center gap-2 border-b border-border px-3 py-2 last:border-b-0 ${rule.enabled ? '' : 'opacity-45'}`} key={rule.id}>
                <span className="w-5 font-mono text-xs font-bold text-muted-foreground">{index + 1}</span>
                <input type="checkbox" checked={rule.enabled} onChange={() => toggle(rule.id)} className="accent-[var(--primary)]" aria-label={`Bật luật ${rule.comment}`} />
                <span className={`w-16 shrink-0 text-center font-mono text-[0.68rem] font-bold ${rule.action === 'ACCEPT' ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>{rule.action}</span>
                <span className="min-w-0 flex-1 text-xs leading-5">
                  <span className="block font-semibold text-ink">{rule.comment}</span>
                  <span className="font-mono text-[0.68rem] text-muted-foreground">từ {rule.source} → cổng {rule.port}</span>
                </span>
                <button type="button" onClick={() => move(index, -1)} disabled={index === 0} className="grid size-7 place-items-center border border-border text-ink hover:border-primary disabled:opacity-30" aria-label="Đưa lên">
                  <ArrowUp size={13} />
                </button>
                <button type="button" onClick={() => move(index, 1)} disabled={index === rules.length - 1} className="grid size-7 place-items-center border border-border text-ink hover:border-primary disabled:opacity-30" aria-label="Đưa xuống">
                  <ArrowDown size={13} />
                </button>
              </li>
            ))}
            <li className="flex items-center gap-2 bg-surface px-3 py-2.5">
              <span className="w-5 font-mono text-xs font-bold text-muted-foreground">∞</span>
              <span className="flex-1 text-xs font-semibold text-ink">Không luật nào khớp → chính sách mặc định</span>
              <div className="flex">
                {(['DROP', 'ACCEPT'] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPolicy(value)}
                    aria-pressed={policy === value}
                    className={`border px-2.5 py-1.5 font-mono text-[0.68rem] font-bold ${policy === value ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-ink hover:border-primary'}`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </li>
          </ol>

          <pre className="mt-4 overflow-x-auto border border-code-border bg-code p-4 font-mono text-[0.72rem] leading-6 text-code-foreground"><code>{script}</code></pre>
        </div>

        <div className="p-4 lg:p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="font-mono text-xs font-semibold text-muted-foreground">Kết quả cho từng gói tin</p>
            <span className={`border px-2 py-0.5 font-mono text-[0.68rem] font-bold ${wrong === 0 ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300'}`}>
              {wrong === 0 ? 'Đúng ý định cả 7' : `${wrong} gói không như mong muốn`}
            </span>
          </div>
          <div className="mt-2 border border-border bg-card">
            {results.map(({ packet, index, allowed }) => {
              const ok = allowed === packet.shouldAllow;
              return (
                <div className={`grid grid-cols-[1fr_auto] items-center gap-3 border-b border-border px-3 py-2 last:border-b-0 ${ok ? '' : 'bg-amber-500/10'}`} key={packet.id}>
                  <div className="min-w-0 text-xs leading-5">
                    <span className="block font-semibold text-ink">{packet.label}</span>
                    <span className="font-mono text-[0.68rem] text-muted-foreground">
                      {packet.source} → :{packet.port} · {index >= 0 ? `khớp luật #${index + 1}` : 'chính sách mặc định'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className={`block font-mono text-xs font-bold ${allowed ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>{allowed ? 'ĐƯỢC QUA' : 'BỊ CHẶN'}</span>
                    {!ok ? <span className="block text-[0.65rem] font-semibold text-amber-700 dark:text-amber-300">trái với ý định</span> : null}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-xs leading-5 text-muted-foreground">
            Dòng iptables ở bên trái luôn khớp với bộ luật hiện tại. Dòng <span className="font-mono">conntrack</span> giữ cho gói trả lời của các kết nối đã được phép vẫn đi qua (stateful).
          </p>
        </div>
      </div>
    </div>
  );
}
