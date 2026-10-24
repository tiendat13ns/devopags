import type { Metadata } from 'next';
import { ArticleIntro, ArticleSection, ArticleShell, ReferenceLink } from '@/components/article-shell';
import { AutoScalingSim } from '@/components/auto-scaling-sim';
import { AnnotatedOutput, Callout, CodeBlock, Code, DataTable } from '@/components/network-ui';

export const metadata: Metadata = {
  title: 'Load Balancer và Auto Scaling trên AWS: chịu tải và tự hồi phục | tiendat13ns',
  description: 'Kiến trúc nhiều AZ với ALB và Auto Scaling Group, so sánh ALB, NLB và GWLB, target group và health check, launch template, các kiểu scaling policy, mô phỏng target tracking và demo bằng AWS CLI.',
};

export default function AwsElbAutoScalingPage() {
  return (
    <ArticleShell currentHref="/bai-viet/aws-elb-auto-scaling">
      <ArticleIntro
        eyebrow="Cloud trên AWS · Bài 5"
        title="Load Balancer và Auto Scaling: chịu tải và tự hồi phục"
        description="Một máy EC2 là một điểm chết: máy hỏng hay quá tải thì cả dịch vụ ngừng. Bài này ghép hai dịch vụ giải quyết cả hai vấn đề: Elastic Load Balancing chia traffic cho nhiều máy, còn Auto Scaling tự thêm, bớt và thay máy theo tình trạng thực tế."
        date="25/10/2026"
        readTime="18 phút đọc"
        tags={['Cloud', 'AWS', 'ELB', 'Auto Scaling']}
      />

      <ArticleSection id="kien-truc" number="01" eyebrow="Bức tranh" title="Kiến trúc chuẩn: ALB ở public, máy ở private, trải hai AZ">
        <CodeBlock title="kiến trúc của bài">{`                          Internet
                             │
                 ┌───────────┴───────────┐
                 │  Application Load     │   public subnet AZ-a + AZ-b
                 │  Balancer (web-alb)   │   SG: 80/443 từ 0.0.0.0/0
                 └───────────┬───────────┘
                    target group web-tg (health check GET /)
              ┌──────────────┴──────────────┐
      private subnet AZ-a           private subnet AZ-b
      ┌──────┐ ┌──────┐            ┌──────┐ ┌──────┐
      │ web  │ │ web  │            │ web  │ │ web  │    Auto Scaling Group
      └──────┘ └──────┘            └──────┘ └──────┘    min 2 · max 6
              SG: 80 chỉ từ SG của ALB`}</CodeBlock>
        <ul className="list-disc space-y-2 pl-5">
          <li>Người dùng chỉ thấy một địa chỉ: DNS name của load balancer. Máy phía sau đến rồi đi mà không ai phải sửa cấu hình.</li>
          <li>Máy web nằm ở private subnet, chỉ nhận traffic từ Security Group của ALB, giống cách app-sg tham chiếu bastion-sg ở bài 3.</li>
          <li>ALB bắt buộc trải ít nhất hai AZ; Auto Scaling Group cũng trải máy đều qua các AZ, nên một AZ sự cố chỉ làm mất một nửa công suất chứ không mất dịch vụ.</li>
        </ul>
        <p>
          Bài Reverse Proxy và Load Balancer trong series Network đã giải thích các thuật toán chia tải và health check bằng Nginx. ELB là cùng ý tưởng đó, chỉ là AWS vận hành, tự mở rộng và tự chịu lỗi giúp bạn.
        </p>
      </ArticleSection>

      <ArticleSection id="loai-elb" number="02" eyebrow="Chọn loại" title="ALB, NLB và GWLB">
        <DataTable
          head={['', 'Application LB', 'Network LB', 'Gateway LB']}
          minWidth={700}
          rows={[
            ['Tầng', 'L7: hiểu HTTP/HTTPS, gRPC, WebSocket', 'L4: TCP, UDP, TLS', 'L3: chuyển nguyên gói tin'],
            ['Định tuyến', 'Theo path, host, header, query, method', 'Theo cổng', 'Chuyển qua thiết bị bảo mật rồi đi tiếp'],
            ['Địa chỉ', 'DNS name, IP thay đổi', 'Có thể có IP tĩnh mỗi AZ (Elastic IP)', 'Dùng qua endpoint'],
            ['Dùng khi', 'Web, API, microservice: lựa chọn mặc định', 'Hiệu năng rất cao, giao thức không phải HTTP, cần IP cố định', 'Firewall, IDS/IPS của bên thứ ba'],
          ]}
        />
        <p>
          Classic Load Balancer là thế hệ cũ, không nên dùng cho hệ thống mới. Với ALB, bạn còn gắn được chứng chỉ TLS miễn phí từ AWS Certificate Manager để chạy HTTPS mà không phải tự quản lý certificate trên từng máy.
        </p>
      </ArticleSection>

      <ArticleSection id="target-group" number="03" eyebrow="Cơ chế" title="Listener, target group và health check">
        <p>
          ALB nhận request qua <strong className="text-ink">listener</strong> (cổng và giao thức), áp các <strong className="text-ink">rule</strong>, rồi chuyển tới một <strong className="text-ink">target group</strong>: một nhóm máy (hoặc IP, Lambda) cùng phục vụ một việc. Target group liên tục gọi health check; máy nào trả lời sai sẽ bị ngừng gửi traffic.
        </p>
        <AnnotatedOutput
          title="các thông số health check quan trọng"
          lines={[
            { text: 'HealthCheckPath: /health', note: 'Nên là một endpoint nhẹ nhưng có kiểm tra thật (vd ping được database), không chỉ trả 200 vô điều kiện.' },
            { text: 'HealthCheckIntervalSeconds: 30', note: 'Bao lâu kiểm tra một lần. Ngắn thì phát hiện lỗi nhanh hơn.' },
            { text: 'HealthyThresholdCount: 5\nUnhealthyThresholdCount: 2', note: 'Cần 2 lần lỗi liên tiếp để loại máy, 5 lần đạt để nhận lại: loại nhanh, nhận lại thận trọng.' },
            { text: 'Matcher: HttpCode=200-399', note: 'Mã trạng thái nào được coi là khỏe.' },
            { text: 'deregistration_delay.timeout_seconds: 300', note: 'Khi một máy rời target group, ALB chờ các request đang xử lý hoàn tất trước khi cắt hẳn (connection draining). Có thể giảm xuống 30–60 giây cho request ngắn.' },
          ]}
        />
        <Callout tone="tip" title="Mã lỗi 502, 503, 504 từ ALB">
          <Code>503</Code>: không có máy khỏe nào trong target group. <Code>502</Code>: máy trả về phản hồi không hợp lệ hoặc đóng kết nối. <Code>504</Code>: máy không trả lời kịp trong idle timeout. Cả ba đều nghĩa là ALB vẫn sống, vấn đề nằm phía sau nó.
        </Callout>
      </ArticleSection>

      <ArticleSection id="auto-scaling" number="04" eyebrow="Co giãn" title="Auto Scaling Group và scaling policy">
        <p>
          Một <strong className="text-ink">Auto Scaling Group</strong> (ASG) giữ số máy trong khoảng <Code>min</Code> đến <Code>max</Code>, quanh con số <Code>desired</Code>. Máy được tạo từ một <strong className="text-ink">launch template</strong> (AMI, instance type, Security Group, user data của bài 4). ASG làm hai việc khác nhau:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li><strong className="text-ink">Tự hồi phục:</strong> máy nào không khỏe (theo EC2 hoặc theo health check của ALB) bị terminate và thay bằng máy mới, kể cả khi traffic không đổi.</li>
          <li><strong className="text-ink">Co giãn:</strong> đổi <Code>desired</Code> theo scaling policy.</li>
        </ul>
        <DataTable
          head={['Policy', 'Cách hoạt động', 'Dùng khi']}
          rows={[
            ['Target tracking', 'Giữ một chỉ số quanh mục tiêu, vd CPU trung bình 50%; AWS tự tính thêm bớt bao nhiêu máy', 'Mặc định cho hầu hết trường hợp'],
            ['Step scaling', 'Tự định nghĩa: CPU > 70% thêm 2 máy, > 90% thêm 4 máy', 'Cần kiểm soát chi tiết phản ứng'],
            ['Scheduled', 'Đổi min/max/desired theo lịch', 'Tải có giờ biết trước: giờ làm việc, flash sale'],
            ['Predictive', 'Học chu kỳ traffic quá khứ để scale trước khi tải tới', 'Tải lặp lại theo ngày hoặc tuần'],
          ]}
        />
        <AutoScalingSim />
      </ArticleSection>

      <ArticleSection id="demo" number="05" eyebrow="Thực hành" title="Demo: ALB + Auto Scaling Group bằng AWS CLI">
        <p>
          ALB cần subnet ở hai AZ, nên trước tiên thêm vào VPC của bài 3 một subnet public và một subnet private ở AZ thứ hai (gắn vào <Code>$RT_PUB</Code> và <Code>$RT_PRIV</Code> có sẵn). Ở dưới gọi chúng là <Code>$PUB_A</Code>, <Code>$PUB_B</Code>, <Code>$PRIV_A</Code>, <Code>$PRIV_B</Code>. Máy ở private subnet ra Internet qua NAT để chạy user data.
        </p>
        <CodeBlock title="bước 1: Security Group cho ALB và cho máy web">{`SG_ALB=$(aws ec2 create-security-group --group-name alb-sg --description "HTTP from Internet" \\
         --vpc-id $VPC --query GroupId --output text)
aws ec2 authorize-security-group-ingress --group-id $SG_ALB --protocol tcp --port 80 --cidr 0.0.0.0/0

SG_WEB=$(aws ec2 create-security-group --group-name web-sg --description "HTTP from ALB only" \\
         --vpc-id $VPC --query GroupId --output text)
aws ec2 authorize-security-group-ingress --group-id $SG_WEB --protocol tcp --port 80 --source-group $SG_ALB`}</CodeBlock>
        <CodeBlock title="bước 2: launch template dùng user data của bài 4">{`aws ec2 create-launch-template --launch-template-name web-lt --launch-template-data "{
  \\"ImageId\\": \\"resolve:ssm:/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64\\",
  \\"InstanceType\\": \\"t3.micro\\",
  \\"SecurityGroupIds\\": [\\"$SG_WEB\\"],
  \\"MetadataOptions\\": {\\"HttpTokens\\": \\"required\\"},
  \\"UserData\\": \\"$(base64 -w0 user-data.sh)\\"
}"`}</CodeBlock>
        <CodeBlock title="bước 3: target group, load balancer, listener">{`TG=$(aws elbv2 create-target-group --name web-tg --protocol HTTP --port 80 --vpc-id $VPC \\
     --health-check-path / --query 'TargetGroups[0].TargetGroupArn' --output text)

ALB=$(aws elbv2 create-load-balancer --name web-alb --subnets $PUB_A $PUB_B \\
      --security-groups $SG_ALB --query 'LoadBalancers[0].LoadBalancerArn' --output text)

aws elbv2 create-listener --load-balancer-arn $ALB --protocol HTTP --port 80 \\
  --default-actions Type=forward,TargetGroupArn=$TG`}</CodeBlock>
        <CodeBlock title="bước 4: Auto Scaling Group và policy target tracking">{`aws autoscaling create-auto-scaling-group --auto-scaling-group-name web-asg \\
  --launch-template 'LaunchTemplateName=web-lt,Version=$Latest' \\
  --min-size 2 --max-size 6 --desired-capacity 2 \\
  --vpc-zone-identifier "$PRIV_A,$PRIV_B" \\
  --target-group-arns $TG \\
  --health-check-type ELB --health-check-grace-period 120

aws autoscaling put-scaling-policy --auto-scaling-group-name web-asg --policy-name cpu-50 \\
  --policy-type TargetTrackingScaling \\
  --target-tracking-configuration '{"PredefinedMetricSpecification":
     {"PredefinedMetricType":"ASGAverageCPUUtilization"},"TargetValue":50.0}'`}</CodeBlock>
        <AnnotatedOutput
          title="kiểm tra: chia tải và tự hồi phục"
          lines={[
            { text: `DNS=$(aws elbv2 describe-load-balancers --load-balancer-arns $ALB \\
      --query 'LoadBalancers[0].DNSName' --output text)
for i in $(seq 1 6); do curl -s http://$DNS; echo; done`, kind: 'command', note: 'Chờ vài phút để máy khởi động và qua health check. Kết quả xen kẽ hai hostname khác nhau: ALB đang chia request cho cả hai máy.' },
            { text: `aws elbv2 describe-target-health --target-group-arn $TG \\
  --query 'TargetHealthDescriptions[].[Target.Id,TargetHealth.State]' --output table`, kind: 'command', note: 'Trạng thái từng máy: initial → healthy. Máy unhealthy sẽ có thêm Reason để gỡ lỗi.' },
            { text: `aws ec2 terminate-instances --instance-ids <một-trong-hai-máy>`, kind: 'command', note: 'Giả lập máy chết. Trong lúc đó curl vẫn trả lời từ máy còn lại; khoảng một hai phút sau, ASG tự tạo máy thay thế để quay về desired = 2.' },
            { text: `aws autoscaling describe-scaling-activities --auto-scaling-group-name web-asg --max-items 3`, kind: 'command', note: 'Nhật ký của ASG: thấy rõ máy bị terminate và lý do tạo máy mới.' },
          ]}
        />
        <CodeBlock title="dọn dẹp">{`aws autoscaling delete-auto-scaling-group --auto-scaling-group-name web-asg --force-delete
aws elbv2 delete-load-balancer --load-balancer-arn $ALB
aws elbv2 wait load-balancers-deleted --load-balancer-arns $ALB
aws elbv2 delete-target-group --target-group-arn $TG
aws ec2 delete-launch-template --launch-template-name web-lt
# chờ các máy của ASG terminate xong rồi mới xóa được web-sg, sau đó alb-sg
aws ec2 delete-security-group --group-id $SG_WEB
aws ec2 delete-security-group --group-id $SG_ALB`}</CodeBlock>
      </ArticleSection>

      <section id="references" className="mt-14 scroll-mt-24 border-t border-border pt-10">
        <p className="section-eyebrow">Đọc thêm</p>
        <h2 className="article-h2">Tài liệu tham khảo</h2>
        <ul className="mt-5 space-y-3 text-sm">
          <ReferenceLink href="https://docs.aws.amazon.com/elasticloadbalancing/latest/application/introduction.html" label="AWS — What is an Application Load Balancer?" />
          <ReferenceLink href="https://docs.aws.amazon.com/elasticloadbalancing/latest/application/target-group-health-checks.html" label="AWS — Health checks for target groups" />
          <ReferenceLink href="https://docs.aws.amazon.com/autoscaling/ec2/userguide/what-is-amazon-ec2-auto-scaling.html" label="AWS — What is Amazon EC2 Auto Scaling?" />
          <ReferenceLink href="https://docs.aws.amazon.com/autoscaling/ec2/userguide/as-scaling-target-tracking.html" label="AWS — Target tracking scaling policies" />
        </ul>
      </section>
    </ArticleShell>
  );
}
