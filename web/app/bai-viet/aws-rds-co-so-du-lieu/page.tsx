import type { Metadata } from 'next';
import { ArticleIntro, ArticleSection, ArticleShell, ReferenceLink } from '@/components/article-shell';
import { AnnotatedOutput, Callout, CodeBlock, Code, DataTable } from '@/components/network-ui';

export const metadata: Metadata = {
  title: 'RDS: database được quản lý trên AWS | tiendat13ns',
  description: 'Khi nào dùng RDS thay vì tự cài database trên EC2, DB subnet group và Security Group, Multi-AZ so với read replica, automated backup và point-in-time restore, mã hóa, Secrets Manager và demo PostgreSQL qua SSH tunnel.',
};

export default function AwsRdsPage() {
  return (
    <ArticleShell currentHref="/bai-viet/aws-rds-co-so-du-lieu">
      <ArticleIntro
        eyebrow="Cloud trên AWS · Bài 7"
        title="RDS: database được quản lý trên AWS"
        description="Database là phần khó vận hành nhất của hầu hết hệ thống: phải vá lỗi, backup, theo dõi đĩa, và khi máy chết thì phải chuyển sang máy dự phòng thật nhanh mà không mất dữ liệu. RDS nhận lại phần lớn công việc đó; phần còn lại là những quyết định bạn vẫn phải tự đưa ra."
        date="25/10/2026"
        readTime="16 phút đọc"
        tags={['Cloud', 'AWS', 'RDS', 'Database']}
      />

      <ArticleSection id="vi-sao" number="01" eyebrow="Nền tảng" title="Tự cài trên EC2 hay dùng RDS?">
        <DataTable
          head={['Việc cần làm', 'PostgreSQL trên EC2', 'RDS for PostgreSQL']}
          rows={[
            ['Cài đặt, vá hệ điều hành và engine', 'Bạn tự làm', 'AWS làm trong maintenance window bạn chọn'],
            ['Backup hằng ngày, lưu log giao dịch', 'Tự viết script, tự kiểm tra', 'Bật sẵn, khôi phục về gần như bất kỳ thời điểm nào'],
            ['Máy dự phòng ở AZ khác, tự chuyển khi sự cố', 'Tự dựng replication và failover', 'Một tùy chọn: Multi-AZ'],
            ['Mở rộng đĩa', 'Tự thêm volume, mở rộng filesystem', 'Đổi số GB, hoặc bật storage autoscaling'],
            ['Quyền root trên máy, extension tùy ý', 'Có', 'Không; chỉ những extension RDS hỗ trợ'],
          ]}
        />
        <p>
          RDS hỗ trợ PostgreSQL, MySQL, MariaDB, Oracle, SQL Server và Db2. <strong className="text-ink">Aurora</strong> là engine riêng của AWS tương thích MySQL hoặc PostgreSQL, với lớp lưu trữ phân tán trên ba AZ, phù hợp khi cần hiệu năng và khả năng chịu lỗi cao hơn. Bài này dùng RDS for PostgreSQL; khái niệm áp dụng chung cho các engine.
        </p>
      </ArticleSection>

      <ArticleSection id="mang" number="02" eyebrow="Mạng" title="Đặt database vào đúng chỗ trong VPC">
        <ul className="list-disc space-y-2 pl-5">
          <li><strong className="text-ink">DB subnet group:</strong> danh sách subnet RDS được phép dùng, bắt buộc trải ít nhất hai AZ, để có chỗ đặt máy dự phòng. Dùng các subnet private.</li>
          <li><strong className="text-ink">Không public:</strong> đặt <Code>PubliclyAccessible = false</Code>. Database không cần, và không nên, có đường nào từ Internet.</li>
          <li><strong className="text-ink">Security Group riêng:</strong> chỉ mở cổng của engine (5432 với PostgreSQL) cho Security Group của app server, giống mô hình tham chiếu SG ở bài 3 và bài 5.</li>
        </ul>
        <p>
          Ứng dụng kết nối tới một <strong className="text-ink">endpoint</strong> dạng DNS, vd <Code>demo-db.abc123.ap-southeast-1.rds.amazonaws.com</Code>, không bao giờ kết nối thẳng tới IP. Khi failover, AWS trỏ DNS sang máy mới, nên ứng dụng chỉ cần kết nối lại.
        </p>
      </ArticleSection>

      <ArticleSection id="multi-az" number="03" eyebrow="Sẵn sàng cao" title="Multi-AZ và read replica: hai thứ hay bị nhầm">
        <DataTable
          head={['', 'Multi-AZ (instance)', 'Read replica']}
          rows={[
            ['Mục đích', 'Sẵn sàng cao: có máy thay thế khi primary chết', 'Mở rộng khả năng đọc'],
            ['Sao chép', 'Đồng bộ (synchronous): giao dịch chỉ xác nhận khi đã ghi ở cả hai AZ', 'Bất đồng bộ (asynchronous): có thể trễ vài giây'],
            ['Đọc được từ bản sao?', 'Không, standby chỉ chờ', 'Có, đó là lý do tồn tại'],
            ['Khi primary chết', 'Tự failover, thường trong 1–2 phút, cùng endpoint', 'Không tự làm gì; phải promote thủ công thành DB độc lập'],
            ['Khác region?', 'Không', 'Có thể, dùng cho khôi phục thảm họa'],
          ]}
        />
        <p>
          Production nên bật Multi-AZ. Read replica chỉ cần khi database thật sự chật vì truy vấn đọc, và ứng dụng phải chủ động gửi truy vấn đọc tới endpoint của replica. Ngoài ra còn có <strong className="text-ink">Multi-AZ DB cluster</strong> với hai standby đọc được, kết hợp một phần ưu điểm của cả hai.
        </p>
      </ArticleSection>

      <ArticleSection id="backup" number="04" eyebrow="Khôi phục" title="Automated backup, snapshot và point-in-time restore">
        <ul className="list-disc space-y-2 pl-5">
          <li><strong className="text-ink">Automated backup:</strong> snapshot hằng ngày cộng log giao dịch, giữ từ 1 đến 35 ngày. Cho phép <strong className="text-ink">point-in-time restore</strong>: khôi phục về một thời điểm bất kỳ trong khoảng đó, thường chỉ trễ vài phút so với hiện tại.</li>
          <li><strong className="text-ink">Manual snapshot:</strong> chụp chủ động (vd trước khi migrate schema), tồn tại cho tới khi bạn xóa, kể cả sau khi đã xóa database.</li>
        </ul>
        <Callout tone="warn" title="Khôi phục luôn tạo ra database mới">
          Restore không ghi đè lên database đang chạy, mà tạo một instance mới với endpoint mới. Quy trình thực tế: restore ra instance mới, kiểm tra dữ liệu, rồi chuyển ứng dụng sang endpoint mới (hoặc đổi tên instance). Hãy diễn tập quy trình này trước khi thật sự cần nó: một bản backup chưa từng được khôi phục thử thì chưa chắc đã dùng được.
        </Callout>
      </ArticleSection>

      <ArticleSection id="bao-mat" number="05" eyebrow="Bảo mật" title="Mã hóa, mật khẩu và kết nối">
        <ul className="list-disc space-y-2 pl-5">
          <li><strong className="text-ink">Mã hóa lúc lưu trữ</strong> (KMS) phải chọn khi tạo instance, không bật được về sau; muốn mã hóa một DB cũ phải sao chép snapshot sang bản mã hóa rồi restore. Bật ngay từ đầu.</li>
          <li><strong className="text-ink">Mật khẩu master trong Secrets Manager:</strong> tùy chọn <Code>--manage-master-user-password</Code> để RDS tự sinh, lưu và xoay vòng mật khẩu. Ứng dụng đọc mật khẩu qua IAM role, không hard-code.</li>
          <li><strong className="text-ink">TLS khi kết nối:</strong> RDS hỗ trợ sẵn; có thể bắt buộc bằng parameter group (với PostgreSQL là <Code>rds.force_ssl</Code>).</li>
          <li><strong className="text-ink">IAM database authentication:</strong> đăng nhập bằng token IAM ngắn hạn thay vì mật khẩu, hợp với ứng dụng chạy trên EC2 hoặc Lambda có role.</li>
        </ul>
      </ArticleSection>

      <ArticleSection id="demo" number="06" eyebrow="Thực hành" title="Demo: PostgreSQL riêng tư, kết nối qua SSH tunnel">
        <p>
          Dùng lại VPC của bài 3 với hai subnet private ở hai AZ (<Code>$PRIV_A</Code>, <Code>$PRIV_B</Code> từ bài 5) và bastion. Database không có đường từ Internet, nên ta đi qua bastion bằng SSH tunnel, đúng kỹ thuật trong bài SSH, Tunnel và VPN của series Network.
        </p>
        <CodeBlock title="bước 1: subnet group và Security Group">{`aws rds create-db-subnet-group --db-subnet-group-name demo-db-subnets \\
  --db-subnet-group-description "private subnets" --subnet-ids $PRIV_A $PRIV_B

SG_DB=$(aws ec2 create-security-group --group-name db-sg --description "Postgres from bastion" \\
        --vpc-id $VPC --query GroupId --output text)
aws ec2 authorize-security-group-ingress --group-id $SG_DB --protocol tcp --port 5432 --source-group $SG_B`}</CodeBlock>
        <CodeBlock title="bước 2: tạo database (mất khoảng 5–10 phút)">{`aws rds create-db-instance --db-instance-identifier demo-db \\
  --engine postgres --db-instance-class db.t4g.micro --allocated-storage 20 \\
  --master-username postgres --manage-master-user-password \\
  --db-subnet-group-name demo-db-subnets --vpc-security-group-ids $SG_DB \\
  --no-publicly-accessible --storage-encrypted --backup-retention-period 7
aws rds wait db-instance-available --db-instance-identifier demo-db`}</CodeBlock>
        <AnnotatedOutput
          title="bước 3: lấy endpoint và mật khẩu, mở tunnel, kết nối"
          lines={[
            { text: `DB_HOST=$(aws rds describe-db-instances --db-instance-identifier demo-db \\
          --query 'DBInstances[0].Endpoint.Address' --output text)
SECRET=$(aws rds describe-db-instances --db-instance-identifier demo-db \\
         --query 'DBInstances[0].MasterUserSecret.SecretArn' --output text)
aws secretsmanager get-secret-value --secret-id $SECRET \\
  --query SecretString --output text`, kind: 'command', note: 'Mật khẩu do RDS sinh và cất trong Secrets Manager, trả về dạng JSON {"username":…,"password":…}. Không ai phải nghĩ ra hay ghi lại mật khẩu này.' },
            { text: 'ssh -i demo-key.pem -N -L 5433:$DB_HOST:5432 ec2-user@$BASTION_IP', kind: 'command', note: 'Cổng 5433 trên laptop được nối qua bastion tới cổng 5432 của database. Để terminal này chạy, mở terminal khác cho bước sau.' },
            { text: 'psql "host=localhost port=5433 user=postgres dbname=postgres sslmode=require"', kind: 'command', note: 'Nhập mật khẩu vừa lấy. sslmode=require buộc kết nối mã hóa tới tận database.' },
            { text: 'SELECT version();', kind: 'command', note: 'Thấy dòng PostgreSQL … on aarch64: db.t4g chạy trên Graviton (bài 4).' },
          ]}
        />
        <CodeBlock title="bước 4: thử point-in-time restore, rồi dọn dẹp">{`# Khôi phục về thời điểm gần nhất có thể, ra một instance mới
aws rds restore-db-instance-to-point-in-time --source-db-instance-identifier demo-db \\
  --target-db-instance-identifier demo-db-restored --use-latest-restorable-time \\
  --db-subnet-group-name demo-db-subnets --vpc-security-group-ids $SG_DB --no-publicly-accessible

# Dọn dẹp (bỏ qua final snapshot vì đây là demo)
for DB in demo-db demo-db-restored; do
  aws rds delete-db-instance --db-instance-identifier $DB --skip-final-snapshot --delete-automated-backups
done
aws rds wait db-instance-deleted --db-instance-identifier demo-db
aws rds wait db-instance-deleted --db-instance-identifier demo-db-restored
aws rds delete-db-subnet-group --db-subnet-group-name demo-db-subnets
aws ec2 delete-security-group --group-id $SG_DB`}</CodeBlock>
      </ArticleSection>

      <section id="references" className="mt-14 scroll-mt-24 border-t border-border pt-10">
        <p className="section-eyebrow">Đọc thêm</p>
        <h2 className="article-h2">Tài liệu tham khảo</h2>
        <ul className="mt-5 space-y-3 text-sm">
          <ReferenceLink href="https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Welcome.html" label="AWS — What is Amazon RDS?" />
          <ReferenceLink href="https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.MultiAZ.html" label="AWS — Multi-AZ deployments" />
          <ReferenceLink href="https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_ReadRepl.html" label="AWS — Working with DB instance read replicas" />
          <ReferenceLink href="https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_PIT.html" label="AWS — Restoring a DB instance to a specified time" />
          <ReferenceLink href="https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/rds-secrets-manager.html" label="AWS — Password management with Amazon RDS and Secrets Manager" />
        </ul>
      </section>
    </ArticleShell>
  );
}
