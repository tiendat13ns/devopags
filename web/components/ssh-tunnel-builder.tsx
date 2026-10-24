'use client';

import { useState } from 'react';
import { ArrowRight, Check, Copy } from 'lucide-react';

type Mode = 'local' | 'remote' | 'dynamic' | 'jump';

type Field = { key: string; label: string; kind: 'port' | 'host' };

type Node = { title: string; sub: string; listen?: string };

type ModeConfig = {
  label: string;
  scenario: string;
  fields: Field[];
  defaults: Record<string, string>;
  command: (v: Record<string, string>) => string;
  nodes: (v: Record<string, string>) => Node[];
  arrows: string[];
  explain: (v: Record<string, string>) => string;
  usage: (v: Record<string, string>) => string;
  caution: string;
};

const modes: Record<Mode, ModeConfig> = {
  local: {
    label: 'Local forward · -L',
    scenario: 'Mở database nội bộ trên laptop',
    fields: [
      { key: 'listen', label: 'Cổng mở trên laptop', kind: 'port' },
      { key: 'host', label: 'Máy đích (nhìn từ bastion)', kind: 'host' },
      { key: 'port', label: 'Cổng đích', kind: 'port' },
      { key: 'via', label: 'SSH tới', kind: 'host' },
    ],
    defaults: { listen: '5433', host: 'db.internal', port: '5432', via: 'dat@bastion.example.com' },
    command: (v) => `ssh -N -L ${v.listen}:${v.host}:${v.port} ${v.via}`,
    nodes: (v) => [
      { title: 'Laptop', sub: 'Bạn chạy lệnh ở đây', listen: `127.0.0.1:${v.listen}` },
      { title: 'Bastion', sub: v.via.split('@').pop() ?? v.via },
      { title: v.host, sub: `cổng ${v.port}` },
    ],
    arrows: ['đường hầm SSH', 'kết nối TCP thường'],
    explain: (v) => `Ai kết nối tới cổng ${v.listen} trên laptop sẽ được chuyển qua đường hầm tới bastion; từ bastion, kết nối được mở tiếp tới ${v.host}:${v.port}. Với database, đây là cách an toàn để truy cập mà không phải mở cổng ra Internet.`,
    usage: (v) => `psql -h 127.0.0.1 -p ${v.listen} -U app mydb`,
    caution: 'Mặc định -L chỉ lắng nghe ở 127.0.0.1. Đừng viết 0.0.0.0:cổng:… trừ khi bạn chủ ý cho cả mạng dùng chung đường hầm của mình.',
  },
  remote: {
    label: 'Remote forward · -R',
    scenario: 'Cho server gọi vào dịch vụ trên laptop',
    fields: [
      { key: 'listen', label: 'Cổng mở trên server', kind: 'port' },
      { key: 'host', label: 'Dịch vụ trên laptop', kind: 'host' },
      { key: 'port', label: 'Cổng dịch vụ', kind: 'port' },
      { key: 'via', label: 'SSH tới', kind: 'host' },
    ],
    defaults: { listen: '8080', host: 'localhost', port: '3000', via: 'dat@server.example.com' },
    command: (v) => `ssh -N -R ${v.listen}:${v.host}:${v.port} ${v.via}`,
    nodes: (v) => [
      { title: 'Server', sub: v.via.split('@').pop() ?? v.via, listen: `127.0.0.1:${v.listen}` },
      { title: 'Laptop', sub: 'Bạn chạy lệnh ở đây' },
      { title: v.host, sub: `cổng ${v.port}` },
    ],
    arrows: ['đường hầm SSH', 'kết nối từ laptop'],
    explain: (v) => `Chiều ngược lại với -L: cổng ${v.listen} được mở trên server. Ai trên server gọi vào đó sẽ đi ngược về laptop và tới ${v.host}:${v.port}. Hữu ích để cho webhook hoặc môi trường staging gọi vào ứng dụng bạn đang phát triển.`,
    usage: (v) => `curl http://127.0.0.1:${v.listen}/   # chạy trên server`,
    caution: 'Cổng mở trên server mặc định chỉ lắng nghe loopback. Bật GatewayPorts ở sshd sẽ mở nó ra mạng, biến laptop của bạn thành cửa vào: hãy cân nhắc kỹ.',
  },
  dynamic: {
    label: 'Dynamic · -D (SOCKS)',
    scenario: 'Duyệt cả mạng nội bộ qua một đường hầm',
    fields: [
      { key: 'listen', label: 'Cổng SOCKS trên laptop', kind: 'port' },
      { key: 'via', label: 'SSH tới', kind: 'host' },
    ],
    defaults: { listen: '1080', via: 'dat@bastion.example.com' },
    command: (v) => `ssh -N -D ${v.listen} ${v.via}`,
    nodes: (v) => [
      { title: 'Laptop', sub: 'Ứng dụng nói SOCKS5', listen: `127.0.0.1:${v.listen}` },
      { title: 'Bastion', sub: v.via.split('@').pop() ?? v.via },
      { title: 'Bất kỳ đích nào', sub: 'wiki.internal, grafana.internal…' },
    ],
    arrows: ['đường hầm SSH', 'bastion tự kết nối tới đích'],
    explain: (v) => `Không cố định một đích như -L: laptop trở thành SOCKS5 proxy ở cổng ${v.listen}, mỗi kết nối của ứng dụng tự chọn đích riêng và bastion mở kết nối thay bạn.`,
    usage: (v) => `curl --socks5-hostname 127.0.0.1:${v.listen} http://wiki.internal/`,
    caution: 'Dùng --socks5-hostname (hoặc đặt proxy DNS trong trình duyệt) để việc phân giải tên cũng đi qua đường hầm; nếu không, tên nội bộ sẽ bị hỏi DNS ở máy bạn và thất bại.',
  },
  jump: {
    label: 'Jump host · -J',
    scenario: 'SSH vào máy private qua bastion',
    fields: [
      { key: 'target', label: 'Máy đích', kind: 'host' },
      { key: 'via', label: 'Bastion (nhảy qua)', kind: 'host' },
    ],
    defaults: { target: 'ubuntu@10.0.1.25', via: 'dat@bastion.example.com' },
    command: (v) => `ssh -J ${v.via} ${v.target}`,
    nodes: (v) => [
      { title: 'Laptop', sub: 'Bạn chạy lệnh ở đây' },
      { title: 'Bastion', sub: v.via.split('@').pop() ?? v.via },
      { title: v.target.split('@').pop() ?? v.target, sub: 'máy trong private subnet' },
    ],
    arrows: ['SSH tới bastion', 'bastion chuyển tiếp TCP'],
    explain: (v) => `Một lệnh duy nhất thay cho hai lần ssh nối tiếp. Phiên SSH được mã hóa đầu cuối giữa laptop và ${v.target.split('@').pop()}; bastion chỉ chuyển tiếp các byte đã mã hóa chứ không đọc được nội dung.`,
    usage: (v) => `scp -J ${v.via} file.txt ${v.target}:~/`,
    caution: 'Không cần mở cổng nào trên laptop và không cần chép private key lên bastion. Tránh dùng agent forwarding (-A) tùy tiện vì bastion bị xâm nhập thì key trong agent có thể bị lợi dụng.',
  },
};

function invalid(field: Field, value: string) {
  if (field.kind === 'port') {
    const number = Number(value);
    return !/^\d+$/.test(value) || number < 1 || number > 65535;
  }
  return !/^[\w.@:-]+$/.test(value);
}

export function SshTunnelBuilder() {
  const [mode, setMode] = useState<Mode>('local');
  const [values, setValues] = useState<Record<Mode, Record<string, string>>>({
    local: modes.local.defaults,
    remote: modes.remote.defaults,
    dynamic: modes.dynamic.defaults,
    jump: modes.jump.defaults,
  });
  const [copied, setCopied] = useState(false);

  const config = modes[mode];
  const current = values[mode];
  const hasError = config.fields.some((field) => invalid(field, current[field.key]));
  const command = config.command(current);
  const nodes = config.nodes(current);

  function update(key: string, value: string) {
    setValues((previous) => ({ ...previous, [mode]: { ...previous[mode], [key]: value.trim() } }));
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="my-8 border border-border bg-surface">
      <div className="border-b border-border px-4 py-3">
        <p className="font-mono text-xs font-semibold text-primary">SSH tunnel builder</p>
        <p className="mt-1 text-sm text-muted-foreground">Chọn bài toán, điền thông tin và xem lệnh cùng sơ đồ ai lắng nghe, ai kết nối.</p>
      </div>

      <div className="grid border-b border-border sm:grid-cols-2 lg:grid-cols-4">
        {(Object.keys(modes) as Mode[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setMode(key)}
            aria-pressed={mode === key}
            className={`border-b border-border px-4 py-3 text-left last:border-b-0 sm:border-r sm:last:border-r-0 lg:border-b-0 ${mode === key ? 'bg-primary-soft' : 'bg-card hover:bg-accent'}`}
          >
            <span className={`block font-mono text-xs font-bold ${mode === key ? 'text-primary' : 'text-ink'}`}>{modes[key].label}</span>
            <span className="mt-0.5 block text-xs text-muted-foreground">{modes[key].scenario}</span>
          </button>
        ))}
      </div>

      <div className="grid gap-3 border-b border-border p-4 sm:grid-cols-2">
        {config.fields.map((field) => {
          const bad = invalid(field, current[field.key]);
          return (
            <label className="block" key={`${mode}-${field.key}`}>
              <span className="font-mono text-xs font-semibold text-muted-foreground">{field.label}</span>
              <input
                className={`mt-1 h-10 w-full border bg-card px-3 font-mono text-sm text-ink outline-none focus:ring-1 ${bad ? 'border-destructive focus:border-destructive focus:ring-destructive' : 'border-border focus:border-primary focus:ring-primary'}`}
                defaultValue={current[field.key]}
                onChange={(event) => update(field.key, event.target.value)}
                spellCheck={false}
                aria-invalid={bad}
              />
              {bad ? <span className="mt-1 block text-xs text-destructive">{field.kind === 'port' ? 'Cổng phải là số từ 1 đến 65535.' : 'Chỉ dùng chữ, số, dấu chấm, @, gạch ngang.'}</span> : null}
            </label>
          );
        })}
      </div>

      <div className="border-b border-border p-4">
        <div className="grid items-stretch gap-2 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
          {nodes.map((node, index) => (
            <div className="contents" key={`${node.title}-${index}`}>
              <div className="border border-border bg-card p-3 text-center">
                <strong className="block break-all text-sm text-ink">{node.title}</strong>
                <span className="mt-0.5 block text-xs text-muted-foreground">{node.sub}</span>
                {node.listen ? (
                  <span className="mt-2 inline-block border border-primary/40 bg-primary-soft px-2 py-0.5 font-mono text-[0.68rem] font-bold text-primary">LISTEN {node.listen}</span>
                ) : null}
              </div>
              {index < nodes.length - 1 ? (
                <div className="flex flex-col items-center justify-center gap-1 px-1 text-center md:min-w-24">
                  <ArrowRight className="rotate-90 text-primary md:rotate-0" size={18} />
                  <span className="text-[0.65rem] leading-4 text-muted-foreground">{config.arrows[index]}</span>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3 p-4 lg:p-5">
        <div className="overflow-hidden border border-code-border bg-code text-code-foreground">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
            <span className="font-mono text-xs text-white/50">Lệnh</span>
            <button
              type="button"
              onClick={copy}
              disabled={hasError}
              className="inline-flex items-center gap-1.5 font-mono text-xs text-white/70 hover:text-white disabled:opacity-40"
            >
              {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? 'Đã chép' : 'Sao chép'}
            </button>
          </div>
          <pre className="overflow-x-auto p-4 font-mono text-sm leading-7"><code>{hasError ? '# Kiểm tra lại các ô bị đánh dấu đỏ' : command}</code></pre>
        </div>

        <p className="text-sm leading-6 text-muted-foreground">{config.explain(current)}</p>

        {!hasError ? (
          <p className="font-mono text-xs text-muted-foreground">
            Sau đó dùng: <span className="break-all font-semibold text-ink">{config.usage(current)}</span>
          </p>
        ) : null}

        <div className="border border-amber-500/30 bg-amber-500/10 p-3 text-xs leading-5 text-muted-foreground">
          <span className="font-bold text-amber-700 dark:text-amber-300">Lưu ý: </span>{config.caution}
        </div>
      </div>
    </div>
  );
}
