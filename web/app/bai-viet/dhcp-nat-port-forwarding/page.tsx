import type { Metadata } from 'next';
import { ArticleIntro, ArticleSection, ArticleShell, ReferenceLink } from '@/components/article-shell';
import { NatSimulator } from '@/components/nat-simulator';
import { AnnotatedOutput, Callout, CodeBlock, Code } from '@/components/network-ui';

export const metadata: Metadata = {
  title: 'DHCP, NAT và Port Forwarding: vì sao máy trong nhà ra được Internet? | tiendat13ns',
  description: 'Giải đáp bằng câu hỏi: IP đến từ đâu (DHCP), vì sao nhiều máy dùng chung một IP public (NAT/PAT), cách mở port ra ngoài (port forwarding) và NAT trên cloud.',
};

const dora = [
  ['Discover', 'Client → mọi máy', 'Tôi mới vào mạng, có ai cấp IP cho tôi không? (broadcast, vì chưa có IP)'],
  ['Offer', 'DHCP server → client', 'Tôi đề nghị cấp 192.168.1.10/24, gateway 192.168.1.1, DNS 192.168.1.1, trong 24 giờ.'],
  ['Request', 'Client → mọi máy', 'Tôi chọn đề nghị này của server đó (broadcast để các server khác thu hồi đề nghị).'],
  ['Acknowledge', 'DHCP server → client', 'Đã ghi nhận. Địa chỉ là của bạn trong thời gian cho thuê (lease).'],
];

const cloudRows = [
  ['Internet Gateway (IGW)', 'Cho phép VPC liên lạc với Internet và thực hiện NAT 1-1 giữa IP private và public của instance.', 'Chiều vào và ra'],
  ['NAT Gateway', 'Cho máy ở private subnet đi ra ngoài (cập nhật package, gọi API) bằng IP public của gateway.', 'Chỉ chiều ra'],
  ['Elastic IP', 'Một IP public cố định bạn giữ lại, gắn vào instance hoặc NAT Gateway.', 'IP không đổi khi restart'],
];

export default function DhcpNatPage() {
  return (
    <ArticleShell currentHref="/bai-viet/dhcp-nat-port-forwarding">
      <ArticleIntro
        eyebrow="Network cho DevOps · Bài 7"
        title="DHCP, NAT và Port Forwarding: vì sao máy trong nhà ra được Internet?"
        description="Bạn cắm laptop vào mạng và mở web ngay, mà chưa cấu hình gì. Bài này trả lời lần lượt các câu hỏi mà hầu như ai cũng thắc mắc sau khi học xong IP và subnet."
        date="22/10/2026"
        readTime="16 phút đọc"
        tags={['Network', 'DHCP', 'NAT', 'Port Forwarding']}
      />

      <ArticleSection id="ip-tu-dau-ra" number="01" eyebrow="Câu hỏi 1" title="Mình chưa gõ IP nào, vậy IP từ đâu ra?">
        <p>
          Từ <strong className="text-ink">DHCP</strong> (Dynamic Host Configuration Protocol). Khi vừa nối mạng, máy chưa có địa chỉ nào, nên nó dùng một cuộc trao đổi bốn bước quen thuộc, thường gọi tắt là DORA, để “xin thuê” một địa chỉ từ DHCP server (thường chính là router).
        </p>
        <ol className="grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {dora.map(([name, who, text], index) => (
            <li className="bg-card p-4" key={name}>
              <span className="font-mono text-xs font-bold text-primary">{index + 1}</span>
              <h3 className="mt-1 font-bold text-ink">{name}</h3>
              <p className="mt-0.5 font-mono text-[0.68rem] text-muted-foreground">{who}</p>
              <p className="mt-2 text-xs leading-5">{text}</p>
            </li>
          ))}
        </ol>
        <p>
          Gói DHCP không chỉ mang IP. Nó đem theo toàn bộ cấu hình mà máy cần để hoạt động: subnet mask, <strong className="text-ink">default gateway</strong>, địa chỉ <strong className="text-ink">DNS server</strong>, và thời gian cho thuê. Đây là lý do bạn không phải đặt từng thứ thủ công.
        </p>
        <AnnotatedOutput
          title="địa chỉ được cấp bởi DHCP"
          lines={[
            { kind: 'command', text: '$ ip -4 addr show eth0' },
            {
              text: '    inet 192.168.1.10/24 brd 192.168.1.255 scope global dynamic eth0',
              note: <>Từ <Code>dynamic</Code> cho biết địa chỉ này đến từ DHCP chứ không đặt tay.</>,
            },
            {
              text: '       valid_lft 85421sec preferred_lft 85421sec',
              note: 'Thời gian lease còn lại (giây). Khi gần hết, máy tự gia hạn.',
            },
          ]}
        />
        <Callout tone="tip" title="Server không nên đổi IP tùy hứng">
          Với máy chủ, hãy cố định IP bằng <strong className="text-ink">DHCP reservation</strong> (router luôn cấp cùng một IP cho cùng một MAC) hoặc đặt static ngoài dải DHCP. Đặt tay một IP nằm trong dải DHCP đang cấp là cách nhanh nhất để gây xung đột địa chỉ.
        </Callout>
      </ArticleSection>

      <ArticleSection id="private-khong-di-duoc" number="02" eyebrow="Câu hỏi 2" title="192.168.1.10 là địa chỉ private, sao vẫn vào được Internet?">
        <p>
          Đúng là router trên Internet từ chối định tuyến các dải private (bài 2), nên gói tin mang IP nguồn <Code>192.168.1.10</Code> ra ngoài sẽ không có đường về. Cách giải quyết: router của bạn <em>đổi IP nguồn</em> sang địa chỉ public của chính nó trước khi đẩy gói tin ra, và nhớ lại việc đã đổi để dịch ngược khi nhận được câu trả lời. Việc này gọi là <strong className="text-ink">NAT</strong> (Network Address Translation).
        </p>
      </ArticleSection>

      <ArticleSection id="nhieu-may-mot-ip" number="03" eyebrow="Câu hỏi 3" title="Nhiều máy chung một IP public, trả lời về đúng máy bằng cách nào?">
        <p>
          Nếu chỉ đổi IP, khi câu trả lời về, router không biết chuyển cho máy nào trong LAN. Vì vậy NAT phổ biến nhất thực ra là <strong className="text-ink">PAT</strong> (còn gọi NAT overload hoặc masquerade): đổi cả IP lẫn <em>port</em>, và ghi cặp đổi này vào <strong className="text-ink">bảng NAT</strong>. Hãy bấm gửi từ vài máy khác nhau, và thử cả trường hợp hai máy chọn cùng source port.
        </p>
        <NatSimulator />
        <p>
          Hệ quả quan trọng: bảng NAT chỉ có dòng khi <em>máy bên trong chủ động bắt đầu</em> kết nối. Gói tự dưng từ ngoài vào không khớp dòng nào nên bị bỏ. Đó là lý do máy sau NAT mặc định “vô hình” với Internet, cũng là lý do bạn cần port forwarding ở câu hỏi tiếp theo.
        </p>
      </ArticleSection>

      <ArticleSection id="port-forwarding" number="04" eyebrow="Câu hỏi 4" title="Làm sao để người ngoài truy cập một server bên trong?">
        <p>
          Bằng cách tạo sẵn một dòng NAT theo chiều ngược lại: <strong className="text-ink">port forwarding</strong> (về bản chất là DNAT, Destination NAT). Rule nói: “gói tới IP public cổng 8080 thì đổi đích thành 192.168.1.11 cổng 80”. Trên router gia đình bạn bấm vài ô trong giao diện web; trên Linux bạn viết bằng iptables hoặc nftables:
        </p>
        <CodeBlock title="router Linux đơn giản: cho cả LAN ra ngoài và mở một cổng vào">{`# 1. Cho phép kernel chuyển tiếp gói tin giữa các card mạng
sudo sysctl -w net.ipv4.ip_forward=1

# 2. SNAT/masquerade: gói từ LAN đi ra qua eth0 mang IP của eth0
sudo iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE

# 3. DNAT: gói vào cổng 8080 của router thì chuyển cho 192.168.1.11:80
sudo iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 8080 \\
     -j DNAT --to-destination 192.168.1.11:80

# 4. Cho phép gói đã được DNAT đi qua (nếu chính sách FORWARD là DROP)
sudo iptables -A FORWARD -p tcp -d 192.168.1.11 --dport 80 -j ACCEPT`}</CodeBlock>
        <Callout title="Docker làm đúng việc này">
          Khi bạn chạy <Code>docker run -p 8080:80 nginx</Code>, Docker thêm một rule DNAT tương tự vào bảng nat: gói tới cổng 8080 của host được đổi đích sang IP của container (ví dụ 172.17.0.2:80). Xem bằng <Code>sudo iptables -t nat -L DOCKER -n</Code>.
        </Callout>
      </ArticleSection>

      <ArticleSection id="tren-cloud" number="05" eyebrow="Câu hỏi 5" title="Trên cloud thì NAT nằm ở đâu?">
        <p>
          Khái niệm y hệt, chỉ đổi tên thành các dịch vụ được quản lý sẵn. Ví dụ trên AWS:
        </p>
        <div className="overflow-x-auto border border-border bg-card">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="bg-surface font-mono text-xs uppercase tracking-[0.06em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Thành phần</th>
                <th className="px-4 py-3">Làm gì</th>
                <th className="px-4 py-3">Hướng</th>
              </tr>
            </thead>
            <tbody>
              {cloudRows.map(([name, what, direction]) => (
                <tr className="border-t border-border" key={name}>
                  <td className="px-4 py-3 font-semibold text-ink">{name}</td>
                  <td className="px-4 py-3">{what}</td>
                  <td className="px-4 py-3">{direction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Mẫu kiến trúc quen thuộc: database và ứng dụng nằm trong <em>private subnet</em> không có IP public, ra ngoài qua NAT Gateway, còn thứ cần nhận traffic từ Internet (load balancer) thì đặt ở <em>public subnet</em>. Máy private vì thế không thể bị truy cập trực tiếp từ ngoài, đúng như mô phỏng ở trên.
        </p>
      </ArticleSection>

      <ArticleSection id="rac-roi-cua-nat" number="06" eyebrow="Câu hỏi 6" title="NAT có để lại rắc rối gì không?">
        <div className="space-y-3">
          {[
            { title: 'Mất địa chỉ gốc của client', text: 'Server phía sau NAT hoặc reverse proxy chỉ thấy IP của thiết bị NAT. Muốn biết client thật, cần header như X-Forwarded-For hoặc PROXY protocol (bài 9).' },
            { title: 'Bảng NAT/conntrack đầy', text: <>Server chịu nhiều kết nối có thể thấy log <Code>nf_conntrack: table full, dropping packet</Code>: kết nối mới bị bỏ ngẫu nhiên dù CPU còn rảnh. Kiểm tra bằng <Code>conntrack -C</Code> và <Code>sysctl net.netfilter.nf_conntrack_max</Code>.</> },
            { title: 'CGNAT', text: 'Nhiều nhà mạng cho cả khu dùng chung một IP public (dải 100.64.0.0/10). Khi đó bạn không thể port forward vì không kiểm soát được thiết bị NAT.' },
            { title: 'Giao thức nhúng IP trong dữ liệu', text: 'Một số giao thức cũ (FTP chế độ active, SIP) ghi địa chỉ IP vào bên trong payload nên cần thêm “helper” để NAT sửa đúng chỗ.' },
          ].map(({ title, text }) => (
            <div className="flex gap-4 border border-border bg-card p-4" key={title}>
              <span className="mt-2 size-2 shrink-0 bg-primary" />
              <div>
                <h3 className="font-bold text-ink">{title}</h3>
                <p className="mt-1 text-sm leading-6">{text}</p>
              </div>
            </div>
          ))}
        </div>
        <p>
          IPv6 loại bỏ nhu cầu NAT vì có đủ địa chỉ cho từng thiết bị, nhưng điều đó không có nghĩa mọi máy đều bị phơi ra Internet: thay vì nhờ NAT “vô tình” che chắn, bạn cần firewall có chủ đích. Đó là chủ đề của bài kế tiếp.
        </p>
      </ArticleSection>

      <section id="references" className="mt-14 scroll-mt-24 border-t border-border pt-10">
        <p className="section-eyebrow">Đọc thêm</p>
        <h2 className="article-h2">Tài liệu tham khảo</h2>
        <ul className="mt-5 space-y-3 text-sm">
          <ReferenceLink href="https://www.rfc-editor.org/rfc/rfc2131" label="RFC 2131 — Dynamic Host Configuration Protocol" />
          <ReferenceLink href="https://www.rfc-editor.org/rfc/rfc3022" label="RFC 3022 — Traditional IP Network Address Translator" />
          <ReferenceLink href="https://docs.aws.amazon.com/vpc/latest/userguide/vpc-nat-gateway.html" label="AWS VPC — NAT gateway" />
          <ReferenceLink href="https://docs.docker.com/engine/network/packet-filtering-firewalls/" label="Docker — Packet filtering và firewall (cách Docker dùng iptables)" />
        </ul>
      </section>
    </ArticleShell>
  );
}
