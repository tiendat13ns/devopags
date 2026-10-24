import type { Metadata } from 'next';
import { ArticleIntro, ArticleSection, ArticleShell, ReferenceLink } from '@/components/article-shell';
import { TcpUdpLab } from '@/components/tcp-udp-lab';
import { AnnotatedOutput, Callout, Code } from '@/components/network-ui';

export const metadata: Metadata = {
  title: 'TCP và UDP: bắt tay ba bước, port và trạng thái trong ss | tiendat13ns',
  description: 'Hiểu port và socket, so sánh TCP với UDP, xem bắt tay ba bước và truyền lại gói bị mất, đọc trạng thái kết nối bằng ss và phân biệt connection refused với timeout.',
};

const ports = [
  ['22', 'SSH', 'TCP'],
  ['53', 'DNS', 'UDP và TCP'],
  ['80', 'HTTP', 'TCP'],
  ['443', 'HTTPS', 'TCP (HTTP/3 dùng UDP)'],
  ['3306', 'MySQL / MariaDB', 'TCP'],
  ['5432', 'PostgreSQL', 'TCP'],
  ['6379', 'Redis', 'TCP'],
  ['51820', 'WireGuard (mặc định)', 'UDP'],
];

const states = [
  ['LISTEN', 'Server đang chờ kết nối đến', 'Bình thường. Thiếu dòng này nghĩa là service chưa chạy hoặc bind sai địa chỉ.'],
  ['SYN-RECV', 'Server đã nhận SYN, đang chờ ACK cuối', 'Thoáng qua. Nhiều bất thường có thể là SYN flood hoặc backlog quá nhỏ.'],
  ['ESTAB', 'Kết nối đang hoạt động', 'Bình thường. Đếm số lượng để biết tải.'],
  ['TIME-WAIT', 'Kết nối vừa đóng, đang đợi thêm', 'Bình thường, thường rất nhiều trên server bận. Không phải rò rỉ.'],
  ['CLOSE-WAIT', 'Phía bên kia đã đóng, ứng dụng mình chưa đóng', 'Đáng lo nếu tích tụ: gần như luôn là bug quên đóng socket trong ứng dụng.'],
  ['SYN-SENT', 'Mình đã gửi SYN, chưa được trả lời', 'Nhiều và kéo dài: đích không phản hồi, kiểm tra firewall hoặc routing.'],
];

export default function TcpUdpPage() {
  return (
    <ArticleShell currentHref="/bai-viet/tcp-va-udp">
      <ArticleIntro
        eyebrow="Network cho DevOps · Bài 4"
        title="TCP và UDP: bắt tay ba bước, port và trạng thái trong ss"
        description="IP đưa gói tin đến đúng máy, còn TCP và UDP quyết định nó đến đúng chương trình và đến như thế nào. Hiểu hai giao thức này là hiểu phần lớn thông báo lỗi kết nối bạn sẽ gặp."
        date="22/10/2026"
        readTime="17 phút đọc"
        tags={['Network', 'TCP', 'UDP', 'Port']}
      />

      <ArticleSection id="port-va-socket" number="01" eyebrow="Địa chỉ thứ hai" title="Port và socket: tòa nhà và số phòng">
        <p>
          Địa chỉ IP chỉ đưa gói tin đến đúng <em>máy</em>. Nhưng một máy chạy cùng lúc web server, SSH, database… nên cần thêm một con số để chọn đúng chương trình: đó là <strong className="text-ink">port</strong>, từ 0 đến 65535. Nếu IP là địa chỉ tòa nhà thì port là số phòng.
        </p>
        <p>
          Cặp <Code>IP:port</Code> gọi là một <strong className="text-ink">socket</strong>. Một kết nối TCP được nhận diện bằng bốn giá trị: IP nguồn, port nguồn, IP đích, port đích. Nhờ vậy cùng một server port 443 phục vụ được hàng nghìn client cùng lúc: mỗi client có cặp (IP, port nguồn) khác nhau.
        </p>
        <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
          <div className="overflow-x-auto border border-border bg-card">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead className="bg-surface font-mono text-xs uppercase tracking-[0.06em] text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Port</th>
                  <th className="px-4 py-3">Dịch vụ</th>
                  <th className="px-4 py-3">Giao thức</th>
                </tr>
              </thead>
              <tbody>
                {ports.map(([port, name, proto]) => (
                  <tr className="border-t border-border" key={port}>
                    <td className="px-4 py-2 font-mono font-bold text-primary">{port}</td>
                    <td className="px-4 py-2 font-semibold text-ink">{name}</td>
                    <td className="px-4 py-2">{proto}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="space-y-3">
            {[
              ['0 – 1023', 'Well-known', 'Dành cho dịch vụ chuẩn; trên Linux cần quyền root để lắng nghe.'],
              ['1024 – 49151', 'Registered', 'Ứng dụng đăng ký: 3306, 5432, 8080…'],
              ['32768 – 60999', 'Ephemeral (Linux)', 'Client được cấp ngẫu nhiên làm port nguồn. Xem bằng sysctl net.ipv4.ip_local_port_range.'],
            ].map(([range, name, text]) => (
              <div className="border border-border bg-card p-4" key={range}>
                <div className="flex items-baseline justify-between gap-3">
                  <strong className="text-ink">{name}</strong>
                  <span className="font-mono text-xs text-primary">{range}</span>
                </div>
                <p className="mt-1 text-xs leading-5">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </ArticleSection>

      <ArticleSection id="tcp-hay-udp" number="02" eyebrow="Hai triết lý" title="Gọi điện hay thả thư?">
        <div className="grid gap-px border border-border bg-border md:grid-cols-2">
          <div className="bg-card p-5">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.08em] text-primary">TCP · gọi điện thoại</p>
            <ul className="mt-3 space-y-2 text-sm leading-6">
              <li>Alo, nghe rõ không? → bắt tay trước khi nói.</li>
              <li>Nói mất tiếng thì xin nhắc lại → gửi lại gói bị mất.</li>
              <li>Câu nói đến đúng thứ tự → đánh số, sắp xếp lại.</li>
              <li>Người nghe bận thì người nói chậm lại → kiểm soát luồng và tắc nghẽn.</li>
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">Dùng cho: HTTP/1.1 và 2, SSH, database, gửi file, email.</p>
          </div>
          <div className="bg-surface p-5">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.08em] text-primary">UDP · thả thư vào hòm</p>
            <ul className="mt-3 space-y-2 text-sm leading-6">
              <li>Viết xong, thả vào hòm thư, không hỏi nhận chưa.</li>
              <li>Thư có thể mất, trùng hoặc đến sai thứ tự.</li>
              <li>Mỗi lá thư độc lập, không có “cuộc hội thoại”.</li>
              <li>Nhưng rất nhẹ và không có độ trễ bắt tay.</li>
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">Dùng cho: DNS, video call, game, VoIP, WireGuard, QUIC (HTTP/3).</p>
          </div>
        </div>
        <p>
          UDP không “tệ hơn” TCP. Với cuộc gọi video, một khung hình đến trễ 2 giây là vô dụng, thà bỏ qua nó còn hơn chờ truyền lại. Khi cần độ tin cậy mà vẫn muốn linh hoạt, người ta xây độ tin cậy ngay trên UDP: QUIC (nền tảng của HTTP/3) làm đúng như vậy.
        </p>
      </ArticleSection>

      <ArticleSection id="phong-thi-nghiem" number="03" eyebrow="Phòng thí nghiệm" title="Xem bắt tay ba bước và truyền lại gói bị mất">
        <p>
          Trong mô phỏng, hãy làm theo thứ tự: chạy TCP đến cuối để thấy vòng đời đầy đủ của một kết nối; bật “Làm mất gói đầu tiên” để thấy TCP tự hồi phục; rồi chuyển sang UDP và so sánh.
        </p>
        <TcpUdpLab />
        <p>
          Chú ý số thứ tự: nó đếm <em>byte</em>, không đếm gói. Gửi 100 byte bắt đầu từ 1001 thì ACK trả về là 1101. Nhờ cơ chế này TCP biết chính xác thiếu mảnh nào để yêu cầu gửi lại và sắp xếp dữ liệu đến lộn xộn về đúng thứ tự.
        </p>
      </ArticleSection>

      <ArticleSection id="doc-ss" number="04" eyebrow="Trên máy chủ" title="Đọc trạng thái kết nối bằng ss">
        <p>
          Các trạng thái bạn vừa thấy trong mô phỏng chính là cột đầu tiên của lệnh <Code>ss</Code> (thay thế cho <Code>netstat</Code> cũ).
        </p>
        <AnnotatedOutput
          title="ss -tan trên một web server"
          lines={[
            { kind: 'command', text: '$ ss -tan' },
            { text: 'State       Recv-Q Send-Q  Local Address:Port   Peer Address:Port' },
            {
              text: 'LISTEN      0      4096          0.0.0.0:443         0.0.0.0:*',
              note: 'Service đang lắng nghe. Với socket LISTEN, Recv-Q là số kết nối đang chờ accept(), Send-Q là backlog tối đa.',
            },
            { text: 'ESTAB       0      0         10.0.1.15:443    203.0.113.50:51822', note: 'Một client đang kết nối. Port nguồn 51822 là port ephemeral.' },
            { text: 'TIME-WAIT   0      0         10.0.1.15:443    203.0.113.77:49310', note: 'Kết nối đã đóng, đang đợi. Hoàn toàn bình thường.' },
            { text: 'CLOSE-WAIT  1      0         10.0.1.15:8080       10.0.1.30:40112', note: 'Bên kia đã đóng nhưng ứng dụng chưa đóng: để ý nếu số này cứ tăng.' },
          ]}
        />
        <div className="overflow-x-auto border border-border bg-card">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-surface font-mono text-xs uppercase tracking-[0.06em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Nghĩa là</th>
                <th className="px-4 py-3">Khi nào cần lo</th>
              </tr>
            </thead>
            <tbody>
              {states.map(([state, meaning, worry]) => (
                <tr className="border-t border-border" key={state}>
                  <td className="px-4 py-2.5 font-mono text-xs font-bold text-primary">{state}</td>
                  <td className="px-4 py-2.5">{meaning}</td>
                  <td className="px-4 py-2.5">{worry}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ArticleSection>

      <ArticleSection id="refused-hay-timeout" number="05" eyebrow="Kỹ năng quan trọng nhất của bài" title="“Connection refused” và “timed out” là hai chuyện khác nhau">
        <p>
          Hai thông báo này nhìn giống nhau nhưng chỉ về hai hướng điều tra hoàn toàn khác. Học cách phân biệt chúng sẽ tiết kiệm cho bạn hàng giờ.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="border border-border bg-card p-5">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.08em] text-rose-600 dark:text-rose-400">Connection refused</p>
            <p className="mt-2 text-sm leading-6">
              Máy đích <strong className="text-ink">phản hồi ngay</strong> bằng gói RST: “ở đây không có ai nghe port này”. Mạng thông, máy sống; vấn đề nằm ở chỗ không có tiến trình nào LISTEN (service chưa chạy, sai port, bind vào 127.0.0.1) hoặc firewall dùng REJECT.
            </p>
            <p className="mt-3 text-xs text-muted-foreground">Việc nên làm: đăng nhập máy đích, chạy <Code>ss -tlnp</Code> xem service có nghe port và nghe địa chỉ nào.</p>
          </div>
          <div className="border border-border bg-card p-5">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.08em] text-amber-600 dark:text-amber-400">Timed out</p>
            <p className="mt-2 text-sm leading-6">
              <strong className="text-ink">Không có phản hồi nào</strong>: SYN đi vào hư không. Gói tin bị thả im lặng (firewall DROP, Security Group chưa mở), sai route, IP không tồn tại hoặc máy đích tắt.
            </p>
            <p className="mt-3 text-xs text-muted-foreground">Việc nên làm: kiểm tra Security Group, firewall, route table, rồi dùng <Code>traceroute</Code> xem gói tin dừng ở đâu.</p>
          </div>
        </div>
        <AnnotatedOutput
          title="kiểm tra port từ máy khác"
          lines={[
            { kind: 'command', text: '$ nc -zv -w 3 10.0.1.20 5432' },
            { text: 'nc: connect to 10.0.1.20 port 5432 (tcp) failed: Connection refused', note: 'Trả lời tức thì → máy sống, chưa có service nghe port 5432.' },
            { kind: 'command', text: '$ nc -zv -w 3 10.0.1.21 5432' },
            { text: 'nc: connect to 10.0.1.21 port 5432 (tcp) timed out: Operation now in progress', note: 'Chờ hết 3 giây mà im lặng → hãy nghi firewall hoặc đường đi.' },
          ]}
        />
      </ArticleSection>

      <ArticleSection id="cua-so-va-tac-nghen" number="06" eyebrow="Thêm một lớp" title="Vì sao TCP không gửi hết tốc độ ngay lập tức?">
        <p>
          TCP không chỉ đảm bảo dữ liệu đến đủ mà còn tự điều chỉnh tốc độ để không làm quá tải người nhận (<strong className="text-ink">flow control</strong>, qua kích thước cửa sổ nhận) và không làm tắc mạng (<strong className="text-ink">congestion control</strong>, bắt đầu chậm rồi tăng dần). Đó là lý do một kết nối mới mất vài vòng RTT mới đạt tốc độ tối đa, và vì sao dùng lại kết nối (keep-alive) nhanh hơn mở kết nối mới nhiều lần.
        </p>
        <Callout tone="tip" title="Gợi ý thực hành">
          Chạy <Code>ss -ti dst 198.51.100.20</Code> trong khi tải dữ liệu để xem <Code>rtt</Code>, <Code>cwnd</Code> (cửa sổ tắc nghẽn) và <Code>retrans</Code> (số lần truyền lại). Nếu retrans tăng đều, đường truyền đang mất gói.
        </Callout>
      </ArticleSection>

      <section id="references" className="mt-14 scroll-mt-24 border-t border-border pt-10">
        <p className="section-eyebrow">Đọc thêm</p>
        <h2 className="article-h2">Tài liệu tham khảo</h2>
        <ul className="mt-5 space-y-3 text-sm">
          <ReferenceLink href="https://www.rfc-editor.org/rfc/rfc9293" label="RFC 9293 — Transmission Control Protocol (TCP)" />
          <ReferenceLink href="https://www.rfc-editor.org/rfc/rfc768" label="RFC 768 — User Datagram Protocol (UDP)" />
          <ReferenceLink href="https://man7.org/linux/man-pages/man8/ss.8.html" label="man ss — các tùy chọn và ý nghĩa cột" />
        </ul>
      </section>
    </ArticleShell>
  );
}
