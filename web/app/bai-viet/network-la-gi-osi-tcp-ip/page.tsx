import type { Metadata } from 'next';
import Link from 'next/link';
import { ArticleIntro, ArticleSection, ArticleShell, ReferenceLink } from '@/components/article-shell';
import { NetworkEncapsulationExplorer } from '@/components/network-encapsulation-explorer';
import { AnnotatedOutput, Callout, Code } from '@/components/network-ui';

export const metadata: Metadata = {
  title: 'Network là gì? Hành trình của một request qua OSI và TCP/IP | tiendat13ns',
  description: 'Lần theo một lệnh curl để hiểu DNS, TCP, TLS, HTTP, cách dữ liệu được đóng gói qua các tầng và cách dùng mô hình tầng để debug network.',
};

const journey = [
  {
    step: 'DNS',
    title: 'Tên miền thành địa chỉ IP',
    text: 'Máy bạn chưa biết example.com nằm ở đâu, nên hỏi DNS để lấy địa chỉ IP.',
    href: '/bai-viet/dns-hoat-dong-the-nao',
  },
  {
    step: 'TCP',
    title: 'Dựng một kết nối đáng tin cậy',
    text: 'Hai bên bắt tay ba bước để thống nhất số thứ tự trước khi trao đổi dữ liệu.',
    href: '/bai-viet/tcp-va-udp',
  },
  {
    step: 'TLS',
    title: 'Mã hóa và kiểm tra danh tính',
    text: 'Server xuất trình chứng chỉ, hai bên thỏa thuận khóa để mọi thứ sau đó được mã hóa.',
    href: '/bai-viet/http-https-tls',
  },
  {
    step: 'HTTP',
    title: 'Hỏi và đáp',
    text: 'Cuối cùng mới đến request GET / và response chứa nội dung trang web.',
    href: '/bai-viet/http-https-tls',
  },
];

const osiRows = [
  ['7', 'Application', 'HTTP, DNS, SSH, SMTP', 'Nginx, Ingress, ALB, API Gateway'],
  ['6', 'Presentation', 'Mã hóa, nén, định dạng dữ liệu', 'TLS thường được xếp ở đây'],
  ['5', 'Session', 'Thiết lập và duy trì phiên', 'Trong thực tế gộp vào tầng 7'],
  ['4', 'Transport', 'TCP, UDP, port', 'Security Group, Network Load Balancer'],
  ['3', 'Network', 'IP, ICMP, routing', 'Route table, subnet, router'],
  ['2', 'Data Link', 'Ethernet, Wi-Fi, ARP, MAC', 'Switch, VLAN, card mạng ảo'],
  ['1', 'Physical', 'Cáp, sóng radio, tín hiệu', 'Datacenter lo giúp bạn'],
];

const series = [
  ['01', 'Network là gì và mô hình tầng', '/bai-viet/network-la-gi-osi-tcp-ip'],
  ['02', 'IP, Subnet và CIDR', '/bai-viet/ip-subnet-cidr'],
  ['03', 'MAC, ARP, Switch và Router', '/bai-viet/mac-arp-switch-router'],
  ['04', 'TCP và UDP', '/bai-viet/tcp-va-udp'],
  ['05', 'DNS', '/bai-viet/dns-hoat-dong-the-nao'],
  ['06', 'HTTP, HTTPS và TLS', '/bai-viet/http-https-tls'],
  ['07', 'DHCP, NAT và Port Forwarding', '/bai-viet/dhcp-nat-port-forwarding'],
  ['08', 'Firewall cơ bản', '/bai-viet/firewall-co-ban'],
  ['09', 'Reverse Proxy và Load Balancer', '/bai-viet/reverse-proxy-load-balancer'],
  ['10', 'SSH, Tunnel và VPN', '/bai-viet/ssh-tunnel-vpn'],
];

export default function NetworkOverviewPage() {
  return (
    <ArticleShell currentHref="/bai-viet/network-la-gi-osi-tcp-ip">
      <ArticleIntro
        eyebrow="Network cho DevOps · Bài 1"
        title="Network là gì? Hành trình của một request qua OSI và TCP/IP"
        description="Thay vì học thuộc bảng bảy tầng, hãy đi theo một lệnh curl từ máy bạn đến server và quay về. Mỗi chặng của hành trình đó sau này đều là một chỗ có thể hỏng."
        date="22/10/2026"
        readTime="14 phút đọc"
        tags={['Network', 'OSI', 'TCP/IP', 'Cơ bản']}
      />

      <div className="border-l-4 border-primary bg-card p-5 sm:p-6">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.08em] text-primary">Tình huống</p>
        <p className="mt-2 text-base leading-7 text-ink">
          Sáng thứ Hai, ticket đầu tiên của bạn chỉ có một dòng: <em>“Web không vào được.”</em>
        </p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Có thể là DNS trả sai IP, port bị firewall chặn, chứng chỉ hết hạn hoặc ứng dụng treo. Người biết network không đoán mò; họ biết chia hành trình thành từng chặng và kiểm tra từng chặng một.
        </p>
      </div>

      <ArticleSection id="network-la-gi" number="01" eyebrow="Khái niệm" title="Network là gì và vì sao DevOps không né được?">
        <p>
          Network là tập hợp các thiết bị được nối với nhau để trao đổi dữ liệu theo những quy ước chung gọi là <strong className="text-ink">protocol</strong>. Mọi thứ bạn làm hằng ngày với tư cách DevOps — gọi API, kéo Docker image, SSH vào server, deploy lên cloud — đều là dữ liệu đi qua một mạng nào đó.
        </p>
        <p>
          Hầu hết sự cố “kỳ lạ” nghe như lỗi ứng dụng nhưng gốc lại ở mạng: service A gọi service B bị timeout, container không phân giải được tên, pipeline không kéo được package. Mọi vấn đề network quy về ba câu hỏi:
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ['Ai là ai?', 'Địa chỉ: IP, MAC, port, tên miền. Gói tin cần biết gửi đến đâu.'],
            ['Đi đường nào?', 'Định tuyến: subnet, gateway, router quyết định chặng tiếp theo.'],
            ['Nói bằng ngôn ngữ gì?', 'Protocol: TCP, UDP, HTTP, TLS, DNS… hai bên phải hiểu cùng một quy ước.'],
          ].map(([title, text], index) => (
            <div className="border border-border bg-card p-4" key={title}>
              <span className="font-mono text-xs font-bold text-primary">Câu hỏi {index + 1}</span>
              <h3 className="mt-2 font-bold text-ink">{title}</h3>
              <p className="mt-1 text-sm leading-6">{text}</p>
            </div>
          ))}
        </div>
      </ArticleSection>

      <ArticleSection id="mot-lan-curl" number="02" eyebrow="Hành trình" title="Một lệnh curl, bốn chặng">
        <p>
          Khi bạn gõ <Code>curl https://example.com</Code>, trước khi nhận được chữ nào của trang web, máy bạn phải đi qua bốn pha liên tiếp. Mỗi pha ứng với một bài trong series này.
        </p>

        <ol className="relative space-y-0 border-l-2 border-primary/30 pl-6">
          {journey.map((item, index) => (
            <li className="relative pb-6 last:pb-0" key={item.step}>
              <span className="absolute -left-[2.2rem] top-0 grid size-7 place-items-center border-2 border-primary bg-background font-mono text-[0.7rem] font-bold text-primary">
                {index + 1}
              </span>
              <p className="font-mono text-xs font-bold uppercase tracking-[0.08em] text-primary">{item.step}</p>
              <h3 className="mt-1 font-bold text-ink">{item.title}</h3>
              <p className="mt-1 text-sm leading-6">{item.text}</p>
              <Link className="mt-2 inline-block text-sm font-semibold text-primary hover:underline" href={item.href}>Đọc bài tương ứng →</Link>
            </li>
          ))}
        </ol>

        <p>
          Bạn không phải đoán pha nào chậm. <Code>curl</Code> có thể báo thời gian đã trôi qua đến cuối mỗi pha:
        </p>
        <AnnotatedOutput
          title="đo từng chặng của một request"
          lines={[
            {
              kind: 'command',
              text: "$ curl -o /dev/null -s -w 'dns=%{time_namelookup} tcp=%{time_connect} tls=%{time_appconnect} ttfb=%{time_starttransfer} total=%{time_total}\\n' https://example.com",
            },
            {
              text: 'dns=0.012 tcp=0.045 tls=0.121 ttfb=0.190 total=0.192',
              note: 'Các số là mốc thời gian cộng dồn (giây), không phải thời lượng riêng của từng pha.',
            },
            { text: '→ DNS mất 12 ms', note: 'time_namelookup: từ lúc bắt đầu đến khi có IP.' },
            { text: '→ TCP mất 45 − 12 = 33 ms', note: 'time_connect trừ đi mốc DNS: gần bằng một RTT tới server.' },
            { text: '→ TLS mất 121 − 45 = 76 ms', note: 'time_appconnect trừ time_connect: thời gian bắt tay TLS.' },
            { text: '→ Server xử lý mất 190 − 121 = 69 ms', note: 'time_starttransfer trừ time_appconnect: gần với thời gian ứng dụng suy nghĩ cộng RTT.' },
          ]}
        />
      </ArticleSection>

      <ArticleSection id="dong-goi" number="03" eyebrow="Cơ chế cốt lõi" title="Đóng gói: mỗi tầng thêm một lớp phong bì">
        <p>
          Dữ liệu của ứng dụng không đi thẳng ra dây. Khi đi xuống, mỗi tầng bọc nó vào một “phong bì” riêng có địa chỉ phù hợp với việc của tầng đó. Quá trình này gọi là <strong className="text-ink">encapsulation</strong>. Phía nhận làm ngược lại, <strong className="text-ink">decapsulation</strong>: bóc từng lớp phong bì cho đến khi ứng dụng nhận được dữ liệu gốc.
        </p>
        <NetworkEncapsulationExplorer />
        <p>
          Điều đáng nhớ nhất khi chơi với mô phỏng trên: <strong className="text-ink">mỗi thiết bị chỉ cần đọc đến tầng của nó</strong>. Switch chỉ nhìn header Ethernet; router bóc Ethernet để đọc header IP rồi đóng lại bằng Ethernet mới; chỉ máy đích mới đọc đến TCP và dữ liệu ứng dụng. Đó là lý do bạn có thể đổi cáp, đổi router hay đổi Wi-Fi mà ứng dụng không hề biết.
        </p>
      </ArticleSection>

      <ArticleSection id="osi-tcp-ip" number="04" eyebrow="Bảng tra" title="OSI bảy tầng và TCP/IP bốn tầng">
        <p>
          Mô hình <strong className="text-ink">OSI</strong> chia mạng thành bảy tầng để tiện học và trao đổi. Thứ thực sự chạy trên Internet là bộ giao thức <strong className="text-ink">TCP/IP</strong>, gộp lại thành bốn tầng: Application (OSI 5–7), Transport (4), Internet (3) và Link (1–2). Khi đồng nghiệp nói “lỗi ở layer 7” hay “load balancer layer 4”, họ đang dùng cách đánh số của OSI.
        </p>
        <div className="overflow-x-auto border border-border bg-card">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-surface font-mono text-xs uppercase tracking-[0.06em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Tầng</th>
                <th className="px-4 py-3">Tên</th>
                <th className="px-4 py-3">Thuộc về tầng này</th>
                <th className="px-4 py-3">Bạn gặp ở đâu</th>
              </tr>
            </thead>
            <tbody>
              {osiRows.map(([layer, name, protocols, devops]) => (
                <tr className="border-t border-border" key={layer}>
                  <td className="px-4 py-3 font-mono font-bold text-primary">L{layer}</td>
                  <td className="px-4 py-3 font-semibold text-ink">{name}</td>
                  <td className="px-4 py-3">{protocols}</td>
                  <td className="px-4 py-3">{devops}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Callout tone="tip" title="Mẹo nhớ nhanh">
          Với công việc DevOps, hãy nhớ ba mốc: <strong className="text-ink">L3</strong> là địa chỉ IP và định tuyến, <strong className="text-ink">L4</strong> là port (TCP/UDP), <strong className="text-ink">L7</strong> là nội dung ứng dụng như đường dẫn URL và header HTTP. Bốn tầng còn lại hiếm khi là nơi bạn phải sửa.
        </Callout>
      </ArticleSection>

      <ArticleSection id="debug-tu-duoi-len" number="05" eyebrow="Ứng dụng thực tế" title="Dùng mô hình tầng để debug từ dưới lên">
        <p>
          Giá trị lớn nhất của mô hình tầng là một quy trình kiểm tra có thứ tự. Khi không chắc lỗi ở đâu, đi từ tầng thấp lên: nếu tầng dưới chưa ổn thì kiểm tra tầng trên chỉ tốn thời gian.
        </p>
        <AnnotatedOutput
          title="thang kiểm tra: từ cáp đến ứng dụng"
          lines={[
            { kind: 'command', text: '$ ip -br link show eth0' },
            { text: 'eth0   UP   02:aa:00:00:00:0a <BROADCAST,MULTICAST,UP,LOWER_UP>', note: 'L1/L2: card mạng phải ở trạng thái UP và có LOWER_UP (đã có tín hiệu).' },
            { kind: 'command', text: '$ ping -c 1 192.168.1.1' },
            { text: '1 packets transmitted, 1 received, 0% packet loss', note: 'L3: tới được gateway trong LAN. Nếu fail, vấn đề nằm ngay trong mạng nội bộ.' },
            { kind: 'command', text: '$ ping -c 1 198.51.100.20' },
            { text: '1 packets transmitted, 1 received, 0% packet loss', note: 'L3: định tuyến ra ngoài hoạt động. Lưu ý ping bị chặn ICMP không có nghĩa host chết.' },
            { kind: 'command', text: '$ nc -zv 198.51.100.20 443' },
            { text: 'Connection to 198.51.100.20 443 port [tcp/https] succeeded!', note: 'L4: port đang mở và bắt tay TCP thành công.' },
            { kind: 'command', text: '$ curl -sI https://example.com | head -1' },
            { text: 'HTTP/2 200', note: 'L7: ứng dụng trả lời đúng. Nếu mọi tầng dưới ổn mà ở đây lỗi, hãy nhìn vào ứng dụng.' },
          ]}
        />
        <p>
          Chiều ngược lại cũng hữu ích: nếu ứng dụng trả <Code>502</Code> mà <Code>nc</Code> tới port vẫn thành công, bạn biết mạng không phải thủ phạm và có thể tập trung vào log của ứng dụng. Cả hai hướng đều nhằm cùng một việc: <em>thu hẹp vùng nghi ngờ thật nhanh</em>.
        </p>
      </ArticleSection>

      <ArticleSection id="ban-do-series" number="06" eyebrow="Tiếp theo" title="Bản đồ cả series">
        <p>
          Mười bài đầu đi theo đúng thứ tự hành trình của một request, từ địa chỉ và đường đi cho tới những công cụ bạn dùng khi triển khai: firewall, load balancer và SSH.
        </p>
        <ol className="grid gap-2 sm:grid-cols-2">
          {series.map(([number, title, href]) => (
            <li key={href}>
              <Link
                className={`flex gap-3 border px-4 py-3 text-sm font-semibold transition-colors ${href === '/bai-viet/network-la-gi-osi-tcp-ip' ? 'border-primary bg-primary-soft text-primary' : 'border-border bg-card text-ink hover:border-primary/50 hover:text-primary'}`}
                href={href}
              >
                <span className="font-mono text-xs leading-6 opacity-70">{number}</span>
                <span>{title}</span>
              </Link>
            </li>
          ))}
        </ol>
      </ArticleSection>

      <section id="references" className="mt-14 scroll-mt-24 border-t border-border pt-10">
        <p className="section-eyebrow">Đọc thêm</p>
        <h2 className="article-h2">Tài liệu tham khảo</h2>
        <ul className="mt-5 space-y-3 text-sm">
          <ReferenceLink href="https://www.cloudflare.com/learning/ddos/glossary/open-systems-interconnection-model-osi/" label="Cloudflare Learning — Mô hình OSI là gì" />
          <ReferenceLink href="https://www.rfc-editor.org/rfc/rfc1122" label="RFC 1122 — Yêu cầu đối với host Internet, nền tảng của mô hình TCP/IP" />
          <ReferenceLink href="https://curl.se/docs/manpage.html" label="curl man page — các biến dùng với tùy chọn --write-out" />
        </ul>
      </section>
    </ArticleShell>
  );
}
