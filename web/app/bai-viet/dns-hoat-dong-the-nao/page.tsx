import type { Metadata } from 'next';
import { ArticleIntro, ArticleSection, ArticleShell, ReferenceLink } from '@/components/article-shell';
import { DnsResolutionWalk } from '@/components/dns-resolution-walk';
import { AnnotatedOutput, Callout, CodeBlock, Code } from '@/components/network-ui';

export const metadata: Metadata = {
  title: 'DNS hoạt động thế nào? Lần theo một câu hỏi từ máy bạn đến root server | tiendat13ns',
  description: 'Hiểu phân cấp DNS, cách resolver tìm bản ghi, các loại record, TTL, cách đọc kết quả dig và gỡ các lỗi DNS thường gặp.',
};

const records = [
  ['A', 'Tên → địa chỉ IPv4', 'www  A  203.0.113.10'],
  ['AAAA', 'Tên → địa chỉ IPv6', 'www  AAAA  2001:db8::10'],
  ['CNAME', 'Tên này là bí danh của tên khác', 'www  CNAME  example.com.'],
  ['MX', 'Mail của domain gửi tới server nào, ưu tiên bao nhiêu', '@  MX  10 mail.example.com.'],
  ['TXT', 'Văn bản tùy ý: SPF, DKIM, xác minh quyền sở hữu', '@  TXT  "v=spf1 -all"'],
  ['NS', 'Server nào quản lý (authoritative) cho zone này', '@  NS  ns1.example.com.'],
  ['PTR', 'Tra ngược: IP → tên', '10.113.0.203.in-addr.arpa  PTR  www.example.com.'],
];

const symptoms = [
  ['NXDOMAIN', 'Tên không tồn tại (theo DNS)', 'Gõ sai tên, quên tạo bản ghi, bản ghi nằm ở zone khác hoặc domain hết hạn.'],
  ['SERVFAIL', 'Resolver cố nhưng thất bại', 'Authoritative server chết hoặc cấu hình hỏng, DNSSEC sai chữ ký.'],
  ['Timeout', 'Không ai trả lời', 'DNS server không tới được (firewall chặn UDP/TCP 53), cấu hình resolv.conf trỏ sai.'],
  ['Ra IP cũ', 'Vẫn thấy địa chỉ trước khi đổi', 'Cache còn hạn (TTL), hoặc đang dùng nhầm resolver nội bộ trả bản ghi khác (split-horizon).'],
  ['Dùng IP được, dùng tên thì không', 'Mạng thông, DNS hỏng', 'Hầu như chắc chắn là vấn đề DNS: kiểm tra resolver mà máy đang dùng.'],
];

export default function DnsPage() {
  return (
    <ArticleShell currentHref="/bai-viet/dns-hoat-dong-the-nao">
      <ArticleIntro
        eyebrow="Network cho DevOps · Bài 5"
        title="DNS hoạt động thế nào? Lần theo một câu hỏi từ máy bạn đến root server"
        description="Gần như mọi lỗi “không kết nối được” đều có thể là lỗi DNS ngụy trang. Bài này đi theo một truy vấn qua từng tầng của hệ thống phân cấp để bạn biết nên nghi ngờ ai, và công cụ nào để hỏi."
        date="22/10/2026"
        readTime="17 phút đọc"
        tags={['Network', 'DNS', 'dig']}
      />

      <div className="border border-border bg-card p-5 sm:p-6">
        <p className="text-sm font-semibold text-ink">Có một câu nói vui trong giới vận hành:</p>
        <p className="mt-2 text-lg font-bold leading-8 text-primary">“Không phải DNS. Không thể là DNS. Đúng là DNS rồi.”</p>
        <p className="mt-2 text-sm leading-6">Hiểu DNS không phải để chứng minh câu đó đúng, mà để loại trừ nó trong ba phút thay vì ba tiếng.</p>
      </div>

      <ArticleSection id="phan-cap" number="01" eyebrow="Cấu trúc" title="DNS là danh bạ phân tán, đọc từ phải sang trái">
        <p>
          Ngày xưa mọi tên máy nằm trong một file <Code>hosts</Code> duy nhất được chép đi khắp nơi. Khi Internet lớn lên, cách đó không còn khả thi, nên DNS được thiết kế như một cây phân cấp: <strong className="text-ink">không ai nắm toàn bộ, mỗi tầng chỉ biết chỉ đường xuống tầng dưới</strong>.
        </p>
        <div className="overflow-x-auto border border-border bg-card p-5">
          <div className="flex min-w-[520px] items-stretch gap-2 text-center">
            {[
              ['www', 'Hostname', 'Do chủ domain tự đặt', 'border-emerald-500/50 bg-emerald-500/10'],
              ['example', 'Domain', 'Bạn đăng ký ở nhà đăng ký', 'border-amber-500/50 bg-amber-500/10'],
              ['com', 'TLD', 'Top-level domain', 'border-sky-500/50 bg-sky-500/10'],
              ['.', 'Root', '13 nhóm root server', 'border-violet-500/50 bg-violet-500/10'],
            ].map(([label, role, note, color], index) => (
              <div className="flex flex-1 items-center gap-2" key={role}>
                <div className={`flex-1 border px-2 py-3 ${color}`}>
                  <div className="font-mono text-lg font-bold text-ink">{label}</div>
                  <div className="mt-1 text-xs font-semibold text-ink">{role}</div>
                  <div className="mt-0.5 text-[0.68rem] leading-4 text-muted-foreground">{note}</div>
                </div>
                {index < 3 ? <span className="font-mono text-lg font-bold text-primary">.</span> : null}
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Tên đầy đủ (FQDN) thật ra là <span className="font-mono text-ink">www.example.com.</span> với một dấu chấm ở cuối đại diện cho root.</p>
        </div>
        <p>
          Cách phân cấp này gọi là <strong className="text-ink">ủy quyền</strong> (delegation): root biết server của <Code>.com</Code>, server của <Code>.com</Code> biết server của <Code>example.com</Code>, và server của <Code>example.com</Code> mới biết <Code>www</Code> trỏ về IP nào. Mỗi nhóm server như vậy được gọi là một <strong className="text-ink">authoritative server</strong> cho phần của mình.
        </p>
      </ArticleSection>

      <ArticleSection id="mo-phong" number="02" eyebrow="Thực hành" title="Theo chân một truy vấn">
        <p>
          Máy bạn không tự đi hỏi root hay TLD. Nó nhờ một <strong className="text-ink">recursive resolver</strong> (DNS của nhà mạng, hoặc 8.8.8.8, 1.1.1.1) làm toàn bộ việc, rồi chỉ nhận kết quả cuối cùng. Chạy kịch bản “chưa có gì trong cache” trước, sau đó thử ba kịch bản còn lại và so sánh thời gian.
        </p>
        <DnsResolutionWalk />
        <p>
          Điểm đáng chú ý là cache ở <em>mọi</em> tầng: trình duyệt, hệ điều hành, resolver. Trong thực tế, phần lớn truy vấn được trả lời từ cache, và root server hiếm khi bị hỏi vì resolver đã nhớ NS của các TLD từ rất lâu.
        </p>
      </ArticleSection>

      <ArticleSection id="loai-ban-ghi" number="03" eyebrow="Từ vựng" title="Các loại bản ghi bạn sẽ gặp">
        <div className="overflow-x-auto border border-border bg-card">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-surface font-mono text-xs uppercase tracking-[0.06em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Loại</th>
                <th className="px-4 py-3">Dùng để</th>
                <th className="px-4 py-3">Ví dụ</th>
              </tr>
            </thead>
            <tbody>
              {records.map(([type, use, sample]) => (
                <tr className="border-t border-border" key={type}>
                  <td className="px-4 py-2.5 font-mono font-bold text-primary">{type}</td>
                  <td className="px-4 py-2.5">{use}</td>
                  <td className="px-4 py-2.5 font-mono text-xs">{sample}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <CodeBlock title="zone file của example.com (rút gọn)">{`$ORIGIN example.com.
$TTL 300
@     IN  SOA  ns1.example.com. admin.example.com. (
                2026102201 ; serial
                7200 3600 1209600 300 )
@     IN  NS   ns1.example.com.
@     IN  A    203.0.113.10
www   IN  CNAME example.com.
@     IN  MX   10 mail.example.com.
@     IN  TXT  "v=spf1 include:_spf.example.com ~all"`}</CodeBlock>
        <Callout tone="warn" title="Hai luật hay làm vấp người mới">
          Một tên đã có CNAME thì <strong className="text-ink">không được</strong> có bản ghi nào khác cùng tên. Vì ở gốc domain (<Code>example.com</Code>) luôn phải có SOA và NS nên không đặt được CNAME ở đó; các nhà cung cấp DNS giải quyết bằng loại bản ghi riêng như ALIAS hoặc ANAME.
        </Callout>
      </ArticleSection>

      <ArticleSection id="doc-dig" number="04" eyebrow="Công cụ" title="Đọc kết quả của dig">
        <p>
          <Code>dig</Code> cho bạn xem nguyên văn câu trả lời DNS, không bị trình duyệt hay <Code>/etc/hosts</Code> che mắt. Lần đầu nhìn output khá rối, nhưng chỉ có vài chỗ cần để ý:
        </p>
        <AnnotatedOutput
          title="dig www.example.com"
          lines={[
            { kind: 'command', text: '$ dig www.example.com' },
            {
              text: ';; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 41523',
              note: <>Dòng quan trọng nhất là <Code>status</Code>: NOERROR (ổn), NXDOMAIN (tên không tồn tại), SERVFAIL (resolver thất bại), REFUSED (bị từ chối).</>,
            },
            {
              text: ';; flags: qr rd ra; QUERY: 1, ANSWER: 1',
              note: 'qr: đây là câu trả lời. rd/ra: hỏi và resolver chấp nhận đệ quy. Có thêm aa nghĩa là server trả lời là authoritative.',
            },
            { text: ';www.example.com.          IN  A', note: 'Câu hỏi: bản ghi loại A của tên này.' },
            {
              text: 'www.example.com.   187  IN  A   203.0.113.10',
              note: 'Câu trả lời. Số 187 là TTL còn lại (giây) trong cache của resolver, nên mỗi lần hỏi nó giảm dần. Hỏi lại sau vài giây sẽ thấy số nhỏ đi.',
            },
            {
              text: ';; Query time: 23 msec',
              note: 'Thời gian truy vấn. Vài ms nghĩa là có cache; vài chục đến vài trăm ms nghĩa là resolver phải đi hỏi.',
            },
            {
              text: ';; SERVER: 127.0.0.53#53(127.0.0.53) (UDP)',
              note: 'Resolver mà máy bạn đã dùng. 127.0.0.53 là stub của systemd-resolved, nó chuyển tiếp lên DNS thật.',
            },
          ]}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ['dig +short www.example.com', 'Chỉ in kết quả, tiện cho script.'],
            ['dig @1.1.1.1 www.example.com', 'Hỏi thẳng một resolver cụ thể để so sánh với DNS mặc định.'],
            ['dig +trace www.example.com', 'Tự đi từ root xuống, lặp lại đúng như mô phỏng ở trên.'],
            ['dig example.com MX', 'Hỏi loại bản ghi khác (MX, TXT, NS…).'],
            ['dig -x 203.0.113.10', 'Tra ngược từ IP ra tên (PTR).'],
            ['getent hosts www.example.com', 'Cách ứng dụng thật sự phân giải: có đọc /etc/hosts và nsswitch.'],
          ].map(([command, note]) => (
            <div className="border border-border bg-card p-4" key={command}>
              <code className="break-all font-mono text-xs font-bold text-primary-dark">{command}</code>
              <p className="mt-1.5 text-sm leading-6">{note}</p>
            </div>
          ))}
        </div>
      </ArticleSection>

      <ArticleSection id="ttl" number="05" eyebrow="Thời gian" title="TTL và chuyện “DNS chưa lan truyền”">
        <p>
          Mỗi bản ghi mang một <strong className="text-ink">TTL</strong> (Time To Live, tính bằng giây): thời gian tối đa các cache được phép nhớ nó. Khi bạn đổi IP của một bản ghi, không có “đợt lan truyền” nào được gửi đi cả. Chỉ có hàng nghìn cache, mỗi cái hết hạn vào lúc khác nhau, rồi lần lượt hỏi lại và nhận giá trị mới.
        </p>
        <div className="border border-border bg-card p-5">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.08em] text-primary">Quy trình đổi IP an toàn</p>
          <ol className="mt-3 space-y-3 text-sm leading-6">
            {[
              ['Hạ TTL trước', 'Đặt TTL của bản ghi xuống 60–300 giây, và chờ ít nhất bằng TTL cũ để các cache đã nhớ giá trị dài hết hạn.'],
              ['Đổi bản ghi', 'Cập nhật sang IP mới. Lúc này tối đa vài phút là mọi nơi đã thấy giá trị mới.'],
              ['Theo dõi', 'Dùng dig @8.8.8.8 và dig @1.1.1.1 để xác nhận từ nhiều resolver. Giữ server cũ chạy cho đến khi hết lưu lượng.'],
              ['Nâng TTL lại', 'Khi ổn định, tăng TTL lên (ví dụ 1 giờ) để giảm tải và tăng tốc độ phản hồi.'],
            ].map(([title, text], index) => (
              <li className="flex gap-3" key={title}>
                <span className="grid size-6 shrink-0 place-items-center border border-primary/40 bg-primary-soft font-mono text-xs font-bold text-primary">{index + 1}</span>
                <span><strong className="text-ink">{title}.</strong> {text}</span>
              </li>
            ))}
          </ol>
        </div>
      </ArticleSection>

      <ArticleSection id="go-loi" number="06" eyebrow="Khi có chuyện" title="Triệu chứng và hướng điều tra">
        <div className="overflow-x-auto border border-border bg-card">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-surface font-mono text-xs uppercase tracking-[0.06em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Triệu chứng</th>
                <th className="px-4 py-3">Nghĩa là</th>
                <th className="px-4 py-3">Hay do</th>
              </tr>
            </thead>
            <tbody>
              {symptoms.map(([symptom, meaning, cause]) => (
                <tr className="border-t border-border" key={symptom}>
                  <td className="px-4 py-2.5 font-mono text-xs font-bold text-primary">{symptom}</td>
                  <td className="px-4 py-2.5 font-semibold text-ink">{meaning}</td>
                  <td className="px-4 py-2.5">{cause}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Trên Linux hiện đại, file <Code>/etc/resolv.conf</Code> thường chỉ chứa <Code>nameserver 127.0.0.53</Code> vì <Code>systemd-resolved</Code> đứng giữa; dùng <Code>resolvectl status</Code> để xem DNS thật mà máy đang dùng. Container cũng có resolver riêng: trong mạng Docker do người dùng tạo, DNS nội bộ nằm ở <Code>127.0.0.11</Code> và cho phép container gọi nhau bằng tên.
        </p>
        <Callout tone="tip" title="Mẹo phân biệt nhanh">
          Chạy <Code>dig tên</Code> mà ra kết quả đúng nhưng <Code>curl tên</Code> vẫn lỗi? Có thể có một dòng trong <Code>/etc/hosts</Code> hoặc cache cục bộ đang che. Ngược lại nếu <Code>dig</Code> sai thì nguyên nhân nằm ngoài máy bạn.
        </Callout>
      </ArticleSection>

      <section id="references" className="mt-14 scroll-mt-24 border-t border-border pt-10">
        <p className="section-eyebrow">Đọc thêm</p>
        <h2 className="article-h2">Tài liệu tham khảo</h2>
        <ul className="mt-5 space-y-3 text-sm">
          <ReferenceLink href="https://www.rfc-editor.org/rfc/rfc1035" label="RFC 1035 — Domain Names: Implementation and Specification" />
          <ReferenceLink href="https://www.cloudflare.com/learning/dns/what-is-dns/" label="Cloudflare Learning — DNS là gì" />
          <ReferenceLink href="https://www.root-servers.org/" label="root-servers.org — Bản đồ các root server" />
        </ul>
      </section>
    </ArticleShell>
  );
}
