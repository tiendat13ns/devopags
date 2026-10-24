import { formatIp, networkOf, parseIp } from '@/lib/ip';

export type Az = 'a' | 'b' | 'c';
export type SubnetKind = 'public' | 'private' | 'isolated';
export type Subnet = { id: string; name: string; cidr: string; az: Az; kind: SubnetKind };

export type Design = {
  vpcCidr: string;
  igw: boolean;
  natSubnet: string | null;
  subnets: Subnet[];
  albSubnets: string[];
  web: [string, string];
  webPublicIp: boolean;
  dbPrimary: string;
  dbStandby: string | null;
  webSgFrom: 'alb' | 'anywhere' | 'none';
  dbSgFrom: 'web' | 'vpc' | 'anywhere';
};

export type CheckStatus = 'pass' | 'warn' | 'fail';
export type Check = { id: string; title: string; status: CheckStatus; detail: string };

type ParsedCidr = { start: number; end: number; prefix: number; aligned: boolean };

export function parseCidr(cidr: string): ParsedCidr | null {
  const [base, length] = cidr.trim().split('/');
  const ip = parseIp(base ?? '');
  const prefix = Number(length);
  if (ip === null || !/^\d{1,2}$/.test(length ?? '') || prefix > 32) return null;
  const start = networkOf(ip, prefix);
  return { start, end: start + 2 ** (32 - prefix) - 1, prefix, aligned: start === ip };
}

// AWS giữ 5 địa chỉ mỗi subnet: network, VPC router, DNS, dự phòng và broadcast.
export function usableIps(cidr: string) {
  const parsed = parseCidr(cidr);
  return parsed ? Math.max(2 ** (32 - parsed.prefix) - 5, 0) : 0;
}

export function suggestSubnet(design: Design): string {
  const vpc = parseCidr(design.vpcCidr);
  if (!vpc || vpc.prefix > 24) return '';
  const taken = design.subnets.map((subnet) => parseCidr(subnet.cidr)).filter((item): item is ParsedCidr => item !== null);
  for (let start = vpc.start; start + 255 <= vpc.end; start += 256) {
    if (!taken.some((item) => start <= item.end && item.start <= start + 255)) return `${formatIp(start)}/24`;
  }
  return '';
}

export function evaluateDesign(design: Design): Check[] {
  const checks: Check[] = [];
  const byId = (id: string | null) => design.subnets.find((subnet) => subnet.id === id);
  const label = (subnet: Subnet | undefined) => (subnet ? `${subnet.name} (AZ ${subnet.az})` : 'subnet không tồn tại');
  const reachesInternet = (subnet: Subnet | undefined) => subnet?.kind === 'public' && design.igw;

  // 1. CIDR
  const vpc = parseCidr(design.vpcCidr);
  const cidrProblems: string[] = [];
  if (!vpc || !vpc.aligned || vpc.prefix < 16 || vpc.prefix > 28) {
    cidrProblems.push(`VPC CIDR ${design.vpcCidr} không hợp lệ: phải là địa chỉ mạng chuẩn với prefix từ /16 đến /28.`);
  } else {
    design.subnets.forEach((subnet, index) => {
      const parsed = parseCidr(subnet.cidr);
      if (!parsed) {
        cidrProblems.push(`${subnet.name}: “${subnet.cidr}” không phải CIDR hợp lệ.`);
        return;
      }
      if (!parsed.aligned) cidrProblems.push(`${subnet.name}: ${subnet.cidr} không phải địa chỉ mạng; với /${parsed.prefix} phải là ${formatIp(parsed.start)}/${parsed.prefix}.`);
      if (parsed.prefix < vpc.prefix || parsed.prefix > 28) cidrProblems.push(`${subnet.name}: prefix /${parsed.prefix} phải nằm trong khoảng /${vpc.prefix} đến /28.`);
      if (parsed.start < vpc.start || parsed.end > vpc.end) cidrProblems.push(`${subnet.name}: ${subnet.cidr} nằm ngoài VPC ${design.vpcCidr}.`);
      design.subnets.slice(index + 1).forEach((other) => {
        const otherParsed = parseCidr(other.cidr);
        if (otherParsed && parsed.start <= otherParsed.end && otherParsed.start <= parsed.end) {
          cidrProblems.push(`${subnet.name} (${subnet.cidr}) chồng lên ${other.name} (${other.cidr}).`);
        }
      });
    });
  }
  checks.push({
    id: 'cidr',
    title: 'Dải địa chỉ hợp lệ, không chồng nhau',
    status: cidrProblems.length ? 'fail' : 'pass',
    detail: cidrProblems.length ? cidrProblems.join(' ') : `Mọi subnet đều nằm gọn trong ${design.vpcCidr} và không chồng lên nhau.`,
  });

  // 2. ALB
  const albSubnets = design.albSubnets.map(byId).filter((subnet): subnet is Subnet => subnet !== undefined);
  const albAzs = new Set(albSubnets.map((subnet) => subnet.az));
  const albPrivate = albSubnets.filter((subnet) => !reachesInternet(subnet));
  const albOk = albAzs.size >= 2 && albPrivate.length === 0;
  checks.push({
    id: 'alb',
    title: 'Load balancer đón được traffic từ Internet',
    status: albOk ? 'pass' : 'fail',
    detail:
      albAzs.size < 2
        ? `ALB bắt buộc đặt ở ít nhất hai subnet thuộc hai AZ khác nhau; hiện có ${albAzs.size} AZ.`
        : albPrivate.length
          ? `${albPrivate.map(label).join(', ')} không có route ra Internet Gateway${design.igw ? '' : ' (VPC chưa gắn IGW)'}, nên ALB internet-facing không nhận được request.`
          : `ALB nằm ở ${albSubnets.map(label).join(', ')}: public và trải ${albAzs.size} AZ.`,
  });

  // 3. Web nhận traffic từ ALB
  checks.push({
    id: 'web-ingress',
    title: 'Web server nhận được request từ ALB',
    status: design.webSgFrom === 'none' ? 'fail' : 'pass',
    detail:
      design.webSgFrom === 'none'
        ? 'web-sg chưa mở cổng 80 cho ai: ALB health check thất bại và trả về 503.'
        : design.webSgFrom === 'alb'
          ? 'web-sg chỉ mở cổng 80 cho alb-sg: đúng nguyên tắc tối thiểu.'
          : 'web-sg mở cổng 80 cho mọi nơi: ALB vẫn vào được, nhưng xem thêm mục “không lộ trực tiếp”.',
  });

  // 4. Web không lộ trực tiếp
  const exposed = design.web.map(byId).filter((subnet) => reachesInternet(subnet) && design.webPublicIp);
  checks.push({
    id: 'web-exposure',
    title: 'Web server không lộ trực tiếp ra Internet',
    status: exposed.length && design.webSgFrom === 'anywhere' ? 'fail' : exposed.length ? 'warn' : 'pass',
    detail: exposed.length
      ? design.webSgFrom === 'anywhere'
        ? 'Web server có public IP trong subnet public và SG mở cho mọi nơi: ai cũng gọi thẳng được, vượt qua ALB (và WAF nếu có).'
        : 'Web server có public IP trong subnet public. SG đang chặn nên chưa lộ, nhưng chỉ cần một luật mở nhầm là lộ: nên đặt ở subnet private.'
      : 'Web server không có đường vào trực tiếp từ Internet; mọi request phải qua ALB.',
  });

  // 5. Web ra được Internet để cập nhật package
  const natHost = byId(design.natSubnet);
  const egressProblems = design.web.map(byId).flatMap((subnet, index) => {
    const name = `Web ${index + 1}`;
    if (!subnet) return [`${name} chưa được đặt vào subnet nào.`];
    if (subnet.kind === 'public') {
      if (!design.igw) return [`${name}: VPC chưa có Internet Gateway.`];
      if (!design.webPublicIp) return [`${name} ở subnet public nhưng không có public IP, nên IGW không dịch địa chỉ cho nó.`];
      return [];
    }
    if (subnet.kind === 'isolated') return [`${name} ở subnet isolated, không có route ra ngoài.`];
    if (!natHost) return [`${name} ở subnet private nhưng VPC chưa có NAT Gateway.`];
    if (!reachesInternet(natHost)) return [`NAT Gateway đang nằm ở ${label(natHost)}, không phải subnet public có IGW, nên chính NAT cũng không ra được Internet.`];
    return [];
  });
  checks.push({
    id: 'web-egress',
    title: 'Web server ra được Internet (cập nhật package, gọi API)',
    status: egressProblems.length ? 'fail' : 'pass',
    detail: egressProblems.length ? [...new Set(egressProblems)].join(' ') : 'Mọi web server đều có đường ra: qua NAT Gateway hoặc trực tiếp qua IGW.',
  });

  // 6. Database riêng tư
  const dbSubnets = [byId(design.dbPrimary), byId(design.dbStandby)].filter((subnet): subnet is Subnet => subnet !== undefined);
  const dbPublic = dbSubnets.filter((subnet) => subnet.kind === 'public');
  checks.push({
    id: 'db-private',
    title: 'Database không ai ngoài app chạm tới được',
    status: dbPublic.length || design.dbSgFrom === 'anywhere' ? 'fail' : design.dbSgFrom === 'vpc' ? 'warn' : 'pass',
    detail: dbPublic.length
      ? `Database nằm ở subnet public ${dbPublic.map(label).join(', ')}: chỉ cách Internet một luật Security Group.`
      : design.dbSgFrom === 'anywhere'
        ? 'db-sg mở cổng 5432 cho 0.0.0.0/0. Dù subnet private, đây là cấu hình nguy hiểm: một thay đổi route là lộ.'
        : design.dbSgFrom === 'vpc'
          ? 'db-sg mở cho cả dải VPC: mọi máy trong VPC đều thử kết nối được. Nên chỉ cho web-sg.'
          : 'Database ở subnet không public và chỉ nhận kết nối từ web-sg.',
  });

  // 7. HA cho web
  const webAzs = new Set(design.web.map(byId).filter((subnet): subnet is Subnet => subnet !== undefined).map((subnet) => subnet.az));
  checks.push({
    id: 'ha-web',
    title: 'Web server trải trên nhiều AZ',
    status: webAzs.size >= 2 ? 'pass' : 'fail',
    detail: webAzs.size >= 2 ? 'Hai web server ở hai AZ khác nhau: một AZ sự cố, dịch vụ vẫn chạy với nửa công suất.' : 'Cả hai web server cùng một AZ: AZ đó sự cố là mất toàn bộ dịch vụ.',
  });

  // 8. HA cho database
  const primary = byId(design.dbPrimary);
  const standby = byId(design.dbStandby);
  checks.push({
    id: 'ha-db',
    title: 'Database có bản dự phòng ở AZ khác (Multi-AZ)',
    status: !standby ? 'warn' : primary && standby.az === primary.az ? 'fail' : 'pass',
    detail: !standby
      ? 'Single-AZ: chấp nhận được cho dev, nhưng production nên bật Multi-AZ để tự failover.'
      : primary && standby.az === primary.az
        ? 'Standby cùng AZ với primary thì không bảo vệ được khi cả AZ sự cố. DB subnet group cần subnet ở ít nhất hai AZ.'
        : `Primary ở AZ ${primary?.az}, standby ở AZ ${standby.az}: RDS tự failover khi primary hoặc cả AZ sự cố.`,
  });

  // 9. NAT theo AZ
  const privateWebAzs = new Set(design.web.map(byId).filter((subnet) => subnet?.kind === 'private').map((subnet) => subnet!.az));
  if (natHost && privateWebAzs.size > 1) {
    checks.push({
      id: 'nat-az',
      title: 'Đường ra Internet không phụ thuộc một AZ',
      status: 'warn',
      detail: `Chỉ có một NAT Gateway ở AZ ${natHost.az}. Nếu AZ này sự cố, web server ở AZ còn lại mất đường ra Internet. Production thường đặt mỗi AZ một NAT; môi trường dev dùng một NAT cho rẻ.`,
    });
  }

  return checks;
}
