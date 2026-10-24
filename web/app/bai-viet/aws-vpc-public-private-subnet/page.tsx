import type { Metadata } from 'next';
import { ArticleIntro, ArticleSection, ArticleShell, ReferenceLink } from '@/components/article-shell';
import { AnnotatedOutput, Callout, CodeBlock, Code } from '@/components/network-ui';
import { VpcConnectivityLab } from '@/components/vpc-connectivity-lab';

export const metadata: Metadata = {
  title: 'Cloud Networking trên AWS: VPC, subnet public/private và demo kiểm tra kết nối | tiendat13ns',
  description: 'Virtual network là gì, các thành phần của AWS VPC (subnet, route table, Internet Gateway, NAT Gateway, Security Group, NACL), so sánh với Azure VNet và GCP, và demo dựng mạng public/private bằng AWS CLI.',
};

const buildingBlocks = [
  ['Dải IP riêng của công ty', 'VPC + CIDR (vd 10.0.0.0/16)', 'Ranh giới của mạng riêng, tối đa /16 và tối thiểu /28'],
  ['VLAN, phân đoạn mạng', 'Subnet (vd 10.0.1.0/24)', 'Chia mạng theo vai trò; mỗi subnet nằm trong đúng một AZ'],
  ['Router và bảng định tuyến', 'Route table', 'Quyết định gói tin đi đâu; gắn vào subnet'],
  ['Modem ra Internet', 'Internet Gateway (IGW)', 'Cửa ra/vào Internet hai chiều cho máy có public IP'],
  ['NAT trên router nhà', 'NAT Gateway', 'Máy private đi ra được, Internet không gọi vào được'],
  ['Firewall', 'Security Group, Network ACL', 'Lọc traffic ở mức máy và mức subnet'],
  ['VPN văn phòng, đường leased line', 'Site-to-Site VPN, Direct Connect', 'Nối mạng on-premise với VPC'],
  ['Nối hai chi nhánh', 'VPC Peering, Transit Gateway', 'Nối nhiều VPC với nhau'],
];

const firewallCompare = [
  ['Gắn vào', 'Network interface (từng máy)', 'Subnet (mọi máy trong subnet)'],
  ['Trạng thái', 'Stateful: request đã được vào thì response tự được ra', 'Stateless: phải mở cả chiều về, kể cả dải ephemeral port'],
  ['Loại luật', 'Chỉ allow', 'Allow và deny'],
  ['Thứ tự', 'Xét tất cả luật, có luật nào cho là qua', 'Xét theo số thứ tự tăng dần, khớp luật nào trước thì dùng luật đó'],
  ['Nguồn trong luật', 'CIDR hoặc một Security Group khác', 'Chỉ CIDR'],
  ['Mặc định', 'Chặn mọi inbound, cho mọi outbound', 'NACL mặc định cho tất cả hai chiều'],
];

const platformCompare = [
  ['Phạm vi mạng', 'Một region', 'Một region', 'Toàn cầu'],
  ['Phạm vi subnet', 'Một AZ', 'Trải trên mọi AZ của region', 'Một region'],
  ['IP bị giữ lại mỗi subnet', '5', '5', '4'],
  ['Firewall', 'Security Group + NACL', 'NSG (stateful, allow/deny, priority 100–4096)', 'Firewall rules / policies'],
  ['Ra Internet cho mạng private', 'NAT Gateway', 'NAT Gateway', 'Cloud NAT'],
  ['Nối nhiều mạng', 'Peering, Transit Gateway', 'Peering, Virtual WAN', 'Peering, Network Connectivity Center'],
  ['Gọi dịch vụ PaaS qua đường private', 'VPC Endpoint / PrivateLink', 'Private Endpoint', 'Private Service Connect'],
  ['Hạ tầng dưới dạng code', 'CloudFormation, Terraform', 'Bicep, ARM, Terraform', 'Terraform, Deployment Manager'],
];

export default function AwsVpcPage() {
  return (
    <ArticleShell currentHref="/bai-viet/aws-vpc-public-private-subnet">
      <ArticleIntro
        eyebrow="Cloud trên AWS · Bài 3"
        title="Cloud Networking trên AWS: VPC, subnet public/private và demo kiểm tra kết nối"
        description="Mọi thứ bạn dựng trên AWS đều nằm trong một mạng ảo. Bài này đi từ khái niệm virtual network, qua từng mảnh của một VPC, so sánh nhanh với Azure và GCP, rồi tự tay dựng một mạng có subnet public, subnet private và kiểm tra xem gói tin đi được tới đâu."
        date="24/10/2026"
        readTime="20 phút đọc"
        tags={['Cloud', 'AWS', 'VPC', 'Networking']}
      />

      <ArticleSection id="virtual-network" number="01" eyebrow="Nền tảng" title="Virtual network: mạng riêng trên hạ tầng dùng chung">
        <p>
          AWS có một hạ tầng mạng vật lý khổng lồ mà hàng triệu khách hàng dùng chung. <strong className="text-ink">Virtual network</strong> (AWS gọi là <strong className="text-ink">VPC</strong>, Virtual Private Cloud) là một mạng riêng logic được cắt ra từ hạ tầng đó bằng phần mềm (SDN, Software-Defined Networking). Ba tính chất quan trọng:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li><strong className="text-ink">Cô lập:</strong> mạng của bạn không nhìn thấy mạng của khách hàng khác, kể cả khi hai bên cùng dùng dải <Code>10.0.0.0/16</Code>.</li>
          <li><strong className="text-ink">Định nghĩa bằng API:</strong> tạo subnet, router hay firewall chỉ là một lệnh, không phải đi dây hay mua thiết bị. Vì vậy hạ tầng mạng có thể viết thành code.</li>
          <li><strong className="text-ink">Trách nhiệm chia đôi:</strong> AWS lo phần cứng và sự cô lập giữa các khách hàng. Bạn lo thiết kế subnet, routing và luật firewall. Mở cổng 22 ra <Code>0.0.0.0/0</Code> là lỗi của bạn, không phải của AWS.</li>
        </ul>
        <p>
          Tin tốt: các khái niệm không mới. Nếu bạn đã đọc series Network (IP và CIDR, NAT, firewall, bastion), VPC chỉ là những thứ đó được đóng gói thành dịch vụ.
        </p>
      </ArticleSection>

      <ArticleSection id="thanh-phan" number="02" eyebrow="Khái niệm" title="Các mảnh ghép của một VPC">
        <div className="overflow-x-auto border border-border bg-card">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-surface font-mono text-xs uppercase tracking-[0.06em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Mạng truyền thống</th>
                <th className="px-4 py-3">Trên AWS</th>
                <th className="px-4 py-3">Vai trò</th>
              </tr>
            </thead>
            <tbody>
              {buildingBlocks.map(([traditional, aws, role]) => (
                <tr className="border-t border-border" key={aws}>
                  <td className="px-4 py-3">{traditional}</td>
                  <td className="px-4 py-3 font-semibold text-ink">{aws}</td>
                  <td className="px-4 py-3">{role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          <strong className="text-ink">Region</strong> là một khu vực địa lý (vd Singapore, <Code>ap-southeast-1</Code>). Mỗi region có nhiều <strong className="text-ink">Availability Zone</strong> (AZ): các trung tâm dữ liệu độc lập về điện, mạng và làm mát. Một VPC trải trên cả region, nhưng mỗi subnet chỉ nằm trong một AZ. Vì vậy thiết kế chuẩn luôn tạo subnet ở ít nhất hai AZ, để một AZ gặp sự cố thì hệ thống vẫn chạy.
        </p>
        <Callout title="Vì sao subnet /24 chỉ dùng được 251 IP?">
          AWS giữ lại 5 địa chỉ trong mỗi subnet. Với <Code>10.0.1.0/24</Code>: <Code>.0</Code> là địa chỉ mạng, <Code>.1</Code> là VPC router, <Code>.2</Code> là DNS, <Code>.3</Code> để dành cho tương lai, và <Code>.255</Code> là địa chỉ broadcast (VPC không hỗ trợ broadcast nhưng vẫn giữ lại). Còn 256 − 5 = 251 địa chỉ cho máy của bạn.
        </Callout>
      </ArticleSection>

      <ArticleSection id="public-private" number="03" eyebrow="Ý quan trọng nhất" title="Public hay private là do route table quyết định">
        <p>
          Khi tạo subnet, AWS không hỏi bạn muốn subnet public hay private. Tính chất đó đến từ <strong className="text-ink">route table</strong> gắn vào subnet:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li><strong className="text-ink">Public subnet</strong> có route <Code>0.0.0.0/0 → Internet Gateway</Code>. Máy có public IP trong đó gọi ra và được gọi vào từ Internet (nếu firewall cho phép). Nơi đặt load balancer, bastion host, NAT Gateway.</li>
          <li><strong className="text-ink">Private subnet</strong> không có route tới IGW. Muốn ra Internet (cập nhật package, gọi API bên ngoài) thì đi <Code>0.0.0.0/0 → NAT Gateway</Code>; Internet không có đường nào để gọi ngược vào. Nơi đặt app server, database.</li>
        </ul>
        <CodeBlock title="kiến trúc của demo trong bài">{`                       Internet
                          │
                  [Internet Gateway]
                          │
┌───────────────── VPC 10.0.0.0/16 ─────────────────┐
│  Public subnet 10.0.1.0/24                         │
│    bastion (có public IP)     NAT Gateway (EIP)    │
│         │ SSH                        ▲             │
│         ▼                            │ ra Internet │
│  Private subnet 10.0.2.0/24          │             │
│    app-vm (không có public IP) ──────┘             │
└────────────────────────────────────────────────────┘`}</CodeBlock>
        <AnnotatedOutput
          title="hai route table của demo"
          lines={[
            {
              text: `rt-public   10.0.0.0/16  →  local
            0.0.0.0/0    →  igw-0a1b…`,
              note: 'Dòng local có sẵn trong mọi route table và không xóa được: mọi subnet trong VPC luôn nói chuyện được với nhau ở tầng routing. Dòng thứ hai làm subnet này thành public.',
            },
            {
              text: `rt-private  10.0.0.0/16  →  local
            0.0.0.0/0    →  nat-0c2d…`,
              note: 'Traffic ra ngoài đi qua NAT Gateway. Bản thân NAT Gateway nằm ở subnet public và ra Internet qua IGW, giống router nhà bạn nằm sau modem.',
            },
          ]}
        />
        <p>
          Gói tin luôn đi theo route <strong className="text-ink">cụ thể nhất</strong> khớp với đích (longest prefix match): gửi tới <Code>10.0.2.15</Code> thì khớp <Code>10.0.0.0/16</Code> và đi nội bộ, gửi tới <Code>8.8.8.8</Code> thì chỉ khớp <Code>0.0.0.0/0</Code> và đi ra gateway.
        </p>
      </ArticleSection>

      <ArticleSection id="firewall" number="04" eyebrow="Bảo mật" title="Hai lớp firewall: Security Group và Network ACL">
        <div className="overflow-x-auto border border-border bg-card">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-surface font-mono text-xs uppercase tracking-[0.06em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3"><span className="sr-only">Tiêu chí</span></th>
                <th className="px-4 py-3">Security Group</th>
                <th className="px-4 py-3">Network ACL</th>
              </tr>
            </thead>
            <tbody>
              {firewallCompare.map(([label, sg, nacl]) => (
                <tr className="border-t border-border" key={label}>
                  <td className="px-4 py-3 font-semibold text-ink">{label}</td>
                  <td className="px-4 py-3">{sg}</td>
                  <td className="px-4 py-3">{nacl}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Trong thực tế, Security Group làm gần như toàn bộ công việc. Điểm mạnh nhất của nó là <strong className="text-ink">tham chiếu Security Group khác</strong> làm nguồn: luật “cho SSH từ <Code>bastion-sg</Code>” nghĩa là cho phép mọi máy đang gắn <Code>bastion-sg</Code>, nên bastion đổi IP hay thêm bastion thứ hai thì luật vẫn đúng. NACL thường để mặc định, chỉ dùng khi cần chặn hẳn một dải IP ở mức subnet.
        </p>
        <Callout tone="tip" title="Lỗi hay gặp: timeout chứ không phải refused">
          Security Group chặn bằng cách lặng lẽ bỏ gói tin, nên phía client thấy <Code>Connection timed out</Code>. Nếu thấy <Code>Connection refused</Code> thì gói đã tới máy rồi: lỗi nằm ở ứng dụng (chưa chạy, sai port), không phải ở firewall.
        </Callout>
      </ArticleSection>

      <ArticleSection id="nen-tang" number="05" eyebrow="Công cụ" title="AWS VPC so với Azure VNet và GCP VPC">
        <div className="overflow-x-auto border border-border bg-card">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-surface font-mono text-xs uppercase tracking-[0.06em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3"><span className="sr-only">Tiêu chí</span></th>
                <th className="px-4 py-3">AWS VPC</th>
                <th className="px-4 py-3">Azure VNet</th>
                <th className="px-4 py-3">GCP VPC</th>
              </tr>
            </thead>
            <tbody>
              {platformCompare.map(([label, aws, azure, gcp]) => (
                <tr className="border-t border-border" key={label}>
                  <td className="px-4 py-3 font-semibold text-ink">{label}</td>
                  <td className="px-4 py-3">{aws}</td>
                  <td className="px-4 py-3">{azure}</td>
                  <td className="px-4 py-3">{gcp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Khác biệt đáng nhớ nhất: subnet AWS gắn với <em>một</em> AZ, nên muốn chịu lỗi phải tự nhân subnet ra nhiều AZ; subnet Azure trải sẵn trên các AZ; còn VPC của GCP là toàn cầu, một mạng dùng chung cho mọi region. Azure cũng đang bỏ dần cơ chế “default outbound access” (máy tự ra được Internet dù không cấu hình gì) để tiến tới mặc định subnet private như AWS. Hãy kiểm tra tài liệu Microsoft hiện hành nếu bạn cần chi tiết này.
        </p>
        <p>Với AWS, bạn có bốn cách làm việc với VPC, từ dễ thấy đến dễ lặp lại:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li><strong className="text-ink">Console:</strong> trực quan, hợp để học và trình bày. Nút “VPC and more” dựng sẵn cả VPC, subnet, route table và gateway.</li>
          <li><strong className="text-ink">AWS CLI:</strong> mỗi thao tác là một lệnh, ghép được thành script. Demo bên dưới dùng cách này để bạn thấy rõ từng mảnh.</li>
          <li><strong className="text-ink">Infrastructure as Code:</strong> Terraform hoặc CloudFormation mô tả trạng thái mong muốn và tự tạo, sửa, xóa. Đây là cách làm ngoài doanh nghiệp.</li>
          <li><strong className="text-ink">Công cụ chẩn đoán:</strong> VPC Reachability Analyzer giải thích vì sao A không tới được B; VPC Flow Logs ghi lại traffic được chấp nhận hay bị từ chối.</li>
        </ul>
      </ArticleSection>

      <ArticleSection id="demo" number="06" eyebrow="Thực hành" title="Demo: dựng mạng public/private bằng AWS CLI">
        <p>
          Cần AWS CLI v2 đã <Code>aws configure</Code> với một user có quyền EC2. Các lệnh dùng biến shell để nối kết quả bước trước vào bước sau; chạy trong cùng một terminal bash. Làm trên Console cũng theo đúng thứ tự này.
        </p>
        <CodeBlock title="bước 1: VPC và hai subnet">{`export AWS_REGION=ap-southeast-1
AZ=\${AWS_REGION}a
MYIP=$(curl -s https://checkip.amazonaws.com)

VPC=$(aws ec2 create-vpc --cidr-block 10.0.0.0/16 --query Vpc.VpcId --output text)
PUB=$(aws ec2 create-subnet --vpc-id $VPC --cidr-block 10.0.1.0/24 \\
      --availability-zone $AZ --query Subnet.SubnetId --output text)
PRIV=$(aws ec2 create-subnet --vpc-id $VPC --cidr-block 10.0.2.0/24 \\
       --availability-zone $AZ --query Subnet.SubnetId --output text)

# Máy tạo trong subnet public tự nhận public IP
aws ec2 modify-subnet-attribute --subnet-id $PUB --map-public-ip-on-launch`}</CodeBlock>
        <CodeBlock title="bước 2: Internet Gateway và route table public">{`IGW=$(aws ec2 create-internet-gateway --query InternetGateway.InternetGatewayId --output text)
aws ec2 attach-internet-gateway --internet-gateway-id $IGW --vpc-id $VPC

RT_PUB=$(aws ec2 create-route-table --vpc-id $VPC --query RouteTable.RouteTableId --output text)
aws ec2 create-route --route-table-id $RT_PUB --destination-cidr-block 0.0.0.0/0 --gateway-id $IGW
aws ec2 associate-route-table --route-table-id $RT_PUB --subnet-id $PUB`}</CodeBlock>
        <CodeBlock title="bước 3: NAT Gateway (đặt ở subnet PUBLIC) và route table private">{`EIP=$(aws ec2 allocate-address --domain vpc --query AllocationId --output text)
NAT=$(aws ec2 create-nat-gateway --subnet-id $PUB --allocation-id $EIP \\
      --query NatGateway.NatGatewayId --output text)
aws ec2 wait nat-gateway-available --nat-gateway-ids $NAT   # mất khoảng 1–2 phút

RT_PRIV=$(aws ec2 create-route-table --vpc-id $VPC --query RouteTable.RouteTableId --output text)
aws ec2 create-route --route-table-id $RT_PRIV --destination-cidr-block 0.0.0.0/0 --nat-gateway-id $NAT
aws ec2 associate-route-table --route-table-id $RT_PRIV --subnet-id $PRIV`}</CodeBlock>
        <CodeBlock title="bước 4: Security Group">{`# Bastion: chỉ nhận SSH từ đúng IP của bạn
SG_B=$(aws ec2 create-security-group --group-name bastion-sg --description "SSH from my IP" \\
       --vpc-id $VPC --query GroupId --output text)
aws ec2 authorize-security-group-ingress --group-id $SG_B --protocol tcp --port 22 --cidr $MYIP/32

# App: chỉ nhận SSH và ping từ máy thuộc bastion-sg
SG_A=$(aws ec2 create-security-group --group-name app-sg --description "From bastion only" \\
       --vpc-id $VPC --query GroupId --output text)
aws ec2 authorize-security-group-ingress --group-id $SG_A --protocol tcp --port 22 --source-group $SG_B
aws ec2 authorize-security-group-ingress --group-id $SG_A --protocol icmp --port -1 --source-group $SG_B`}</CodeBlock>
        <CodeBlock title="bước 5: key pair và hai máy ảo">{`aws ec2 create-key-pair --key-name demo-key --query KeyMaterial --output text > demo-key.pem
chmod 400 demo-key.pem

# AMI Amazon Linux 2023 mới nhất, lấy qua SSM Parameter thay vì gõ cứng ID
AMI=resolve:ssm:/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64

BASTION=$(aws ec2 run-instances --image-id $AMI --instance-type t3.micro --key-name demo-key \\
          --subnet-id $PUB --security-group-ids $SG_B \\
          --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=bastion}]' \\
          --query 'Instances[0].InstanceId' --output text)
APP=$(aws ec2 run-instances --image-id $AMI --instance-type t3.micro --key-name demo-key \\
      --subnet-id $PRIV --security-group-ids $SG_A \\
      --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=app}]' \\
      --query 'Instances[0].InstanceId' --output text)
aws ec2 wait instance-running --instance-ids $BASTION $APP

BASTION_IP=$(aws ec2 describe-instances --instance-ids $BASTION \\
             --query 'Reservations[0].Instances[0].PublicIpAddress' --output text)
APP_IP=$(aws ec2 describe-instances --instance-ids $APP \\
         --query 'Reservations[0].Instances[0].PrivateIpAddress' --output text)`}</CodeBlock>
      </ArticleSection>

      <ArticleSection id="kiem-tra" number="07" eyebrow="Kiểm tra" title="Kiểm tra kết nối: thứ gì tới được, thứ gì không">
        <p>
          Một demo mạng tốt không chỉ chứng minh cái gì <em>chạy</em>, mà còn chứng minh cái gì <em>bị chặn đúng như thiết kế</em>. Sáu phép thử dưới đây bao phủ cả hai. Hãy thử tắt từng mảnh cấu hình trong lab để thấy phép thử nào hỏng theo:
        </p>
        <VpcConnectivityLab />
        <CodeBlock title="chạy các phép thử thật">{`# 1. Laptop → bastion
ssh -i demo-key.pem ec2-user@$BASTION_IP

# 2. Laptop → app: treo rồi timeout (10.0.2.x không định tuyến được trên Internet)
ssh -i demo-key.pem -o ConnectTimeout=5 ec2-user@$APP_IP

# 3. Đi qua bastion. Nạp key vào ssh-agent để cả hai chặng đều dùng được
eval "$(ssh-agent -s)" && ssh-add demo-key.pem
ssh -J ec2-user@$BASTION_IP ec2-user@$APP_IP

# 4. Trên app: IP in ra phải là Elastic IP của NAT Gateway
curl https://checkip.amazonaws.com

# 5. Trên app: ping bastion (thay 10.0.1.x bằng private IP của bastion) → timeout
ping -c 3 10.0.1.x`}</CodeBlock>
        <p>
          Muốn AWS tự giải thích một đường đi, dùng <strong className="text-ink">Reachability Analyzer</strong>. Nó phân tích cấu hình chứ không gửi gói tin thật, và chỉ ra chính xác thành phần nào chặn (route table, Security Group hay NACL). Mỗi lần phân tích tính phí nhỏ, nên chỉ chạy khi cần.
        </p>
        <CodeBlock title="hỏi AWS: từ Internet Gateway có SSH tới app được không?">{`PATH_ID=$(aws ec2 create-network-insights-path --source $IGW --destination $APP \\
          --protocol tcp --destination-port 22 \\
          --query NetworkInsightsPath.NetworkInsightsPathId --output text)
ANALYSIS=$(aws ec2 start-network-insights-analysis --network-insights-path-id $PATH_ID \\
           --query NetworkInsightsAnalysis.NetworkInsightsAnalysisId --output text)

# Đợi vài giây rồi xem kết quả: NetworkPathFound = false kèm lý do
aws ec2 describe-network-insights-analyses --network-insights-analysis-ids $ANALYSIS \\
  --query 'NetworkInsightsAnalyses[0].[Status,NetworkPathFound,Explanations[0].ExplanationCode]'`}</CodeBlock>
      </ArticleSection>

      <ArticleSection id="don-dep" number="08" eyebrow="Đừng quên" title="Dọn dẹp và chi phí">
        <Callout tone="warn" title="Thứ tốn tiền trong demo này">
          <strong className="text-ink">NAT Gateway</strong> tính tiền theo giờ cộng theo GB dữ liệu đi qua, quên xóa là mất khoảng 1–1,5 USD mỗi ngày. <strong className="text-ink">Public IPv4</strong> (cả Elastic IP lẫn public IP của bastion) bị tính phí theo giờ từ tháng 2/2024. EC2 <Code>t3.micro</Code> có thể nằm trong Free Tier tùy tài khoản. Xem giá hiện hành của region bạn dùng trên trang pricing của AWS.
        </Callout>
        <p>Xóa theo thứ tự ngược với lúc tạo, vì tài nguyên phụ thuộc nhau (không xóa được VPC khi còn subnet, không xóa được bastion-sg khi app-sg còn tham chiếu tới nó):</p>
        <CodeBlock title="dọn sạch demo">{`aws ec2 terminate-instances --instance-ids $BASTION $APP
aws ec2 wait instance-terminated --instance-ids $BASTION $APP

aws ec2 delete-nat-gateway --nat-gateway-id $NAT
aws ec2 wait nat-gateway-deleted --nat-gateway-ids $NAT
aws ec2 release-address --allocation-id $EIP

aws ec2 detach-internet-gateway --internet-gateway-id $IGW --vpc-id $VPC
aws ec2 delete-internet-gateway --internet-gateway-id $IGW

aws ec2 delete-subnet --subnet-id $PUB
aws ec2 delete-subnet --subnet-id $PRIV
aws ec2 delete-route-table --route-table-id $RT_PUB
aws ec2 delete-route-table --route-table-id $RT_PRIV

aws ec2 delete-security-group --group-id $SG_A   # app-sg trước, vì nó tham chiếu bastion-sg
aws ec2 delete-security-group --group-id $SG_B
aws ec2 delete-vpc --vpc-id $VPC
aws ec2 delete-key-pair --key-name demo-key && rm -f demo-key.pem`}</CodeBlock>
        <p>
          Tới đây bạn đã có đủ nền để đọc hiểu kiến trúc mạng của hầu hết hệ thống trên AWS. Bài 4 đặt máy ảo vào mạng này một cách bài bản hơn, bài 5 nhân đôi subnet sang AZ thứ hai và đặt load balancer phía trước, và bài 8 viết lại toàn bộ demo bằng Terraform để dựng và xóa chỉ bằng một lệnh.
        </p>
      </ArticleSection>

      <section id="references" className="mt-14 scroll-mt-24 border-t border-border pt-10">
        <p className="section-eyebrow">Đọc thêm</p>
        <h2 className="article-h2">Tài liệu tham khảo</h2>
        <ul className="mt-5 space-y-3 text-sm">
          <ReferenceLink href="https://docs.aws.amazon.com/vpc/latest/userguide/what-is-amazon-vpc.html" label="AWS — What is Amazon VPC?" />
          <ReferenceLink href="https://docs.aws.amazon.com/vpc/latest/userguide/vpc-nat-gateway.html" label="AWS — NAT gateways" />
          <ReferenceLink href="https://docs.aws.amazon.com/vpc/latest/userguide/vpc-security-groups.html" label="AWS — Security groups" />
          <ReferenceLink href="https://docs.aws.amazon.com/vpc/latest/userguide/vpc-network-acls.html" label="AWS — Network ACLs" />
          <ReferenceLink href="https://docs.aws.amazon.com/vpc/latest/reachability/what-is-reachability-analyzer.html" label="AWS — VPC Reachability Analyzer" />
          <ReferenceLink href="https://learn.microsoft.com/azure/virtual-network/virtual-networks-overview" label="Microsoft — Azure Virtual Network overview" />
        </ul>
      </section>
    </ArticleShell>
  );
}
