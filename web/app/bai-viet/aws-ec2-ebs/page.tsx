import type { Metadata } from 'next';
import { ArticleIntro, ArticleSection, ArticleShell, ReferenceLink } from '@/components/article-shell';
import { Ec2InstanceTypeDecoder } from '@/components/ec2-instance-type-decoder';
import { AnnotatedOutput, Callout, CodeBlock, Code, DataTable } from '@/components/network-ui';

export const metadata: Metadata = {
  title: 'EC2 và EBS: máy ảo và ổ đĩa trên AWS | tiendat13ns',
  description: 'Vòng đời của một EC2 instance, cách đọc tên instance type, AMI, user data và IMDSv2, so sánh EBS, instance store và EFS, các mô hình giá On-Demand, Savings Plans, Spot và demo dựng web server.',
};

export default function AwsEc2Page() {
  return (
    <ArticleShell currentHref="/bai-viet/aws-ec2-ebs">
      <ArticleIntro
        eyebrow="Cloud trên AWS · Bài 4"
        title="EC2 và EBS: máy ảo và ổ đĩa trên AWS"
        description="EC2 là dịch vụ lâu đời và phổ biến nhất của AWS: thuê một máy ảo, chọn cấu hình, cài gì tùy bạn. Bài này đi qua những quyết định khi tạo một máy: chọn loại nào, khởi động bằng gì, lưu dữ liệu ở đâu và trả tiền theo cách nào."
        date="25/10/2026"
        readTime="17 phút đọc"
        tags={['Cloud', 'AWS', 'EC2', 'EBS']}
      />

      <ArticleSection id="vong-doi" number="01" eyebrow="Nền tảng" title="Instance và vòng đời của nó">
        <p>
          Mỗi máy ảo EC2 gọi là một <strong className="text-ink">instance</strong>. Nó chạy trên một máy chủ vật lý của AWS (qua hệ thống Nitro), nằm trong một subnet của VPC (bài 3), có Security Group, và thường có một ổ đĩa gốc là EBS volume. Hiểu các trạng thái giúp bạn tránh hai sai lầm đắt giá: mất dữ liệu và trả tiền cho máy không dùng.
        </p>
        <DataTable
          head={['Trạng thái / thao tác', 'Chuyện gì xảy ra', 'Tiền']}
          rows={[
            ['running', 'Máy đang chạy', 'Tính tiền compute theo giây (Linux, tối thiểu 60 giây)'],
            ['reboot', 'Khởi động lại hệ điều hành, vẫn trên cùng máy chủ; IP giữ nguyên', 'Như running'],
            ['stop → stopped', 'Tắt máy; ổ EBS giữ nguyên; lần start sau có thể chạy trên máy chủ vật lý khác', 'Hết tính compute, vẫn tính EBS và Elastic IP'],
            ['start', 'Bật lại; public IP tự cấp sẽ đổi (trừ khi dùng Elastic IP), private IP giữ nguyên', 'Tính lại từ đầu'],
            ['terminate', 'Xóa vĩnh viễn; ổ gốc bị xóa theo (DeleteOnTermination mặc định bật)', 'Hết tính tiền, nhưng dữ liệu cũng mất'],
          ]}
        />
        <Callout tone="warn" title="Server không phải thú cưng">
          Trên cloud, hãy coi một instance có thể biến mất bất cứ lúc nào: phần cứng hỏng, AZ sự cố, Spot bị thu hồi, hay chính bạn terminate nhầm. Dữ liệu quan trọng để ở EBS có snapshot, S3 hoặc database; cấu hình máy viết thành user data hoặc AMI để dựng lại được trong vài phút.
        </Callout>
      </ArticleSection>

      <ArticleSection id="instance-type" number="02" eyebrow="Chọn cấu hình" title="Đọc tên instance type">
        <p>
          AWS có hàng trăm instance type, nhưng tên của chúng theo một quy tắc chung: <strong className="text-ink">họ + thế hệ + thuộc tính + kích cỡ</strong>. Đọc được tên là biết ngay máy đó mạnh về gì.
        </p>
        <Ec2InstanceTypeDecoder />
        <p>
          Quy tắc chọn đơn giản: bắt đầu với một máy general purpose cỡ nhỏ ở thế hệ mới nhất (vd <Code>t3</Code>/<Code>t4g</Code> cho dev, <Code>m7g</Code>/<Code>m7i</Code> cho production), đo CPU và RAM thực tế bằng CloudWatch, rồi mới đổi họ hoặc đổi cỡ. Đổi instance type chỉ cần stop, sửa thuộc tính, rồi start lại.
        </p>
        <Callout title="Họ t và CPU credit">
          Máy <Code>t</Code> chỉ được dùng một phần CPU liên tục (CPU nền), phần vượt trên đó tiêu CPU credit tích lũy lúc rảnh. <Code>t3</Code> và <Code>t4g</Code> mặc định chạy ở chế độ <em>unlimited</em>: hết credit vẫn chạy nhanh, nhưng tính thêm phí. Nếu CPU luôn cao, một máy <Code>m</Code> hoặc <Code>c</Code> sẽ rẻ và ổn định hơn.
        </Callout>
      </ArticleSection>

      <ArticleSection id="ami-user-data" number="03" eyebrow="Khởi động" title="AMI, user data và instance metadata">
        <p>
          <strong className="text-ink">AMI</strong> (Amazon Machine Image) là ảnh đĩa để khởi động máy: hệ điều hành cộng với mọi thứ đã cài sẵn. Bạn có thể dùng AMI của AWS (Amazon Linux, Ubuntu…), của marketplace, hoặc tự tạo AMI từ một máy đã cấu hình xong. <strong className="text-ink">User data</strong> là script chạy một lần ở lần khởi động đầu tiên (qua cloud-init), cách nhanh nhất để máy tự cài đặt mà không cần SSH vào.
        </p>
        <AnnotatedOutput
          title="user-data.sh: biến máy trống thành web server"
          lines={[
            { text: '#!/bin/bash', note: 'Dòng shebang bắt buộc để cloud-init biết đây là shell script. Script chạy bằng root.' },
            { text: 'dnf install -y nginx', note: 'Amazon Linux 2023 dùng dnf. Máy cần đường ra Internet: public subnet hoặc private subnet có NAT (bài 3).' },
            { text: 'echo "<h1>Hello from $(hostname -f)</h1>" > /usr/share/nginx/html/index.html', note: 'In tên máy ra trang chủ: bài 5 dùng nó để thấy load balancer chia request cho máy nào.' },
            { text: 'systemctl enable --now nginx', note: 'Bật ngay và tự bật lại sau mỗi lần reboot.' },
          ]}
        />
        <p>
          Từ bên trong máy, <strong className="text-ink">Instance Metadata Service</strong> (IMDS) ở địa chỉ <Code>169.254.169.254</Code> cho biết máy là ai: instance ID, AZ, IP, và credential tạm thời của IAM role (bài 2). Nên bắt buộc dùng <strong className="text-ink">IMDSv2</strong>, phiên bản yêu cầu lấy token trước, để chặn kiểu tấn công lừa ứng dụng gọi tới metadata (SSRF).
        </p>
        <CodeBlock title="đọc metadata bằng IMDSv2">{`TOKEN=$(curl -sX PUT http://169.254.169.254/latest/api/token \\
        -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")
curl -sH "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/instance-id
curl -sH "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/placement/availability-zone`}</CodeBlock>
      </ArticleSection>

      <ArticleSection id="luu-tru" number="04" eyebrow="Dữ liệu" title="EBS, instance store và EFS: lưu dữ liệu ở đâu?">
        <DataTable
          head={['', 'EBS', 'Instance store', 'EFS']}
          minWidth={700}
          rows={[
            ['Loại', 'Ổ đĩa block qua mạng', 'Ổ NVMe gắn trực tiếp vào máy chủ', 'Hệ thống file NFS dùng chung'],
            ['Gắn vào', 'Một máy (trừ chế độ multi-attach đặc biệt), cùng AZ', 'Chỉ máy đó', 'Nhiều máy, nhiều AZ cùng lúc'],
            ['Khi stop/terminate', 'Giữ được dữ liệu; có snapshot', 'Mất sạch khi stop hoặc terminate', 'Độc lập với máy'],
            ['Hợp với', 'Ổ gốc, database trên EC2', 'Cache, dữ liệu tạm cần tốc độ cao', 'Thư mục dùng chung giữa nhiều server'],
          ]}
        />
        <p>
          Với EBS, chọn <Code>gp3</Code> làm mặc định: SSD đa dụng, có sẵn 3.000 IOPS và 125 MiB/s bất kể dung lượng, và tăng IOPS hoặc throughput riêng mà không cần tăng dung lượng. <Code>io2</Code> dành cho database cần IOPS rất cao; <Code>st1</Code>/<Code>sc1</Code> là HDD cho dữ liệu đọc tuần tự dung lượng lớn.
        </p>
        <p>
          <strong className="text-ink">Snapshot</strong> là bản sao lưu của EBS volume, lưu ở hạ tầng của S3 và chỉ ghi phần thay đổi so với lần trước (incremental). Snapshot là cách duy nhất đưa một volume sang AZ khác: tạo snapshot rồi tạo volume mới từ nó ở AZ đích. Dữ liệu dạng file và ảnh do người dùng tải lên thì nên để ở S3 (bài 6), không phải trên đĩa của máy.
        </p>
      </ArticleSection>

      <ArticleSection id="gia" number="05" eyebrow="Chi phí" title="On-Demand, Savings Plans, Reserved và Spot">
        <DataTable
          head={['Mô hình', 'Cách hoạt động', 'Hợp với']}
          rows={[
            ['On-Demand', 'Trả theo giây, không cam kết', 'Học, thử nghiệm, workload chưa biết trước'],
            ['Savings Plans', 'Cam kết chi một mức $/giờ trong 1 hoặc 3 năm, đổi lấy giá giảm đáng kể; linh hoạt giữa họ máy và region (loại Compute)', 'Workload chạy ổn định lâu dài'],
            ['Reserved Instances', 'Cam kết một cấu hình cụ thể trong 1 hoặc 3 năm', 'Cách cũ; Savings Plans thường linh hoạt hơn'],
            ['Spot', 'Dùng công suất thừa của AWS, giảm tới khoảng 90%, nhưng có thể bị thu hồi với cảnh báo 2 phút', 'Batch, CI, xử lý dữ liệu chịu được gián đoạn'],
          ]}
        />
        <p>
          Một chiến lược phổ biến: phần tải nền chạy liên tục mua Savings Plans, phần dao động dùng On-Demand qua Auto Scaling (bài 5), và các job chịu được gián đoạn chạy Spot.
        </p>
      </ArticleSection>

      <ArticleSection id="demo" number="06" eyebrow="Thực hành" title="Demo: web server bằng user data, stop/start và snapshot">
        <p>Dùng lại VPC và subnet public của bài 3 (biến <Code>$VPC</Code>, <Code>$PUB</Code>, key pair <Code>demo-key</Code>).</p>
        <CodeBlock title="bước 1: Security Group cho web và máy ảo">{`SG_WEB=$(aws ec2 create-security-group --group-name web-sg --description "HTTP from anywhere" \\
         --vpc-id $VPC --query GroupId --output text)
aws ec2 authorize-security-group-ingress --group-id $SG_WEB --protocol tcp --port 80 --cidr 0.0.0.0/0

WEB=$(aws ec2 run-instances \\
      --image-id resolve:ssm:/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64 \\
      --instance-type t3.micro --key-name demo-key --subnet-id $PUB --security-group-ids $SG_WEB \\
      --user-data file://user-data.sh \\
      --metadata-options HttpTokens=required \\
      --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=web}]' \\
      --query 'Instances[0].InstanceId' --output text)
aws ec2 wait instance-status-ok --instance-ids $WEB`}</CodeBlock>
        <AnnotatedOutput
          title="bước 2: kiểm tra, rồi stop/start"
          lines={[
            { text: `IP=$(aws ec2 describe-instances --instance-ids $WEB \\
     --query 'Reservations[0].Instances[0].PublicIpAddress' --output text)
curl http://$IP`, kind: 'command', note: 'Nhận về <h1>Hello from ip-10-0-1-…</h1>: user data đã cài và chạy Nginx mà không ai SSH vào máy.' },
            { text: `aws ec2 stop-instances --instance-ids $WEB
aws ec2 wait instance-stopped --instance-ids $WEB
aws ec2 start-instances --instance-ids $WEB
aws ec2 wait instance-running --instance-ids $WEB`, kind: 'command', note: 'Stop rồi start. User data không chạy lại, nhưng Nginx vẫn lên vì đã enable và ổ EBS giữ nguyên.' },
            { text: `aws ec2 describe-instances --instance-ids $WEB \\
  --query 'Reservations[0].Instances[0].[PublicIpAddress,PrivateIpAddress]'`, kind: 'command', note: 'Public IP đã khác lần trước, private IP vẫn như cũ. Muốn IP cố định thì dùng Elastic IP hoặc, tốt hơn, đặt load balancer phía trước (bài 5).' },
          ]}
        />
        <CodeBlock title="bước 3: snapshot ổ gốc, rồi dọn dẹp">{`VOL=$(aws ec2 describe-instances --instance-ids $WEB \\
      --query 'Reservations[0].Instances[0].BlockDeviceMappings[0].Ebs.VolumeId' --output text)
SNAP=$(aws ec2 create-snapshot --volume-id $VOL --description "web root" --query SnapshotId --output text)
aws ec2 wait snapshot-completed --snapshot-ids $SNAP

# Dọn dẹp: snapshot vẫn tính tiền lưu trữ nếu để lại
aws ec2 terminate-instances --instance-ids $WEB
aws ec2 wait instance-terminated --instance-ids $WEB
aws ec2 delete-snapshot --snapshot-id $SNAP
aws ec2 delete-security-group --group-id $SG_WEB`}</CodeBlock>
      </ArticleSection>

      <section id="references" className="mt-14 scroll-mt-24 border-t border-border pt-10">
        <p className="section-eyebrow">Đọc thêm</p>
        <h2 className="article-h2">Tài liệu tham khảo</h2>
        <ul className="mt-5 space-y-3 text-sm">
          <ReferenceLink href="https://docs.aws.amazon.com/ec2/latest/instancetypes/instance-type-names.html" label="AWS — Amazon EC2 instance type naming conventions" />
          <ReferenceLink href="https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-instance-lifecycle.html" label="AWS — Instance state changes" />
          <ReferenceLink href="https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/configuring-instance-metadata-service.html" label="AWS — Use the Instance Metadata Service (IMDSv2)" />
          <ReferenceLink href="https://docs.aws.amazon.com/ebs/latest/userguide/ebs-volume-types.html" label="AWS — Amazon EBS volume types" />
          <ReferenceLink href="https://aws.amazon.com/ec2/pricing/" label="AWS — Amazon EC2 pricing" />
        </ul>
      </section>
    </ArticleShell>
  );
}
