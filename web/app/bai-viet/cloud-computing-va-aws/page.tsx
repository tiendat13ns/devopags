import type { Metadata } from 'next';
import { ArticleIntro, ArticleSection, ArticleShell, ReferenceLink } from '@/components/article-shell';
import { AnnotatedOutput, Callout, CodeBlock, Code, DataTable } from '@/components/network-ui';
import { SharedResponsibilityMatrix } from '@/components/shared-responsibility-matrix';

export const metadata: Metadata = {
  title: 'Cloud computing và AWS: bắt đầu từ đâu? | tiendat13ns',
  description: 'Cloud là gì, IaaS, PaaS, SaaS và serverless, hạ tầng toàn cầu của AWS (Region, Availability Zone, Edge), mô hình trách nhiệm chia sẻ và cách thiết lập tài khoản AWS an toàn ngay từ ngày đầu.',
};

const series = [
  ['1', 'Cloud computing và AWS', 'Bài này: khái niệm nền và tài khoản an toàn'],
  ['2', 'IAM', 'Ai được làm gì trên tài khoản: user, role, policy'],
  ['3', 'VPC', 'Mạng riêng: subnet public/private, route table, Security Group'],
  ['4', 'EC2 và EBS', 'Máy ảo, ổ đĩa, AMI, user data và các mô hình giá'],
  ['5', 'Load Balancer và Auto Scaling', 'Chịu tải, tự thay máy hỏng, co giãn theo traffic'],
  ['6', 'S3', 'Lưu trữ object, storage class, quyền truy cập'],
  ['7', 'RDS', 'Database được quản lý: Multi-AZ, backup, kết nối an toàn'],
  ['8', 'Terraform', 'Viết lại toàn bộ hạ tầng bằng code'],
];

export default function CloudComputingPage() {
  return (
    <ArticleShell currentHref="/bai-viet/cloud-computing-va-aws">
      <ArticleIntro
        eyebrow="Cloud trên AWS · Bài 1"
        title="Cloud computing và AWS: bắt đầu từ đâu?"
        description="Trước khi bấm tạo máy ảo đầu tiên, có vài khái niệm quyết định cách bạn nghĩ về mọi dịch vụ sau này: cloud thực chất bán cho bạn cái gì, hạ tầng AWS được chia ra sao, phần nào AWS lo và phần nào vẫn là trách nhiệm của bạn."
        date="25/10/2026"
        readTime="14 phút đọc"
        tags={['Cloud', 'AWS', 'Cơ bản']}
      />

      <ArticleSection id="cloud-la-gi" number="01" eyebrow="Nền tảng" title="Cloud là gì: thuê hạ tầng qua API, trả tiền theo mức dùng">
        <p>
          Trước cloud, muốn chạy một ứng dụng bạn phải mua server, đặt ở datacenter, chờ vài tuần để giao hàng và lắp đặt, và trả tiền cho cả công suất không dùng tới. <strong className="text-ink">Cloud computing</strong> đảo ngược điều đó: nhà cung cấp sở hữu hạ tầng, bạn thuê từng phần qua API và trả tiền theo mức dùng.
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li><strong className="text-ink">Tự phục vụ, theo yêu cầu:</strong> có máy ảo sau một phút, không cần gọi cho ai.</li>
          <li><strong className="text-ink">Co giãn:</strong> tăng lên 50 máy lúc cao điểm, về lại 2 máy lúc đêm khuya.</li>
          <li><strong className="text-ink">Trả theo mức dùng:</strong> chi phí chuyển từ đầu tư một lần (CapEx) sang chi phí vận hành hằng tháng (OpEx).</li>
          <li><strong className="text-ink">Quy mô toàn cầu:</strong> triển khai gần người dùng ở châu Á, châu Âu hay Mỹ chỉ bằng cách đổi region.</li>
        </ul>
        <Callout tone="warn" title="Mặt trái của “trả theo mức dùng”">
          Không có giới hạn trên tự nhiên. Một máy quên tắt, một NAT Gateway quên xóa hay một access key bị lộ có thể tạo hóa đơn rất lớn. Vì vậy việc đầu tiên khi có tài khoản AWS là đặt cảnh báo chi phí (mục 5).
        </Callout>
      </ArticleSection>

      <ArticleSection id="mo-hinh-dich-vu" number="02" eyebrow="Khái niệm" title="IaaS, PaaS, SaaS và serverless">
        <p>Các mô hình dịch vụ khác nhau ở chỗ bạn thuê tới tầng nào của chồng công nghệ. Thuê càng cao thì càng ít việc vận hành, đổi lại càng ít quyền kiểm soát.</p>
        <DataTable
          head={['Mô hình', 'Bạn nhận được', 'Bạn vẫn lo', 'Ví dụ trên AWS']}
          rows={[
            ['IaaS', 'Máy ảo, ổ đĩa, mạng', 'Hệ điều hành trở lên', 'EC2, EBS, VPC'],
            ['PaaS', 'Một nền tảng chạy sẵn: database, môi trường chạy app', 'Cấu hình, dữ liệu, code', 'RDS, Elastic Beanstalk'],
            ['Serverless / FaaS', 'Nơi chạy một hàm khi có sự kiện, tính tiền theo lần gọi', 'Code và quyền của hàm', 'Lambda, API Gateway, DynamoDB'],
            ['SaaS', 'Phần mềm hoàn chỉnh', 'Dữ liệu và người dùng', 'Amazon WorkMail; ngoài AWS: Gmail, Slack'],
          ]}
        />
        <p>
          Một hệ thống thực tế thường trộn nhiều mô hình: app chạy trên EC2 (IaaS), database dùng RDS (PaaS), xử lý ảnh tải lên bằng Lambda (serverless). Chọn mô hình là chọn đánh đổi giữa kiểm soát và công vận hành.
        </p>
      </ArticleSection>

      <ArticleSection id="ha-tang-toan-cau" number="03" eyebrow="Hạ tầng" title="Region, Availability Zone và Edge location">
        <DataTable
          head={['Đơn vị', 'Là gì', 'Vì sao quan trọng']}
          rows={[
            ['Region', 'Một khu vực địa lý, vd ap-southeast-1 (Singapore)', 'Dữ liệu nằm trong region bạn chọn; hầu hết dịch vụ hoạt động trong phạm vi một region'],
            ['Availability Zone', 'Một hoặc nhiều datacenter độc lập về điện, mạng, làm mát, cách nhau vài km đến vài chục km', 'Đặt hệ thống trên ≥ 2 AZ thì một AZ sự cố vẫn chạy được'],
            ['Edge location', 'Điểm hiện diện gần người dùng, nhiều hơn region rất nhiều', 'CloudFront (CDN) và Route 53 (DNS) phục vụ từ đây để giảm độ trễ'],
          ]}
        />
        <p>Chọn region dựa trên bốn câu hỏi, theo thứ tự ưu tiên:</p>
        <ol className="list-decimal space-y-2 pl-5">
          <li><strong className="text-ink">Pháp lý:</strong> dữ liệu có bắt buộc phải nằm ở quốc gia nào không?</li>
          <li><strong className="text-ink">Độ trễ:</strong> người dùng ở đâu? Với Việt Nam, Singapore là lựa chọn phổ biến.</li>
          <li><strong className="text-ink">Dịch vụ:</strong> region đó đã có dịch vụ bạn cần chưa? Dịch vụ mới thường ra ở us-east-1 trước.</li>
          <li><strong className="text-ink">Giá:</strong> cùng một dịch vụ, giá mỗi region khác nhau.</li>
        </ol>
        <p>
          Tên AZ như <Code>ap-southeast-1a</Code> được ánh xạ ngẫu nhiên theo từng tài khoản: <Code>1a</Code> của bạn có thể là <Code>1b</Code> của người khác. Khi cần chỉ đúng một AZ vật lý giữa nhiều tài khoản, dùng AZ ID như <Code>apse1-az1</Code>.
        </p>
      </ArticleSection>

      <ArticleSection id="trach-nhiem" number="04" eyebrow="Bảo mật" title="Trách nhiệm chia sẻ: AWS lo phần nào, bạn lo phần nào?">
        <p>
          AWS gọi đây là <strong className="text-ink">Shared Responsibility Model</strong>: AWS chịu trách nhiệm bảo mật <em>của</em> cloud (datacenter, phần cứng, hypervisor), bạn chịu trách nhiệm bảo mật <em>trong</em> cloud (những gì bạn cấu hình và đưa lên). Ranh giới dịch chuyển tùy dịch vụ:
        </p>
        <SharedResponsibilityMatrix />
        <p>
          Hệ quả thực tế: “dùng dịch vụ được quản lý” không có nghĩa là “an toàn mặc định”. Một bucket S3 để public hay một Security Group mở <Code>0.0.0.0/0</Code> là lỗi cấu hình phía khách hàng, và đó là nguyên nhân của phần lớn sự cố bảo mật trên cloud.
        </p>
      </ArticleSection>

      <ArticleSection id="tai-khoan" number="05" eyebrow="Ngày đầu tiên" title="Thiết lập tài khoản AWS an toàn">
        <p>Năm việc nên làm ngay sau khi tạo tài khoản, trước khi tạo bất kỳ tài nguyên nào:</p>
        <ol className="list-decimal space-y-2 pl-5">
          <li><strong className="text-ink">Bật MFA cho root user.</strong> Root có toàn quyền, kể cả đóng tài khoản và đổi phương thức thanh toán.</li>
          <li><strong className="text-ink">Ngừng dùng root cho việc hằng ngày.</strong> Tạo một danh tính quản trị riêng: IAM Identity Center (khuyến nghị) hoặc một IAM user có MFA. Bài 2 nói kỹ phần này.</li>
          <li><strong className="text-ink">Không tạo access key cho root.</strong> Nếu đã lỡ tạo, xóa ngay.</li>
          <li><strong className="text-ink">Đặt budget và cảnh báo.</strong> AWS Budgets gửi email khi chi phí thực tế hoặc dự báo vượt ngưỡng.</li>
          <li><strong className="text-ink">Chọn một region mặc định</strong> và làm việc nhất quán ở đó, để không “mất” tài nguyên ở region khác mà vẫn bị tính tiền.</li>
        </ol>
        <CodeBlock title="tạo budget 10 USD/tháng, báo email khi chi phí thực tế vượt 80%">{`ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

aws budgets create-budget --account-id $ACCOUNT_ID \\
  --budget '{"BudgetName":"monthly-10usd","BudgetLimit":{"Amount":"10","Unit":"USD"},
             "TimeUnit":"MONTHLY","BudgetType":"COST"}' \\
  --notifications-with-subscribers '[{
     "Notification":{"NotificationType":"ACTUAL","ComparisonOperator":"GREATER_THAN",
                     "Threshold":80,"ThresholdType":"PERCENTAGE"},
     "Subscribers":[{"SubscriptionType":"EMAIL","Address":"ban@example.com"}]}]'`}</CodeBlock>
        <Callout title="Free Tier">
          AWS đã đổi chương trình Free Tier cho tài khoản mới từ giữa năm 2025, chuyển sang dạng credit và gói miễn phí có thời hạn. Điều kiện thay đổi theo thời gian, nên hãy đọc trang Free Tier chính thức thay vì tin vào hướng dẫn cũ, và vẫn đặt budget kể cả khi đang dùng gói miễn phí.
        </Callout>
      </ArticleSection>

      <ArticleSection id="cong-cu" number="06" eyebrow="Công cụ" title="Console, CLI và CloudShell">
        <p>
          <strong className="text-ink">Console</strong> hợp để học và quan sát. <strong className="text-ink">AWS CLI v2</strong> hợp để làm lặp lại và viết script; series này dùng CLI cho mọi demo. <strong className="text-ink">CloudShell</strong> là terminal chạy ngay trong trình duyệt, đã cài sẵn CLI và đăng nhập sẵn bằng danh tính của bạn, tiện khi không muốn cài gì lên máy.
        </p>
        <AnnotatedOutput
          title="cấu hình CLI lần đầu"
          lines={[
            { text: 'aws configure sso', kind: 'command', note: 'Cách khuyến nghị nếu dùng IAM Identity Center: CLI mở trình duyệt để đăng nhập và nhận credential tạm thời, không phải lưu key lâu dài trên máy.' },
            { text: 'aws configure', kind: 'command', note: 'Cách cũ với access key của IAM user. Key nằm trong ~/.aws/credentials dưới dạng văn bản thường: đừng bao giờ commit file này.' },
            { text: 'aws sts get-caller-identity', kind: 'command', note: 'Lệnh “tôi là ai”. Luôn chạy nó khi nghi ngờ đang dùng nhầm tài khoản hoặc nhầm profile.' },
            {
              text: `{
    "UserId": "AROA…:dat",
    "Account": "123456789012",
    "Arn": "arn:aws:sts::123456789012:assumed-role/AdminAccess/dat"
}`,
              note: 'ARN cho biết bạn đang dùng role AdminAccess thông qua phiên tạm thời (assumed-role), không phải root.',
            },
          ]}
        />
      </ArticleSection>

      <ArticleSection id="lo-trinh" number="07" eyebrow="Tiếp theo" title="Lộ trình của series">
        <p>Mỗi bài dựng tiếp trên bài trước, nên đọc theo thứ tự sẽ dễ nhất. Đến bài 8, bạn sẽ viết lại toàn bộ hạ tầng của series bằng Terraform.</p>
        <DataTable head={['Bài', 'Chủ đề', 'Nội dung']} rows={series} minWidth={520} />
      </ArticleSection>

      <section id="references" className="mt-14 scroll-mt-24 border-t border-border pt-10">
        <p className="section-eyebrow">Đọc thêm</p>
        <h2 className="article-h2">Tài liệu tham khảo</h2>
        <ul className="mt-5 space-y-3 text-sm">
          <ReferenceLink href="https://aws.amazon.com/compliance/shared-responsibility-model/" label="AWS — Shared Responsibility Model" />
          <ReferenceLink href="https://docs.aws.amazon.com/whitepapers/latest/aws-overview/global-infrastructure.html" label="AWS Whitepaper — Global infrastructure" />
          <ReferenceLink href="https://docs.aws.amazon.com/IAM/latest/UserGuide/root-user-best-practices.html" label="AWS — Root user best practices" />
          <ReferenceLink href="https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-managing-costs.html" label="AWS — Managing your costs with AWS Budgets" />
          <ReferenceLink href="https://aws.amazon.com/free/" label="AWS — Free Tier" />
        </ul>
      </section>
    </ArticleShell>
  );
}
