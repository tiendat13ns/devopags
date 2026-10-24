'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

type Message = {
  dir: 'right' | 'left' | 'note';
  label: string;
  sub?: string;
  lost?: boolean;
  client: string;
  server: string;
  text: string;
};

function tcpSteps(loss: boolean): Message[] {
  const open: Message[] = [
    {
      dir: 'note',
      label: 'Bắt đầu',
      client: 'CLOSED',
      server: 'LISTEN',
      text: 'Server đã mở socket và đang LISTEN trên port 443. Client chưa có kết nối nào với server này.',
    },
    {
      dir: 'right',
      label: 'SYN',
      sub: 'seq=1000',
      client: 'SYN_SENT',
      server: 'LISTEN',
      text: 'Client chọn một số thứ tự ban đầu (ISN) ngẫu nhiên và nói: “Tôi muốn kết nối, tôi sẽ đếm từ 1000.”',
    },
    {
      dir: 'left',
      label: 'SYN, ACK',
      sub: 'seq=5000 ack=1001',
      client: 'SYN_SENT',
      server: 'SYN_RECEIVED',
      text: 'Server đồng ý (ack=1001: “tôi đã nhận số 1000, đang chờ 1001”) và chọn số thứ tự của riêng mình là 5000.',
    },
    {
      dir: 'right',
      label: 'ACK',
      sub: 'ack=5001',
      client: 'ESTABLISHED',
      server: 'ESTABLISHED',
      text: 'Client xác nhận số 5000 của server. Cả hai bên đã ESTABLISHED: ba bước bắt tay xong, giờ mới có thể gửi dữ liệu.',
    },
  ];

  const request: Message[] = loss
    ? [
        {
          dir: 'right',
          label: 'GET / (100 byte)',
          sub: 'seq=1001',
          lost: true,
          client: 'ESTABLISHED',
          server: 'ESTABLISHED',
          text: 'Segment chứa request bị mất trên đường (switch quá tải, Wi-Fi nhiễu…). Server không nhận được gì.',
        },
        {
          dir: 'note',
          label: 'Hết RTO — không thấy ACK',
          client: 'ESTABLISHED',
          server: 'ESTABLISHED',
          text: 'Client giữ bản sao dữ liệu chưa được xác nhận. Khi hết thời gian chờ (RTO), nó biết có chuyện và gửi lại. Đây chính là thứ làm TCP “đáng tin cậy”.',
        },
        {
          dir: 'right',
          label: 'GET / (gửi lại)',
          sub: 'seq=1001',
          client: 'ESTABLISHED',
          server: 'ESTABLISHED',
          text: 'Cùng số thứ tự 1001, nên server hiểu đây là cùng một dữ liệu. Ứng dụng không hề biết đã có một lần mất gói.',
        },
      ]
    : [
        {
          dir: 'right',
          label: 'GET / (100 byte)',
          sub: 'seq=1001',
          client: 'ESTABLISHED',
          server: 'ESTABLISHED',
          text: 'Client gửi request HTTP: 100 byte, bắt đầu từ số thứ tự 1001.',
        },
      ];

  const rest: Message[] = [
    {
      dir: 'left',
      label: 'ACK',
      sub: 'ack=1101',
      client: 'ESTABLISHED',
      server: 'ESTABLISHED',
      text: 'ack=1101 nghĩa là “tôi đã nhận đủ đến byte 1100, đang chờ byte 1101”. ACK luôn là số byte kế tiếp bên nhận mong đợi.',
    },
    {
      dir: 'left',
      label: '200 OK (500 byte)',
      sub: 'seq=5001',
      client: 'ESTABLISHED',
      server: 'ESTABLISHED',
      text: 'Server trả response. Hai chiều có số thứ tự độc lập với nhau.',
    },
    {
      dir: 'right',
      label: 'ACK',
      sub: 'ack=5501',
      client: 'ESTABLISHED',
      server: 'ESTABLISHED',
      text: 'Client xác nhận đã nhận đủ response.',
    },
    {
      dir: 'right',
      label: 'FIN, ACK',
      sub: 'seq=1101',
      client: 'FIN_WAIT_1',
      server: 'ESTABLISHED',
      text: 'Client muốn đóng kết nối: “tôi không còn gì để gửi nữa”.',
    },
    {
      dir: 'left',
      label: 'ACK',
      sub: 'ack=1102',
      client: 'FIN_WAIT_2',
      server: 'CLOSE_WAIT',
      text: 'Server xác nhận. Nó vào CLOSE_WAIT: đang chờ ứng dụng của mình gọi close(). Nếu ứng dụng quên đóng, bạn sẽ thấy rất nhiều CLOSE_WAIT.',
    },
    {
      dir: 'left',
      label: 'FIN, ACK',
      sub: 'seq=5501',
      client: 'FIN_WAIT_2',
      server: 'LAST_ACK',
      text: 'Ứng dụng phía server đã đóng socket nên server cũng gửi FIN.',
    },
    {
      dir: 'right',
      label: 'ACK',
      sub: 'ack=5502',
      client: 'TIME_WAIT',
      server: 'CLOSED',
      text: 'Server đóng hẳn. Client đợi thêm một khoảng (TIME_WAIT, khoảng 60 giây trên Linux) để chắc chắn ACK cuối đến nơi và gói tin lạc không lẫn vào kết nối sau.',
    },
  ];

  return [...open, ...request, ...rest];
}

function udpSteps(loss: boolean): Message[] {
  const start: Message = {
    dir: 'note',
    label: 'Bắt đầu',
    client: '—',
    server: '—',
    text: 'UDP không có bắt tay và không có trạng thái kết nối. Server chỉ bind port 53 và chờ; client gửi được ngay.',
  };

  const query: Message = {
    dir: 'right',
    label: 'Datagram',
    sub: 'DNS query · 49152 → 53',
    lost: loss,
    client: '—',
    server: '—',
    text: loss
      ? 'Datagram bị mất. Không có ACK, không có cảnh báo: tầng giao vận hoàn toàn không biết.'
      : 'Client gửi một datagram duy nhất chứa câu hỏi. Không cần bắt tay nên chỉ tốn một lượt đi.',
  };

  if (loss) {
    return [
      start,
      query,
      {
        dir: 'note',
        label: 'Ứng dụng tự timeout',
        client: '—',
        server: '—',
        text: 'Việc phát hiện mất gói là trách nhiệm của ứng dụng. Với DNS, resolver tự đặt timer và hỏi lại (thường sau vài trăm ms đến vài giây).',
      },
      { ...query, lost: false, label: 'Datagram (gửi lại)', text: 'Lần thử thứ hai thành công. Ứng dụng đã tự lo độ tin cậy, đổi lại UDP cho nó toàn quyền quyết định thử lại nhanh hay chậm.' },
      { dir: 'left', label: 'Datagram', sub: 'DNS answer · 53 → 49152', client: '—', server: '—', text: 'Server trả lời bằng một datagram. Mỗi datagram độc lập, không có thứ tự hay quan hệ nào với datagram khác.' },
    ];
  }

  return [
    start,
    query,
    { dir: 'left', label: 'Datagram', sub: 'DNS answer · 53 → 49152', client: '—', server: '—', text: 'Server trả lời bằng một datagram. Xong: hai gói tin cho toàn bộ cuộc trao đổi, không cần dọn dẹp gì thêm.' },
  ];
}

const CLIENT_X = 130;
const SERVER_X = 570;
const ROW = 46;

export function TcpUdpLab() {
  const [protocol, setProtocol] = useState<'tcp' | 'udp'>('tcp');
  const [loss, setLoss] = useState(false);
  const [index, setIndex] = useState(0);

  const steps = protocol === 'tcp' ? tcpSteps(loss) : udpSteps(loss);
  const current = steps[index];
  const visible = steps.slice(0, index + 1);
  const height = 78 + visible.length * ROW;

  function reset(nextProtocol: 'tcp' | 'udp', nextLoss: boolean) {
    setProtocol(nextProtocol);
    setLoss(nextLoss);
    setIndex(0);
  }

  return (
    <div className="my-8 border border-border bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div>
          <p className="font-mono text-xs font-semibold text-primary">TCP / UDP lab</p>
          <p className="mt-1 text-sm text-muted-foreground">Bấm “Tiếp” để xem từng gói tin xuất hiện và trạng thái hai đầu thay đổi.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {(['tcp', 'udp'] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => reset(value, loss)}
              aria-pressed={protocol === value}
              className={`border px-3 py-2 font-mono text-xs font-semibold uppercase ${protocol === value ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-ink hover:border-primary'}`}
            >
              {value}
            </button>
          ))}
          <label className="inline-flex cursor-pointer items-center gap-2 border border-border bg-card px-3 py-2 text-xs font-semibold text-ink">
            <input type="checkbox" checked={loss} onChange={(event) => reset(protocol, event.target.checked)} className="accent-[var(--primary)]" />
            Làm mất gói đầu tiên
          </label>
        </div>
      </div>

      <div className="border-b border-border p-3 sm:p-4">
        <p className="sr-only">{`Sơ đồ trao đổi gói tin ${protocol.toUpperCase()}: ${current.text}`}</p>
        <div className="overflow-x-auto">
          <svg viewBox={`0 0 700 ${height}`} className="min-w-[600px] w-full border border-border bg-card" aria-hidden="true">
            <defs>
              <marker id="tcp-arrow-active" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0 0 L10 5 L0 10 Z" fill="var(--primary)" />
              </marker>
              <marker id="tcp-arrow-muted" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0 0 L10 5 L0 10 Z" fill="var(--muted-foreground)" />
              </marker>
            </defs>

            {[['Client', CLIENT_X], ['Server', SERVER_X]].map(([label, x]) => (
              <g key={label}>
                <rect x={Number(x) - 40} y="12" width="80" height="28" fill="var(--primary-soft)" stroke="var(--primary)" />
                <text x={x} y="31" textAnchor="middle" fill="var(--primary-dark)" fontSize="12" fontWeight="700">{label}</text>
                <line x1={x} y1="40" x2={x} y2={height - 10} stroke="var(--border)" strokeWidth="2" strokeDasharray="4 4" />
              </g>
            ))}

            {visible.map((message, rowIndex) => {
              const y = 78 + rowIndex * ROW;
              const isCurrent = rowIndex === index;
              const color = isCurrent ? 'var(--primary)' : 'var(--muted-foreground)';
              const marker = isCurrent ? 'url(#tcp-arrow-active)' : 'url(#tcp-arrow-muted)';
              const mid = (CLIENT_X + SERVER_X) / 2;
              const fromX = message.dir === 'right' ? CLIENT_X : SERVER_X;
              const toX = message.dir === 'right' ? (message.lost ? mid + 20 : SERVER_X) : CLIENT_X;

              return (
                <g key={rowIndex} opacity={isCurrent ? 1 : 0.7}>
                  <text x={CLIENT_X - 12} y={y + 4} textAnchor="end" fill="var(--muted-foreground)" fontSize="10" fontFamily="var(--font-mono)">{message.client}</text>
                  <text x={SERVER_X + 12} y={y + 4} textAnchor="start" fill="var(--muted-foreground)" fontSize="10" fontFamily="var(--font-mono)">{message.server}</text>

                  {message.dir === 'note' ? (
                    <text x={mid} y={y + 4} textAnchor="middle" fill={color} fontSize="12" fontStyle="italic">{message.label}</text>
                  ) : (
                    <>
                      <line x1={fromX} y1={y} x2={toX} y2={y} stroke={color} strokeWidth={isCurrent ? 2.5 : 1.8} markerEnd={message.lost ? undefined : marker} />
                      {message.lost ? (
                        <text x={toX + 8} y={y + 5} fill="var(--destructive)" fontSize="16" fontWeight="700">✗</text>
                      ) : null}
                      <text x={mid} y={y - 8} textAnchor="middle" fill={isCurrent ? 'var(--ink)' : 'var(--muted-foreground)'} fontSize="12" fontWeight="700">
                        {message.label}
                        {message.sub ? <tspan fontWeight="400" fontFamily="var(--font-mono)" fontSize="10"> {message.sub}</tspan> : null}
                      </text>
                    </>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      <div className="grid gap-4 p-4 lg:grid-cols-[1.4fr_1fr] lg:p-5">
        <div>
          <p className="font-mono text-xs font-semibold text-primary">Bước {index + 1}/{steps.length}</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{current.text}</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="border border-border bg-card p-3">
            <span className="text-xs text-muted-foreground">Trạng thái client</span>
            <strong className="mt-1 block font-mono text-xs text-ink">{current.client}</strong>
          </div>
          <div className="border border-border bg-card p-3">
            <span className="text-xs text-muted-foreground">Trạng thái server</span>
            <strong className="mt-1 block font-mono text-xs text-ink">{current.server}</strong>
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
