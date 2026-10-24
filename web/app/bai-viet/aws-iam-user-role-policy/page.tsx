import type { Metadata } from 'next';
import { ArticleIntro, ArticleSection, ArticleShell, ReferenceLink } from '@/components/article-shell';
import { IamPolicyEvaluator } from '@/components/iam-policy-evaluator';
import { AnnotatedOutput, Callout, CodeBlock, Code, DataTable } from '@/components/network-ui';

export const metadata: Metadata = {
  title: 'IAM: ai được làm gì trên tài khoản AWS | tiendat13ns',
  description: 'Root user, IAM user, group và role; cấu trúc một policy JSON; cách AWS đánh giá allow và deny; role với credential tạm thời cho EC2; nguyên tắc least privilege và demo cấp quyền đọc S3 cho máy ảo.',
};

export default function AwsIamPage() {
  return (
    <ArticleShell currentHref="/bai-viet/aws-iam-user-role-policy">
      <ArticleIntro
        eyebrow="Cloud trên AWS · Bài 2"
        title="IAM: ai được làm gì trên tài khoản AWS"
        description="Mọi lệnh gọi tới AWS, từ cú click trên Console tới một dòng aws s3 cp, đều đi qua cùng một câu hỏi: ai đang gọi, và người đó có được phép làm việc này trên tài nguyên này không? IAM là dịch vụ trả lời câu hỏi đó."
        date="25/10/2026"
        readTime="18 phút đọc"
        tags={['Cloud', 'AWS', 'IAM', 'Security']}
      />

      <ArticleSection id="danh-tinh" number="01" eyebrow="Nền tảng" title="Xác thực, phân quyền và các loại danh tính">
        <p>
          IAM tách hai việc: <strong className="text-ink">authentication</strong> (bạn là ai: mật khẩu, MFA, access key) và <strong className="text-ink">authorization</strong> (bạn được làm gì: policy). Đối tượng thực hiện request gọi là <strong className="text-ink">principal</strong>.
        </p>
        <DataTable
          head={['Danh tính', 'Là gì', 'Khi nào dùng']}
          rows={[
            ['Root user', 'Email đăng ký tài khoản, toàn quyền, không giới hạn được bằng policy', 'Chỉ cho vài việc bắt buộc như đổi thông tin thanh toán hay đóng tài khoản'],
            ['IAM user', 'Một danh tính lâu dài có mật khẩu và/hoặc access key', 'Hạn chế dùng; chủ yếu cho hệ thống cũ không hỗ trợ role'],
            ['IAM group', 'Tập hợp user để gắn policy chung', 'Gắn quyền theo vai trò (dev, ops) thay vì cho từng người'],
            ['IAM role', 'Một tập quyền không gắn với ai cố định; ai được phép thì “đóng vai” và nhận credential tạm thời', 'Cho dịch vụ (EC2, Lambda), cho truy cập giữa các tài khoản, và cho con người qua Identity Center'],
          ]}
        />
        <p>
          Xu hướng hiện nay là <strong className="text-ink">con người đăng nhập qua IAM Identity Center</strong> (một cổng SSO, có thể nối với Google Workspace hay Microsoft Entra ID), còn <strong className="text-ink">máy và dịch vụ dùng role</strong>. Cả hai đều dùng credential tạm thời, tự hết hạn, nên nếu bị lộ thì thiệt hại cũng có giới hạn.
        </p>
      </ArticleSection>

      <ArticleSection id="policy" number="02" eyebrow="Ngôn ngữ của quyền" title="Đọc một policy JSON">
        <AnnotatedOutput
          title="policy cho phép đọc bucket reports"
          lines={[
            { text: `{
  "Version": "2012-10-17",`, note: 'Phiên bản ngôn ngữ policy, không phải ngày tạo. Luôn dùng 2012-10-17; bản cũ hơn không hỗ trợ biến như ${aws:username}.' },
            { text: `  "Statement": [{
    "Sid": "ReadReports",
    "Effect": "Allow",`, note: 'Mỗi statement là một luật. Effect chỉ có hai giá trị: Allow hoặc Deny. Sid là nhãn tùy chọn để dễ đọc.' },
            { text: `    "Action": ["s3:GetObject", "s3:ListBucket"],`, note: 'Hành động theo dạng dịch vụ:API. Dùng được wildcard như s3:Get*, nhưng càng cụ thể càng an toàn.' },
            { text: `    "Resource": [
      "arn:aws:s3:::reports",
      "arn:aws:s3:::reports/*"
    ],`, note: 'Tài nguyên theo ARN. ListBucket áp lên bucket, GetObject áp lên object (/*): thiếu một trong hai dòng là lỗi rất hay gặp.' },
            { text: `    "Condition": {
      "Bool": { "aws:SecureTransport": "true" }
    }
  }]
}`, note: 'Điều kiện thêm (tùy chọn): ở đây chỉ cho phép khi request đi qua HTTPS. Có thể ràng buộc theo IP nguồn, tag, MFA, thời gian…' },
          ]}
        />
        <p>
          Policy gắn vào user, group hoặc role gọi là <strong className="text-ink">identity-based policy</strong>. Một số dịch vụ còn cho gắn policy trực tiếp lên tài nguyên, gọi là <strong className="text-ink">resource-based policy</strong>, nổi tiếng nhất là bucket policy của S3 (bài 6). Resource-based policy có thêm trường <Code>Principal</Code> để nói ai được hưởng quyền.
        </p>
      </ArticleSection>

      <ArticleSection id="danh-gia" number="03" eyebrow="Quyết định" title="AWS quyết định cho phép hay chặn như thế nào?">
        <p>
          Trong cùng một tài khoản, logic cốt lõi gói trong ba quy tắc: <strong className="text-ink">mặc định mọi thứ bị chặn</strong>; một <strong className="text-ink">Allow</strong> khớp sẽ mở quyền; một <strong className="text-ink">Deny</strong> tường minh khớp thì luôn thắng, bất kể có bao nhiêu Allow.
        </p>
        <IamPolicyEvaluator />
        <p>
          Bức tranh đầy đủ còn có vài lớp “trần quyền” chỉ có thể thu hẹp chứ không mở rộng quyền: <strong className="text-ink">Service Control Policy</strong> của AWS Organizations (áp lên cả tài khoản), <strong className="text-ink">permissions boundary</strong> (trần quyền cho một user hoặc role), và session policy. Một request chỉ được phép khi qua được tất cả các lớp đang áp dụng.
        </p>
        <Callout tone="tip" title="Dùng Deny để dựng hàng rào">
          Deny tường minh rất hợp cho những điều không bao giờ được xảy ra, bất kể ai được cấp quyền gì sau này: cấm tắt CloudTrail, cấm xóa backup, cấm hoạt động ngoài các region cho phép.
        </Callout>
      </ArticleSection>

      <ArticleSection id="role" number="04" eyebrow="Cách làm đúng" title="Role và credential tạm thời">
        <p>
          Một role có hai policy với hai vai trò khác nhau. <strong className="text-ink">Trust policy</strong> nói <em>ai</em> được đóng vai role này. <strong className="text-ink">Permissions policy</strong> nói đóng vai rồi thì <em>được làm gì</em>. Khi đóng vai, AWS STS cấp một bộ credential tạm thời (access key, secret, session token) có hạn dùng.
        </p>
        <AnnotatedOutput
          title="trust policy: cho phép dịch vụ EC2 đóng vai role"
          lines={[
            { text: `{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": { "Service": "ec2.amazonaws.com" },
    "Action": "sts:AssumeRole"
  }]
}`, note: 'Principal là dịch vụ EC2: máy ảo gắn role này (qua instance profile) sẽ tự nhận credential tạm thời từ instance metadata, và SDK hay CLI trên máy tự tìm thấy chúng.' },
          ]}
        />
        <Callout tone="warn" title="Đừng bao giờ chép access key lên EC2">
          Key nằm trên đĩa của server sẽ theo server vào snapshot, AMI và bản backup, và không tự hết hạn. Role cho máy ảo đúng quyền nó cần mà không có bí mật nào phải cất giữ. Tương tự, CI/CD như GitHub Actions nên đăng nhập AWS qua OIDC để nhận role, thay vì lưu access key trong secret.
        </Callout>
      </ArticleSection>

      <ArticleSection id="least-privilege" number="05" eyebrow="Thói quen tốt" title="Least privilege trong thực tế">
        <ul className="list-disc space-y-2 pl-5">
          <li><strong className="text-ink">Bắt đầu hẹp, mở dần khi cần.</strong> Thu hồi một quyền đã cấp khó hơn nhiều so với cấp thêm.</li>
          <li><strong className="text-ink">Dùng AWS managed policy để bắt đầu, rồi thu hẹp.</strong> IAM Access Analyzer có thể sinh policy dựa trên các hành động thực sự xuất hiện trong CloudTrail.</li>
          <li><strong className="text-ink">Bật MFA</strong> cho mọi con người có quyền đăng nhập Console.</li>
          <li><strong className="text-ink">Rà soát định kỳ:</strong> tab “Last accessed” cho biết dịch vụ nào một role chưa từng dùng, đó là quyền nên gỡ.</li>
          <li><strong className="text-ink">Thử trước khi tin:</strong> IAM Policy Simulator trả lời “role này có được làm X không” mà không phải thực hiện X.</li>
        </ul>
        <CodeBlock title="hỏi IAM trước khi thử thật">{`aws iam simulate-principal-policy \\
  --policy-source-arn arn:aws:iam::123456789012:role/app-reader \\
  --action-names s3:GetObject s3:DeleteObject \\
  --resource-arns "arn:aws:s3:::reports/q3.csv" \\
  --query 'EvaluationResults[].[EvalActionName,EvalDecision]' --output table`}</CodeBlock>
      </ArticleSection>

      <ArticleSection id="demo" number="06" eyebrow="Thực hành" title="Demo: cho máy ảo quyền đọc một bucket S3, không cần access key">
        <CodeBlock title="bước 1: role với trust policy cho EC2">{`cat > trust.json <<'EOF'
{"Version":"2012-10-17","Statement":[{"Effect":"Allow",
  "Principal":{"Service":"ec2.amazonaws.com"},"Action":"sts:AssumeRole"}]}
EOF
aws iam create-role --role-name app-reader --assume-role-policy-document file://trust.json`}</CodeBlock>
        <CodeBlock title="bước 2: permissions policy chỉ đọc đúng một bucket">{`BUCKET=reports-$(aws sts get-caller-identity --query Account --output text)
aws s3 mb s3://$BUCKET
echo "quy,doanh_thu" > q3.csv && aws s3 cp q3.csv s3://$BUCKET/

cat > read.json <<EOF
{"Version":"2012-10-17","Statement":[{"Effect":"Allow",
  "Action":["s3:GetObject","s3:ListBucket"],
  "Resource":["arn:aws:s3:::$BUCKET","arn:aws:s3:::$BUCKET/*"]}]}
EOF
aws iam put-role-policy --role-name app-reader --policy-name read-reports --policy-document file://read.json`}</CodeBlock>
        <CodeBlock title="bước 3: instance profile, cái “vỏ” để gắn role vào EC2">{`aws iam create-instance-profile --instance-profile-name app-reader
aws iam add-role-to-instance-profile --instance-profile-name app-reader --role-name app-reader

# Gắn vào máy đang chạy (hoặc dùng --iam-instance-profile Name=app-reader khi run-instances)
aws ec2 associate-iam-instance-profile --instance-id $APP --iam-instance-profile Name=app-reader`}</CodeBlock>
        <AnnotatedOutput
          title="kiểm tra từ bên trong máy ảo"
          lines={[
            { text: 'aws sts get-caller-identity --query Arn --output text', kind: 'command', note: 'Không có file credentials nào trên máy, CLI tự lấy credential tạm thời từ instance metadata.' },
            { text: 'arn:aws:sts::123456789012:assumed-role/app-reader/i-0abc…', note: 'Máy đang đóng vai app-reader; tên phiên chính là instance ID.' },
            { text: 'aws s3 ls s3://reports-123456789012', kind: 'command', note: 'Được phép: ListBucket trên bucket.' },
            { text: 'aws s3 rm s3://reports-123456789012/q3.csv', kind: 'command', note: 'AccessDenied: không có Allow nào cho s3:DeleteObject, nên rơi vào implicit deny.' },
          ]}
        />
        <p>
          Dọn dẹp: <Code>disassociate-iam-instance-profile</Code>, <Code>remove-role-from-instance-profile</Code>, <Code>delete-instance-profile</Code>, <Code>delete-role-policy</Code>, <Code>delete-role</Code>, rồi <Code>aws s3 rb s3://$BUCKET --force</Code>.
        </p>
      </ArticleSection>

      <section id="references" className="mt-14 scroll-mt-24 border-t border-border pt-10">
        <p className="section-eyebrow">Đọc thêm</p>
        <h2 className="article-h2">Tài liệu tham khảo</h2>
        <ul className="mt-5 space-y-3 text-sm">
          <ReferenceLink href="https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html" label="AWS — Security best practices in IAM" />
          <ReferenceLink href="https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic.html" label="AWS — Policy evaluation logic" />
          <ReferenceLink href="https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html" label="AWS — IAM roles" />
          <ReferenceLink href="https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/iam-roles-for-amazon-ec2.html" label="AWS — IAM roles for Amazon EC2" />
          <ReferenceLink href="https://docs.aws.amazon.com/singlesignon/latest/userguide/what-is.html" label="AWS — What is IAM Identity Center?" />
        </ul>
      </section>
    </ArticleShell>
  );
}
