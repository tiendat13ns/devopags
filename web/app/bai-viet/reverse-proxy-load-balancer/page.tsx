import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import { ArticleIntro, ArticleSection, ArticleShell, ReferenceLink } from '@/components/article-shell';
import { LoadBalancerSim } from '@/components/load-balancer-sim';
import { AnnotatedOutput, Callout, CodeBlock, Code } from '@/components/network-ui';

export const metadata: Metadata = {
  title: 'Reverse Proxy và Load Balancer: một cửa vào, nhiều server phía sau | tiendat13ns',
  description: 'Phân biệt forward proxy và reverse proxy, cấu hình Nginx tối thiểu, so sánh round robin, least connections, IP hash qua mô phỏng, hiểu L4 và L7, health check và lỗi 502/504.',
};

const reverseJobs = [
  ['TLS termination', 'Giải mã HTTPS ở một chỗ duy nhất; ứng dụng phía sau nói HTTP thường, và bạn chỉ quản lý chứng chỉ một nơi.'],
  ['Định tuyến theo nội dung', 'Cùng một IP, /api đi về service A, /static đi về service B, app.example.com và blog.example.com đi về hai nơi khác nhau.'],
  ['Cân bằng tải', 'Chia request cho nhiều bản sao của ứng dụng và bỏ qua bản nào đang hỏng.'],
  ['Cache và nén', 'Lưu phản hồi tĩnh, nén gzip/brotli để ứng dụng nhẹ gánh.'],
  ['Bảo vệ', 'Che giấu địa chỉ backend, giới hạn tốc độ, chặn request bất thường trước khi chạm vào ứng dụng.'],
];

const layerRows = [
  ['Nhìn thấy gì', 'IP và port', 'Toàn bộ HTTP: URL, header, cookie'],
  ['Định tuyến theo', 'Địa chỉ và port đích', 'Host, đường dẫn, header, method…'],
  ['TLS', 'Thường chuyển nguyên gói (passthrough)', 'Thường giải mã tại LB'],
  ['Tốc độ', 'Rất nhanh, tốn ít tài nguyên', 'Chậm hơn vì phải hiểu giao thức'],
  ['Ví dụ', 'AWS NLB, HAProxy mode tcp, IPVS', 'Nginx, AWS ALB, Traefik, Envoy, Ingress'],
];

export default function ReverseProxyPage() {
  return (
    <ArticleShell currentHref="/bai-viet/reverse-proxy-load-balancer">
      <ArticleIntro
        eyebrow="Network cho DevOps · Bài 9"
        title="Reverse Proxy và Load Balancer: một cửa vào, nhiều server phía sau"
        description="Gần như mọi hệ thống chạy thật đều có một thành phần đứng giữa người dùng và ứng dụng. Bài này giải thích nó làm gì, chọn server bằng cách nào, và vì sao nó là nơi bạn thường gặp lỗi 502, 504."
        date="22/10/2026"
        readTime="18 phút đọc"
        tags={['Network', 'Nginx', 'Load Balancer', 'Reverse Proxy']}
      />

      <ArticleSection id="forward-va-reverse" number="01" eyebrow="Phân biệt" title="Proxy đứng về phía ai?">
        <p>
          Proxy là bên trung gian chuyển tiếp request. Điều phân biệt hai loại là <strong className="text-ink">nó đại diện cho ai</strong>:
        </p>
        <div className="space-y-3">
          {[
            {
              name: 'Forward proxy',
              side: 'đại diện cho client',
              flow: ['Client nội bộ', 'Forward proxy', 'Internet'],
              note: 'Proxy của công ty: nhân viên đi ra ngoài qua đó, công ty lọc hoặc ghi log. Server bên ngoài chỉ thấy proxy.',
            },
            {
              name: 'Reverse proxy',
              side: 'đại diện cho server',
              flow: ['Client (Internet)', 'Reverse proxy', 'Server nội bộ'],
              note: 'Nginx đặt trước ứng dụng: người dùng chỉ biết một địa chỉ công khai, còn phía sau có bao nhiêu server họ không thấy.',
            },
          ].map((item) => (
            <div className="border border-border bg-card p-4 sm:p-5" key={item.name}>
              <div className="flex flex-wrap items-baseline gap-x-3">
                <strong className="text-ink">{item.name}</strong>
                <span className="font-mono text-xs text-primary">{item.side}</span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold">
                {item.flow.map((step, index) => (
                  <span className="flex items-center gap-2" key={step}>
                    <span className={`border px-3 py-2 ${index === 1 ? 'border-primary bg-primary-soft text-primary' : 'border-border bg-surface text-ink'}`}>{step}</span>
                    {index < item.flow.length - 1 ? <ArrowRight className="text-muted-foreground" size={15} /> : null}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-sm leading-6">{item.note}</p>
            </div>
          ))}
        </div>
        <p>
          <strong className="text-ink">Load balancer</strong> thực chất là một reverse proxy có thêm nhiệm vụ chia request cho nhiều server. Ranh giới giữa hai tên gọi rất mờ: Nginx hay HAProxy đều đóng cả hai vai.
        </p>
      </ArticleSection>

      <ArticleSection id="lam-duoc-gi" number="02" eyebrow="Giá trị" title="Reverse proxy làm được những gì?">
        <div className="grid gap-3 sm:grid-cols-2">
          {reverseJobs.map(([title, text], index) => (
            <div className={`border border-border bg-card p-4 ${index === reverseJobs.length - 1 ? 'sm:col-span-2' : ''}`} key={title}>
              <h3 className="font-bold text-ink">{title}</h3>
              <p className="mt-1 text-sm leading-6">{text}</p>
            </div>
          ))}
        </div>
        <Callout tone="warn" title="Ứng dụng của bạn giờ thấy IP của proxy">
          Vì kết nối đến ứng dụng thực chất do proxy tạo ra, địa chỉ nguồn trong log của ứng dụng sẽ luôn là IP của proxy. Proxy phải chuyển IP thật của client qua header, thường là <Code>X-Forwarded-For</Code>, và ứng dụng phải được cấu hình để tin header đó (chỉ khi nó đến từ proxy của mình). Nếu quên, rate limit, log truy cập và geo-IP của bạn đều sai.
        </Callout>
      </ArticleSection>

      <ArticleSection id="nginx" number="03" eyebrow="Thực hành" title="Cấu hình Nginx tối thiểu, đọc từng khối">
        <AnnotatedOutput
          title="/etc/nginx/conf.d/app.conf"
          lines={[
            {
              text: `upstream app_backend {
    least_conn;
    server 10.0.1.11:3000 max_fails=3 fail_timeout=10s;
    server 10.0.1.12:3000 max_fails=3 fail_timeout=10s;
}`,
              note: 'Danh sách server phía sau. least_conn chọn thuật toán. max_fails/fail_timeout: lỗi 3 lần thì tạm loại server 10 giây (kiểm tra sức khỏe thụ động).',
            },
            {
              text: `server {
    listen 443 ssl;
    server_name example.com;
    ssl_certificate     /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;`,
              note: 'Nginx lắng nghe HTTPS cho tên example.com và giải mã TLS tại đây. Dùng fullchain.pem để gửi đủ chuỗi chứng chỉ (bài 6).',
            },
            {
              text: `    location / {
        proxy_pass http://app_backend;`,
              note: 'Mọi đường dẫn được chuyển tới nhóm upstream. Bạn có thể thêm location /api, location /static để định tuyến riêng.',
            },
            {
              text: `        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;`,
              note: 'Báo cho ứng dụng biết tên host gốc, IP thật của client và client đã dùng http hay https.',
            },
            {
              text: `        proxy_read_timeout 30s;
    }
}`,
              note: 'Chờ phản hồi tối đa 30 giây. Quá hạn sẽ trả 504 cho client.',
            },
          ]}
        />
        <CodeBlock title="kiểm tra rồi mới áp dụng">{`sudo nginx -t                    # kiểm tra cú pháp, KHÔNG ảnh hưởng đang chạy
sudo systemctl reload nginx      # nạp cấu hình mới mà không ngắt kết nối hiện có`}</CodeBlock>
      </ArticleSection>

      <ArticleSection id="mo-phong" number="04" eyebrow="Mô phỏng" title="Ba cách chia việc">
        <p>
          Server <Code>app-3</Code> trong mô phỏng yếu hơn, xử lý chậm gấp đôi. Hãy bấm “Gửi 10” với từng thuật toán và so sánh số request mỗi server nhận. Sau đó thử cho một server sập giữa chừng. Với IP hash, hãy chọn các client khác nhau và để ý server nào được chọn.
        </p>
        <LoadBalancerSim />
        <p>
          Thuật toán đúng phụ thuộc vào bản chất công việc, không có đáp án duy nhất. Request ngắn và đều: round robin là đủ. Request có độ dài chênh lệch hoặc server không đồng đều: least connections. Ứng dụng giữ trạng thái trong bộ nhớ và chưa thể sửa: sticky session bằng IP hash hoặc cookie, dù cách bền vững hơn là làm ứng dụng không lưu trạng thái cục bộ.
        </p>
      </ArticleSection>

      <ArticleSection id="l4-l7" number="05" eyebrow="Chọn công cụ" title="Load balancer tầng 4 và tầng 7">
        <p>
          Từ bài 1 bạn đã biết L4 là tầng của port, L7 là tầng của nội dung ứng dụng. Load balancer cũng được chia theo tầng mà nó hiểu:
        </p>
        <div className="overflow-x-auto border border-border bg-card">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="bg-surface font-mono text-xs uppercase tracking-[0.06em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3"><span className="sr-only">Tiêu chí</span></th>
                <th className="px-4 py-3">Layer 4 (TCP/UDP)</th>
                <th className="px-4 py-3">Layer 7 (HTTP)</th>
              </tr>
            </thead>
            <tbody>
              {layerRows.map(([label, l4, l7]) => (
                <tr className="border-t border-border" key={label}>
                  <td className="px-4 py-3 font-semibold text-ink">{label}</td>
                  <td className="px-4 py-3">{l4}</td>
                  <td className="px-4 py-3">{l7}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Với web thông thường, L7 gần như luôn là lựa chọn mặc định vì cho phép định tuyến theo URL và quản lý chứng chỉ tập trung. L4 xuất hiện khi giao thức không phải HTTP (database, MQTT, game) hoặc khi cần hiệu năng thô.
        </p>
      </ArticleSection>

      <ArticleSection id="health-check" number="06" eyebrow="Vận hành" title="Health check và những lỗi bạn sẽ gặp">
        <p>
          Load balancer chỉ giúp được khi nó biết server nào còn sống. Có hai cách:
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="border border-border bg-card p-4">
            <h3 className="font-bold text-ink">Thụ động</h3>
            <p className="mt-1 text-sm leading-6">Quan sát lưu lượng thật: nếu một server liên tục lỗi hoặc timeout thì tạm loại. Có sẵn trong Nginx mã nguồn mở (<Code>max_fails</Code>). Nhược điểm: người dùng thật phải chịu vài lỗi đầu tiên.</p>
          </div>
          <div className="border border-border bg-card p-4">
            <h3 className="font-bold text-ink">Chủ động</h3>
            <p className="mt-1 text-sm leading-6">Định kỳ gọi một endpoint như <Code>/healthz</Code> và loại server không trả 200. Có trong HAProxy, Traefik, ALB, Nginx Plus. Endpoint nên kiểm tra thứ ứng dụng thật sự cần, không chỉ trả 200 vô điều kiện.</p>
          </div>
        </div>

        <div className="overflow-x-auto border border-border bg-card">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-surface font-mono text-xs uppercase tracking-[0.06em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Bạn thấy</th>
                <th className="px-4 py-3">Thường là</th>
                <th className="px-4 py-3">Kiểm tra</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['502 ngay lập tức', 'Upstream không chạy, sai port, hoặc đóng kết nối đột ngột', 'ss -tlnp trên backend; proxy_pass có đúng địa chỉ không; log ứng dụng'],
                ['504 sau ~30 giây', 'Upstream chạy nhưng xử lý quá lâu', 'Truy vấn chậm, tắc nghẽn tài nguyên; so với proxy_read_timeout'],
                ['503 khi đang bảo trì hoặc mọi server fail', 'Không còn upstream khỏe', 'Trạng thái health check; tài nguyên của backend'],
                ['Chỉ một vài request lỗi', 'Một trong N server hỏng', 'So log từng server; kiểm tra bản deploy lệch phiên bản'],
              ].map(([symptom, cause, check]) => (
                <tr className="border-t border-border" key={symptom}>
                  <td className="px-4 py-3 font-semibold text-ink">{symptom}</td>
                  <td className="px-4 py-3">{cause}</td>
                  <td className="px-4 py-3">{check}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Callout title="Nginx và tên miền trong upstream">
          Nginx mã nguồn mở phân giải tên host trong khối <Code>upstream</Code> <em>một lần lúc khởi động</em>. Khi dùng Docker Compose (<Code>server app:3000;</Code>), nếu container <Code>app</Code> được tạo lại với IP mới, Nginx vẫn trỏ về IP cũ và bạn nhận 502 cho đến khi reload. Cách khắc phục là reload Nginx sau khi deploy, hoặc dùng <Code>resolver 127.0.0.11</Code> cùng biến trong <Code>proxy_pass</Code> để phân giải lại theo TTL (bài 5).
        </Callout>
      </ArticleSection>

      <section id="references" className="mt-14 scroll-mt-24 border-t border-border pt-10">
        <p className="section-eyebrow">Đọc thêm</p>
        <h2 className="article-h2">Tài liệu tham khảo</h2>
        <ul className="mt-5 space-y-3 text-sm">
          <ReferenceLink href="https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/" label="Nginx — Cấu hình reverse proxy" />
          <ReferenceLink href="https://nginx.org/en/docs/http/load_balancing.html" label="Nginx — Using nginx as HTTP load balancer" />
          <ReferenceLink href="https://docs.aws.amazon.com/elasticloadbalancing/latest/userguide/what-is-load-balancing.html" label="AWS — Elastic Load Balancing là gì" />
        </ul>
      </section>
    </ArticleShell>
  );
}
