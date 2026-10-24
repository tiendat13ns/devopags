import type { Metadata } from 'next';
import { ArticleIntro, ArticleSection, ArticleShell, ReferenceLink } from '@/components/article-shell';
import { FirewallRuleTester } from '@/components/firewall-rule-tester';
import { Callout, CodeBlock, Code } from '@/components/network-ui';

export const metadata: Metadata = {
  title: 'Firewall cơ bản: luật nào khớp trước thì thắng | tiendat13ns',
  description: 'Firewall lọc gói tin thế nào, vì sao thứ tự luật quan trọng, stateful khác stateless ra sao, cách dùng ufw/firewalld/iptables và phân biệt với Security Group, NACL trên cloud.',
};

const layers = [
  ['Firewall trên host', 'ufw, firewalld, iptables/nftables', 'Bảo vệ riêng từng máy. Là lớp cuối cùng, vẫn hoạt động khi mạng bên ngoài cấu hình sai.'],
  ['Firewall mạng', 'Thiết bị hoặc appliance ở rìa mạng', 'Lọc traffic giữa các vùng mạng (Internet, DMZ, nội bộ), thường do đội network quản lý.'],
  ['Firewall trên cloud', 'Security Group, NACL, firewall rule của VPC', 'Cấu hình bằng API hoặc Terraform, áp dụng cho instance/subnet mà không cần cài gì lên máy.'],
];

const cloudCompare = [
  ['Áp dụng cho', 'Card mạng của instance', 'Cả subnet'],
  ['Trạng thái', 'Stateful: tự cho gói trả lời đi qua', 'Stateless: phải mở cả chiều đi lẫn chiều về'],
  ['Loại luật', 'Chỉ có allow', 'Có cả allow và deny'],
  ['Cách đánh giá', 'Xét toàn bộ luật, chỉ cần một luật cho phép', 'Theo số thứ tự, luật nhỏ nhất khớp trước thì thắng'],
  ['Dùng khi', 'Là lớp bảo vệ chính, luôn cấu hình', 'Cần chặn tường minh một IP/dải, hoặc thêm lớp phòng thủ'],
];

export default function FirewallPage() {
  return (
    <ArticleShell currentHref="/bai-viet/firewall-co-ban">
      <ArticleIntro
        eyebrow="Network cho DevOps · Bài 8"
        title="Firewall cơ bản: luật nào khớp trước thì thắng"
        description="Firewall nghe có vẻ phức tạp nhưng chỉ làm một việc: đọc từng gói tin, so với danh sách luật theo thứ tự rồi quyết định cho qua hay chặn. Phần lớn lỗi nằm ở thứ tự luật và ở những thứ bị quên mở."
        date="22/10/2026"
        readTime="17 phút đọc"
        tags={['Network', 'Firewall', 'Security']}
      />

      <ArticleSection id="firewall-lam-gi" number="01" eyebrow="Khái niệm" title="Firewall làm gì và nằm ở đâu?">
        <p>
          Một luật firewall thường gồm: <strong className="text-ink">điều kiện</strong> (IP nguồn, IP đích, giao thức, port) và <strong className="text-ink">hành động</strong>. Hai hành động bạn gặp nhiều nhất là <Code>ACCEPT</Code> (cho qua) và <Code>DROP</Code> (bỏ im lặng). Còn một hành động nữa là <Code>REJECT</Code>: chặn nhưng báo lại cho người gửi.
        </p>
        <Callout title="DROP và REJECT khác nhau thế nào khi debug?">
          Nhớ lại bài 4: với <Code>REJECT</Code>, người gửi nhận ngay “connection refused”. Với <Code>DROP</Code>, người gửi không nhận được gì và phải chờ đến khi <em>timeout</em>. Vì vậy một service “timeout” khi gọi từ ngoài vào thường là dấu hiệu của DROP hoặc Security Group chưa mở.
        </Callout>
        <div className="grid gap-4 md:grid-cols-3">
          {layers.map(([name, tools, text]) => (
            <div className="border border-border bg-card p-5" key={name}>
              <h3 className="font-bold text-ink">{name}</h3>
              <p className="mt-1 font-mono text-[0.7rem] text-primary">{tools}</p>
              <p className="mt-2 text-sm leading-6">{text}</p>
            </div>
          ))}
        </div>
      </ArticleSection>

      <ArticleSection id="stateful" number="02" eyebrow="Ý niệm quan trọng" title="Stateful: firewall có trí nhớ">
        <p>
          Khi bạn truy cập web server ở port 443, chiều đi rất đơn giản. Nhưng gói trả lời quay lại từ port 443 của server đến một port ngẫu nhiên (ephemeral) của bạn. Nếu firewall chỉ nhìn từng gói riêng lẻ, bạn sẽ phải mở toàn bộ dải port cao cho chiều về, điều không ai muốn.
        </p>
        <div className="grid gap-px border border-border bg-border md:grid-cols-2">
          <div className="bg-card p-5">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.08em] text-primary">Stateless</p>
            <p className="mt-2 text-sm leading-6">Đánh giá từng gói độc lập. Muốn cho gói trả lời đi qua, bạn phải viết thêm luật cho chiều ngược lại, thường là cả dải port 1024–65535.</p>
          </div>
          <div className="bg-surface p-5">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.08em] text-primary">Stateful</p>
            <p className="mt-2 text-sm leading-6">Ghi nhớ các kết nối đã được cho phép (connection tracking). Gói trả lời của kết nối hợp lệ được tự động cho qua, bạn chỉ cần mô tả chiều <em>khởi tạo</em> kết nối.</p>
          </div>
        </div>
        <p>
          Hầu hết firewall hiện đại trên host đều stateful. Trong iptables, dòng <Code>-m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT</Code> chính là bật trí nhớ này lên, và bạn sẽ thấy nó ở đầu bộ luật trong mô phỏng bên dưới.
        </p>
      </ArticleSection>

      <ArticleSection id="rule-tester" number="03" eyebrow="Thực hành" title="Thứ tự luật quyết định tất cả">
        <p>
          Firewall dừng ở <strong className="text-ink">luật đầu tiên khớp</strong>, các luật phía sau bị bỏ qua. Nếu không luật nào khớp thì áp dụng chính sách mặc định. Hãy thử ba việc: (1) bấm “đưa luật DROP SSH lên đầu” và xem điều gì xảy ra với người trong văn phòng; (2) đổi chính sách mặc định sang ACCEPT; (3) tắt một luật bằng ô chọn.
        </p>
        <FirewallRuleTester />
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ['Cụ thể trước, chung sau', 'Luật cho phép ngoại lệ (SSH từ văn phòng) phải đứng trước luật chặn chung (SSH từ mọi nơi).'],
            ['Mặc định là từ chối', 'Chính sách DROP buộc bạn mở tường minh từng thứ cần thiết. Mặc định ACCEPT nghĩa là cái gì quên đóng thì đang mở.'],
            ['Mở đúng nguồn', 'SSH chỉ cho văn phòng hoặc bastion, database chỉ cho mạng nội bộ. Hiếm khi có lý do để mở 0.0.0.0/0 cho ngoài web.'],
          ].map(([title, text]) => (
            <div className="border border-border bg-card p-4" key={title}>
              <h3 className="font-bold text-ink">{title}</h3>
              <p className="mt-1 text-sm leading-6">{text}</p>
            </div>
          ))}
        </div>
      </ArticleSection>

      <ArticleSection id="cong-cu" number="04" eyebrow="Trên Linux" title="ufw, firewalld và iptables">
        <p>
          Phía dưới các công cụ, Linux dùng bộ lọc gói tin trong kernel (Netfilter). <Code>iptables</Code> và <Code>nftables</Code> là giao diện trực tiếp; <Code>ufw</Code> (Ubuntu) và <Code>firewalld</Code> (RHEL, Rocky, Fedora) là lớp dễ dùng hơn bọc bên trên. Với người mới, hãy bắt đầu với công cụ mà distro của bạn mặc định.
        </p>
        <CodeBlock title="ufw: cấu hình nền tảng cho một web server (Ubuntu)">{`# Mặc định: chặn mọi thứ đi vào, cho phép mọi thứ đi ra
sudo ufw default deny incoming
sudo ufw default allow outgoing

# QUAN TRỌNG: mở SSH TRƯỚC khi bật firewall, kẻo tự khóa mình
sudo ufw allow from 203.0.113.0/24 to any port 22 proto tcp

# Web
sudo ufw allow 80,443/tcp

sudo ufw enable
sudo ufw status numbered`}</CodeBlock>
        <CodeBlock title="firewalld: làm điều tương tự (RHEL / Rocky)">{`sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-rich-rule='rule family="ipv4" source address="203.0.113.0/24" service name="ssh" accept'
sudo firewall-cmd --reload
sudo firewall-cmd --list-all`}</CodeBlock>
        <Callout tone="warn" title="Hai cái bẫy kinh điển">
          <p>
            <strong className="text-ink">Tự khóa mình:</strong> bật firewall từ xa mà chưa mở SSH là mất kết nối vĩnh viễn (phải vào console của nhà cung cấp để sửa). Khi sửa luật SSH, hãy giữ một phiên đang mở và thử đăng nhập bằng phiên thứ hai trước khi đóng.
          </p>
          <p className="mt-2">
            <strong className="text-ink">Docker lách qua ufw:</strong> Docker tự thêm rule vào iptables để publish port (<Code>-p 8080:80</Code>), và các rule này có thể được xử lý trước luật ufw. Hệ quả là một port bạn tưởng đã bị ufw chặn vẫn mở ra Internet. Hãy bind vào <Code>127.0.0.1:8080:80</Code> khi chỉ cần dùng nội bộ, và kiểm tra lại từ bên ngoài.
          </p>
        </Callout>
        <p>
          Luật tạo bằng lệnh trực tiếp với iptables sẽ mất khi khởi động lại, trừ khi bạn lưu chúng (<Code>netfilter-persistent save</Code>). <Code>ufw</Code> và <Code>firewalld --permanent</Code> đã tự lưu.
        </p>
      </ArticleSection>

      <ArticleSection id="tren-cloud" number="05" eyebrow="Cloud" title="Security Group và NACL">
        <p>
          Trên cloud bạn thường không động vào iptables mà cấu hình firewall bằng dịch vụ của nền tảng. Hai thứ trên AWS dễ nhầm với nhau:
        </p>
        <div className="overflow-x-auto border border-border bg-card">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-surface font-mono text-xs uppercase tracking-[0.06em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3"><span className="sr-only">Tiêu chí</span></th>
                <th className="px-4 py-3">Security Group</th>
                <th className="px-4 py-3">Network ACL</th>
              </tr>
            </thead>
            <tbody>
              {cloudCompare.map(([label, sg, nacl]) => (
                <tr className="border-t border-border" key={label}>
                  <td className="px-4 py-3 font-semibold text-ink">{label}</td>
                  <td className="px-4 py-3">{sg}</td>
                  <td className="px-4 py-3">{nacl}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Một mẹo thiết kế rất đáng nhớ: Security Group có thể dùng <em>Security Group khác</em> làm nguồn. Thay vì ghi IP của app server vào luật của database, bạn viết “cho phép từ SG của app”. Khi app scale thêm instance, database tự chấp nhận mà không phải sửa luật.
        </p>
      </ArticleSection>

      <ArticleSection id="kiem-tra" number="06" eyebrow="Thói quen tốt" title="Cấu hình xong, hãy kiểm tra từ bên ngoài">
        <p>
          Luật nhìn đúng chưa chắc hoạt động đúng. Hãy kiểm tra từ một máy khác, ở đúng vị trí mạng mà người dùng thật sẽ truy cập:
        </p>
        <CodeBlock title="xác minh từ một máy bên ngoài (chỉ quét hệ thống của chính bạn)">{`# Port nào đang mở? (nmap chỉ nên dùng cho máy bạn sở hữu hoặc được phép)
nmap -Pn -p 22,80,443,3306,5432,6379 203.0.113.10

# Nhanh gọn hơn: thử từng port, timeout 3 giây
nc -zv -w 3 203.0.113.10 5432

# Trên chính server: ai đang nghe, ở địa chỉ nào?
sudo ss -tlnp`}</CodeBlock>
        <ul className="list-disc space-y-2 pl-5">
          <li><strong className="text-ink">Database, Redis, message queue</strong> không nên truy cập được từ Internet. Hãy thử kiểm tra ngay hôm nay xem bạn có lỡ mở chúng không.</li>
          <li><strong className="text-ink">Ghi log</strong> các gói bị chặn (<Code>ufw logging on</Code>) để biết ai đang thử vào và có luật nào chặn nhầm người dùng thật không.</li>
          <li><strong className="text-ink">Lưu cấu hình dưới dạng code</strong> (Terraform, Ansible) để luật được review như mọi thay đổi khác.</li>
        </ul>
      </ArticleSection>

      <section id="references" className="mt-14 scroll-mt-24 border-t border-border pt-10">
        <p className="section-eyebrow">Đọc thêm</p>
        <h2 className="article-h2">Tài liệu tham khảo</h2>
        <ul className="mt-5 space-y-3 text-sm">
          <ReferenceLink href="https://documentation.ubuntu.com/server/how-to/security/firewalls/" label="Ubuntu Server — Hướng dẫn firewall (ufw)" />
          <ReferenceLink href="https://firewalld.org/documentation/" label="firewalld — Tài liệu" />
          <ReferenceLink href="https://docs.aws.amazon.com/vpc/latest/userguide/vpc-security-groups.html" label="AWS VPC — Security Group" />
          <ReferenceLink href="https://docs.docker.com/engine/network/packet-filtering-firewalls/" label="Docker — Packet filtering và firewall" />
        </ul>
      </section>
    </ArticleShell>
  );
}
