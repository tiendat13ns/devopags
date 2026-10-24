'use client';

import { useState } from 'react';

type Owner = 'aws' | 'you' | 'na';

type Layer = { id: string; label: string };

const layers: Layer[] = [
  { id: 'facility', label: 'Datacenter, điện, phần cứng' },
  { id: 'host', label: 'Máy chủ vật lý, hypervisor' },
  { id: 'os', label: 'Hệ điều hành: cài, vá lỗi' },
  { id: 'runtime', label: 'Runtime, database engine: cài, vá lỗi' },
  { id: 'network', label: 'Cấu hình mạng: Security Group, ai được kết nối' },
  { id: 'code', label: 'Code ứng dụng, schema, query' },
  { id: 'iam', label: 'Ai được làm gì: IAM, user, mật khẩu' },
  { id: 'data', label: 'Dữ liệu: phân loại, mã hóa, backup, quyền đọc' },
];

type Service = {
  id: string;
  name: string;
  model: string;
  owners: Record<string, Owner>;
  notes: Partial<Record<string, string>>;
};

const services: Service[] = [
  {
    id: 'ec2',
    name: 'EC2',
    model: 'IaaS: bạn thuê một máy ảo',
    owners: { facility: 'aws', host: 'aws', os: 'you', runtime: 'you', network: 'you', code: 'you', iam: 'you', data: 'you' },
    notes: {
      os: 'AWS giao máy với AMI bạn chọn; từ lúc đó dnf update là việc của bạn.',
      runtime: 'Bạn tự cài Nginx, Node, PostgreSQL… và tự vá lỗi bảo mật cho chúng.',
    },
  },
  {
    id: 'rds',
    name: 'RDS',
    model: 'PaaS: bạn thuê một database',
    owners: { facility: 'aws', host: 'aws', os: 'aws', runtime: 'aws', network: 'you', code: 'you', iam: 'you', data: 'you' },
    notes: {
      os: 'Bạn không SSH được vào máy chạy RDS.',
      runtime: 'AWS vá engine trong maintenance window do bạn chọn; nâng major version vẫn do bạn quyết định.',
      data: 'Backup tự động có sẵn, nhưng bật mã hóa, thời gian lưu và ai đọc được dữ liệu là lựa chọn của bạn.',
    },
  },
  {
    id: 'lambda',
    name: 'Lambda',
    model: 'Serverless: bạn chỉ đưa code',
    owners: { facility: 'aws', host: 'aws', os: 'aws', runtime: 'aws', network: 'na', code: 'you', iam: 'you', data: 'you' },
    notes: {
      runtime: 'Với runtime được quản lý (Python, Node…) AWS tự vá; thư viện bạn đóng gói kèm code thì bạn vẫn phải tự cập nhật.',
      network: 'Mặc định không có cổng nào để kết nối vào; chỉ cần cấu hình mạng khi gắn Lambda vào VPC.',
      iam: 'Execution role quyết định code của bạn được gọi những dịch vụ nào.',
    },
  },
  {
    id: 's3',
    name: 'S3',
    model: 'Dịch vụ lưu trữ được quản lý hoàn toàn',
    owners: { facility: 'aws', host: 'aws', os: 'aws', runtime: 'aws', network: 'na', code: 'na', iam: 'you', data: 'you' },
    notes: {
      iam: 'Bucket policy và Block Public Access: phần lớn sự cố lộ dữ liệu trên S3 nằm ở đây.',
      data: 'S3 tự mã hóa mặc định, nhưng versioning, lifecycle và việc ai được đọc vẫn do bạn bật.',
    },
  },
];

const ownerStyle: Record<Owner, { label: string; className: string }> = {
  aws: { label: 'AWS', className: 'border-primary/30 bg-primary-soft text-primary-dark' },
  you: { label: 'Bạn', className: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' },
  na: { label: 'Không áp dụng', className: 'border-border bg-surface text-muted-foreground' },
};

export function SharedResponsibilityMatrix() {
  const [serviceId, setServiceId] = useState('ec2');
  const service = services.find((item) => item.id === serviceId) ?? services[0];
  const yours = layers.filter((layer) => service.owners[layer.id] === 'you').length;

  return (
    <div className="my-8 border border-border bg-surface">
      <div className="border-b border-border px-4 py-3">
        <p className="font-mono text-xs font-semibold text-primary">Shared responsibility</p>
        <p className="mt-1 text-sm text-muted-foreground">Chọn một dịch vụ và xem lớp nào AWS lo, lớp nào vẫn là việc của bạn.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {services.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setServiceId(item.id)}
              aria-pressed={item.id === serviceId}
              className={`border px-3 py-1.5 text-xs font-semibold ${item.id === serviceId ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-ink hover:border-primary'}`}
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 lg:p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-sm font-semibold text-ink">{service.model}</p>
          <p className="font-mono text-xs text-muted-foreground">{yours}/{layers.length} lớp là việc của bạn</p>
        </div>
        <ol className="mt-3 border border-border bg-card">
          {layers.map((layer) => {
            const owner = ownerStyle[service.owners[layer.id]];
            const note = service.notes[layer.id];
            return (
              <li className="grid grid-cols-[1fr_auto] items-start gap-3 border-b border-border px-3 py-2.5 last:border-b-0" key={layer.id}>
                <div className="min-w-0 text-xs leading-5">
                  <span className="block font-semibold text-ink">{layer.label}</span>
                  {note ? <span className="mt-0.5 block text-muted-foreground">{note}</span> : null}
                </div>
                <span className={`w-28 border px-2 py-1 text-center font-mono text-[0.68rem] font-bold ${owner.className}`}>{owner.label}</span>
              </li>
            );
          })}
        </ol>
        <p className="mt-3 text-xs leading-5 text-muted-foreground">
          Càng đi từ EC2 sang S3, AWS nhận càng nhiều lớp. Nhưng hai lớp cuối, quyền truy cập và dữ liệu, không bao giờ chuyển sang AWS.
        </p>
      </div>
    </div>
  );
}
