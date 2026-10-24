'use client';

import { useState } from 'react';
import { RotateCcw } from 'lucide-react';

type Entry = {
  id: number;
  insideIp: string;
  insidePort: number;
  outsidePort: number;
  destination: string;
};

type LogEvent = {
  tone: 'ok' | 'drop' | 'info';
  title: string;
  lines: string[];
  note: string;
};

const PUBLIC_IP = '203.0.113.5';

const clients = [
  { name: 'PC-1', ip: '192.168.1.10' },
  { name: 'PC-2', ip: '192.168.1.11' },
  { name: 'PC-3', ip: '192.168.1.12' },
];

const destinations = [
  { label: 'Web server', ip: '198.51.100.20', port: 443 },
  { label: 'DNS server', ip: '198.51.100.53', port: 53 },
];

const toneClasses = {
  ok: 'border-emerald-500/40 bg-emerald-500/10',
  drop: 'border-rose-500/40 bg-rose-500/10',
  info: 'border-border bg-card',
};

export function NatSimulator() {
  const [clientIndex, setClientIndex] = useState(0);
  const [destinationIndex, setDestinationIndex] = useState(0);
  const [sameSourcePort, setSameSourcePort] = useState(true);
  const [forwarding, setForwarding] = useState(false);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [counter, setCounter] = useState(0);
  const [event, setEvent] = useState<LogEvent | null>(null);

  const client = clients[clientIndex];
  const destination = destinations[destinationIndex];

  function sendOutbound() {
    const insidePort = sameSourcePort ? 50000 : 50000 + counter * 7;
    const destinationText = `${destination.ip}:${destination.port}`;
    const existing = entries.find(
      (entry) => entry.insideIp === client.ip && entry.insidePort === insidePort && entry.destination === destinationText,
    );

    setCounter((value) => value + 1);

    if (existing) {
      setEvent({
        tone: 'info',
        title: `${client.name} gửi thêm gói trong cùng một kết nối`,
        lines: [
          `Trước NAT:  ${client.ip}:${insidePort} → ${destinationText}`,
          `Sau NAT:    ${PUBLIC_IP}:${existing.outsidePort} → ${destinationText}`,
        ],
        note: 'Router đã có entry cho kết nối này nên chỉ dịch lại theo bảng, không tạo thêm dòng mới.',
      });
      return;
    }

    let outsidePort = insidePort;
    while (entries.some((entry) => entry.outsidePort === outsidePort)) outsidePort += 1;
    const changed = outsidePort !== insidePort;

    setEntries((current) => [
      ...current,
      { id: counter, insideIp: client.ip, insidePort, outsidePort, destination: destinationText },
    ]);
    setEvent({
      tone: 'ok',
      title: `${client.name} ra Internet qua NAT`,
      lines: [
        `Trước NAT:  ${client.ip}:${insidePort} → ${destinationText}`,
        `Sau NAT:    ${PUBLIC_IP}:${outsidePort} → ${destinationText}`,
        `Gói trả về: ${destinationText} → ${PUBLIC_IP}:${outsidePort}`,
        `Router dịch ngược: → ${client.ip}:${insidePort}`,
      ],
      note: changed
        ? `Port ${insidePort} đã được máy khác dùng nên router đổi sang ${outsidePort}. Đây là lý do kỹ thuật này tên là PAT (Port Address Translation): nhiều máy dùng chung một IP public nhờ phân biệt bằng port.`
        : 'Router thay IP nguồn private bằng IP public của nó, ghi vào bảng NAT để biết gói trả về thuộc về máy nào.',
    });
  }

  function sendUnsolicited() {
    setEvent({
      tone: 'drop',
      title: 'Gói từ Internet gửi thẳng vào, không ai yêu cầu',
      lines: [`Đến:  198.51.100.99:4444 → ${PUBLIC_IP}:443`, 'Tra bảng NAT: không có entry nào khớp'],
      note: 'Router không biết chuyển cho máy nào trong LAN, nên bỏ gói. Đây là lý do máy trong mạng riêng mặc định không bị truy cập trực tiếp từ ngoài, dù không cần firewall.',
    });
  }

  function sendToForwardedPort() {
    if (!forwarding) {
      setEvent({
        tone: 'drop',
        title: `Gói từ Internet tới ${PUBLIC_IP}:8080`,
        lines: ['Đến:  198.51.100.99:5555 → ' + PUBLIC_IP + ':8080', 'Không có entry NAT và cũng chưa có rule port forwarding'],
        note: 'Bị bỏ. Hãy bật “Port forwarding” bên cạnh rồi thử lại.',
      });
      return;
    }
    setEvent({
      tone: 'ok',
      title: 'Port forwarding (DNAT) cho gói đi vào',
      lines: [
        `Đến:  198.51.100.99:5555 → ${PUBLIC_IP}:8080`,
        'Khớp rule: 8080 → 192.168.1.11:80',
        'Sau DNAT: 198.51.100.99:5555 → 192.168.1.11:80',
      ],
      note: 'Rule do người quản trị tạo, nên router biết đích là PC-2. Router tự thêm entry để gói trả lời của PC-2 được dịch ngược đúng đường.',
    });
  }

  function reset() {
    setEntries([]);
    setCounter(0);
    setEvent(null);
  }

  return (
    <div className="my-8 border border-border bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div>
          <p className="font-mono text-xs font-semibold text-primary">NAT simulator</p>
          <p className="mt-1 text-sm text-muted-foreground">Router có IP public {PUBLIC_IP}. Ba máy trong LAN lần lượt ra ngoài, hãy xem bảng NAT lớn dần.</p>
        </div>
        <button type="button" onClick={reset} className="inline-flex items-center gap-1.5 border border-border bg-card px-3 py-2 text-xs font-semibold text-ink hover:border-primary">
          <RotateCcw size={13} /> Xóa bảng NAT
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-4 border-b border-border p-4 lg:border-b-0 lg:border-r lg:p-5">
          <div>
            <p className="font-mono text-xs font-semibold text-muted-foreground">1. Máy nào gửi?</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {clients.map((item, index) => (
                <button key={item.name} type="button" onClick={() => setClientIndex(index)} aria-pressed={clientIndex === index} className={`border px-3 py-2 text-xs font-semibold ${clientIndex === index ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-ink hover:border-primary'}`}>
                  {item.name} <span className="font-mono opacity-70">{item.ip}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="font-mono text-xs font-semibold text-muted-foreground">2. Gửi tới đâu?</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {destinations.map((item, index) => (
                <button key={item.label} type="button" onClick={() => setDestinationIndex(index)} aria-pressed={destinationIndex === index} className={`border px-3 py-2 text-xs font-semibold ${destinationIndex === index ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-ink hover:border-primary'}`}>
                  {item.label} <span className="font-mono opacity-70">{item.ip}:{item.port}</span>
                </button>
              ))}
            </div>
          </div>

          <label className="flex cursor-pointer items-start gap-2 text-sm">
            <input type="checkbox" checked={sameSourcePort} onChange={(e) => setSameSourcePort(e.target.checked)} className="mt-1 accent-[var(--primary)]" />
            <span>Mọi máy đều chọn source port <span className="font-mono">50000</span> <span className="text-muted-foreground">(để thấy router xử lý đụng port)</span></span>
          </label>

          <button type="button" onClick={sendOutbound} className="w-full border border-primary bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">
            Gửi kết nối ra Internet
          </button>

          <div className="border-t border-border pt-4">
            <p className="font-mono text-xs font-semibold text-muted-foreground">Chiều ngược lại: từ Internet vào</p>
            <label className="mt-2 flex cursor-pointer items-start gap-2 text-sm">
              <input type="checkbox" checked={forwarding} onChange={(e) => setForwarding(e.target.checked)} className="mt-1 accent-[var(--primary)]" />
              <span>Bật port forwarding <span className="font-mono">{PUBLIC_IP}:8080 → 192.168.1.11:80</span></span>
            </label>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <button type="button" onClick={sendUnsolicited} className="border border-border bg-card px-3 py-2 text-xs font-semibold text-ink hover:border-primary">
                Gói lạ tới :443
              </button>
              <button type="button" onClick={sendToForwardedPort} className="border border-border bg-card px-3 py-2 text-xs font-semibold text-ink hover:border-primary">
                Gói tới :8080
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4 p-4 lg:p-5">
          <div>
            <p className="font-mono text-xs font-semibold text-muted-foreground">Bảng NAT của router</p>
            <div className="mt-2 overflow-x-auto border border-border bg-card">
              <table className="w-full min-w-[420px] text-left font-mono text-xs">
                <thead className="bg-surface text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-semibold">Bên trong</th>
                    <th className="px-3 py-2 font-semibold">Bên ngoài</th>
                    <th className="px-3 py-2 font-semibold">Đích</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.length === 0 ? (
                    <tr><td className="px-3 py-3 text-muted-foreground" colSpan={3}>(trống: chưa có kết nối nào)</td></tr>
                  ) : (
                    entries.map((entry) => (
                      <tr className="border-t border-border" key={entry.id}>
                        <td className="px-3 py-2 text-ink">{entry.insideIp}:{entry.insidePort}</td>
                        <td className="px-3 py-2 text-primary">{PUBLIC_IP}:{entry.outsidePort}</td>
                        <td className="px-3 py-2">{entry.destination}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className={`border p-4 ${event ? toneClasses[event.tone] : toneClasses.info}`}>
            {event ? (
              <>
                <p className="text-sm font-bold text-ink">{event.title}</p>
                <pre className="mt-2 overflow-x-auto font-mono text-[0.72rem] leading-6 text-ink">{event.lines.join('\n')}</pre>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{event.note}</p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Bấm “Gửi kết nối ra Internet” để bắt đầu. Kết quả dịch địa chỉ sẽ hiện ở đây.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
