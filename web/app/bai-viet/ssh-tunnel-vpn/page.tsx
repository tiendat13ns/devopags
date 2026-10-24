import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import { ArticleIntro, ArticleSection, ArticleShell, ReferenceLink } from '@/components/article-shell';
import { SshTunnelBuilder } from '@/components/ssh-tunnel-builder';
import { AnnotatedOutput, Callout, CodeBlock, Code } from '@/components/network-ui';

export const metadata: Metadata = {
  title: 'SSH, Tunnel và VPN: đi vào mạng nội bộ một cách an toàn | tiendat13ns',
  description: 'Xác thực SSH bằng key, ~/.ssh/config, local/remote/dynamic forwarding và ProxyJump, mô hình bastion host, so sánh SSH tunnel với VPN, WireGuard cơ bản và cách gỡ lỗi SSH.',
};

const authSteps = [
  ['Tạo cặp khóa', 'Private key nằm lại trên máy bạn, không bao giờ rời đi. Public key thì chia sẻ thoải mái.'],
  ['Cài public key lên server', 'Dòng public key nằm trong ~/.ssh/authorized_keys của user trên server.'],
  ['Server thử thách', 'Khi bạn kết nối, server gửi một thử thách mà chỉ người giữ private key tương ứng mới ký đúng được.'],
  ['Bạn chứng minh', 'Client ký bằng private key; server kiểm tra bằng public key. Mật khẩu không hề đi qua mạng.'],
];

const vpnCompare = [
  ['Phạm vi', 'Từng cổng, từng ứng dụng bạn khai báo', 'Cả mạng: mọi ứng dụng trên máy dùng được'],
  ['Hoạt động ở', 'Chuyển tiếp TCP trong kênh SSH', 'Tầng 3: thêm một card mạng ảo có IP riêng'],
  ['Thiết lập', 'Một dòng lệnh, chỉ cần quyền SSH', 'Cần cài server VPN, cấp key, cấu hình route'],
  ['Phù hợp', 'Truy cập tạm thời, một vài dịch vụ', 'Truy cập thường xuyên nhiều dịch vụ; nối hai mạng (site-to-site)'],
  ['Quản lý', 'Theo từng người dùng SSH', 'Tập trung: cấp, thu hồi, ghi log từng thiết bị'],
];

const sshErrors = [
  ['Connection refused', 'Máy đích sống nhưng không có sshd nghe ở cổng đó (chưa cài, sai port, đã dừng).', 'Vào console kiểm tra systemctl status ssh và ss -tlnp.'],
  ['Connection timed out', 'Gói tin không tới nơi: Security Group, firewall hoặc route.', 'Bài 4 và bài 8: kiểm tra cổng 22 có được mở từ IP của bạn không.'],
  ['Permission denied (publickey)', 'Server từ chối key: sai user, key chưa được cài, hoặc quyền thư mục sai.', 'ssh -v để xem key nào được thử; ~/.ssh phải 700, authorized_keys phải 600.'],
  ['REMOTE HOST IDENTIFICATION HAS CHANGED', 'Fingerprint của server khác với lần trước: server mới dựng lại, đổi IP, hoặc (hiếm) bị giả mạo.', 'Xác minh nguyên nhân chính đáng rồi ssh-keygen -R tên-host. Đừng xóa cảnh báo một cách máy móc.'],
  ['Too many authentication failures', 'ssh-agent đang đưa ra quá nhiều key, server ngắt trước khi thử đúng key.', 'Thêm IdentitiesOnly yes và IdentityFile trong ~/.ssh/config.'],
];

export default function SshTunnelVpnPage() {
  return (
    <ArticleShell currentHref="/bai-viet/ssh-tunnel-vpn">
      <ArticleIntro
        eyebrow="Network cho DevOps · Bài 10"
        title="SSH, Tunnel và VPN: đi vào mạng nội bộ một cách an toàn"
        description="Database và server production không nên có cửa mở ra Internet, vậy làm sao bạn vẫn vào được khi cần? Bài này đi từ bài toán thực tế sang công cụ phù hợp: SSH key, tunnel, bastion host và VPN."
        date="22/10/2026"
        readTime="19 phút đọc"
        tags={['Network', 'SSH', 'Tunnel', 'VPN']}
      />

      <ArticleSection id="ssh-va-key" number="01" eyebrow="Nền tảng" title="SSH: một kênh mã hóa, xác thực bằng key">
        <p>
          <strong className="text-ink">SSH</strong> (Secure Shell) mở một kênh được mã hóa giữa hai máy, thường dùng để lấy shell từ xa nhưng cũng chạy được lệnh, chép file (<Code>scp</Code>, <Code>rsync</Code>) và chuyển tiếp cổng (phần chính của bài này). Mật khẩu là cách xác thực yếu và bị dò rất nhiều trên Internet; cách chuẩn là dùng cặp khóa:
        </p>
        <ol className="grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {authSteps.map(([title, text], index) => (
            <li className="bg-card p-4" key={title}>
              <span className="font-mono text-xs font-bold text-primary">{index + 1}</span>
              <h3 className="mt-1 font-bold text-ink">{title}</h3>
              <p className="mt-1 text-xs leading-5">{text}</p>
            </li>
          ))}
        </ol>
        <CodeBlock title="tạo key và cài lên server">{`# ed25519: ngắn, nhanh, an toàn. Hãy đặt passphrase cho private key
ssh-keygen -t ed25519 -C "dat@laptop"

# Chép public key lên server (một lần, cần mật khẩu hoặc quyền sẵn có)
ssh-copy-id -i ~/.ssh/id_ed25519.pub dat@server.example.com

# Từ giờ đăng nhập bằng key
ssh dat@server.example.com`}</CodeBlock>
        <p>
          Lần đầu kết nối tới một máy, SSH hỏi bạn xác nhận <strong className="text-ink">fingerprint</strong> của server rồi lưu vào <Code>~/.ssh/known_hosts</Code>. Những lần sau nếu fingerprint đổi, SSH cảnh báo to và dừng lại: đó là cách nó chống kẻ đứng giữa giả danh server.
        </p>
      </ArticleSection>

      <ArticleSection id="ssh-config" number="02" eyebrow="Tiện tay" title="~/.ssh/config: đừng gõ lại dòng lệnh dài">
        <AnnotatedOutput
          title="~/.ssh/config"
          lines={[
            {
              text: `Host bastion
    HostName bastion.example.com
    User dat
    IdentityFile ~/.ssh/id_ed25519
    IdentitiesOnly yes`,
              note: 'Đặt tên ngắn “bastion” để gõ ssh bastion. IdentitiesOnly ngăn agent thử lung tung nhiều key khác.',
            },
            {
              text: `Host db-tunnel
    HostName bastion.example.com
    User dat
    LocalForward 5433 db.internal:5432`,
              note: 'Lưu sẵn tunnel -L: ssh -N db-tunnel là mở cổng 5433 tới database.',
            },
            {
              text: `Host 10.0.1.*
    User ubuntu
    ProxyJump bastion`,
              note: 'Mọi máy trong dải 10.0.1.x tự động đi qua bastion, nên ssh 10.0.1.25 là đủ, không cần cờ -J.',
            },
          ]}
        />
      </ArticleSection>

      <ArticleSection id="tunnel" number="03" eyebrow="Thực hành" title="Port forwarding: bốn kiểu, bốn bài toán">
        <p>
          Tunnel SSH là việc đưa một cổng TCP đi “xuyên” qua kênh SSH đã mã hóa. Bốn cờ <Code>-L</Code>, <Code>-R</Code>, <Code>-D</Code>, <Code>-J</Code> khác nhau ở <em>ai lắng nghe</em> và <em>ai là người kết nối ra đích</em>. Hãy chọn từng bài toán, điền thông tin và để ý nhãn LISTEN trên sơ đồ.
        </p>
        <SshTunnelBuilder />
        <p>
          Cờ <Code>-N</Code> nghĩa là “đừng chạy lệnh gì, chỉ giữ đường hầm”. Thêm <Code>-f</Code> để đẩy tiến trình ra nền sau khi đăng nhập xong. Muốn tunnel tự dựng lại khi rớt mạng, dùng <Code>autossh</Code> hoặc một systemd service thay vì để một cửa sổ terminal mở mãi.
        </p>
      </ArticleSection>

      <ArticleSection id="bastion" number="04" eyebrow="Kiến trúc" title="Bastion host: một cửa duy nhất vào mạng private">
        <p>
          Thay vì để mỗi server production có cổng SSH mở ra Internet, bạn dựng <strong className="text-ink">một</strong> máy trung gian được canh gác cẩn thận gọi là bastion (hay jump host). Mọi truy cập quản trị đều đi qua nó:
        </p>
        <div className="border border-border bg-card p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            {[
              ['Bạn', 'IP văn phòng / VPN', false],
              ['Bastion', 'public subnet · SG: 22 từ IP của bạn', true],
              ['Server app, DB', 'private subnet · SG: 22 chỉ từ SG của bastion', false],
            ].map(([name, note, highlight], index) => (
              <span className="flex items-center gap-2" key={String(name)}>
                <span className={`block border px-3 py-2 ${highlight ? 'border-primary bg-primary-soft' : 'border-border bg-surface'}`}>
                  <span className={`block ${highlight ? 'text-primary' : 'text-ink'}`}>{name}</span>
                  <span className="mt-0.5 block text-[0.65rem] font-normal text-muted-foreground">{note}</span>
                </span>
                {index < 2 ? <ArrowRight className="text-muted-foreground" size={15} /> : null}
              </span>
            ))}
          </div>
        </div>
        <ul className="list-disc space-y-2 pl-5">
          <li>Chỉ <em>một</em> máy phơi cổng 22 ra ngoài, và chỉ cho IP được phép. Diện tích bị tấn công nhỏ đi rất nhiều.</li>
          <li>Security Group của các máy private chỉ chấp nhận SSH từ <em>Security Group của bastion</em> (bài 8), nên thêm máy mới không phải sửa luật.</li>
          <li>Bastion nên tối giản: không chạy ứng dụng, cập nhật thường xuyên, ghi log mọi phiên đăng nhập.</li>
          <li>Trên AWS còn có lựa chọn không cần mở cổng 22 nào: <strong className="text-ink">Systems Manager Session Manager</strong> mở phiên shell qua kênh quản lý của AWS, xác thực bằng IAM và ghi log tập trung.</li>
        </ul>
      </ArticleSection>

      <ArticleSection id="vpn" number="05" eyebrow="Mở rộng" title="Khi nào nên dùng VPN thay vì tunnel?">
        <div className="overflow-x-auto border border-border bg-card">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="bg-surface font-mono text-xs uppercase tracking-[0.06em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3"><span className="sr-only">Tiêu chí</span></th>
                <th className="px-4 py-3">SSH tunnel</th>
                <th className="px-4 py-3">VPN</th>
              </tr>
            </thead>
            <tbody>
              {vpnCompare.map(([label, ssh, vpn]) => (
                <tr className="border-t border-border" key={label}>
                  <td className="px-4 py-3 font-semibold text-ink">{label}</td>
                  <td className="px-4 py-3">{ssh}</td>
                  <td className="px-4 py-3">{vpn}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Quy tắc ngón tay cái: nếu bạn thấy mình mở đi mở lại các tunnel đến cùng một mạng, hoặc cả team cần vào nhiều dịch vụ nội bộ, đã đến lúc dựng VPN. <strong className="text-ink">WireGuard</strong> là lựa chọn hiện đại và gọn nhất: cấu hình chỉ vài dòng, chạy trên UDP, nằm sẵn trong kernel Linux.
        </p>
        <AnnotatedOutput
          title="/etc/wireguard/wg0.conf trên máy của bạn (client)"
          lines={[
            {
              text: `[Interface]
PrivateKey = <khóa riêng của máy này>
Address = 10.8.0.2/32
DNS = 10.8.0.1`,
              note: 'Danh tính của máy bạn trong mạng VPN: một IP riêng 10.8.0.2 và DNS nội bộ. Không bao giờ commit PrivateKey lên git.',
            },
            {
              text: `[Peer]
PublicKey = <khóa công khai của VPN server>
Endpoint = vpn.example.com:51820`,
              note: 'VPN server là ai và tìm nó ở đâu. WireGuard dùng UDP, cổng mặc định phổ biến là 51820.',
            },
            {
              text: `AllowedIPs = 10.0.0.0/16
PersistentKeepalive = 25`,
              note: 'AllowedIPs vừa là bảng định tuyến (chỉ traffic tới 10.0.0.0/16 đi qua VPN) vừa là ACL. Đặt 0.0.0.0/0 sẽ đẩy toàn bộ traffic qua VPN. Keepalive giúp giữ ô NAT mở.',
            },
          ]}
        />
        <CodeBlock title="bật và kiểm tra">{`sudo wg-quick up wg0     # dựng giao diện wg0 và route theo AllowedIPs
sudo wg show             # xem peer, lần bắt tay gần nhất, lượng dữ liệu
ip route | grep wg0      # xác nhận route đã được thêm`}</CodeBlock>
      </ArticleSection>

      <ArticleSection id="go-loi" number="06" eyebrow="Khi có chuyện" title="Gỡ lỗi SSH và giữ cho nó an toàn">
        <p>
          Công cụ gỡ lỗi quan trọng nhất là <Code>ssh -v</Code> (thêm <Code>-vv</Code>, <Code>-vvv</Code> để chi tiết hơn): nó in ra từng bước, từ kết nối TCP, thương lượng thuật toán, tới các key đã thử. Dựa vào thông báo cuối cùng, bạn có thể thu hẹp nguyên nhân rất nhanh:
        </p>
        <div className="overflow-x-auto border border-border bg-card">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="bg-surface font-mono text-xs uppercase tracking-[0.06em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Thông báo</th>
                <th className="px-4 py-3">Nghĩa là</th>
                <th className="px-4 py-3">Làm gì</th>
              </tr>
            </thead>
            <tbody>
              {sshErrors.map(([message, meaning, action]) => (
                <tr className="border-t border-border" key={message}>
                  <td className="px-4 py-3 font-mono text-xs font-bold text-primary">{message}</td>
                  <td className="px-4 py-3">{meaning}</td>
                  <td className="px-4 py-3">{action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <CodeBlock title="/etc/ssh/sshd_config: bộ cấu hình tối thiểu nên có">{`PasswordAuthentication no     # chỉ cho đăng nhập bằng key
PermitRootLogin no            # không cho login thẳng bằng root
PubkeyAuthentication yes
AllowUsers dat deploy         # giới hạn user được phép

# Kiểm tra cú pháp trước, rồi mới nạp lại (tên service: ssh trên Ubuntu/Debian, sshd trên RHEL)
sudo sshd -t && sudo systemctl reload ssh`}</CodeBlock>
        <Callout tone="warn" title="Đổi port SSH có ích không?">
          Đổi từ 22 sang cổng khác giúp giảm tiếng ồn trong log vì ít bot dò quét, nhưng <strong className="text-ink">không phải bảo mật</strong>: kẻ có chủ đích vẫn quét ra. Hãy ưu tiên các lớp thật sự có tác dụng: tắt mật khẩu, giới hạn IP nguồn bằng firewall, dùng bastion, và bật cảnh báo cho đăng nhập bất thường (ví dụ fail2ban).
        </Callout>
        <p>
          Chúc mừng, đến đây bạn đã đi hết hành trình từ một gói tin trong LAN đến cách vào an toàn một mạng private. Phần tiếp theo của series dự kiến gom lại công cụ chẩn đoán, quy trình troubleshoot, network trong Docker và Kubernetes, và VPC trên cloud.
        </p>
      </ArticleSection>

      <section id="references" className="mt-14 scroll-mt-24 border-t border-border pt-10">
        <p className="section-eyebrow">Đọc thêm</p>
        <h2 className="article-h2">Tài liệu tham khảo</h2>
        <ul className="mt-5 space-y-3 text-sm">
          <ReferenceLink href="https://man.openbsd.org/ssh" label="OpenSSH — man ssh (các tùy chọn -L, -R, -D, -J)" />
          <ReferenceLink href="https://man.openbsd.org/ssh_config" label="OpenSSH — man ssh_config" />
          <ReferenceLink href="https://www.wireguard.com/quickstart/" label="WireGuard — Quick start" />
          <ReferenceLink href="https://www.rfc-editor.org/rfc/rfc4251" label="RFC 4251 — The Secure Shell (SSH) Protocol Architecture" />
        </ul>
      </section>
    </ArticleShell>
  );
}
