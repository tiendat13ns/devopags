import type { Metadata } from 'next';
import { ArticleIntro, ArticleSection, ArticleShell, ReferenceLink } from '@/components/article-shell';
import { SameSubnetChecker, SubnetCalculator } from '@/components/subnet-calculator';
import { Callout, Code } from '@/components/network-ui';

export const metadata: Metadata = {
  title: 'IP, Subnet và CIDR: đọc 192.168.1.0/24 trong 30 giây | tiendat13ns',
  description: 'Hiểu địa chỉ IPv4 dưới dạng 32 bit, subnet mask, CIDR, dải private/public và cách chia subnet bằng một công cụ tính trực tiếp.',
};

const cidrRows = [
  ['/8', '255.0.0.0', '16.777.216', '16.777.214', 'Cả dải 10.0.0.0/8'],
  ['/16', '255.255.0.0', '65.536', '65.534', 'VPC thường tạo'],
  ['/24', '255.255.255.0', '256', '254', 'LAN văn phòng, subnet phổ biến'],
  ['/25', '255.255.255.128', '128', '126', 'Chia đôi một /24'],
  ['/26', '255.255.255.192', '64', '62', 'Chia tư một /24'],
  ['/27', '255.255.255.224', '32', '30', 'Nhóm server nhỏ'],
  ['/28', '255.255.255.240', '16', '14', 'Subnet nhỏ nhất AWS cho phép'],
  ['/30', '255.255.255.252', '4', '2', 'Đường nối hai router'],
  ['/32', '255.255.255.255', '1', '1', 'Đúng một host (rule firewall, route)'],
];

const quiz = [
  {
    q: '10.0.3.77/24 thuộc network nào, broadcast là gì?',
    a: 'Prefix /24 nghĩa là 3 octet đầu giữ nguyên. Network 10.0.3.0, broadcast 10.0.3.255, host dùng được từ 10.0.3.1 đến 10.0.3.254 (254 host).',
  },
  {
    q: '192.168.10.200/27 nằm trong khối nào?',
    a: 'Mask /27 có octet cuối là 224 nên bước nhảy là 256 − 224 = 32. Các khối bắt đầu ở .0, .32, .64 … .192, .224. Số 200 rơi vào khối .192: network 192.168.10.192, broadcast 192.168.10.223, host .193 đến .222.',
  },
  {
    q: '10.0.1.5/24 và 10.0.2.5/24 có cùng subnet không?',
    a: 'Không. Với /24, octet thứ ba tham gia vào phần network: 10.0.1.0 khác 10.0.2.0. Hai máy này muốn nói chuyện phải đi qua router. Nếu đổi prefix thành /16 thì chúng lại cùng subnet.',
  },
  {
    q: 'Cần một subnet cho 50 server, chọn prefix nào?',
    a: '/27 chỉ có 30 host dùng được nên thiếu; /26 có 62 nên đủ và còn dư chỗ. Trên AWS còn phải trừ thêm 5 địa chỉ bị giữ riêng nên /26 vẫn còn 59.',
  },
  {
    q: 'Một VPC 10.0.0.0/16 chia được bao nhiêu subnet /24?',
    a: '2^(24 − 16) = 256 subnet, mỗi subnet có 256 địa chỉ.',
  },
];

export default function IpSubnetCidrPage() {
  return (
    <ArticleShell currentHref="/bai-viet/ip-subnet-cidr">
      <ArticleIntro
        eyebrow="Network cho DevOps · Bài 2"
        title="IP, Subnet và CIDR: đọc 192.168.1.0/24 trong 30 giây"
        description="Bài này bắt đầu bằng công cụ trước, lý thuyết sau. Hãy nghịch với máy tính subnet, nhìn các bit đổi màu, rồi đọc phần giải thích để biết vì sao nó hoạt động như vậy."
        date="22/10/2026"
        readTime="16 phút đọc"
        tags={['Network', 'IPv4', 'CIDR', 'Subnet']}
      />

      <Callout title="Thử ngay trước khi đọc">
        Kéo thanh prefix từ /8 đến /30 và quan sát: càng nhiều bit màu tím (network), càng ít bit màu vàng (host), subnet càng nhỏ. Mọi thứ trong bài đều là hệ quả của điều này.
      </Callout>

      <SubnetCalculator />

      <ArticleSection id="ip-la-32-bit" number="01" eyebrow="Nền móng" title="Địa chỉ IPv4 chỉ là một con số 32 bit">
        <p>
          Địa chỉ như <Code>192.168.1.130</Code> là cách viết cho con người. Máy tính thấy một dãy 32 bit, được chia thành 4 nhóm 8 bit gọi là <strong className="text-ink">octet</strong>, mỗi octet viết thành số thập phân từ 0 đến 255. Vì vậy mới không có địa chỉ nào như <Code>192.168.1.300</Code>.
        </p>
        <div className="overflow-x-auto border border-border bg-card p-4 font-mono text-sm">
          <div className="flex min-w-[560px] justify-between gap-2 text-center">
            {[['192', '11000000'], ['168', '10101000'], ['1', '00000001'], ['130', '10000010']].map(([decimal, bits]) => (
              <div className="flex-1 border border-border bg-surface px-2 py-3" key={decimal}>
                <div className="text-lg font-bold text-ink">{decimal}</div>
                <div className="mt-1 text-xs text-primary">{bits}</div>
              </div>
            ))}
          </div>
        </div>
        <p>
          32 bit cho ra 2<sup>32</sup> ≈ 4,3 tỷ địa chỉ, con số nghe lớn nhưng đã cạn từ lâu. Giải pháp dài hạn là IPv6 (128 bit), còn giải pháp tình thế đã giữ Internet sống suốt nhiều năm là dùng chung một địa chỉ public cho nhiều máy bằng NAT, thứ ta sẽ gặp ở bài 7.
        </p>
      </ArticleSection>

      <ArticleSection id="subnet-mask" number="02" eyebrow="Ý tưởng chính" title="Subnet mask: một đường kẻ chia địa chỉ làm hai nửa">
        <p>
          Mỗi địa chỉ IP gồm hai phần: <strong className="text-ink">phần network</strong> cho biết máy thuộc mạng nào, và <strong className="text-ink">phần host</strong> cho biết máy nào trong mạng đó. Subnet mask là bảng đánh dấu: bit 1 thuộc network, bit 0 thuộc host.
        </p>
        <p>
          Để tìm network address, máy thực hiện phép <strong className="text-ink">AND từng bit</strong> giữa IP và mask. Hàng thứ ba trong công cụ ở đầu bài chính là kết quả của phép này: phần host bị xóa thành 0.
        </p>
        <div className="border border-border bg-card p-5">
          <p className="font-mono text-xs font-semibold text-primary">Ví dụ: 192.168.1.130 với mask 255.255.255.192</p>
          <div className="mt-3 space-y-1 overflow-x-auto font-mono text-sm leading-7">
            <div className="min-w-[440px]"><span className="inline-block w-24 text-muted-foreground">IP</span> 11000000.10101000.00000001.<span className="text-primary">10</span>000010</div>
            <div className="min-w-[440px]"><span className="inline-block w-24 text-muted-foreground">Mask</span> 11111111.11111111.11111111.<span className="text-primary">11</span>000000</div>
            <div className="min-w-[440px] border-t border-border pt-1"><span className="inline-block w-24 text-muted-foreground">AND</span> 11000000.10101000.00000001.<span className="text-primary">10</span>000000 = 192.168.1.128</div>
          </div>
        </div>
        <p>
          Gần như mọi quyết định mạng đều bắt đầu từ phép AND này: máy so sánh network address của mình với của đích để biết đích có cùng mạng hay không.
        </p>
      </ArticleSection>

      <ArticleSection id="cidr" number="03" eyebrow="Ký hiệu" title="CIDR: viết gọn và cách tính nhẩm">
        <p>
          Thay vì viết <Code>255.255.255.192</Code>, ta viết <Code>/26</Code> sau địa chỉ: có 26 bit đầu là network. Cách viết <Code>192.168.1.128/26</Code> gọi là ký hiệu <strong className="text-ink">CIDR</strong> (Classless Inter-Domain Routing). Nó thay thế cách chia cứng theo lớp A/B/C ngày xưa, cho phép cắt mạng ở bất kỳ vị trí bit nào.
        </p>
        <div className="overflow-x-auto border border-border bg-card">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-surface font-mono text-xs uppercase tracking-[0.06em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Prefix</th>
                <th className="px-4 py-3">Mask</th>
                <th className="px-4 py-3">Địa chỉ</th>
                <th className="px-4 py-3">Host dùng được</th>
                <th className="px-4 py-3">Hay gặp ở</th>
              </tr>
            </thead>
            <tbody>
              {cidrRows.map(([prefix, mask, total, usable, note]) => (
                <tr className="border-t border-border" key={prefix}>
                  <td className="px-4 py-2.5 font-mono font-bold text-primary">{prefix}</td>
                  <td className="px-4 py-2.5 font-mono">{mask}</td>
                  <td className="px-4 py-2.5">{total}</td>
                  <td className="px-4 py-2.5 font-semibold text-ink">{usable}</td>
                  <td className="px-4 py-2.5">{note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Số host dùng được là <Code>2^(32 − prefix) − 2</Code>: trừ đi network address (bit host toàn 0) và broadcast (bit host toàn 1). Hai ngoại lệ là /31 (dùng cho link điểm-điểm, cả hai địa chỉ đều dùng được) và /32 (một host duy nhất).
        </p>
        <Callout tone="tip" title="Cách tính nhẩm: bước nhảy">
          Khi prefix cắt giữa một octet, lấy <strong className="text-ink">256 trừ giá trị octet đó của mask</strong> để ra bước nhảy. Mask /26 có octet cuối là 192, bước nhảy 64 nên các subnet bắt đầu ở .0, .64, .128, .192. IP có octet cuối 130 rơi vào khối .128, vậy network là .128, broadcast là .191 (kế trước khối tiếp theo).
        </Callout>
      </ArticleSection>

      <ArticleSection id="private-public" number="04" eyebrow="Phân loại" title="Private, public và vài dải đặc biệt">
        <p>
          Không phải địa chỉ nào cũng đi được trên Internet. Có ba dải <strong className="text-ink">private</strong> (RFC 1918) dành cho mạng nội bộ; router trên Internet sẽ không định tuyến chúng, nên bao nhiêu mạng cũng dùng lại được cùng một dải.
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ['10.0.0.0/8', '16,7 triệu địa chỉ', 'Doanh nghiệp, VPC cloud'],
            ['172.16.0.0/12', '1 triệu địa chỉ', 'Từ 172.16 đến 172.31; cũng là dải Docker mặc định 172.17.0.0/16'],
            ['192.168.0.0/16', '65 nghìn địa chỉ', 'Router gia đình, văn phòng nhỏ'],
          ].map(([cidr, size, note]) => (
            <div className="border border-border bg-card p-4" key={cidr}>
              <strong className="font-mono text-sm text-primary">{cidr}</strong>
              <p className="mt-1 text-sm font-semibold text-ink">{size}</p>
              <p className="mt-1 text-xs leading-5">{note}</p>
            </div>
          ))}
        </div>
        <p>
          Ngoài ra bạn sẽ gặp <Code>127.0.0.0/8</Code> (loopback — <Code>localhost</Code> chính là máy này), <Code>169.254.0.0/16</Code> (link-local — máy tự gán khi xin DHCP thất bại, thấy địa chỉ này nghĩa là mạng có vấn đề) và <Code>100.64.0.0/10</Code> (dải dùng chung của nhà mạng cho CGNAT). Máy tính ở đầu bài sẽ nhận diện tất cả các dải này.
        </p>
      </ArticleSection>

      <ArticleSection id="cung-subnet" number="05" eyebrow="Quyết định của máy gửi" title="Cùng subnet hay khác subnet?">
        <p>
          Trước khi gửi bất kỳ gói tin nào, máy luôn tự hỏi một câu: <em>đích có nằm trong subnet của mình không?</em> Nếu có, nó gửi trực tiếp. Nếu không, nó giao gói tin cho <strong className="text-ink">default gateway</strong> — router có nhiệm vụ đưa gói tin đi tiếp. Thử với hai địa chỉ và prefix khác nhau:
        </p>
        <SameSubnetChecker />
        <p>
          Đây là nguồn gốc của một loại lỗi kinh điển: máy được cấu hình sai mask, ví dụ /16 thay vì /24. Nó tưởng nhiều máy ở subnet khác là hàng xóm, cố gửi trực tiếp và không bao giờ nhận được phản hồi. Khi hai máy “nhìn thấy nhau” bằng ping nhưng service không thông, hãy kiểm tra mask trước tiên.
        </p>
      </ArticleSection>

      <ArticleSection id="thiet-ke-subnet" number="06" eyebrow="Ứng dụng" title="Chia subnet trong dự án thật">
        <p>
          Khi dựng VPC hoặc mạng nội bộ, bạn chọn một khối lớn (ví dụ <Code>10.0.0.0/16</Code>) rồi cắt thành các subnet theo vai trò: public, private cho ứng dụng, private cho database, mỗi loại lặp lại ở nhiều availability zone. Một vài nguyên tắc nên nhớ từ sớm:
        </p>
        <div className="space-y-3">
          {[
            ['Chừa chỗ để lớn lên', 'Đừng chia sát nhu cầu hôm nay. Đổi kích thước subnet sau khi có tài nguyên chạy bên trong thường rất đau.'],
            ['Không chồng lấn CIDR', 'Hai VPC chồng dải sẽ không peering hay nối VPN được. Dải Docker 172.17.0.0/16 cũng từng va với VPN công ty khiến container không ra được mạng nội bộ.'],
            ['Nhớ những địa chỉ bị giữ riêng', 'AWS giữ 5 địa chỉ mỗi subnet (network, router, DNS, dự phòng, broadcast), nên /28 chỉ còn 11 địa chỉ dùng.'],
            ['Ghi lại kế hoạch', 'Một bảng CIDR trong tài liệu hoặc Terraform có giá trị hơn nhiều so với tự nhớ.'],
          ].map(([title, text]) => (
            <div className="flex gap-4 border border-border bg-card p-4" key={title}>
              <span className="mt-1 size-2 shrink-0 bg-primary" />
              <div>
                <h3 className="font-bold text-ink">{title}</h3>
                <p className="mt-1 text-sm leading-6">{text}</p>
              </div>
            </div>
          ))}
        </div>
        <Callout title="IPv6 thì sao?">
          IPv6 dài 128 bit, viết bằng hệ thập lục phân như <Code>2001:db8::1</Code>, và subnet chuẩn là /64 nên bài toán “thiếu địa chỉ” gần như biến mất. Các khái niệm prefix, gateway, route vẫn y hệt. Bạn có thể bắt đầu với IPv4 mà không sợ học lại từ đầu.
        </Callout>
      </ArticleSection>

      <ArticleSection id="tu-kiem-tra" number="07" eyebrow="Luyện tập" title="Tự kiểm tra">
        <p>Tự nhẩm đáp án trước, sau đó bấm để đối chiếu hoặc dán số vào máy tính ở đầu bài.</p>
        <div className="space-y-2">
          {quiz.map((item, index) => (
            <details className="group border border-border bg-card" key={item.q}>
              <summary className="flex cursor-pointer list-none items-start gap-3 px-4 py-3 text-sm font-semibold text-ink marker:hidden [&::-webkit-details-marker]:hidden">
                <span className="font-mono text-xs leading-6 text-primary">Q{index + 1}</span>
                <span className="leading-6">{item.q}</span>
              </summary>
              <p className="border-t border-border px-4 py-3 text-sm leading-6">{item.a}</p>
            </details>
          ))}
        </div>
      </ArticleSection>

      <section id="references" className="mt-14 scroll-mt-24 border-t border-border pt-10">
        <p className="section-eyebrow">Đọc thêm</p>
        <h2 className="article-h2">Tài liệu tham khảo</h2>
        <ul className="mt-5 space-y-3 text-sm">
          <ReferenceLink href="https://www.rfc-editor.org/rfc/rfc4632" label="RFC 4632 — Classless Inter-domain Routing (CIDR)" />
          <ReferenceLink href="https://www.rfc-editor.org/rfc/rfc1918" label="RFC 1918 — Địa chỉ cho mạng private" />
          <ReferenceLink href="https://www.rfc-editor.org/rfc/rfc5737" label="RFC 5737 — Các dải địa chỉ IPv4 dùng cho tài liệu" />
          <ReferenceLink href="https://docs.aws.amazon.com/vpc/latest/userguide/subnet-sizing.html" label="AWS VPC — Kích thước subnet và các địa chỉ bị giữ riêng" />
        </ul>
      </section>
    </ArticleShell>
  );
}
