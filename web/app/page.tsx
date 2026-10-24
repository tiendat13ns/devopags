import Link from 'next/link';
import { ArrowUpRight, Menu, Terminal } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { PaginatedPostList, type Post } from '@/components/post-list';
import { SocialLinks } from '@/components/social-links';
import { AnimatedTerminal } from '@/components/animated-terminal';
import { GithubContributions } from '@/components/github-contributions';

const documentPosts: Post[] = [
  {
    title: 'Terraform: viết lại hạ tầng AWS bằng code',
    description: 'Infrastructure as Code, provider, resource, state; viết lại VPC public/private của series bằng Terraform, đọc plan, remote state trên S3 và drift.',
    date: '25/10/2026',
    readTime: '19 phút đọc',
    tags: ['Cloud', 'AWS', 'Terraform', 'IaC'],
    href: '/bai-viet/terraform-iac-aws',
    accent: 'amethyst',
  },
  {
    title: 'RDS: database được quản lý trên AWS',
    description: 'RDS so với tự cài trên EC2, DB subnet group, Multi-AZ và read replica, backup và point-in-time restore, Secrets Manager, demo PostgreSQL qua SSH tunnel.',
    date: '25/10/2026',
    readTime: '16 phút đọc',
    tags: ['Cloud', 'AWS', 'RDS', 'Database'],
    href: '/bai-viet/aws-rds-co-so-du-lieu',
    accent: 'amethyst',
  },
  {
    title: 'S3: lưu trữ object, quyền truy cập và chi phí',
    description: 'Bucket, key và prefix, storage class và lifecycle, Block Public Access, bucket policy, presigned URL, versioning và mã hóa.',
    date: '25/10/2026',
    readTime: '16 phút đọc',
    tags: ['Cloud', 'AWS', 'S3', 'Storage'],
    href: '/bai-viet/aws-s3-luu-tru-object',
    accent: 'amethyst',
  },
  {
    title: 'Load Balancer và Auto Scaling: chịu tải và tự hồi phục',
    description: 'ALB, NLB và GWLB, target group và health check, launch template, scaling policy, mô phỏng target tracking và demo ALB + ASG.',
    date: '25/10/2026',
    readTime: '18 phút đọc',
    tags: ['Cloud', 'AWS', 'ELB', 'Auto Scaling'],
    href: '/bai-viet/aws-elb-auto-scaling',
    accent: 'amethyst',
  },
  {
    title: 'EC2 và EBS: máy ảo và ổ đĩa trên AWS',
    description: 'Vòng đời instance, cách đọc tên instance type, AMI, user data, IMDSv2, EBS so với instance store và EFS, On-Demand, Savings Plans và Spot.',
    date: '25/10/2026',
    readTime: '17 phút đọc',
    tags: ['Cloud', 'AWS', 'EC2', 'EBS'],
    href: '/bai-viet/aws-ec2-ebs',
    accent: 'amethyst',
  },
  {
    title: 'IAM: ai được làm gì trên tài khoản AWS',
    description: 'User, group, role, cấu trúc policy JSON, cách AWS đánh giá allow và deny, credential tạm thời cho EC2 và least privilege.',
    date: '25/10/2026',
    readTime: '18 phút đọc',
    tags: ['Cloud', 'AWS', 'IAM', 'Security'],
    href: '/bai-viet/aws-iam-user-role-policy',
    accent: 'amethyst',
  },
  {
    title: 'Cloud computing và AWS: bắt đầu từ đâu?',
    description: 'IaaS, PaaS, SaaS và serverless, Region và Availability Zone, mô hình trách nhiệm chia sẻ và thiết lập tài khoản AWS an toàn.',
    date: '25/10/2026',
    readTime: '14 phút đọc',
    tags: ['Cloud', 'AWS', 'Cơ bản'],
    href: '/bai-viet/cloud-computing-va-aws',
    accent: 'amethyst',
  },
  {
    title: 'Cloud Networking trên AWS: VPC, subnet public/private và demo kiểm tra kết nối',
    description: 'Virtual network là gì, VPC, subnet, route table, Internet Gateway, NAT Gateway, Security Group và NACL; so sánh với Azure VNet và demo dựng mạng bằng AWS CLI.',
    date: '24/10/2026',
    readTime: '20 phút đọc',
    tags: ['Cloud', 'AWS', 'VPC', 'Networking'],
    href: '/bai-viet/aws-vpc-public-private-subnet',
    accent: 'amethyst',
  },
  {
    title: 'SSH, Tunnel và VPN: đi vào mạng nội bộ một cách an toàn',
    description: 'SSH key, ~/.ssh/config, local/remote/dynamic forwarding, ProxyJump, bastion host, so sánh với VPN và WireGuard cơ bản.',
    date: '22/10/2026',
    readTime: '19 phút đọc',
    tags: ['Network', 'SSH', 'Tunnel', 'VPN'],
    href: '/bai-viet/ssh-tunnel-vpn',
    accent: 'amethyst',
  },
  {
    title: 'Reverse Proxy và Load Balancer: một cửa vào, nhiều server phía sau',
    description: 'Forward và reverse proxy, Nginx tối thiểu, round robin, least connections, IP hash, L4 và L7, health check và lỗi 502/504.',
    date: '22/10/2026',
    readTime: '18 phút đọc',
    tags: ['Network', 'Nginx', 'Load Balancer', 'Reverse Proxy'],
    href: '/bai-viet/reverse-proxy-load-balancer',
    accent: 'amethyst',
  },
  {
    title: 'Firewall cơ bản: luật nào khớp trước thì thắng',
    description: 'Cách firewall lọc gói tin, thứ tự luật, stateful và stateless, ufw, firewalld, iptables và Security Group so với NACL.',
    date: '22/10/2026',
    readTime: '17 phút đọc',
    tags: ['Network', 'Firewall', 'Security'],
    href: '/bai-viet/firewall-co-ban',
    accent: 'amethyst',
  },
  {
    title: 'DHCP, NAT và Port Forwarding: vì sao máy trong nhà ra được Internet?',
    description: 'IP đến từ đâu (DHCP), vì sao nhiều máy dùng chung một IP public (NAT/PAT), cách mở port ra ngoài và NAT trên cloud.',
    date: '22/10/2026',
    readTime: '16 phút đọc',
    tags: ['Network', 'DHCP', 'NAT', 'Port Forwarding'],
    href: '/bai-viet/dhcp-nat-port-forwarding',
    accent: 'amethyst',
  },
  {
    title: 'HTTP, HTTPS và TLS: đọc được một request thay vì đoán',
    description: 'Giải phẫu request và response, status code (502, 503, 504), TLS handshake, chuỗi chứng chỉ, curl -v và openssl s_client.',
    date: '22/10/2026',
    readTime: '18 phút đọc',
    tags: ['Network', 'HTTP', 'TLS', 'curl'],
    href: '/bai-viet/http-https-tls',
    accent: 'amethyst',
  },
  {
    title: 'DNS hoạt động thế nào? Lần theo một câu hỏi từ máy bạn đến root server',
    description: 'Phân cấp DNS, cách resolver tìm bản ghi, các loại record, TTL, cách đọc dig và gỡ các lỗi DNS thường gặp.',
    date: '22/10/2026',
    readTime: '17 phút đọc',
    tags: ['Network', 'DNS', 'dig'],
    href: '/bai-viet/dns-hoat-dong-the-nao',
    accent: 'amethyst',
  },
  {
    title: 'TCP và UDP: bắt tay ba bước, port và trạng thái trong ss',
    description: 'Port và socket, so sánh TCP với UDP, bắt tay ba bước, truyền lại gói bị mất, đọc ss và phân biệt connection refused với timeout.',
    date: '22/10/2026',
    readTime: '17 phút đọc',
    tags: ['Network', 'TCP', 'UDP', 'Port'],
    href: '/bai-viet/tcp-va-udp',
    accent: 'amethyst',
  },
  {
    title: 'MAC, ARP, Switch và Router: gói tin đi qua LAN như thế nào?',
    description: 'Phân biệt MAC và IP, hiểu ARP, switch học MAC, router định tuyến qua mô phỏng gói tin từng chặng và cách đọc ip neigh, ip route.',
    date: '22/10/2026',
    readTime: '15 phút đọc',
    tags: ['Network', 'MAC', 'ARP', 'Routing'],
    href: '/bai-viet/mac-arp-switch-router',
    accent: 'amethyst',
  },
  {
    title: 'IP, Subnet và CIDR: đọc 192.168.1.0/24 trong 30 giây',
    description: 'Địa chỉ IPv4 dưới dạng 32 bit, subnet mask, CIDR, dải private/public và cách chia subnet qua một công cụ tính trực tiếp.',
    date: '22/10/2026',
    readTime: '16 phút đọc',
    tags: ['Network', 'IPv4', 'CIDR', 'Subnet'],
    href: '/bai-viet/ip-subnet-cidr',
    accent: 'amethyst',
  },
  {
    title: 'Network là gì? Hành trình của một request qua OSI và TCP/IP',
    description: 'Lần theo một lệnh curl để hiểu DNS, TCP, TLS, HTTP, cách dữ liệu được đóng gói qua các tầng và dùng mô hình tầng để debug.',
    date: '22/10/2026',
    readTime: '14 phút đọc',
    tags: ['Network', 'OSI', 'TCP/IP', 'Cơ bản'],
    href: '/bai-viet/network-la-gi-osi-tcp-ip',
    accent: 'amethyst',
  },
  {
    title: 'Nhập môn Machine Learning với KNN',
    description: 'Từ input, feature, label, loss và generalisation đến KNN, distance metric, scaling, validation và giới hạn của dữ liệu nhiều chiều.',
    date: '23/09/2026',
    readTime: '18 phút đọc',
    tags: ['Machine Learning', 'Supervised Learning', 'KNN'],
    href: '/bai-viet/nhap-mon-machine-learning-va-knn',
    accent: 'amethyst',
  },
  {
    title: 'Kiến trúc Transformer',
    description: 'Từ embedding và positional encoding đến multi-head attention, residual, feed-forward cùng ba họ Transformer phổ biến.',
    date: '23/09/2026',
    readTime: '17 phút đọc',
    tags: ['AI', 'Attention', 'Transformer'],
    href: '/bai-viet/kien-truc-transformer',
    accent: 'amethyst',
  },
  {
    title: 'Cơ chế Attention',
    description: 'Hiểu Query, Key, Value, scaled dot-product, mask và multi-head attention qua mô phỏng trọng số giữa các token.',
    date: '23/09/2026',
    readTime: '15 phút đọc',
    tags: ['AI', 'Deep Learning', 'Attention'],
    href: '/bai-viet/co-che-attention',
    accent: 'amethyst',
  },
  {
    title: 'So sánh RNN, LSTM và GRU',
    description: 'So sánh memory, gate, parameter, tốc độ và độ ổn định; đối chiếu với benchmark 100 lần chạy trên ba bộ time series.',
    date: '23/09/2026',
    readTime: '16 phút đọc',
    tags: ['AI', 'RNN', 'Time Series'],
    href: '/bai-viet/so-sanh-rnn-lstm-gru',
    accent: 'amethyst',
  },
  {
    title: 'Kiến trúc RNN',
    description: 'Hiểu cách RNN đọc chuỗi theo từng timestep, truyền hidden state và vì sao LSTM, GRU giúp mạng ghi nhớ tốt hơn.',
    date: '23/09/2026',
    readTime: '15 phút đọc',
    tags: ['AI', 'Deep Learning', 'RNN'],
    href: '/bai-viet/kien-truc-rnn-la-gi',
    accent: 'amethyst',
  },
  {
    title: 'Kiến trúc CNN',
    description: 'Hiểu cách kernel quét ảnh, tạo feature map và cách channel, stride, padding, pooling phối hợp trong một CNN.',
    date: '23/09/2026',
    readTime: '15 phút đọc',
    tags: ['AI', 'Deep Learning', 'CNN'],
    href: '/bai-viet/kien-truc-cnn-la-gi',
    accent: 'amethyst',
  },
  {
    title: 'Kiến trúc MLP',
    description: 'Từ vector đầu vào qua các fully connected layer, activation, logits và cách tính parameter của một MLP.',
    date: '23/09/2026',
    readTime: '14 phút đọc',
    tags: ['AI', 'Deep Learning', 'MLP'],
    href: '/bai-viet/kien-truc-mlp-la-gi',
    accent: 'amethyst',
  },
  {
    title: 'Đọc kết quả model: Loss, Accuracy, Precision, Recall và F1',
    description: 'Phân biệt loss và metric, đọc confusion matrix, hiểu threshold và chọn metric phù hợp với chi phí sai của sản phẩm.',
    date: '22/09/2026',
    readTime: '13 phút đọc',
    tags: ['AI', 'Machine Learning'],
    href: '/bai-viet/danh-gia-model-loss-accuracy-precision-recall-f1',
    accent: 'amethyst',
  },
  {
    title: 'Dữ liệu đi vào mạng dưới dạng gì?',
    description: 'Hiểu cách ảnh, text, bảng và graph được biểu diễn thành vector, tensor, token ID, embedding và cấu trúc số cho model.',
    date: '22/09/2026',
    readTime: '14 phút đọc',
    tags: ['AI', 'Deep Learning'],
    href: '/bai-viet/du-lieu-vao-mang-vector-tensor-token-embedding-graph',
    accent: 'amethyst',
  },
  {
    title: 'Hàm kích hoạt',
    description: 'Hiểu vai trò của tính phi tuyến, ReLU, Sigmoid, Tanh, GELU, Softmax và cách chọn activation cho từng bài toán.',
    date: '22/09/2026',
    readTime: '12 phút đọc',
    tags: ['AI', 'Deep Learning'],
    href: '/bai-viet/ham-kich-hoat-la-gi',
    accent: 'amethyst',
  },
  {
    title: 'Deep Learning',
    description: 'Cách mình hiểu Deep Learning: vị trí trong AI, parameter, weight, bias, training, inference và các architecture phổ biến.',
    date: '22/09/2026',
    readTime: '14 phút đọc',
    tags: ['AI', 'Deep Learning'],
    href: '/bai-viet/deep-learning-la-gi',
    accent: 'amethyst',
  },
  {
    title: 'Tư duy triển khai bất kỳ dự án nào cho DevOps',
    description: 'Cách nhìn một dự án từ góc độ DevOps: runtime, phiên bản, file cấu hình, quy trình build và cách chạy ứng dụng an toàn trên Linux.',
    date: '16/09/2026',
    readTime: '10 phút đọc',
    tags: ['Linux', 'DevOps', 'Deployment'],
    href: '/bai-viet/tu-duy-trien-khai-du-an',
    accent: 'amethyst',
  },
  {
    title: 'Linux là gì và tại sao Linux cần thiết cho DevOps?',
    description: 'Hiểu Linux từ kernel, distribution đến vai trò của Linux trong server, container, cloud và công việc DevOps hằng ngày.',
    date: '16/09/2026',
    readTime: '9 phút đọc',
    tags: ['Linux', 'DevOps', 'Cơ bản'],
    href: '/bai-viet/linux-la-gi',
    accent: 'amethyst',
  },
  {
    title: 'Docker là gì và tại sao nên dùng Docker?',
    description: 'Tìm hiểu image, container, registry và cách Docker giúp môi trường phát triển, CI và production nhất quán hơn.',
    date: '16/09/2026',
    readTime: '10 phút đọc',
    tags: ['Docker', 'Container', 'DevOps'],
    href: '/bai-viet/docker-la-gi',
    accent: 'docker',
  },
  {
    title: 'Linux & Git Cheatsheet cho DevOps Intern',
    description: 'Các lệnh thường dùng trên server và workflow Git hằng ngày, được nhóm lại để tra cứu nhanh.',
    date: '15/09/2026',
    readTime: '15 phút đọc',
    tags: ['Linux', 'Git'],
    href: '/bai-viet/linux-git-cheatsheet',
    accent: 'amethyst',
  },
];

const sharingPosts: Post[] = [
  {
    title: 'Three Wise Monkeys',
    description: 'Từ màn ăn mừng của ba cầu thủ PSV đến câu chuyện phía sau biểu tượng “không nhìn, không nghe, không nói điều ác”.',
    date: '16/09/2026',
    readTime: '5 phút đọc',
    tags: ['Văn hóa', 'Bóng đá'],
    href: '/chia-se/three-wise-monkeys',
    accent: 'amethyst',
  },
];

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-background text-foreground transition-colors duration-300">
      <DevOpsBackdrop />
      <SiteHeader />

      <div className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-5 sm:px-8">
        <section id="top" className="grid gap-10 py-12 sm:py-16 lg:grid-cols-[minmax(0,0.8fr)_minmax(460px,1fr)] lg:items-start lg:gap-12 lg:py-20">
          <div className="max-w-2xl border-l-2 border-primary pl-6 sm:pl-8">
            <p className="font-mono text-sm font-semibold text-primary">$ whoami</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.025em] text-ink sm:text-4xl">Tiến Đạt</h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
              Đây là blog cá nhân ghi lại quá trình học tập của mình. Nội dung sẽ được cập nhật theo thời gian; hiện tại mình vẫn đang là sinh viên năm 4.
            </p>
            <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
              Có thể liên hệ với mình qua các liên kết mạng xã hội hoặc Gmail:{' '}
              <a className="font-semibold text-primary transition-colors hover:text-primary-dark hover:underline" href="mailto:dat96133@gmail.com">
                dat96133@gmail.com
              </a>
            </p>
          </div>

          <LinuxPlaygroundPreview />
        </section>

        <GithubContributions />

        <div className="grid gap-12 pb-16 lg:grid-cols-[minmax(0,1fr)_250px] lg:gap-20 lg:pb-24">
          <section id="bai-viet" className="space-y-10" aria-label="Bài viết mới">
            <div aria-labelledby="documents-title">
              <SectionTitle id="documents-title" label="Tài liệu mới" command="ls ./tai-lieu" />
              <PaginatedPostList posts={documentPosts} autoAdvanceMs={5000} />
            </div>

            <div id="chia-se-moi" className="scroll-mt-24" aria-labelledby="sharing-title">
              <SectionTitle id="sharing-title" label="Chia sẻ mới" command="ls ./chia-se" />
              <PaginatedPostList posts={sharingPosts} />
            </div>
          </section>

          <aside className="space-y-10 lg:border-l lg:border-border lg:pl-7">
            <section id="gioi-thieu" aria-labelledby="about-title">
              <h2 id="about-title" className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-primary">Về mình</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Sinh viên năm 4, cung Bảo Bình. Mình đang tìm hiểu cách đưa AI vào ứng dụng và xây dựng quy trình DevOps thực tế.
              </p>

              <dl className="mt-5 space-y-4">
                <div>
                  <dt className="font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-primary/80">Sở thích</dt>
                  <dd className="mt-1 text-sm leading-6 text-muted-foreground">Cầu lông · Bóng đá · Đọc sách</dd>
                </div>
                <div>
                  <dt className="font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-primary/80">Lĩnh vực</dt>
                  <dd className="mt-1 text-sm leading-6 text-muted-foreground">Ứng dụng AI · DevOps</dd>
                </div>
                <div>
                  <dt className="font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-primary/80">Ngôn ngữ / Framework</dt>
                  <dd className="mt-1 text-sm leading-6 text-muted-foreground">Python · JavaScript · TypeScript · React · NestJS</dd>
                </div>
                <div>
                  <dt className="font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-primary/80">Dịch vụ</dt>
                  <dd className="mt-1 text-sm leading-6 text-muted-foreground">MinIO · Cloudflare R2</dd>
                </div>
              </dl>
            </section>

            <section id="chu-de" aria-labelledby="topics-title">
              <h2 id="topics-title" className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-primary">Chủ đề</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                <a className="border border-border bg-card/70 px-3 py-1.5 text-sm text-muted-foreground transition hover:border-primary/50 hover:text-ink" href="#bai-viet">Linux</a>
                <a className="border border-border bg-card/70 px-3 py-1.5 text-sm text-muted-foreground transition hover:border-primary/50 hover:text-ink" href="#bai-viet">Git</a>
                <a className="border border-border bg-card/70 px-3 py-1.5 text-sm text-muted-foreground transition hover:border-primary/50 hover:text-ink" href="#bai-viet">Docker</a>
                <a className="border border-border bg-card/70 px-3 py-1.5 text-sm text-muted-foreground transition hover:border-primary/50 hover:text-ink" href="#bai-viet">Network</a>
              </div>
            </section>

            <section aria-labelledby="status-title">
              <h2 id="status-title" className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-primary">Status</h2>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
                {['Intern AI Application (Fullstack)', 'Hanoi University', 'Studying everyday...'].map((status) => (
                  <li className="flex items-start gap-2" key={status}>
                    <span className="mt-2 size-1.5 shrink-0 bg-primary shadow-[0_0_10px_rgba(168,85,247,0.8)]" aria-hidden="true" />
                    <span>{status}</span>
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        </div>
      </div>

      <footer className="relative z-10 border-t border-border bg-background/75 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-7 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>© 2026 Tiến Đạt · tiendat13ns</p>
          <a className="font-semibold transition hover:text-primary" href="https://github.com/tiendat13ns" target="_blank" rel="noreferrer">GitHub</a>
        </div>
      </footer>
    </main>
  );
}

function SectionTitle({ id, label, command }: { id: string; label: string; command: string }) {
  return (
    <div className="flex items-end justify-between gap-5 border-b border-border pb-3">
      <h2 id={id} className="text-xl font-bold tracking-tight text-ink">{label}</h2>
      <span className="hidden font-mono text-xs text-muted-foreground sm:block">$ {command}</span>
    </div>
  );
}

function LinuxPlaygroundPreview() {
  return (
    <section id="playground" className="h-fit scroll-mt-24" aria-labelledby="playground-title">
      <div className="overflow-hidden border border-border bg-card/70 shadow-[0_18px_48px_-42px_var(--brand-mark-shadow)] backdrop-blur-sm">
        <div className="flex h-11 items-center justify-between border-b border-border bg-muted/55 px-4">
          <div className="flex gap-2" aria-hidden="true">
            <span className="size-2.5 rounded-full bg-primary/35" />
            <span className="size-2.5 rounded-full bg-primary/65" />
            <span className="size-2.5 rounded-full bg-primary" />
          </div>
          <span className="font-mono text-[11px] font-semibold text-muted-foreground">linux-playground</span>
          <Terminal className="text-muted-foreground" size={15} />
        </div>

        <div className="grid gap-5 p-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] xl:items-center">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-primary">Thực hành trên trình duyệt</p>
            <h2 id="playground-title" className="mt-2 text-xl font-semibold tracking-normal text-ink">DevOps Playground</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Thử Linux trong filesystem ảo và luyện Git với repository mô phỏng có branch, staging area và commit history.
            </p>
            <Link
              className="mt-4 inline-flex w-full items-center justify-center gap-2 border border-primary/35 bg-primary-soft px-3 py-2 text-xs font-semibold text-primary-dark transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              href="/playground"
            >
              <Terminal size={16} /> Mở DevOps Playground <ArrowUpRight size={16} />
            </Link>
          </div>

          <AnimatedTerminal />
        </div>
      </div>
    </section>
  );
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <a className="inline-flex items-center" href="/" aria-label="tiendat13ns - Trang chủ">
          <span className="text-[1.05rem] font-bold tracking-[-0.025em] text-ink">tiendat<span className="text-primary">13ns</span></span>
        </a>

        <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex" aria-label="Điều hướng chính">
          <a className="transition hover:text-primary" href="/tai-lieu">Tài liệu</a>
          <a className="transition hover:text-primary" href="/playground">Playground</a>
          <a className="transition hover:text-primary" href="/chia-se">Chia sẻ</a>
          <a className="transition hover:text-primary" href="#gioi-thieu">Về mình</a>
        </nav>

        <div className="flex items-center gap-2">
          <SocialLinks />
          <GitHubLink />
          <ThemeToggle />
          <details className="relative md:hidden">
            <summary className="grid size-9 cursor-pointer list-none place-items-center rounded-lg border border-border bg-card text-foreground [&::-webkit-details-marker]:hidden" aria-label="Mở menu">
              <Menu size={18} />
            </summary>
            <nav className="absolute right-0 top-12 flex w-40 flex-col gap-1 rounded-xl border border-border bg-card p-2 text-sm font-medium text-muted-foreground shadow-2xl" aria-label="Điều hướng di động">
              <a className="rounded-lg px-3 py-2 hover:bg-accent hover:text-ink" href="/tai-lieu">Tài liệu</a>
              <a className="rounded-lg px-3 py-2 hover:bg-accent hover:text-ink" href="/playground">Playground</a>
              <a className="rounded-lg px-3 py-2 hover:bg-accent hover:text-ink" href="/chia-se">Chia sẻ</a>
              <a className="rounded-lg px-3 py-2 hover:bg-accent hover:text-ink" href="#gioi-thieu">Về mình</a>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}

function GitHubLink() {
  return (
    <a
      className="grid size-9 place-items-center rounded-lg border border-border bg-card text-ink transition hover:border-primary/40 hover:bg-accent hover:text-primary"
      href="https://github.com/tiendat13ns"
      target="_blank"
      rel="noreferrer"
      aria-label="Mở GitHub"
      title="GitHub"
    >
      <svg aria-hidden="true" viewBox="0 0 16 16" className="size-[18px] fill-current">
        <path d="M8 0C3.58 0 0 3.64 0 8.13c0 3.59 2.29 6.64 5.47 7.71.4.08.55-.17.55-.39 0-.19-.01-.83-.01-1.51-2.01.38-2.53-.5-2.69-.96-.09-.23-.48-.96-.82-1.15-.28-.15-.68-.53-.01-.54.63-.01 1.08.59 1.23.83.72 1.23 1.87.88 2.33.67.07-.53.28-.88.51-1.08-1.78-.21-3.64-.91-3.64-4.02 0-.89.31-1.62.82-2.19-.08-.21-.36-1.04.08-2.16 0 0 .67-.22 2.2.84A7.37 7.37 0 0 1 8 3.91c.68 0 1.36.09 2 .27 1.53-1.06 2.2-.84 2.2-.84.44 1.12.16 1.95.08 2.16.51.57.82 1.29.82 2.19 0 3.12-1.87 3.81-3.65 4.02.29.25.54.74.54 1.5 0 1.08-.01 1.95-.01 2.23 0 .22.15.47.55.39A8.02 8.02 0 0 0 16 8.13C16 3.64 12.42 0 8 0Z" />
      </svg>
    </a>
  );
}

function DevOpsBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div
        className="devops-aurora-motion absolute inset-[-4%]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 18% 12%, var(--devops-glow-primary), transparent 30%), radial-gradient(circle at 82% 40%, var(--devops-glow-secondary), transparent 34%), linear-gradient(135deg, var(--background) 0%, var(--surface) 50%, var(--background) 100%)',
        }}
      />
      <div
        className="devops-grid-motion absolute inset-[-64px] opacity-30"
        style={{
          backgroundImage:
            'linear-gradient(var(--devops-grid) 1px, transparent 1px), linear-gradient(90deg, var(--devops-grid) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'linear-gradient(to bottom, black, transparent 88%)',
        }}
      />

      <svg className="devops-network-motion absolute inset-0 h-full w-full opacity-60" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
        <g fill="none" stroke="var(--devops-network)" strokeWidth="1">
          <path opacity="0.12" d="M64 172 188 124l96 82 132-74 96 94 128-50 124 97" />
          <path opacity="0.09" d="M884 126 1008 196l112-56 78 116 152-54" />
          <path opacity="0.11" d="M76 616 210 530l116 92 146-66 130 90 118-38" />
          <path opacity="0.08" d="M864 620 988 524l114 90 92-52 170 106" />
        </g>
        <g fill="var(--devops-node)">
          {[['64','172'],['188','124'],['284','206'],['416','132'],['512','226'],['640','176'],['764','273'],['884','126'],['1008','196'],['1120','140'],['1198','256'],['1350','202'],['76','616'],['210','530'],['326','622'],['472','556'],['602','646'],['720','608'],['864','620'],['988','524'],['1102','614'],['1194','562'],['1364','668']].map(([cx, cy], index) => (
            <circle
              className="devops-node-motion"
              key={`${cx}-${cy}`}
              cx={cx}
              cy={cy}
              r="2"
              style={{ animationDelay: `${index * -0.37}s` }}
            />
          ))}
        </g>
      </svg>

      <CommandLine className="left-[4%] top-[13%] -rotate-6" delay="-2s" text="$ ssh deploy@10.0.0.12" />
      <CommandLine className="right-[5%] top-[18%] rotate-3" delay="-8s" text="kubectl get pods -A" />
      <CommandLine className="left-[2%] top-[43%] rotate-2" delay="-5s" text="git log --oneline --graph" />
      <CommandLine className="right-[3%] top-[49%] -rotate-3" delay="-11s" text="docker compose up -d" />
      <CommandLine className="left-[7%] top-[72%] -rotate-2" delay="-7s" text="journalctl -u nginx -f" />
      <CommandLine className="right-[8%] top-[80%] rotate-2" delay="-14s" text="terraform plan" />
    </div>
  );
}

function CommandLine({ className, delay, text }: { className: string; delay: string; text: string }) {
  return (
    <span
      className={`devops-command-motion absolute hidden whitespace-nowrap font-mono text-xs text-primary sm:block ${className}`}
      style={{ animationDelay: delay }}
    >
      {text}
    </span>
  );
}
