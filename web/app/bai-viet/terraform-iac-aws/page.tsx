import type { Metadata } from 'next';
import { ArticleIntro, ArticleSection, ArticleShell, ReferenceLink } from '@/components/article-shell';
import { AnnotatedOutput, Callout, CodeBlock, Code, DataTable } from '@/components/network-ui';

export const metadata: Metadata = {
  title: 'Terraform: viết lại hạ tầng AWS bằng code | tiendat13ns',
  description: 'Infrastructure as Code là gì, provider, resource, data source, variable, output và state; viết lại toàn bộ VPC public/private của series bằng Terraform, đọc plan, remote state trên S3, drift và module.',
};

export default function TerraformPage() {
  return (
    <ArticleShell currentHref="/bai-viet/terraform-iac-aws">
      <ArticleIntro
        eyebrow="Cloud trên AWS · Bài 8"
        title="Terraform: viết lại hạ tầng AWS bằng code"
        description="Ở bài 3, dựng một VPC tốn hơn hai mươi lệnh CLI và một bảng biến shell, còn dọn dẹp phải nhớ đúng thứ tự ngược lại. Bài cuối của series viết lại toàn bộ hạ tầng đó thành vài file Terraform: dựng bằng một lệnh, xóa bằng một lệnh, và review được như code."
        date="25/10/2026"
        readTime="19 phút đọc"
        tags={['Cloud', 'AWS', 'Terraform', 'IaC']}
      />

      <ArticleSection id="iac" number="01" eyebrow="Nền tảng" title="Infrastructure as Code: mô tả trạng thái, không liệt kê thao tác">
        <p>
          Script CLI là <strong className="text-ink">mệnh lệnh</strong> (imperative): “tạo VPC, rồi tạo subnet, rồi…”. Chạy lại lần hai là lỗi vì tài nguyên đã tồn tại, và script không biết ai đã sửa tay trên Console. Terraform là <strong className="text-ink">khai báo</strong> (declarative): bạn mô tả hạ tầng <em>nên trông như thế nào</em>, Terraform so với thực tế rồi tự tính ra cần tạo, sửa hay xóa gì.
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li><strong className="text-ink">Lặp lại được:</strong> dựng môi trường dev, staging, prod giống hệt nhau từ cùng một code.</li>
          <li><strong className="text-ink">Review được:</strong> thay đổi hạ tầng đi qua pull request như code ứng dụng, kèm bản plan cho người review đọc.</li>
          <li><strong className="text-ink">Có lịch sử:</strong> git cho biết ai mở cổng 22 ra Internet, khi nào và vì sao.</li>
          <li><strong className="text-ink">Xóa sạch:</strong> <Code>terraform destroy</Code> tự xóa theo đúng thứ tự phụ thuộc.</li>
        </ul>
        <DataTable
          head={['', 'Terraform / OpenTofu', 'CloudFormation']}
          rows={[
            ['Phạm vi', 'Đa cloud và hàng nghìn provider (GitHub, Cloudflare, Kubernetes…)', 'Chỉ AWS'],
            ['Ngôn ngữ', 'HCL', 'YAML/JSON (hoặc code qua AWS CDK)'],
            ['State', 'File state do bạn quản lý (nên để trên S3)', 'AWS tự quản lý'],
            ['Giấy phép', 'Terraform: BSL từ 2023; OpenTofu: fork mã nguồn mở, cú pháp gần như giống hệt', 'Dịch vụ của AWS, miễn phí'],
          ]}
        />
      </ArticleSection>

      <ArticleSection id="khai-niem" number="02" eyebrow="Khái niệm" title="Provider, resource, data source, variable, output, state">
        <DataTable
          head={['Khái niệm', 'Là gì', 'Ví dụ']}
          rows={[
            ['Provider', 'Plugin nói chuyện với một API', <Code key="p">hashicorp/aws</Code>],
            ['Resource', 'Một thứ Terraform tạo và quản lý', <Code key="r">aws_vpc</Code>],
            ['Data source', 'Đọc thông tin có sẵn, không tạo gì', <Code key="d">aws_ami</Code>],
            ['Variable', 'Tham số đầu vào', <Code key="v">var.my_ip_cidr</Code>],
            ['Output', 'Giá trị in ra sau khi apply, hoặc để module khác dùng', <Code key="o">bastion_public_ip</Code>],
            ['State', 'File ghi lại resource trong code ứng với ID nào ngoài thực tế', <Code key="s">terraform.tfstate</Code>],
          ]}
        />
        <p>
          Terraform tự suy ra thứ tự tạo từ các tham chiếu: subnet viết <Code>vpc_id = aws_vpc.main.id</Code> nên VPC phải có trước. Bạn không phải sắp thứ tự như với script CLI.
        </p>
      </ArticleSection>

      <ArticleSection id="code" number="03" eyebrow="Thực hành" title="Viết lại VPC của series bằng Terraform">
        <p>
          Cùng kiến trúc với bài 3, nâng lên hai AZ như bài 5: hai subnet public, hai subnet private, IGW, NAT Gateway, hai route table, bastion và một máy app. Tách thành bốn file trong một thư mục.
        </p>
        <CodeBlock title="versions.tf">{`terraform {
  required_version = ">= 1.10"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

provider "aws" {
  region = var.region

  default_tags {
    tags = {
      Project   = "cloud-series"
      ManagedBy = "terraform"
    }
  }
}`}</CodeBlock>
        <CodeBlock title="variables.tf">{`variable "region" {
  type    = string
  default = "ap-southeast-1"
}

variable "my_ip_cidr" {
  type        = string
  description = "IP được SSH vào bastion, vd 203.0.113.10/32"
}

variable "key_name" {
  type    = string
  default = "demo-key"
}`}</CodeBlock>
        <AnnotatedOutput
          title="main.tf: mạng"
          lines={[
            { text: `data "aws_availability_zones" "available" {
  state = "available"
}

resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  tags                 = { Name = "demo-vpc" }
}`, note: 'Data source lấy danh sách AZ của region thay vì gõ cứng ap-southeast-1a, nên code chạy được ở region khác.' },
            { text: `resource "aws_subnet" "public" {
  count                   = 2
  vpc_id                  = aws_vpc.main.id
  cidr_block              = cidrsubnet(aws_vpc.main.cidr_block, 8, count.index + 1)
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true
  tags                    = { Name = "public-\${count.index}" }
}

resource "aws_subnet" "private" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(aws_vpc.main.cidr_block, 8, count.index + 11)
  availability_zone = data.aws_availability_zones.available.names[count.index]
  tags              = { Name = "private-\${count.index}" }
}`, note: 'count tạo hai bản, mỗi AZ một subnet. cidrsubnet cắt /16 thành các /24: public là 10.0.1.0/24 và 10.0.2.0/24, private là 10.0.11.0/24 và 10.0.12.0/24 (bài IP, Subnet và CIDR).' },
            { text: `resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
}

resource "aws_eip" "nat" {
  domain = "vpc"
}

resource "aws_nat_gateway" "main" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.public[0].id
  depends_on    = [aws_internet_gateway.main]
}`, note: 'NAT Gateway đặt ở subnet public đầu tiên. depends_on là phụ thuộc ngầm mà Terraform không tự suy ra được từ tham chiếu: NAT cần IGW đã gắn vào VPC.' },
            { text: `resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }
}

resource "aws_route_table" "private" {
  vpc_id = aws_vpc.main.id
  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main.id
  }
}

resource "aws_route_table_association" "public" {
  count          = 2
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "private" {
  count          = 2
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private.id
}`, note: 'Hai route table của bài 3, giờ là code. Route local 10.0.0.0/16 không cần khai báo vì AWS luôn tự có.' },
          ]}
        />
        <AnnotatedOutput
          title="main.tf: Security Group và máy ảo"
          lines={[
            { text: `resource "aws_security_group" "bastion" {
  name   = "bastion-sg"
  vpc_id = aws_vpc.main.id
}

resource "aws_vpc_security_group_ingress_rule" "bastion_ssh" {
  security_group_id = aws_security_group.bastion.id
  cidr_ipv4         = var.my_ip_cidr
  ip_protocol       = "tcp"
  from_port         = 22
  to_port           = 22
}`, note: 'Mỗi luật là một resource riêng: dễ đọc diff, và thêm hay bớt một luật không làm Terraform viết lại cả Security Group.' },
            { text: `resource "aws_security_group" "app" {
  name   = "app-sg"
  vpc_id = aws_vpc.main.id
}

resource "aws_vpc_security_group_ingress_rule" "app_ssh" {
  security_group_id            = aws_security_group.app.id
  referenced_security_group_id = aws_security_group.bastion.id
  ip_protocol                  = "tcp"
  from_port                    = 22
  to_port                      = 22
}

resource "aws_vpc_security_group_ingress_rule" "app_icmp" {
  security_group_id            = aws_security_group.app.id
  referenced_security_group_id = aws_security_group.bastion.id
  ip_protocol                  = "icmp"
  from_port                    = -1
  to_port                      = -1
}`, note: 'referenced_security_group_id chính là --source-group của bài 3: chỉ máy thuộc bastion-sg được vào.' },
            { text: `resource "aws_vpc_security_group_egress_rule" "all_out" {
  for_each          = {
    bastion = aws_security_group.bastion.id
    app     = aws_security_group.app.id
  }
  security_group_id = each.value
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "-1"
}`, note: 'Bẫy kinh điển: khi Terraform tạo Security Group, nó XÓA luật egress “cho mọi thứ ra” mặc định. Quên khai báo lại thì máy không ra được Internet, dnf update treo.' },
            { text: `data "aws_ami" "al2023" {
  most_recent = true
  owners      = ["amazon"]
  filter {
    name   = "name"
    values = ["al2023-ami-2023.*-x86_64"]
  }
}

resource "aws_instance" "bastion" {
  ami                    = data.aws_ami.al2023.id
  instance_type          = "t3.micro"
  subnet_id              = aws_subnet.public[0].id
  vpc_security_group_ids = [aws_security_group.bastion.id]
  key_name               = var.key_name
  metadata_options { http_tokens = "required" }
  tags = { Name = "bastion" }
}

resource "aws_instance" "app" {
  ami                    = data.aws_ami.al2023.id
  instance_type          = "t3.micro"
  subnet_id              = aws_subnet.private[0].id
  vpc_security_group_ids = [aws_security_group.app.id]
  key_name               = var.key_name
  metadata_options { http_tokens = "required" }
  tags = { Name = "app" }
}`, note: 'Data source aws_ami tìm AMI Amazon Linux 2023 mới nhất. http_tokens = "required" bật IMDSv2 như bài 4.' },
          ]}
        />
        <CodeBlock title="outputs.tf">{`output "bastion_public_ip" {
  value = aws_instance.bastion.public_ip
}

output "app_private_ip" {
  value = aws_instance.app.private_ip
}

output "nat_public_ip" {
  value = aws_eip.nat.public_ip
}`}</CodeBlock>
      </ArticleSection>

      <ArticleSection id="quy-trinh" number="04" eyebrow="Quy trình" title="init, plan, apply và cách đọc plan">
        <AnnotatedOutput
          title="vòng làm việc hằng ngày"
          lines={[
            { text: 'terraform init', kind: 'command', note: 'Tải provider, cấu hình backend. Chạy lần đầu và mỗi khi đổi provider hay backend.' },
            { text: 'terraform fmt && terraform validate', kind: 'command', note: 'Định dạng code chuẩn và kiểm tra cú pháp, tham chiếu. Nên chạy trong CI cho mọi pull request.' },
            { text: 'terraform plan -var="my_ip_cidr=$(curl -s https://checkip.amazonaws.com)/32" -out=tfplan', kind: 'command', note: 'Tính ra danh sách thay đổi mà chưa đụng vào gì. -out lưu đúng bản plan đã xem để apply, tránh trường hợp thực tế đổi giữa lúc plan và lúc apply.' },
            { text: 'terraform apply tfplan', kind: 'command', note: 'Thực hiện đúng bản plan đã lưu. Sau vài phút in ra ba output: IP bastion, IP app và IP của NAT.' },
            { text: 'terraform destroy -var="my_ip_cidr=0.0.0.0/32"', kind: 'command', note: 'Xóa toàn bộ theo đúng thứ tự phụ thuộc. Biến bắt buộc vẫn phải có giá trị, dù giá trị nào cũng được khi xóa.' },
          ]}
        />
        <AnnotatedOutput
          title="đọc output của terraform plan"
          lines={[
            { text: `  # aws_vpc.main will be created
  + resource "aws_vpc" "main" {
      + cidr_block = "10.0.0.0/16"
      + id         = (known after apply)`, note: 'Dấu + là tạo mới. (known after apply) là giá trị chỉ AWS biết sau khi tạo xong, như ID.' },
            { text: `  # aws_instance.app will be updated in-place
  ~ resource "aws_instance" "app" {
      ~ instance_type = "t3.micro" -> "t3.small"`, note: 'Dấu ~ là sửa tại chỗ. Với EC2, đổi instance type nghĩa là máy bị stop rồi start lại: “tại chỗ” không có nghĩa là không gián đoạn.' },
            { text: `  # aws_subnet.private[0] must be replaced
-/+ resource "aws_subnet" "private" {
      ~ cidr_block = "10.0.11.0/24" -> "10.0.21.0/24" # forces replacement`, note: 'Dấu -/+ là xóa rồi tạo lại, kèm chú thích thuộc tính nào gây ra. Đây là dòng phải đọc kỹ nhất: xóa subnet kéo theo cả máy trong đó.' },
            { text: 'Plan: 23 to add, 0 to change, 0 to destroy.', note: 'Dòng tổng kết. Trong review, con số “to destroy” khác 0 luôn đáng một câu hỏi.' },
          ]}
        />
      </ArticleSection>

      <ArticleSection id="state" number="05" eyebrow="Quan trọng" title="State: trái tim, cũng là điểm yếu">
        <p>
          File state nối từng resource trong code với ID thật trên AWS. Mất state, Terraform không còn biết mình đã tạo những gì; hai người cùng apply trên hai bản state khác nhau thì hạ tầng hỏng. Vì vậy khi làm nhóm, state phải nằm ở một chỗ chung và có khóa.
        </p>
        <CodeBlock title="versions.tf: thêm remote backend trên S3 có khóa">{`terraform {
  backend "s3" {
    bucket       = "tfstate-123456789012"      # tạo tay một lần, bật versioning
    key          = "cloud-series/vpc.tfstate"
    region       = "ap-southeast-1"
    use_lockfile = true                         # khóa bằng file trên S3 (Terraform 1.10+)
  }
}`}</CodeBlock>
        <ul className="list-disc space-y-2 pl-5">
          <li><strong className="text-ink">Không commit state lên git.</strong> State chứa ID và có thể chứa cả bí mật dạng văn bản thường. Thêm <Code>.terraform/</Code>, <Code>*.tfstate*</Code> và <Code>*.tfvars</Code> vào <Code>.gitignore</Code>, nhưng nên commit <Code>.terraform.lock.hcl</Code> để cố định phiên bản provider.</li>
          <li><strong className="text-ink">Bật versioning cho bucket state</strong> (bài 6): state hỏng thì quay lại phiên bản trước.</li>
          <li><strong className="text-ink">Khóa bằng S3:</strong> từ Terraform 1.10, backend S3 tự khóa bằng file <Code>.tflock</Code>; cách cũ dùng bảng DynamoDB đã được đánh dấu deprecated.</li>
        </ul>
        <Callout tone="tip" title="Thử nghiệm drift">
          Sau khi apply, vào Console xóa luật SSH của <Code>bastion-sg</Code> và đổi tag Name của máy app, rồi chạy <Code>terraform plan</Code>: Terraform phát hiện cả hai và đề xuất đưa về đúng như code. Nhưng nếu bạn <em>thêm</em> tay một luật mới, chẳng hạn mở cổng 3306 vào <Code>app-sg</Code>, plan sẽ không thấy gì, vì luật đó không có trong code nên Terraform không quản lý. Lỗ hổng như vậy nằm ngoài tầm mắt của mọi người review, và đó là lý do nhiều nhóm cấm sửa tay hạ tầng production.
        </Callout>
      </ArticleSection>

      <ArticleSection id="tiep-theo" number="06" eyebrow="Đi xa hơn" title="Module, nhiều môi trường và CI/CD">
        <ul className="list-disc space-y-2 pl-5">
          <li><strong className="text-ink">Module:</strong> gói một cụm resource thành khối dùng lại. Module cộng đồng <Code>terraform-aws-modules/vpc/aws</Code> dựng được toàn bộ phần mạng ở trên trong khoảng mười dòng; tự viết một lần như bài này giúp bạn hiểu module đó đang làm gì.</li>
          <li><strong className="text-ink">Nhiều môi trường:</strong> mỗi môi trường một thư mục gọi cùng module với tham số khác nhau, và mỗi thư mục một file state riêng, để lỗi ở dev không chạm được tới prod.</li>
          <li><strong className="text-ink">CI/CD:</strong> pull request chạy <Code>fmt</Code>, <Code>validate</Code>, <Code>plan</Code> và đăng plan thành comment; merge vào main mới <Code>apply</Code>. Pipeline đăng nhập AWS qua OIDC để nhận role (bài 2), không lưu access key.</li>
        </ul>
        <p>
          Đến đây series Cloud trên AWS đã đi đủ một vòng: tài khoản an toàn, phân quyền, mạng, máy ảo, chịu tải, lưu trữ, database, và cuối cùng là đưa tất cả vào code. Bước tiếp theo tự nhiên là đóng gói ứng dụng bằng container và chạy trên ECS hoặc Kubernetes (EKS), cùng với giám sát bằng CloudWatch.
        </p>
      </ArticleSection>

      <section id="references" className="mt-14 scroll-mt-24 border-t border-border pt-10">
        <p className="section-eyebrow">Đọc thêm</p>
        <h2 className="article-h2">Tài liệu tham khảo</h2>
        <ul className="mt-5 space-y-3 text-sm">
          <ReferenceLink href="https://developer.hashicorp.com/terraform/tutorials/aws-get-started" label="HashiCorp — Get started with Terraform on AWS" />
          <ReferenceLink href="https://registry.terraform.io/providers/hashicorp/aws/latest/docs" label="Terraform Registry — AWS provider documentation" />
          <ReferenceLink href="https://developer.hashicorp.com/terraform/language/backend/s3" label="HashiCorp — S3 backend" />
          <ReferenceLink href="https://registry.terraform.io/modules/terraform-aws-modules/vpc/aws/latest" label="Terraform Registry — terraform-aws-modules/vpc" />
          <ReferenceLink href="https://opentofu.org/docs/" label="OpenTofu — Documentation" />
        </ul>
      </section>
    </ArticleShell>
  );
}
