import type { Metadata } from 'next';
import { ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { ArticleIntro, ArticleSection, ArticleShell, ReferenceLink } from '@/components/article-shell';
import { HttpMessageBuilder } from '@/components/http-message-builder';
import { AnnotatedOutput, Callout, CodeBlock, Code } from '@/components/network-ui';

export const metadata: Metadata = {
  title: 'HTTP, HTTPS và TLS: đọc được một request thay vì đoán | tiendat13ns',
  description: 'Giải phẫu một HTTP request và response, ý nghĩa các status code (đặc biệt 502, 503, 504), TLS handshake, chuỗi chứng chỉ và cách đọc curl -v, openssl s_client.',
};

const families = [
  { range: '2xx', name: 'Thành công', text: 'Request đã được xử lý.', color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' },
  { range: '3xx', name: 'Chuyển hướng', text: 'Client cần làm thêm một bước, thường là gọi tới URL khác.', color: 'border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-300' },
  { range: '4xx', name: 'Lỗi từ phía client', text: 'Request có vấn đề: sai dữ liệu, thiếu quyền, không tồn tại. Gửi lại y nguyên sẽ vẫn lỗi.', color: 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300' },
  { range: '5xx', name: 'Lỗi từ phía server', text: 'Request có thể đúng nhưng server hoặc đường đi phía sau bị hỏng. Thử lại có thể thành công.', color: 'border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300' },
];

const protocols = [
  ['HTTP/1.1', 'Văn bản, mỗi kết nối xử lý lần lượt từng request (có keep-alive).', 'TCP', 'Vẫn rất phổ biến, dễ đọc bằng mắt.'],
  ['HTTP/2', 'Nhị phân, dồn nhiều request song song trên cùng một kết nối (multiplexing), nén header.', 'TCP + TLS', 'Mặc định của hầu hết website hiện nay.'],
  ['HTTP/3', 'Cùng ý tưởng với HTTP/2 nhưng chạy trên QUIC, nên một gói mất không chặn các luồng khác.', 'UDP (QUIC)', 'Cần mở UDP 443 trên firewall.'],
];

const certIssues = [
  ['Hết hạn', 'Chứng chỉ quá ngày notAfter.', 'Gia hạn; tự động hóa bằng certbot hoặc cert-manager và có cảnh báo trước 14–30 ngày.'],
  ['Sai tên', 'Tên bạn truy cập không có trong CN/SAN của chứng chỉ (ví dụ dùng IP hoặc tên khác).', 'Cấp chứng chỉ có đúng tên, hoặc truy cập bằng đúng tên miền.'],
  ['Thiếu chuỗi', 'Server chỉ gửi leaf, thiếu intermediate. Trình duyệt đôi khi tự vá, curl và ứng dụng thì không.', 'Cấu hình fullchain.pem thay vì cert.pem.'],
  ['Tự ký', 'Chứng chỉ không do CA tin cậy ký.', 'Dùng CA nội bộ và cài root vào máy; đừng dùng -k trong script production.'],
  ['Lệch giờ', 'Đồng hồ máy sai khiến chứng chỉ “chưa có hiệu lực” hoặc “đã hết hạn”.', 'Đồng bộ NTP (chrony, systemd-timesyncd).'],
];

export default function HttpTlsPage() {
  return (
    <ArticleShell currentHref="/bai-viet/http-https-tls">
      <ArticleIntro
        eyebrow="Network cho DevOps · Bài 6"
        title="HTTP, HTTPS và TLS: đọc được một request thay vì đoán"
        description="HTTP chỉ là văn bản có cấu trúc, TLS là lớp mã hóa bọc quanh nó. Khi bạn nhìn được cả hai ở dạng nguyên bản, các mã lỗi như 502 hay “certificate verify failed” thôi mơ hồ."
        date="22/10/2026"
        readTime="18 phút đọc"
        tags={['Network', 'HTTP', 'TLS', 'curl']}
      />

      <ArticleSection id="http-la-van-ban" number="01" eyebrow="Giải phẫu" title="HTTP chỉ là văn bản có cấu trúc">
        <p>
          Dưới lớp công cụ và framework, một HTTP request là vài dòng chữ: dòng đầu cho biết <strong className="text-ink">method</strong> và <strong className="text-ink">đường dẫn</strong>, tiếp theo là các <strong className="text-ink">header</strong> dạng <Code>Tên: giá trị</Code>, một dòng trống đánh dấu hết header, rồi đến <strong className="text-ink">body</strong> nếu có. Response có cấu trúc y hệt, chỉ khác dòng đầu là mã trạng thái.
        </p>
        <p>
          HTTP là giao thức <strong className="text-ink">không lưu trạng thái</strong>: mỗi request độc lập, server không tự nhớ bạn là ai. Những thứ như đăng nhập được xây trên đó bằng cookie hoặc token gửi kèm trong header ở mỗi request.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['GET', 'Đọc dữ liệu. An toàn, không làm thay đổi gì.'],
            ['POST', 'Tạo mới hoặc kích hoạt một hành động. Không idempotent.'],
            ['PUT', 'Thay thế toàn bộ một tài nguyên. Gọi nhiều lần cho cùng kết quả.'],
            ['DELETE', 'Xóa tài nguyên. Idempotent.'],
          ].map(([method, text]) => (
            <div className="border border-border bg-card p-4" key={method}>
              <strong className="font-mono text-sm text-primary">{method}</strong>
              <p className="mt-1 text-xs leading-5">{text}</p>
            </div>
          ))}
        </div>
      </ArticleSection>

      <ArticleSection id="builder" number="02" eyebrow="Thực hành" title="Tự dựng request và đọc response">
        <p>
          Thay đổi method, thử bật tắt header, và để ý hai điều: <Code>Content-Length</Code> tự đổi theo body (đếm theo <em>byte</em> chứ không phải số ký tự), và lệnh <Code>curl</Code> bên dưới luôn khớp với văn bản thô. Sau đó bấm qua các mã trạng thái bên phải.
        </p>
        <HttpMessageBuilder />
      </ArticleSection>

      <ArticleSection id="status-code" number="03" eyebrow="Mã trạng thái" title="Bốn họ mã và bộ ba 502, 503, 504">
        <div className="grid gap-3 sm:grid-cols-2">
          {families.map((family) => (
            <div className={`border p-4 ${family.color}`} key={family.range}>
              <div className="flex items-baseline gap-3">
                <strong className="font-mono text-xl">{family.range}</strong>
                <span className="font-semibold text-ink">{family.name}</span>
              </div>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{family.text}</p>
            </div>
          ))}
        </div>
        <p>
          Khi có reverse proxy hay load balancer đứng trước ứng dụng (bài 9), ba mã 5xx dưới đây thường làm người mới lẫn lộn. Điểm khác nhau là <em>ai đang gặp vấn đề</em>:
        </p>
        <div className="overflow-x-auto border border-border bg-card">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-surface font-mono text-xs uppercase tracking-[0.06em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Mã</th>
                <th className="px-4 py-3">Proxy đã làm gì</th>
                <th className="px-4 py-3">Câu hỏi đầu tiên</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['502 Bad Gateway', 'Cố gọi upstream nhưng kết nối thất bại hoặc nhận về phản hồi không hợp lệ.', 'Ứng dụng phía sau có đang chạy và đúng port không?'],
                ['503 Service Unavailable', 'Không còn upstream nào khỏe để giao việc, hoặc server đang quá tải/bảo trì.', 'Health check có đang fail không? Tài nguyên còn đủ không?'],
                ['504 Gateway Timeout', 'Gọi được upstream nhưng đợi mãi không có câu trả lời.', 'Ứng dụng đang xử lý chậm hay bị treo? Timeout đặt bao nhiêu?'],
              ].map(([code, what, ask]) => (
                <tr className="border-t border-border" key={code}>
                  <td className="px-4 py-3 font-mono text-xs font-bold text-rose-600 dark:text-rose-400">{code}</td>
                  <td className="px-4 py-3">{what}</td>
                  <td className="px-4 py-3 font-semibold text-ink">{ask}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ArticleSection>

      <ArticleSection id="tls" number="04" eyebrow="Bảo mật" title="HTTPS = HTTP + TLS">
        <p>
          HTTP thuần gửi mọi thứ dưới dạng chữ rõ: ai ngồi giữa đường (Wi-Fi công cộng, router lạ) đều đọc và sửa được. <strong className="text-ink">TLS</strong> chèn một lớp vào giữa TCP và HTTP để đảm bảo ba điều:
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ['Bí mật', 'Dữ liệu được mã hóa, người ngoài chỉ thấy chuỗi ngẫu nhiên.'],
            ['Toàn vẹn', 'Bị sửa dù chỉ một bit trên đường đi thì bên nhận phát hiện được.'],
            ['Xác thực', 'Bạn đang nói chuyện đúng với example.com chứ không phải kẻ giả mạo.'],
          ].map(([title, text]) => (
            <div className="border border-border bg-card p-4" key={title}>
              <strong className="text-ink">{title}</strong>
              <p className="mt-1 text-sm leading-6">{text}</p>
            </div>
          ))}
        </div>

        <div className="border border-border bg-card p-5">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.08em] text-primary">TLS 1.3 handshake · một vòng khứ hồi (1-RTT)</p>
          <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-x-3 gap-y-3 text-sm">
            <span className="text-center font-mono text-xs font-bold text-muted-foreground">Client</span>
            <span />
            <span className="text-center font-mono text-xs font-bold text-muted-foreground">Server</span>

            <div className="border border-border bg-surface p-3 text-xs leading-5">
              <strong className="text-ink">ClientHello</strong>
              <br />
              Phiên bản, cipher suite hỗ trợ, key share (ECDHE), SNI (tên host), ALPN (h2, http/1.1)
            </div>
            <ArrowRight className="text-primary" size={18} />
            <span />

            <span />
            <ArrowLeft className="text-primary" size={18} />
            <div className="border border-border bg-surface p-3 text-xs leading-5">
              <strong className="text-ink">ServerHello + Certificate + Finished</strong>
              <br />
              Chọn cipher, key share, gửi chứng chỉ và chứng minh nắm giữ private key. Từ đây mọi thứ đã mã hóa.
            </div>

            <div className="border border-border bg-surface p-3 text-xs leading-5">
              <strong className="text-ink">Finished</strong> + dữ liệu ứng dụng
              <br />
              Client kiểm tra chứng chỉ, xác nhận và gửi luôn request HTTP đầu tiên.
            </div>
            <ArrowRight className="text-primary" size={18} />
            <span />
          </div>
        </div>

        <p>
          Phần “xác thực” dựa vào <strong className="text-ink">chuỗi chứng chỉ</strong>. Server xuất trình chứng chỉ của nó (leaf); trình duyệt kiểm tra nó được ký bởi một CA trung gian, CA này lại được ký bởi một root CA nằm sẵn trong kho tin cậy của hệ điều hành. Ngoài chữ ký, còn phải đúng <em>tên</em> (nằm trong SAN) và còn <em>hạn</em>.
        </p>
        <div className="mx-auto flex max-w-sm flex-col items-stretch gap-1 text-center text-sm">
          {[
            ['Root CA', 'Có sẵn trong hệ điều hành / trình duyệt'],
            ['Intermediate CA', 'Server phải gửi kèm'],
            ['Leaf: example.com', 'Chứng chỉ của bạn, SAN chứa tên domain'],
          ].map(([name, note], index) => (
            <div key={name}>
              {index > 0 ? <ArrowDown className="mx-auto my-1 text-primary" size={16} /> : null}
              <div className="border border-border bg-card px-4 py-3">
                <strong className="block text-ink">{name}</strong>
                <span className="text-xs text-muted-foreground">{note}</span>
              </div>
            </div>
          ))}
          <p className="mt-2 text-xs text-muted-foreground">Mũi tên: “ký cho”. Root ký Intermediate, Intermediate ký Leaf.</p>
        </div>
      </ArticleSection>

      <ArticleSection id="curl-v" number="05" eyebrow="Công cụ" title="Đọc curl -v: thấy cả bắt tay lẫn HTTP">
        <p>
          Cờ <Code>-v</Code> của curl in ra mọi pha ta đã nhắc: dòng bắt đầu bằng <Code>*</Code> là thông tin của curl (kết nối, TLS), <Code>&gt;</Code> là request gửi đi, <Code>&lt;</Code> là response nhận về.
        </p>
        <AnnotatedOutput
          title="curl -v https://example.com/ -o /dev/null"
          lines={[
            { kind: 'command', text: '$ curl -v https://example.com/ -o /dev/null' },
            { text: '*   Trying 203.0.113.10:443...', note: 'Đã phân giải DNS xong và đang mở TCP tới IP đó. Treo ở dòng này → vấn đề TCP/firewall (bài 4).' },
            { text: '* Connected to example.com (203.0.113.10) port 443', note: 'Bắt tay TCP thành công.' },
            { text: '* TLSv1.3 (OUT), TLS handshake, Client hello (1):', note: 'Bắt đầu bắt tay TLS. Treo hoặc lỗi từ đây → vấn đề TLS.' },
            { text: '* SSL connection using TLSv1.3 / TLS_AES_256_GCM_SHA384', note: 'Phiên bản TLS và cipher suite đã thỏa thuận.' },
            { text: '* ALPN: server accepted h2', note: 'Hai bên đồng ý dùng HTTP/2.' },
            { text: '*  subject: CN=example.com', note: 'Chứng chỉ cấp cho tên nào.' },
            { text: '*  expire date: Nov 30 23:59:59 2026 GMT', note: 'Ngày hết hạn. Đây là nơi bạn phát hiện cert sắp hết hạn.' },
            { text: '*  SSL certificate verify ok.', note: 'Chuỗi chứng chỉ, tên và thời hạn đều hợp lệ. Nếu lỗi sẽ thấy “SSL certificate problem …”.' },
            { text: '> GET / HTTP/2', note: 'Đây mới là request HTTP đầu tiên, sau tất cả những bước trên.' },
            { text: '< HTTP/2 200', note: 'Response từ server.' },
          ]}
        />
        <CodeBlock title="một vài lệnh kiểm tra chứng chỉ rất hay dùng">{`# Xem chứng chỉ mà server thật sự gửi (nhớ -servername để chọn đúng site)
openssl s_client -connect example.com:443 -servername example.com </dev/null

# Chỉ lấy ngày hiệu lực, người cấp và tên
openssl s_client -connect example.com:443 -servername example.com </dev/null 2>/dev/null \\
  | openssl x509 -noout -dates -issuer -subject

# Test server mới trước khi đổi DNS: ép example.com trỏ tới IP mới
curl -v --resolve example.com:443:203.0.113.10 https://example.com/`}</CodeBlock>
      </ArticleSection>

      <ArticleSection id="phien-ban-http" number="06" eyebrow="Tiến hóa" title="HTTP/1.1, HTTP/2 và HTTP/3">
        <div className="overflow-x-auto border border-border bg-card">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-surface font-mono text-xs uppercase tracking-[0.06em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Phiên bản</th>
                <th className="px-4 py-3">Đặc điểm</th>
                <th className="px-4 py-3">Chạy trên</th>
                <th className="px-4 py-3">Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              {protocols.map(([version, trait, transport, note]) => (
                <tr className="border-t border-border" key={version}>
                  <td className="px-4 py-3 font-mono text-xs font-bold text-primary">{version}</td>
                  <td className="px-4 py-3">{trait}</td>
                  <td className="px-4 py-3 font-mono text-xs">{transport}</td>
                  <td className="px-4 py-3">{note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Về mặt ý nghĩa (method, header, status code) ba phiên bản giống nhau, nên ứng dụng gần như không phải sửa gì. Khác biệt chủ yếu nằm ở tầng vận chuyển, nơi reverse proxy hay CDN của bạn thường tự lo.
        </p>
      </ArticleSection>

      <ArticleSection id="loi-chung-chi" number="07" eyebrow="Sự cố kinh điển" title="Năm lỗi chứng chỉ hay gặp nhất">
        <div className="overflow-x-auto border border-border bg-card">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-surface font-mono text-xs uppercase tracking-[0.06em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Lỗi</th>
                <th className="px-4 py-3">Nguyên nhân</th>
                <th className="px-4 py-3">Cách xử lý</th>
              </tr>
            </thead>
            <tbody>
              {certIssues.map(([name, cause, fix]) => (
                <tr className="border-t border-border" key={name}>
                  <td className="px-4 py-3 font-semibold text-ink">{name}</td>
                  <td className="px-4 py-3">{cause}</td>
                  <td className="px-4 py-3">{fix}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Callout tone="warn" title="Đừng tắt kiểm tra chứng chỉ cho tiện">
          <Code>curl -k</Code> hoặc <Code>verify=False</Code> làm lỗi biến mất nhưng cũng làm mất luôn lớp xác thực, tức là mất nửa giá trị của HTTPS. Hãy tìm ra vì sao chứng chỉ không hợp lệ thay vì né nó, nhất là trong pipeline và script production.
        </Callout>
      </ArticleSection>

      <section id="references" className="mt-14 scroll-mt-24 border-t border-border pt-10">
        <p className="section-eyebrow">Đọc thêm</p>
        <h2 className="article-h2">Tài liệu tham khảo</h2>
        <ul className="mt-5 space-y-3 text-sm">
          <ReferenceLink href="https://developer.mozilla.org/en-US/docs/Web/HTTP" label="MDN — Tài liệu HTTP" />
          <ReferenceLink href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Status" label="MDN — Danh sách HTTP status code" />
          <ReferenceLink href="https://www.rfc-editor.org/rfc/rfc9110" label="RFC 9110 — HTTP Semantics" />
          <ReferenceLink href="https://www.rfc-editor.org/rfc/rfc8446" label="RFC 8446 — TLS 1.3" />
          <ReferenceLink href="https://letsencrypt.org/docs/" label="Let's Encrypt — Tài liệu và quy trình cấp chứng chỉ" />
        </ul>
      </section>
    </ArticleShell>
  );
}
