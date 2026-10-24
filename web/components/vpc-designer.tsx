'use client';

import { useState } from 'react';
import { CircleAlert, CircleCheck, CircleX, Plus, Trash2 } from 'lucide-react';
import { evaluateDesign, suggestSubnet, usableIps, type Az, type CheckStatus, type Design, type Subnet, type SubnetKind } from '@/lib/vpc-designer';

const standard: Design = {
  vpcCidr: '10.0.0.0/16',
  igw: true,
  natSubnet: 'pub-a',
  subnets: [
    { id: 'pub-a', name: 'public-a', cidr: '10.0.1.0/24', az: 'a', kind: 'public' },
    { id: 'pub-b', name: 'public-b', cidr: '10.0.2.0/24', az: 'b', kind: 'public' },
    { id: 'app-a', name: 'app-a', cidr: '10.0.11.0/24', az: 'a', kind: 'private' },
    { id: 'app-b', name: 'app-b', cidr: '10.0.12.0/24', az: 'b', kind: 'private' },
    { id: 'db-a', name: 'db-a', cidr: '10.0.21.0/24', az: 'a', kind: 'isolated' },
    { id: 'db-b', name: 'db-b', cidr: '10.0.22.0/24', az: 'b', kind: 'isolated' },
  ],
  albSubnets: ['pub-a', 'pub-b'],
  web: ['app-a', 'app-b'],
  webPublicIp: false,
  dbPrimary: 'db-a',
  dbStandby: 'db-b',
  webSgFrom: 'alb',
  dbSgFrom: 'web',
};

const presets: { id: string; label: string; design: Design }[] = [
  { id: 'standard', label: 'Kiến trúc chuẩn 2 AZ', design: standard },
  {
    id: 'flat',
    label: 'Mọi thứ trong một subnet public',
    design: {
      ...standard,
      natSubnet: null,
      subnets: [
        { id: 'pub-a', name: 'public-a', cidr: '10.0.1.0/24', az: 'a', kind: 'public' },
        { id: 'pub-b', name: 'public-b', cidr: '10.0.2.0/24', az: 'b', kind: 'public' },
      ],
      web: ['pub-a', 'pub-a'],
      webPublicIp: true,
      dbPrimary: 'pub-a',
      dbStandby: null,
      webSgFrom: 'anywhere',
      dbSgFrom: 'anywhere',
    },
  },
  {
    id: 'broken',
    label: 'Lỗi khó thấy',
    design: {
      ...standard,
      natSubnet: 'app-a',
      subnets: standard.subnets.map((subnet) => (subnet.id === 'db-b' ? { ...subnet, cidr: '10.0.21.128/25', az: 'a' } : subnet)),
      dbSgFrom: 'vpc',
    },
  },
];

const kindStyle: Record<SubnetKind, { label: string; box: string; badge: string }> = {
  public: { label: 'public', box: 'border-emerald-500/40 bg-emerald-500/5', badge: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' },
  private: { label: 'private', box: 'border-sky-500/40 bg-sky-500/5', badge: 'bg-sky-500/15 text-sky-700 dark:text-sky-300' },
  isolated: { label: 'isolated', box: 'border-border bg-surface', badge: 'bg-muted text-muted-foreground' },
};

const kindRoute: Record<SubnetKind, string> = {
  public: '0.0.0.0/0 → IGW',
  private: '0.0.0.0/0 → NAT',
  isolated: 'chỉ route local',
};

const statusIcon: Record<CheckStatus, { icon: typeof CircleCheck; className: string; label: string }> = {
  pass: { icon: CircleCheck, className: 'text-emerald-600 dark:text-emerald-400', label: 'Đạt' },
  warn: { icon: CircleAlert, className: 'text-amber-600 dark:text-amber-400', label: 'Cảnh báo' },
  fail: { icon: CircleX, className: 'text-rose-600 dark:text-rose-400', label: 'Lỗi' },
};

const azs: Az[] = ['a', 'b', 'c'];

function resourcesIn(design: Design, subnetId: string) {
  return [
    ...(design.natSubnet === subnetId ? ['NAT GW'] : []),
    ...(design.albSubnets.includes(subnetId) ? ['ALB'] : []),
    ...design.web.flatMap((id, index) => (id === subnetId ? [`Web ${index + 1}`] : [])),
    ...(design.dbPrimary === subnetId ? ['DB primary'] : []),
    ...(design.dbStandby === subnetId ? ['DB standby'] : []),
  ];
}

const selectClass = 'mt-0.5 block h-8 w-full border border-border bg-background px-1.5 text-xs text-ink outline-none focus:border-primary';

export function VpcDesigner() {
  const [design, setDesign] = useState<Design>(standard);
  const checks = evaluateDesign(design);
  const counts = { pass: 0, warn: 0, fail: 0 };
  checks.forEach((check) => counts[check.status]++);

  const update = (patch: Partial<Design>) => setDesign((current) => ({ ...current, ...patch }));
  const updateSubnet = (id: string, patch: Partial<Subnet>) => update({ subnets: design.subnets.map((subnet) => (subnet.id === id ? { ...subnet, ...patch } : subnet)) });

  function addSubnet() {
    const id = `subnet-${Date.now().toString(36)}`;
    update({ subnets: [...design.subnets, { id, name: `subnet-${design.subnets.length + 1}`, cidr: suggestSubnet(design), az: 'a', kind: 'private' }] });
  }

  function removeSubnet(id: string) {
    const fallback = design.subnets.find((subnet) => subnet.id !== id)?.id ?? '';
    update({
      subnets: design.subnets.filter((subnet) => subnet.id !== id),
      albSubnets: design.albSubnets.filter((subnetId) => subnetId !== id),
      natSubnet: design.natSubnet === id ? null : design.natSubnet,
      web: design.web.map((subnetId) => (subnetId === id ? fallback : subnetId)) as [string, string],
      dbPrimary: design.dbPrimary === id ? fallback : design.dbPrimary,
      dbStandby: design.dbStandby === id ? null : design.dbStandby,
    });
  }

  const subnetOptions = design.subnets.map((subnet) => (
    <option key={subnet.id} value={subnet.id}>{subnet.name} · AZ {subnet.az}</option>
  ));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <button key={preset.id} type="button" onClick={() => setDesign(preset.design)} className="border border-border bg-card px-3 py-1.5 text-xs font-semibold text-ink hover:border-primary">
            {preset.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-4">
          <div className="border border-border bg-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className={`border px-3 py-1 font-mono text-xs font-bold ${design.igw ? 'border-emerald-500/40 text-emerald-700 dark:text-emerald-300' : 'border-border text-muted-foreground line-through'}`}>
                Internet Gateway
              </span>
              <span className="font-mono text-xs text-muted-foreground">VPC {design.vpcCidr}</span>
            </div>
            <div className="mt-3 grid gap-3 border-2 border-dashed border-primary/40 p-3 md:grid-cols-3">
              {azs.map((az) => (
                <div key={az} className="min-w-0">
                  <p className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground">AZ {az}</p>
                  <div className="mt-2 space-y-2">
                    {design.subnets.filter((subnet) => subnet.az === az).map((subnet) => {
                      const style = kindStyle[subnet.kind];
                      const resources = resourcesIn(design, subnet.id);
                      return (
                        <div key={subnet.id} className={`border p-2.5 ${style.box}`}>
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate text-xs font-bold text-ink">{subnet.name}</span>
                            <span className={`px-1.5 py-0.5 font-mono text-[0.62rem] font-bold ${style.badge}`}>{style.label}</span>
                          </div>
                          <p className="mt-0.5 font-mono text-[0.68rem] text-muted-foreground">{subnet.cidr} · {usableIps(subnet.cidr)} IP</p>
                          <p className="font-mono text-[0.62rem] text-muted-foreground">{kindRoute[subnet.kind]}</p>
                          {resources.length > 0 ? (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {resources.map((resource) => (
                                <span key={resource} className="border border-primary/30 bg-card px-1.5 py-0.5 text-[0.65rem] font-semibold text-primary-dark">{resource}</span>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                    {design.subnets.every((subnet) => subnet.az !== az) ? <p className="border border-dashed border-border p-3 text-center text-[0.68rem] text-muted-foreground">Chưa có subnet</p> : null}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-border bg-card">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
              <p className="text-sm font-bold text-ink">Kiểm tra thiết kế</p>
              <div className="flex gap-3 font-mono text-xs">
                <span className="text-emerald-700 dark:text-emerald-300">{counts.pass} đạt</span>
                <span className="text-amber-700 dark:text-amber-300">{counts.warn} cảnh báo</span>
                <span className="text-rose-700 dark:text-rose-300">{counts.fail} lỗi</span>
              </div>
            </div>
            <ul>
              {checks.map((check) => {
                const { icon: Icon, className, label } = statusIcon[check.status];
                return (
                  <li key={check.id} className="flex gap-3 border-b border-border px-4 py-3 last:border-b-0">
                    <Icon className={`mt-0.5 shrink-0 ${className}`} size={17} aria-label={label} />
                    <div className="min-w-0 text-xs leading-5">
                      <p className="font-semibold text-ink">{check.title}</p>
                      <p className="text-muted-foreground">{check.detail}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <aside className="space-y-4 text-xs">
          <div className="border border-border bg-card p-4">
            <div className="grid grid-cols-[1fr_auto] items-end gap-3">
              <label className="font-semibold text-ink">
                VPC CIDR
                <input value={design.vpcCidr} onChange={(event) => update({ vpcCidr: event.target.value })} spellCheck={false} className="mt-0.5 block h-8 w-full border border-border bg-background px-2 font-mono text-ink outline-none focus:border-primary" />
              </label>
              <label className="flex h-8 items-center gap-2 font-semibold text-ink">
                <input type="checkbox" checked={design.igw} onChange={() => update({ igw: !design.igw })} className="accent-[var(--primary)]" />
                Gắn IGW
              </label>
            </div>
          </div>

          <div className="border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
              <p className="font-semibold text-ink">Subnet ({design.subnets.length})</p>
              <button type="button" onClick={addSubnet} className="inline-flex items-center gap-1 border border-border px-2 py-1 font-semibold text-ink hover:border-primary">
                <Plus size={12} /> Thêm
              </button>
            </div>
            <ul className="max-h-80 overflow-y-auto">
              {design.subnets.map((subnet) => (
                <li key={subnet.id} className="grid grid-cols-[1fr_1fr_auto] gap-1.5 border-b border-border px-3 py-2 last:border-b-0">
                  <input value={subnet.name} onChange={(event) => updateSubnet(subnet.id, { name: event.target.value })} aria-label="Tên subnet" className="h-8 border border-border bg-background px-1.5 text-ink outline-none focus:border-primary" />
                  <input value={subnet.cidr} onChange={(event) => updateSubnet(subnet.id, { cidr: event.target.value })} aria-label="CIDR" spellCheck={false} className="h-8 border border-border bg-background px-1.5 font-mono text-ink outline-none focus:border-primary" />
                  <button type="button" onClick={() => removeSubnet(subnet.id)} disabled={design.subnets.length <= 1} className="grid size-8 place-items-center border border-border text-muted-foreground hover:border-rose-500 hover:text-rose-600 disabled:opacity-30" aria-label={`Xóa ${subnet.name}`}>
                    <Trash2 size={13} />
                  </button>
                  <select value={subnet.az} onChange={(event) => updateSubnet(subnet.id, { az: event.target.value as Az })} aria-label="Availability Zone" className="h-8 border border-border bg-background px-1.5 text-ink outline-none focus:border-primary">
                    {azs.map((az) => <option key={az} value={az}>AZ {az}</option>)}
                  </select>
                  <select value={subnet.kind} onChange={(event) => updateSubnet(subnet.id, { kind: event.target.value as SubnetKind })} aria-label="Loại subnet" className="h-8 border border-border bg-background px-1.5 text-ink outline-none focus:border-primary">
                    <option value="public">public</option>
                    <option value="private">private (qua NAT)</option>
                    <option value="isolated">isolated</option>
                  </select>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3 border border-border bg-card p-4">
            <p className="font-semibold text-ink">Đặt tài nguyên</p>
            <label className="block text-muted-foreground">
              NAT Gateway
              <select value={design.natSubnet ?? ''} onChange={(event) => update({ natSubnet: event.target.value || null })} className={selectClass}>
                <option value="">Không có NAT</option>
                {subnetOptions}
              </select>
            </label>
            <fieldset>
              <legend className="text-muted-foreground">ALB (chọn các subnet)</legend>
              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
                {design.subnets.map((subnet) => (
                  <label key={subnet.id} className="flex items-center gap-1.5 text-ink">
                    <input
                      type="checkbox"
                      checked={design.albSubnets.includes(subnet.id)}
                      onChange={() => update({ albSubnets: design.albSubnets.includes(subnet.id) ? design.albSubnets.filter((id) => id !== subnet.id) : [...design.albSubnets, subnet.id] })}
                      className="accent-[var(--primary)]"
                    />
                    {subnet.name}
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="grid grid-cols-2 gap-2">
              {design.web.map((subnetId, index) => (
                <label key={index} className="block text-muted-foreground">
                  Web {index + 1}
                  <select value={subnetId} onChange={(event) => update({ web: design.web.map((id, webIndex) => (webIndex === index ? event.target.value : id)) as [string, string] })} className={selectClass}>
                    {subnetOptions}
                  </select>
                </label>
              ))}
              <label className="block text-muted-foreground">
                DB primary
                <select value={design.dbPrimary} onChange={(event) => update({ dbPrimary: event.target.value })} className={selectClass}>
                  {subnetOptions}
                </select>
              </label>
              <label className="block text-muted-foreground">
                DB standby
                <select value={design.dbStandby ?? ''} onChange={(event) => update({ dbStandby: event.target.value || null })} className={selectClass}>
                  <option value="">Không (Single-AZ)</option>
                  {subnetOptions}
                </select>
              </label>
            </div>
            <label className="flex items-center gap-2 text-ink">
              <input type="checkbox" checked={design.webPublicIp} onChange={() => update({ webPublicIp: !design.webPublicIp })} className="accent-[var(--primary)]" />
              Web server có public IP
            </label>
          </div>

          <div className="space-y-3 border border-border bg-card p-4">
            <p className="font-semibold text-ink">Security Group</p>
            <label className="block text-muted-foreground">
              web-sg: cổng 80 mở cho
              <select value={design.webSgFrom} onChange={(event) => update({ webSgFrom: event.target.value as Design['webSgFrom'] })} className={selectClass}>
                <option value="alb">alb-sg (chỉ load balancer)</option>
                <option value="anywhere">0.0.0.0/0 (mọi nơi)</option>
                <option value="none">Không mở</option>
              </select>
            </label>
            <label className="block text-muted-foreground">
              db-sg: cổng 5432 mở cho
              <select value={design.dbSgFrom} onChange={(event) => update({ dbSgFrom: event.target.value as Design['dbSgFrom'] })} className={selectClass}>
                <option value="web">web-sg (chỉ web server)</option>
                <option value="vpc">Cả dải VPC</option>
                <option value="anywhere">0.0.0.0/0 (mọi nơi)</option>
              </select>
            </label>
          </div>
        </aside>
      </div>
    </div>
  );
}
