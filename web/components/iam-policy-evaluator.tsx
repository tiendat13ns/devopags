'use client';

import { useState } from 'react';
import { RotateCcw } from 'lucide-react';

type Statement = {
  effect: 'Allow' | 'Deny';
  actions: string[];
  resources: string[];
  condition?: { key: string; value: string };
};

type Policy = {
  id: string;
  name: string;
  summary: string;
  statements: Statement[];
};

type Request = {
  id: string;
  label: string;
  action: string;
  resource: string;
  tags?: Record<string, string>;
};

const policies: Policy[] = [
  {
    id: 's3-read',
    name: 'ReportsReadOnly',
    summary: 'Allow s3:GetObject, s3:ListBucket trên bucket reports',
    statements: [{ effect: 'Allow', actions: ['s3:GetObject', 's3:ListBucket'], resources: ['arn:aws:s3:::reports', 'arn:aws:s3:::reports/*'] }],
  },
  {
    id: 'ec2-dev',
    name: 'StartStopDevOnly',
    summary: 'Allow ec2:Start/StopInstances khi tag env = dev',
    statements: [{ effect: 'Allow', actions: ['ec2:StartInstances', 'ec2:StopInstances'], resources: ['*'], condition: { key: 'aws:ResourceTag/env', value: 'dev' } }],
  },
  {
    id: 'deny-prod-delete',
    name: 'DenyDeleteProd',
    summary: 'Deny s3:DeleteObject trên mọi bucket prod-*',
    statements: [{ effect: 'Deny', actions: ['s3:DeleteObject'], resources: ['arn:aws:s3:::prod-*/*'] }],
  },
  {
    id: 'admin',
    name: 'AdministratorAccess',
    summary: 'Allow * trên * (managed policy của AWS)',
    statements: [{ effect: 'Allow', actions: ['*'], resources: ['*'] }],
  },
];

const requests: Request[] = [
  { id: 'get-report', label: 'Đọc file báo cáo', action: 's3:GetObject', resource: 'arn:aws:s3:::reports/q3.csv' },
  { id: 'put-report', label: 'Ghi đè file báo cáo', action: 's3:PutObject', resource: 'arn:aws:s3:::reports/q3.csv' },
  { id: 'stop-dev', label: 'Tắt máy dev', action: 'ec2:StopInstances', resource: 'arn:aws:ec2:…:instance/i-0dev', tags: { env: 'dev' } },
  { id: 'stop-prod', label: 'Tắt máy prod', action: 'ec2:StopInstances', resource: 'arn:aws:ec2:…:instance/i-0prod', tags: { env: 'prod' } },
  { id: 'delete-backup', label: 'Xóa bản backup prod', action: 's3:DeleteObject', resource: 'arn:aws:s3:::prod-backups/db.sql' },
  { id: 'create-user', label: 'Tạo IAM user mới', action: 'iam:CreateUser', resource: 'arn:aws:iam::123456789012:user/eve' },
];

const initialEnabled: Record<string, boolean> = { 's3-read': true, 'ec2-dev': true, 'deny-prod-delete': true, admin: false };

// Wildcard của IAM: * khớp chuỗi bất kỳ (kể cả rỗng), so sánh action không phân biệt hoa thường.
function wildcardMatch(pattern: string, value: string, ignoreCase = false) {
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
  return new RegExp(`^${escaped}$`, ignoreCase ? 'i' : '').test(value);
}

function statementMatches(statement: Statement, request: Request) {
  if (!statement.actions.some((action) => wildcardMatch(action, request.action, true))) return false;
  if (!statement.resources.some((resource) => wildcardMatch(resource, request.resource))) return false;
  if (statement.condition) {
    const tagKey = statement.condition.key.replace('aws:ResourceTag/', '');
    if (request.tags?.[tagKey] !== statement.condition.value) return false;
  }
  return true;
}

function evaluate(request: Request, enabled: Record<string, boolean>) {
  const active = policies.filter((policy) => enabled[policy.id]);
  const matching = (effect: Statement['effect']) =>
    active.filter((policy) => policy.statements.some((statement) => statement.effect === effect && statementMatches(statement, request)));

  const denies = matching('Deny');
  if (denies.length > 0) return { allowed: false, kind: 'explicit-deny' as const, by: denies.map((policy) => policy.name) };

  const allows = matching('Allow');
  if (allows.length > 0) return { allowed: true, kind: 'allow' as const, by: allows.map((policy) => policy.name) };

  return { allowed: false, kind: 'implicit-deny' as const, by: [] };
}

const verdictText = {
  'explicit-deny': 'Explicit deny',
  allow: 'Allow',
  'implicit-deny': 'Implicit deny',
};

export function IamPolicyEvaluator() {
  const [enabled, setEnabled] = useState(initialEnabled);
  const results = requests.map((request) => ({ request, ...evaluate(request, enabled) }));

  return (
    <div className="my-8 border border-border bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div>
          <p className="font-mono text-xs font-semibold text-primary">IAM policy evaluator</p>
          <p className="mt-1 text-sm text-muted-foreground">Gắn hoặc gỡ policy khỏi user và xem sáu request được quyết định ra sao.</p>
        </div>
        <button type="button" onClick={() => setEnabled(initialEnabled)} className="inline-flex items-center gap-1.5 border border-border bg-card px-3 py-2 text-xs font-semibold text-ink hover:border-primary">
          <RotateCcw size={13} /> Đặt lại
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="border-b border-border p-4 lg:border-b-0 lg:border-r lg:p-5">
          <p className="font-mono text-xs font-semibold text-muted-foreground">Policy đang gắn vào user dat</p>
          <ul className="mt-2 border border-border bg-card">
            {policies.map((policy) => (
              <li className="border-b border-border last:border-b-0" key={policy.id}>
                <label className="flex cursor-pointer items-start gap-3 px-3 py-2.5" aria-label={policy.name}>
                  <input
                    type="checkbox"
                    className="mt-1 accent-[var(--primary)]"
                    checked={enabled[policy.id]}
                    onChange={() => setEnabled((current) => ({ ...current, [policy.id]: !current[policy.id] }))}
                  />
                  <span className="min-w-0 text-xs leading-5">
                    <span className={`block font-mono font-semibold ${enabled[policy.id] ? 'text-ink' : 'text-muted-foreground line-through'}`}>{policy.name}</span>
                    <span className="text-muted-foreground">{policy.summary}</span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
          <ol className="mt-4 space-y-1.5 text-xs leading-5 text-muted-foreground">
            <li><span className="font-mono font-bold text-ink">1.</span> Có Deny nào khớp? → chặn, dừng luôn.</li>
            <li><span className="font-mono font-bold text-ink">2.</span> Có Allow nào khớp? → cho phép.</li>
            <li><span className="font-mono font-bold text-ink">3.</span> Không khớp gì → chặn (mặc định).</li>
          </ol>
        </div>

        <div className="p-4 lg:p-5">
          <p className="font-mono text-xs font-semibold text-muted-foreground">Request</p>
          <ol className="mt-2 border border-border bg-card">
            {results.map(({ request, allowed, kind, by }) => (
              <li className="border-b border-border px-3 py-2.5 last:border-b-0" key={request.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 text-xs leading-5">
                    <span className="block font-semibold text-ink">{request.label}</span>
                    <span className="block break-all font-mono text-[0.68rem] text-muted-foreground">
                      {request.action} · {request.resource}
                      {request.tags ? ` · env=${request.tags.env}` : ''}
                    </span>
                  </div>
                  <span className={`shrink-0 font-mono text-xs font-bold ${allowed ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>
                    {allowed ? 'CHO PHÉP' : 'CHẶN'}
                  </span>
                </div>
                <p className="mt-1 text-[0.7rem] leading-5 text-muted-foreground">
                  <span className="font-semibold text-ink">{verdictText[kind]}</span>
                  {by.length > 0 ? ` bởi ${by.join(', ')}` : ': không policy nào cho phép'}
                </p>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-xs leading-5 text-muted-foreground">
            Thử bật AdministratorAccess: mọi request đều được phép, trừ việc xóa backup prod, vì một Deny tường minh luôn thắng mọi Allow.
          </p>
        </div>
      </div>
    </div>
  );
}
