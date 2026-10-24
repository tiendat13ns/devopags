'use client';

import { useState } from 'react';

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';

type StatusInfo = {
  code: number;
  reason: string;
  headers: string[];
  body?: string;
  meaning: string;
  check: string;
};

const methods: Method[] = ['GET', 'POST', 'PUT', 'DELETE'];

const statuses: StatusInfo[] = [
  { code: 200, reason: 'OK', headers: ['Content-Type: application/json'], body: '{"id":42,"name":"An"}', meaning: 'Thành công, body chứa kết quả.', check: 'Thường không cần làm gì. Nhưng 200 chỉ nói request được xử lý, không bảo đảm dữ liệu đúng.' },
  { code: 201, reason: 'Created', headers: ['Location: /api/users/42'], body: '{"id":42}', meaning: 'Đã tạo tài nguyên mới; header Location trỏ tới nó.', check: 'Thường là phản hồi cho POST tạo mới.' },
  { code: 204, reason: 'No Content', headers: [], meaning: 'Thành công và cố tình không có body.', check: 'Hay gặp ở DELETE hoặc PUT. Đừng cố parse body.' },
  { code: 301, reason: 'Moved Permanently', headers: ['Location: https://api.example.com/api/users'], meaning: 'Địa chỉ đã chuyển vĩnh viễn; client phải gọi lại tới URL trong Location.', check: 'Gặp redirect loop? Kiểm tra cấu hình http→https và proxy. Dùng curl -L để đi theo redirect.' },
  { code: 304, reason: 'Not Modified', headers: ['ETag: "a1b2c3"'], meaning: 'Bản cache của client vẫn còn mới, server không gửi lại nội dung.', check: 'Bình thường và tốt cho hiệu năng khi dùng ETag hoặc If-Modified-Since.' },
  { code: 400, reason: 'Bad Request', headers: ['Content-Type: application/json'], body: '{"error":"name is required"}', meaning: 'Server không hiểu hoặc không chấp nhận request: sai cú pháp, thiếu trường, JSON hỏng.', check: 'Đọc body lỗi; kiểm tra Content-Type và Content-Length có khớp nội dung không.' },
  { code: 401, reason: 'Unauthorized', headers: ['WWW-Authenticate: Bearer'], meaning: 'Chưa xác thực: thiếu token, token sai hoặc đã hết hạn.', check: 'Có gửi header Authorization không? Token còn hạn không? Gửi đúng môi trường chưa?' },
  { code: 403, reason: 'Forbidden', headers: [], meaning: 'Server biết bạn là ai nhưng không cho phép.', check: 'Quyền (role/IAM), IP allowlist, WAF hoặc rule của reverse proxy.' },
  { code: 404, reason: 'Not Found', headers: [], meaning: 'Không có tài nguyên ở đường dẫn này.', check: 'Sai path, thiếu hoặc thừa base path, location trong Nginx chưa khớp, hoặc đang gọi nhầm môi trường.' },
  { code: 429, reason: 'Too Many Requests', headers: ['Retry-After: 30'], meaning: 'Bị giới hạn tốc độ (rate limit).', check: 'Giảm tần suất, thêm backoff, đọc Retry-After. Kiểm tra rate limit đặt ở đâu.' },
  { code: 500, reason: 'Internal Server Error', headers: ['Content-Type: text/plain'], body: 'Internal Server Error', meaning: 'Ứng dụng gặp lỗi chưa được xử lý.', check: 'Xem log của ứng dụng (stack trace). Lỗi nằm trong code, không phải mạng.' },
  { code: 502, reason: 'Bad Gateway', headers: ['Server: nginx', 'Content-Type: text/html'], body: '<html>502 Bad Gateway</html>', meaning: 'Proxy hoặc load balancer không nhận được phản hồi hợp lệ từ upstream, thường vì không kết nối được hoặc upstream đóng kết nối đột ngột.', check: 'Upstream có đang chạy không? Địa chỉ và port trong proxy_pass có đúng không? Ứng dụng có crash không?' },
  { code: 503, reason: 'Service Unavailable', headers: ['Retry-After: 120'], meaning: 'Dịch vụ tạm thời không nhận thêm request: quá tải, đang bảo trì hoặc mọi upstream đều không khỏe.', check: 'Xem tài nguyên và health check. Bảo trì có chủ ý thì trả 503 kèm Retry-After.' },
  { code: 504, reason: 'Gateway Timeout', headers: ['Server: nginx', 'Content-Type: text/html'], body: '<html>504 Gateway Time-out</html>', meaning: 'Proxy kết nối được upstream nhưng chờ phản hồi quá lâu.', check: 'Truy vấn chậm? Ứng dụng bị treo? So sánh proxy_read_timeout với thời gian xử lý thực tế.' },
];

function familyClasses(code: number, active: boolean) {
  const family = Math.floor(code / 100);
  const colors: Record<number, string> = {
    2: 'border-emerald-500/50 text-emerald-700 dark:text-emerald-300',
    3: 'border-sky-500/50 text-sky-700 dark:text-sky-300',
    4: 'border-amber-500/50 text-amber-700 dark:text-amber-300',
    5: 'border-rose-500/50 text-rose-700 dark:text-rose-300',
  };
  const activeBg: Record<number, string> = {
    2: 'bg-emerald-500/20',
    3: 'bg-sky-500/20',
    4: 'bg-amber-500/20',
    5: 'bg-rose-500/20',
  };
  return `${colors[family]} ${active ? activeBg[family] : 'bg-card'}`;
}

export function HttpMessageBuilder() {
  const [method, setMethod] = useState<Method>('POST');
  const [path, setPath] = useState('/api/users');
  const [auth, setAuth] = useState(true);
  const [json, setJson] = useState(true);
  const [accept, setAccept] = useState(true);
  const [gzip, setGzip] = useState(false);
  const [body, setBody] = useState('{"name":"An"}');
  const [statusCode, setStatusCode] = useState(201);

  const hasBody = method === 'POST' || method === 'PUT';
  const safePath = path.startsWith('/') ? path : `/${path}`;
  const status = statuses.find((item) => item.code === statusCode) ?? statuses[0];

  const headers: [string, string][] = [['Host', 'api.example.com'], ['User-Agent', 'curl/8.5.0']];
  if (accept) headers.push(['Accept', 'application/json']);
  if (gzip) headers.push(['Accept-Encoding', 'gzip']);
  if (auth) headers.push(['Authorization', 'Bearer eyJhbGciOi…']);
  if (hasBody && json) headers.push(['Content-Type', 'application/json']);
  if (hasBody) headers.push(['Content-Length', String(new TextEncoder().encode(body).length)]);

  const curlParts = [`curl -i${method === 'GET' ? '' : ` -X ${method}`} https://api.example.com${safePath}`];
  if (accept) curlParts.push("-H 'Accept: application/json'");
  if (gzip) curlParts.push('--compressed');
  if (auth) curlParts.push("-H 'Authorization: Bearer <token>'");
  if (hasBody && json) curlParts.push("-H 'Content-Type: application/json'");
  if (hasBody) curlParts.push(`-d '${body}'`);

  const toggles: [string, boolean, (value: boolean) => void, boolean][] = [
    ['Authorization', auth, setAuth, true],
    ['Accept: JSON', accept, setAccept, true],
    ['Accept-Encoding: gzip', gzip, setGzip, true],
    ['Content-Type: JSON', json, setJson, hasBody],
  ];

  return (
    <div className="my-8 border border-border bg-surface">
      <div className="border-b border-border px-4 py-3">
        <p className="font-mono text-xs font-semibold text-primary">HTTP message builder</p>
        <p className="mt-1 text-sm text-muted-foreground">Chỉnh request bên trái, chọn mã phản hồi bên phải, và xem đúng văn bản thô được gửi qua dây.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="space-y-4 border-b border-border p-4 lg:border-b-0 lg:border-r lg:p-5">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.08em] text-primary">Request</p>

          <div className="flex flex-wrap gap-2">
            {methods.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setMethod(item)}
                aria-pressed={method === item}
                className={`border px-3 py-2 font-mono text-xs font-bold ${method === item ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-ink hover:border-primary'}`}
              >
                {item}
              </button>
            ))}
          </div>

          <label className="block">
            <span className="font-mono text-xs font-semibold text-muted-foreground">Đường dẫn</span>
            <input
              className="mt-1 h-10 w-full border border-border bg-card px-3 font-mono text-sm text-ink outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              value={path}
              onChange={(event) => setPath(event.target.value)}
              spellCheck={false}
            />
          </label>

          <div className="flex flex-wrap gap-2">
            {toggles.map(([label, value, setter, enabled]) => (
              <label className={`inline-flex items-center gap-2 border border-border bg-card px-3 py-1.5 text-xs font-semibold ${enabled ? 'cursor-pointer text-ink' : 'cursor-not-allowed text-muted-foreground opacity-50'}`} key={label}>
                <input type="checkbox" checked={value && enabled} disabled={!enabled} onChange={(event) => setter(event.target.checked)} className="accent-[var(--primary)]" />
                {label}
              </label>
            ))}
          </div>

          {hasBody ? (
            <label className="block">
              <span className="font-mono text-xs font-semibold text-muted-foreground">Body</span>
              <textarea
                className="mt-1 min-h-16 w-full border border-border bg-card p-3 font-mono text-sm text-ink outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                value={body}
                onChange={(event) => setBody(event.target.value)}
                spellCheck={false}
              />
            </label>
          ) : (
            <p className="text-xs text-muted-foreground">{method} thường không có body, nên Content-Length và Content-Type biến mất.</p>
          )}

          <div className="overflow-hidden border border-code-border bg-code text-code-foreground">
            <div className="border-b border-white/10 px-4 py-2 font-mono text-xs text-white/50">Văn bản gửi đi</div>
            <pre className="overflow-x-auto p-4 font-mono text-[0.8rem] leading-6"><code>
              <span className="text-emerald-300">{method}</span> <span className="text-amber-200">{safePath}</span> <span className="text-white/50">HTTP/1.1</span>
              {'\n'}
              {headers.map(([name, value]) => (
                <span key={name}>
                  <span className="text-sky-300">{name}</span>: {value}
                  {'\n'}
                </span>
              ))}
              <span className="text-white/35">(dòng trống: hết header)</span>
              {hasBody ? (
                <>
                  {'\n'}
                  <span className="text-violet-300">{body}</span>
                </>
              ) : null}
            </code></pre>
          </div>

          <div className="overflow-hidden border border-code-border bg-code text-code-foreground">
            <div className="border-b border-white/10 px-4 py-2 font-mono text-xs text-white/50">Lệnh curl tương đương</div>
            <pre className="overflow-x-auto whitespace-pre-wrap break-all p-4 font-mono text-[0.8rem] leading-6"><code>{curlParts.join(' \\\n  ')}</code></pre>
          </div>
        </div>

        <div className="space-y-4 p-4 lg:p-5">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.08em] text-primary">Response</p>

          <div className="flex flex-wrap gap-1.5">
            {statuses.map((item) => (
              <button
                key={item.code}
                type="button"
                onClick={() => setStatusCode(item.code)}
                aria-pressed={statusCode === item.code}
                className={`border px-2.5 py-1.5 font-mono text-xs font-bold ${familyClasses(item.code, statusCode === item.code)} ${statusCode === item.code ? 'ring-1 ring-current' : 'hover:brightness-95'}`}
              >
                {item.code}
              </button>
            ))}
          </div>

          <div className="overflow-hidden border border-code-border bg-code text-code-foreground">
            <div className="border-b border-white/10 px-4 py-2 font-mono text-xs text-white/50">Văn bản nhận về</div>
            <pre className="overflow-x-auto p-4 font-mono text-[0.8rem] leading-6"><code>
              <span className="text-white/50">HTTP/1.1</span> <span className="text-amber-200">{status.code} {status.reason}</span>
              {'\n'}
              {status.headers.map((header) => {
                const [name, ...rest] = header.split(': ');
                return (
                  <span key={header}>
                    <span className="text-sky-300">{name}</span>: {rest.join(': ')}
                    {'\n'}
                  </span>
                );
              })}
              <span className="text-white/35">(dòng trống: hết header)</span>
              {status.body ? (
                <>
                  {'\n'}
                  <span className="text-violet-300">{status.body}</span>
                </>
              ) : null}
            </code></pre>
          </div>

          <div className="border border-border bg-card p-4">
            <p className="font-mono text-xs font-semibold text-muted-foreground">Nghĩa là</p>
            <p className="mt-1 text-sm leading-6 text-ink">{status.meaning}</p>
            <p className="mt-3 font-mono text-xs font-semibold text-muted-foreground">DevOps kiểm tra gì</p>
            <p className="mt-1 text-sm leading-6">{status.check}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
