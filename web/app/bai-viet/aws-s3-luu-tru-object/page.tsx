import type { Metadata } from 'next';
import { ArticleIntro, ArticleSection, ArticleShell, ReferenceLink } from '@/components/article-shell';
import { AnnotatedOutput, Callout, CodeBlock, Code, DataTable } from '@/components/network-ui';

export const metadata: Metadata = {
  title: 'S3: lưu trữ object, quyền truy cập và chi phí | tiendat13ns',
  description: 'Object storage khác block và file storage thế nào, bucket, key và prefix, các storage class và lifecycle rule, Block Public Access, bucket policy, presigned URL, versioning, mã hóa và demo bằng AWS CLI.',
};

const storageClasses = [
  ['S3 Standard', 'Dữ liệu dùng thường xuyên', 'Không', 'Mili giây'],
  ['S3 Intelligent-Tiering', 'Không đoán được tần suất truy cập; S3 tự chuyển tầng theo mức dùng', 'Không', 'Mili giây (các tầng archive tùy chọn thì chậm hơn)'],
  ['S3 Standard-IA', 'Ít truy cập nhưng cần lấy ngay: backup gần, file cũ', '30 ngày', 'Mili giây, tính phí mỗi GB lấy ra'],
  ['S3 One Zone-IA', 'Như Standard-IA nhưng chỉ nằm ở một AZ: dữ liệu tạo lại được', '30 ngày', 'Mili giây'],
  ['Glacier Instant Retrieval', 'Lưu trữ lâu, truy cập vài lần mỗi năm nhưng cần lấy ngay', '90 ngày', 'Mili giây'],
  ['Glacier Flexible Retrieval', 'Lưu trữ, chấp nhận chờ', '90 ngày', 'Vài phút đến vài giờ'],
  ['Glacier Deep Archive', 'Lưu trữ dài hạn rẻ nhất, gần như không bao giờ đọc', '180 ngày', 'Trong vòng khoảng 12 giờ'],
];

export default function AwsS3Page() {
  return (
    <ArticleShell currentHref="/bai-viet/aws-s3-luu-tru-object">
      <ArticleIntro
        eyebrow="Cloud trên AWS · Bài 6"
        title="S3: lưu trữ object, quyền truy cập và chi phí"
        description="S3 là nơi gần như mọi hệ thống trên AWS cất dữ liệu: ảnh người dùng tải lên, file log, bản backup, website tĩnh, dữ liệu cho phân tích. Dùng S3 thì dễ; dùng an toàn và rẻ thì cần hiểu storage class, các lớp quyền và vài tính năng bảo vệ dữ liệu."
        date="25/10/2026"
        readTime="16 phút đọc"
        tags={['Cloud', 'AWS', 'S3', 'Storage']}
      />

      <ArticleSection id="object-storage" number="01" eyebrow="Nền tảng" title="Object storage: bucket, key và object">
        <p>
          EBS là ổ đĩa (block storage), EFS là thư mục dùng chung (file storage), còn S3 là <strong className="text-ink">object storage</strong>: bạn đưa lên một khối dữ liệu kèm một cái tên, và lấy lại bằng đúng cái tên đó qua HTTP API. Không có “mở file, sửa dòng 10”; muốn sửa là ghi đè cả object.
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li><strong className="text-ink">Bucket:</strong> nơi chứa object, tên phải là duy nhất trên toàn bộ AWS, nằm ở một region.</li>
          <li><strong className="text-ink">Object:</strong> dữ liệu (tối đa 5 TB) cộng metadata.</li>
          <li><strong className="text-ink">Key:</strong> tên đầy đủ của object, vd <Code>uploads/2026/10/avatar.png</Code>. S3 không thật sự có thư mục: <Code>uploads/2026/</Code> chỉ là <strong className="text-ink">prefix</strong> của key, Console hiển thị như thư mục cho dễ nhìn.</li>
        </ul>
        <p>
          S3 Standard được thiết kế cho độ bền 99,999999999% (“11 số 9”) bằng cách lưu dữ liệu dư thừa trên nhiều AZ. Từ cuối năm 2020, S3 cũng có <strong className="text-ink">strong read-after-write consistency</strong>: ghi xong là mọi lần đọc sau thấy ngay bản mới.
        </p>
      </ArticleSection>

      <ArticleSection id="storage-class" number="02" eyebrow="Chi phí" title="Storage class và lifecycle rule">
        <p>
          Cùng một object, giá lưu trữ có thể chênh nhau hơn chục lần tùy storage class. Tầng càng rẻ để lưu thì càng đắt (hoặc chậm) để lấy ra, và thường có thời gian lưu tối thiểu: xóa sớm vẫn bị tính đủ.
        </p>
        <DataTable head={['Storage class', 'Dùng cho', 'Lưu tối thiểu', 'Lấy dữ liệu']} rows={storageClasses} minWidth={720} />
        <p>
          Thay vì chuyển tay, đặt <strong className="text-ink">lifecycle rule</strong> để S3 tự chuyển tầng hoặc tự xóa theo tuổi của object:
        </p>
        <AnnotatedOutput
          title="lifecycle.json: log giữ 30 ngày ở Standard, 1 năm ở Glacier, rồi xóa"
          lines={[
            { text: `{ "Rules": [{
    "ID": "logs-retention",
    "Filter": { "Prefix": "logs/" },
    "Status": "Enabled",`, note: 'Chỉ áp cho object có key bắt đầu bằng logs/. Một bucket có thể có nhiều rule cho nhiều prefix.' },
            { text: `    "Transitions": [
      { "Days": 30, "StorageClass": "GLACIER_IR" }
    ],`, note: 'Sau 30 ngày chuyển sang Glacier Instant Retrieval: vẫn đọc được ngay nếu cần điều tra sự cố.' },
            { text: `    "Expiration": { "Days": 395 }
}]}`, note: 'Tự xóa sau khoảng 13 tháng. Với bucket bật versioning, cần thêm NoncurrentVersionExpiration để dọn cả các phiên bản cũ.' },
          ]}
        />
      </ArticleSection>

      <ArticleSection id="quyen-truy-cap" number="03" eyebrow="Bảo mật" title="Ai đọc được bucket của bạn?">
        <p>
          Phần lớn sự cố lộ dữ liệu trên S3 không phải do AWS bị tấn công, mà do bucket bị cấu hình cho public. Quyền truy cập S3 đi qua nhiều lớp, và request phải qua được tất cả:
        </p>
        <DataTable
          head={['Lớp', 'Vai trò', 'Mặc định với bucket mới']}
          rows={[
            ['Block Public Access', 'Công tắc an toàn ở mức tài khoản và bucket: chặn mọi cấu hình làm bucket thành public, bất kể policy viết gì', 'Bật cả 4 tùy chọn'],
            ['IAM policy', 'Quyền của user hoặc role trong tài khoản (bài 2)', 'Không có quyền gì'],
            ['Bucket policy', 'Resource-based policy gắn lên bucket: cho tài khoản khác, dịch vụ khác, hoặc ép điều kiện như bắt buộc HTTPS', 'Trống'],
            ['ACL', 'Cơ chế phân quyền cũ theo từng object', 'Bị tắt (Object Ownership = Bucket owner enforced)'],
          ]}
        />
        <AnnotatedOutput
          title="bucket policy: từ chối mọi request không dùng HTTPS"
          lines={[
            { text: `{ "Version": "2012-10-17",
  "Statement": [{
    "Sid": "DenyInsecureTransport",
    "Effect": "Deny",
    "Principal": "*",`, note: 'Deny áp lên mọi principal, kể cả admin trong tài khoản: một hàng rào không ai vượt qua được (bài 2).' },
            { text: `    "Action": "s3:*",
    "Resource": [
      "arn:aws:s3:::my-app-uploads",
      "arn:aws:s3:::my-app-uploads/*"
    ],`, note: 'Cả bucket lẫn mọi object bên trong.' },
            { text: `    "Condition": { "Bool": { "aws:SecureTransport": "false" } }
  }]
}`, note: 'Chỉ khớp khi request đi bằng HTTP thường.' },
          ]}
        />
        <Callout tone="tip" title="Cho người ngoài tải một file mà không mở public: presigned URL">
          Một presigned URL là đường link có chữ ký, cho phép tải (hoặc tải lên) đúng một object trong thời hạn ngắn, dùng quyền của người tạo ra nó. Đây là cách chuẩn để app cho người dùng tải ảnh hay hóa đơn riêng tư. Muốn phục vụ nội dung public như website tĩnh, đặt CloudFront phía trước với Origin Access Control thay vì mở public cho bucket.
        </Callout>
      </ArticleSection>

      <ArticleSection id="bao-ve-du-lieu" number="04" eyebrow="Bảo vệ dữ liệu" title="Versioning, mã hóa và replication">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-ink">Versioning:</strong> mỗi lần ghi đè hay xóa, phiên bản cũ vẫn được giữ lại; xóa chỉ thêm một “delete marker”. Đây là lưới an toàn trước lỗi người dùng và ransomware. Đổi lại, mọi phiên bản cũ đều tính tiền lưu trữ, nên đi kèm lifecycle rule để dọn.
          </li>
          <li>
            <strong className="text-ink">Mã hóa:</strong> từ tháng 1/2023, mọi object mới được mã hóa mặc định bằng khóa do S3 quản lý (SSE-S3). Chọn SSE-KMS khi cần kiểm soát ai được dùng khóa và ghi log mỗi lần giải mã qua CloudTrail.
          </li>
          <li>
            <strong className="text-ink">Replication:</strong> tự sao chép object sang bucket khác, cùng hoặc khác region, cho yêu cầu khôi phục thảm họa hoặc để dữ liệu gần người dùng hơn. Cần bật versioning ở cả hai bucket.
          </li>
          <li>
            <strong className="text-ink">Object Lock:</strong> chế độ WORM (ghi một lần, không xóa được trong thời hạn), dùng cho backup cần chống xóa và yêu cầu tuân thủ.
          </li>
        </ul>
      </ArticleSection>

      <ArticleSection id="demo" number="05" eyebrow="Thực hành" title="Demo: bucket riêng tư, presigned URL, versioning và lifecycle">
        <CodeBlock title="bước 1: tạo bucket, tải lên và liệt kê">{`BUCKET=demo-$(aws sts get-caller-identity --query Account --output text)-$RANDOM
aws s3 mb s3://$BUCKET

echo "bao cao quy 3" > report.txt
aws s3 cp report.txt s3://$BUCKET/reports/2026/q3.txt
aws s3 ls s3://$BUCKET --recursive`}</CodeBlock>
        <AnnotatedOutput
          title="bước 2: thử truy cập từ bên ngoài"
          lines={[
            { text: 'curl -s -o /dev/null -w "%{http_code}\\n" https://$BUCKET.s3.$AWS_REGION.amazonaws.com/reports/2026/q3.txt', kind: 'command', note: '403: bucket riêng tư, request không có chữ ký bị từ chối. Dùng endpoint theo region (AWS_REGION đặt từ bài 3) để tránh bị redirect.' },
            { text: 'URL=$(aws s3 presign s3://$BUCKET/reports/2026/q3.txt --expires-in 300)\ncurl -s "$URL"', kind: 'command', note: 'Đọc được nội dung: URL có chữ ký, hết hạn sau 5 phút. Gửi URL này cho người khác là họ tải được trong 5 phút đó.' },
          ]}
        />
        <AnnotatedOutput
          title="bước 3: versioning cứu một lần xóa nhầm"
          lines={[
            { text: 'aws s3api put-bucket-versioning --bucket $BUCKET --versioning-configuration Status=Enabled', kind: 'command', note: 'Bật versioning. Từ giờ mọi lần ghi đè hay xóa đều để lại phiên bản cũ.' },
            { text: 'echo "ban moi" > report.txt && aws s3 cp report.txt s3://$BUCKET/reports/2026/q3.txt\naws s3 rm s3://$BUCKET/reports/2026/q3.txt', kind: 'command', note: 'Ghi đè rồi xóa. aws s3 ls không còn thấy file.' },
            { text: 'aws s3api list-object-versions --bucket $BUCKET --prefix reports/2026/q3.txt \\\n  --query \'[Versions[].[VersionId,IsLatest],DeleteMarkers[].[VersionId,IsLatest]]\'', kind: 'command', note: 'Vẫn còn đủ: hai phiên bản dữ liệu và một delete marker đang là bản mới nhất.' },
            { text: 'aws s3api delete-object --bucket $BUCKET --key reports/2026/q3.txt --version-id <id-của-delete-marker>', kind: 'command', note: 'Xóa delete marker là file “sống lại” với nội dung mới nhất.' },
          ]}
        />
        <CodeBlock title="bước 4: lifecycle rule, rồi dọn dẹp">{`aws s3api put-bucket-lifecycle-configuration --bucket $BUCKET \\
  --lifecycle-configuration file://lifecycle.json

# Bucket có versioning: aws s3 rb --force chỉ xóa phiên bản mới nhất.
# Cách nhanh nhất để xóa sạch mọi phiên bản: nút "Empty" trên Console, rồi:
aws s3 rb s3://$BUCKET`}</CodeBlock>
      </ArticleSection>

      <section id="references" className="mt-14 scroll-mt-24 border-t border-border pt-10">
        <p className="section-eyebrow">Đọc thêm</p>
        <h2 className="article-h2">Tài liệu tham khảo</h2>
        <ul className="mt-5 space-y-3 text-sm">
          <ReferenceLink href="https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html" label="AWS — What is Amazon S3?" />
          <ReferenceLink href="https://docs.aws.amazon.com/AmazonS3/latest/userguide/storage-class-intro.html" label="AWS — Using Amazon S3 storage classes" />
          <ReferenceLink href="https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-control-block-public-access.html" label="AWS — Blocking public access to your Amazon S3 storage" />
          <ReferenceLink href="https://docs.aws.amazon.com/AmazonS3/latest/userguide/Versioning.html" label="AWS — Retaining multiple versions of objects with S3 Versioning" />
          <ReferenceLink href="https://docs.aws.amazon.com/AmazonS3/latest/userguide/ShareObjectPreSignedURL.html" label="AWS — Sharing objects with presigned URLs" />
        </ul>
      </section>
    </ArticleShell>
  );
}
