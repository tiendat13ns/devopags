'use client';

import { useState } from 'react';
import { CircleCheck, CircleX, Plus, Trash2 } from 'lucide-react';
import { evaluateRequest, layerNames, type Layer, type RequestContext } from '@/lib/iam-eval';

type Preset = {
  id: string;
  label: string;
  policies: Partial<Record<Layer, string>>;
  tests: (RequestContext & { name: string })[];
};

const json = (value: unknown) => JSON.stringify(value, null, 2);

const baseContext: RequestContext = {
  action: 's3:GetObject',
  resource: 'arn:aws:s3:::company-data/home/dat/notes.txt',
  username: 'dat',
  sourceIp: '203.0.113.25',
  region: 'ap-southeast-1',
  mfa: false,
  secureTransport: true,
  resourceTags: '',
};

const presets: Preset[] = [
  {
    id: 'home-folder',
    label: 'Mỗi user một thư mục S3',
    policies: {
      identity: json({
        Version: '2012-10-17',
        Statement: [
          { Sid: 'ListBucket', Effect: 'Allow', Action: 's3:ListBucket', Resource: 'arn:aws:s3:::company-data' },
          { Sid: 'OwnHomeFolder', Effect: 'Allow', Action: ['s3:GetObject', 's3:PutObject'], Resource: 'arn:aws:s3:::company-data/home/${aws:username}/*' },
        ],
      }),
    },
    tests: [
      { ...baseContext, name: 'Đọc file của chính mình' },
      { ...baseContext, name: 'Đọc file của người khác', resource: 'arn:aws:s3:::company-data/home/lan/salary.xlsx' },
      { ...baseContext, name: 'Xóa file của chính mình', action: 's3:DeleteObject' },
      { ...baseContext, name: 'Liệt kê bucket', action: 's3:ListBucket', resource: 'arn:aws:s3:::company-data' },
    ],
  },
  {
    id: 'mfa',
    label: 'Terminate máy phải có MFA',
    policies: {
      identity: json({
        Version: '2012-10-17',
        Statement: [
          { Sid: 'ManageEc2', Effect: 'Allow', Action: 'ec2:*', Resource: '*' },
          {
            Sid: 'DenyTerminateWithoutMfa',
            Effect: 'Deny',
            Action: 'ec2:TerminateInstances',
            Resource: '*',
            Condition: { BoolIfExists: { 'aws:MultiFactorAuthPresent': 'false' } },
          },
        ],
      }),
    },
    tests: [
      { ...baseContext, name: 'Xem danh sách máy', action: 'ec2:DescribeInstances', resource: '*' },
      { ...baseContext, name: 'Terminate, không MFA', action: 'ec2:TerminateInstances', resource: 'arn:aws:ec2:ap-southeast-1:123456789012:instance/i-0abc' },
      { ...baseContext, name: 'Terminate, có MFA', action: 'ec2:TerminateInstances', resource: 'arn:aws:ec2:ap-southeast-1:123456789012:instance/i-0abc', mfa: true },
    ],
  },
  {
    id: 'tags',
    label: 'Chỉ bật/tắt máy của team mình',
    policies: {
      identity: json({
        Version: '2012-10-17',
        Statement: [
          { Sid: 'DescribeAll', Effect: 'Allow', Action: 'ec2:DescribeInstances', Resource: '*' },
          {
            Sid: 'StartStopTeamData',
            Effect: 'Allow',
            Action: ['ec2:StartInstances', 'ec2:StopInstances'],
            Resource: 'arn:aws:ec2:*:*:instance/*',
            Condition: { StringEquals: { 'aws:ResourceTag/team': 'data' } },
          },
        ],
      }),
    },
    tests: [
      { ...baseContext, name: 'Tắt máy team data', action: 'ec2:StopInstances', resource: 'arn:aws:ec2:ap-southeast-1:123456789012:instance/i-0data', resourceTags: 'team=data, env=dev' },
      { ...baseContext, name: 'Tắt máy team web', action: 'ec2:StopInstances', resource: 'arn:aws:ec2:ap-southeast-1:123456789012:instance/i-0web', resourceTags: 'team=web' },
      { ...baseContext, name: 'Tắt máy chưa gắn tag', action: 'ec2:StopInstances', resource: 'arn:aws:ec2:ap-southeast-1:123456789012:instance/i-0old' },
    ],
  },
  {
    id: 'network',
    label: 'Chỉ từ IP văn phòng, qua HTTPS',
    policies: {
      identity: json({
        Version: '2012-10-17',
        Statement: [
          { Sid: 'ReportsBucket', Effect: 'Allow', Action: 's3:*', Resource: ['arn:aws:s3:::reports', 'arn:aws:s3:::reports/*'] },
          { Sid: 'OfficeOnly', Effect: 'Deny', Action: '*', Resource: '*', Condition: { NotIpAddress: { 'aws:SourceIp': ['203.0.113.0/24'] } } },
          { Sid: 'HttpsOnly', Effect: 'Deny', Action: 's3:*', Resource: '*', Condition: { Bool: { 'aws:SecureTransport': 'false' } } },
        ],
      }),
    },
    tests: [
      { ...baseContext, name: 'Từ văn phòng, HTTPS', resource: 'arn:aws:s3:::reports/q3.csv' },
      { ...baseContext, name: 'Từ quán cà phê', resource: 'arn:aws:s3:::reports/q3.csv', sourceIp: '198.51.100.40' },
      { ...baseContext, name: 'Từ văn phòng, HTTP thường', resource: 'arn:aws:s3:::reports/q3.csv', secureTransport: false },
    ],
  },
  {
    id: 'scp',
    label: 'SCP giới hạn region',
    policies: {
      scp: json({
        Version: '2012-10-17',
        Statement: [
          { Sid: 'AllowAll', Effect: 'Allow', Action: '*', Resource: '*' },
          {
            Sid: 'DenyOtherRegions',
            Effect: 'Deny',
            NotAction: ['iam:*', 'sts:*', 'organizations:*', 'cloudfront:*', 'route53:*', 'support:*'],
            Resource: '*',
            Condition: { StringNotEquals: { 'aws:RequestedRegion': ['ap-southeast-1', 'us-east-1'] } },
          },
        ],
      }),
      identity: json({ Version: '2012-10-17', Statement: [{ Sid: 'Admin', Effect: 'Allow', Action: '*', Resource: '*' }] }),
    },
    tests: [
      { ...baseContext, name: 'Tạo máy ở Singapore', action: 'ec2:RunInstances', resource: '*' },
      { ...baseContext, name: 'Tạo máy ở Ireland', action: 'ec2:RunInstances', resource: '*', region: 'eu-west-1' },
      { ...baseContext, name: 'Tạo IAM role (dịch vụ toàn cầu)', action: 'iam:CreateRole', resource: 'arn:aws:iam::123456789012:role/app', region: 'eu-west-1' },
    ],
  },
  {
    id: 'boundary',
    label: 'Permissions boundary',
    policies: {
      boundary: json({ Version: '2012-10-17', Statement: [{ Sid: 'OnlyS3AndLogs', Effect: 'Allow', Action: ['s3:*', 'logs:*'], Resource: '*' }] }),
      identity: json({ Version: '2012-10-17', Statement: [{ Sid: 'Admin', Effect: 'Allow', Action: '*', Resource: '*' }] }),
    },
    tests: [
      { ...baseContext, name: 'Đọc S3', resource: 'arn:aws:s3:::reports/q3.csv' },
      { ...baseContext, name: 'Tạo máy EC2', action: 'ec2:RunInstances', resource: '*' },
      { ...baseContext, name: 'Tạo IAM user', action: 'iam:CreateUser', resource: 'arn:aws:iam::123456789012:user/eve' },
    ],
  },
];

const layers: Layer[] = ['identity', 'boundary', 'scp'];
const emptyPolicy = json({ Version: '2012-10-17', Statement: [{ Effect: 'Allow', Action: '*', Resource: '*' }] });
const regions = ['ap-southeast-1', 'us-east-1', 'eu-west-1', 'ap-northeast-1'];
const actionSuggestions = ['s3:GetObject', 's3:PutObject', 's3:DeleteObject', 's3:ListBucket', 'ec2:DescribeInstances', 'ec2:RunInstances', 'ec2:StartInstances', 'ec2:StopInstances', 'ec2:TerminateInstances', 'iam:CreateUser', 'iam:CreateRole', 'logs:PutLogEvents'];

const inputClass = 'mt-0.5 block h-8 w-full border border-border bg-background px-2 font-mono text-ink outline-none focus:border-primary';

export function IamPolicyPlayground() {
  const [presetId, setPresetId] = useState(presets[0].id);
  const [policies, setPolicies] = useState<Partial<Record<Layer, string>>>(presets[0].policies);
  const [tab, setTab] = useState<Layer>('identity');
  const [request, setRequest] = useState<RequestContext>(presets[0].tests[0]);
  const [tests, setTests] = useState(presets[0].tests);

  const decision = evaluateRequest(policies, request);
  const patch = (value: Partial<RequestContext>) => setRequest((current) => ({ ...current, ...value }));

  function loadPreset(preset: Preset) {
    setPresetId(preset.id);
    setPolicies(preset.policies);
    setTests(preset.tests);
    setRequest(preset.tests[0]);
    setTab('identity');
  }

  function toggleLayer(layer: Layer) {
    setPolicies((current) => {
      const next = { ...current };
      if (next[layer] === undefined) next[layer] = emptyPolicy;
      else delete next[layer];
      return next;
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <button key={preset.id} type="button" onClick={() => loadPreset(preset)} aria-pressed={preset.id === presetId} className={`border px-3 py-1.5 text-xs font-semibold ${preset.id === presetId ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-ink hover:border-primary'}`}>
            {preset.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="border border-border bg-card">
          <div className="flex border-b border-border">
            {layers.map((layer) => (
              <button key={layer} type="button" onClick={() => setTab(layer)} aria-pressed={tab === layer} className={`flex-1 px-2 py-2.5 text-xs font-semibold ${tab === layer ? 'bg-primary text-primary-foreground' : 'text-ink hover:bg-accent'}`}>
                {layerNames[layer]}
                {layer !== 'identity' ? <span className="ml-1 font-normal opacity-75">{policies[layer] === undefined ? '(tắt)' : '(bật)'}</span> : null}
              </button>
            ))}
          </div>
          {tab !== 'identity' ? (
            <label className="flex items-center gap-2 border-b border-border px-4 py-2 text-xs font-semibold text-ink">
              <input type="checkbox" checked={policies[tab] !== undefined} onChange={() => toggleLayer(tab)} className="accent-[var(--primary)]" />
              Áp dụng {layerNames[tab]}
              <span className="font-normal text-muted-foreground">
                {tab === 'scp' ? '· trần quyền cho cả tài khoản, đặt bởi AWS Organizations' : '· trần quyền cho riêng user hoặc role này'}
              </span>
            </label>
          ) : null}
          {policies[tab] !== undefined ? (
            <textarea
              value={policies[tab]}
              onChange={(event) => setPolicies((current) => ({ ...current, [tab]: event.target.value }))}
              spellCheck={false}
              aria-label={`Nội dung ${layerNames[tab]}`}
              className="block h-[26rem] w-full resize-y bg-code p-4 font-mono text-[0.78rem] leading-6 text-code-foreground outline-none"
            />
          ) : (
            <p className="p-4 text-sm text-muted-foreground">Lớp này đang tắt. Bật lên để giới hạn quyền tối đa mà identity policy có thể cấp.</p>
          )}
        </div>

        <div className="space-y-4">
          <div className="border border-border bg-card p-4 text-xs">
            <p className="font-semibold text-ink">Request</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <label className="text-muted-foreground">
                Action
                <input value={request.action} onChange={(event) => patch({ action: event.target.value })} list="iam-actions" spellCheck={false} className={inputClass} />
                <datalist id="iam-actions">
                  {actionSuggestions.map((action) => <option key={action} value={action}>{action}</option>)}
                </datalist>
              </label>
              <label className="text-muted-foreground">
                User (aws:username)
                <input value={request.username} onChange={(event) => patch({ username: event.target.value })} spellCheck={false} className={inputClass} />
              </label>
              <label className="text-muted-foreground sm:col-span-2">
                Resource (ARN)
                <input value={request.resource} onChange={(event) => patch({ resource: event.target.value })} spellCheck={false} className={inputClass} />
              </label>
              <label className="text-muted-foreground">
                IP nguồn (aws:SourceIp)
                <input value={request.sourceIp} onChange={(event) => patch({ sourceIp: event.target.value })} spellCheck={false} className={inputClass} />
              </label>
              <label className="text-muted-foreground">
                Region (aws:RequestedRegion)
                <select value={request.region} onChange={(event) => patch({ region: event.target.value })} className={inputClass}>
                  {regions.map((region) => <option key={region}>{region}</option>)}
                </select>
              </label>
              <label className="text-muted-foreground sm:col-span-2">
                Tag của tài nguyên (aws:ResourceTag/…), dạng key=value, cách nhau bởi dấu phẩy
                <input value={request.resourceTags} onChange={(event) => patch({ resourceTags: event.target.value })} placeholder="team=data, env=prod" spellCheck={false} className={inputClass} />
              </label>
              <label className="flex items-center gap-2 text-ink">
                <input type="checkbox" checked={request.mfa} onChange={() => patch({ mfa: !request.mfa })} className="accent-[var(--primary)]" />
                Đăng nhập có MFA
              </label>
              <label className="flex items-center gap-2 text-ink">
                <input type="checkbox" checked={request.secureTransport} onChange={() => patch({ secureTransport: !request.secureTransport })} className="accent-[var(--primary)]" />
                Qua HTTPS
              </label>
            </div>
          </div>

          <div className={`border p-4 ${decision.allowed ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-rose-500/40 bg-rose-500/5'}`}>
            <div className="flex items-center gap-2">
              {decision.allowed ? <CircleCheck className="text-emerald-600 dark:text-emerald-400" size={22} /> : <CircleX className="text-rose-600 dark:text-rose-400" size={22} />}
              <p className="text-lg font-bold text-ink">{decision.allowed ? 'Allow' : decision.kind === 'explicit-deny' ? 'Explicit deny' : 'Implicit deny'}</p>
            </div>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{decision.summary}</p>

            <div className="mt-3 space-y-3">
              {decision.layers.map((layer) => (
                <div key={layer.layer} className="border border-border bg-card">
                  <p className="border-b border-border px-3 py-1.5 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                    {layerNames[layer.layer]} · {layer.deny ? 'có Deny khớp' : layer.allow ? 'có Allow khớp' : 'không có Allow khớp'}
                  </p>
                  {layer.error ? <p className="px-3 py-2 text-xs text-rose-700 dark:text-rose-300">{layer.error}</p> : null}
                  <ul>
                    {layer.statements.map((statement) => (
                      <li key={statement.index} className="border-b border-border px-3 py-2 text-xs last:border-b-0">
                        <p className="flex flex-wrap items-center gap-2">
                          <span className={`font-mono font-bold ${statement.effect === 'Deny' ? 'text-rose-700 dark:text-rose-300' : 'text-emerald-700 dark:text-emerald-300'}`}>{statement.effect}</span>
                          <span className="font-semibold text-ink">{statement.sid ?? `Statement ${statement.index + 1}`}</span>
                          <span className={`ml-auto font-mono text-[0.68rem] ${statement.matched ? 'font-bold text-ink' : 'text-muted-foreground'}`}>{statement.matched ? 'KHỚP' : 'không khớp'}</span>
                        </p>
                        {statement.reasons.map((reason) => (
                          <p key={reason} className="mt-0.5 break-all leading-5 text-muted-foreground">{reason}</p>
                        ))}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border border-border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-2.5">
          <p className="text-sm font-bold text-ink">Bộ test</p>
          <button type="button" onClick={() => setTests((current) => [...current, { ...request, name: `${request.action} · ${request.resource.split(':').pop()}` }])} className="inline-flex items-center gap-1 border border-border px-2 py-1 text-xs font-semibold text-ink hover:border-primary">
            <Plus size={12} /> Lưu request hiện tại
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-xs">
            <thead className="bg-surface font-mono text-muted-foreground">
              <tr>
                <th className="px-4 py-2">Tình huống</th>
                <th className="px-4 py-2">Action</th>
                <th className="px-4 py-2">Kết quả</th>
                <th className="px-4 py-2"><span className="sr-only">Xóa</span></th>
              </tr>
            </thead>
            <tbody>
              {tests.map((test, index) => {
                const result = evaluateRequest(policies, test);
                return (
                  <tr key={`${index}-${test.name}`} className="cursor-pointer border-t border-border hover:bg-accent" onClick={() => setRequest(test)}>
                    <td className="px-4 py-2 font-semibold text-ink">{test.name}</td>
                    <td className="px-4 py-2 font-mono text-muted-foreground">{test.action}</td>
                    <td className={`px-4 py-2 font-mono font-bold ${result.allowed ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>
                      {result.allowed ? 'Allow' : result.kind === 'explicit-deny' ? 'Explicit deny' : 'Implicit deny'}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <button type="button" onClick={(event) => { event.stopPropagation(); setTests((current) => current.filter((_, testIndex) => testIndex !== index)); }} className="text-muted-foreground hover:text-rose-600" aria-label={`Xóa ${test.name}`}>
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="border-t border-border px-4 py-2 text-xs text-muted-foreground">Sửa policy là cả bộ test chạy lại ngay: cách nhanh để chắc rằng sửa một chỗ không làm hỏng chỗ khác. Bấm một dòng để nạp request đó lên trên.</p>
      </div>
    </div>
  );
}
