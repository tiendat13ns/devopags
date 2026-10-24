import { formatIp, inCidr, networkOf, parseIp } from '@/lib/ip';

export type HostId = 'A' | 'B' | 'S' | 'W';
export type NodeId = HostId | 'R1' | 'ISP' | 'SW1';
export type LinkId = 'A-SW1' | 'B-SW1' | 'SW1-R1' | 'R1-S' | 'R1-ISP' | 'ISP-W';
type SegmentId = 'lan1' | 'lan2' | 'wan' | 'net';

export type HostConfig = { ip: string; prefix: number; gateway: string };

export type SimConfig = {
  hosts: Record<HostId, HostConfig>;
  nat: boolean;
  defaultRoute: boolean;
  down: LinkId[];
};

export type NatEntry = { inside: string; insideId: number; outsideId: number };

export type NetState = {
  arp: Partial<Record<NodeId, Record<string, string>>>;
  macTable: Record<string, string>;
  nat: NatEntry[];
};

export type Frame = {
  type: 'ARP' | 'IPv4';
  srcMac: string;
  dstMac: string;
  srcIp?: string;
  dstIp?: string;
  ttl?: number;
  info: string;
};

export type SimEvent = {
  kind: 'think' | 'arp' | 'frame' | 'route' | 'nat' | 'deliver' | 'success' | 'drop';
  at: NodeId;
  paths: NodeId[][];
  title: string;
  detail: string;
  frame?: Frame;
  state: NetState;
};

type Iface = { node: NodeId; name: string; ip: string; prefix: number; mac: string; segment: SegmentId; link: LinkId };
type Route = { cidr: string; iface: string; via?: string };
type Packet = { srcIp: string; dstIp: string; ttl: number; kind: 'request' | 'reply'; id: number };

export const R1_OUTSIDE = '203.0.113.2';
const BROADCAST = 'ff:ff:ff:ff:ff:ff';

export const switchPorts: Partial<Record<LinkId, string>> = { 'A-SW1': 'Fa0/1', 'B-SW1': 'Fa0/2', 'SW1-R1': 'Fa0/24' };

export const defaultConfig: SimConfig = {
  hosts: {
    A: { ip: '192.168.1.10', prefix: 24, gateway: '192.168.1.1' },
    B: { ip: '192.168.1.20', prefix: 24, gateway: '192.168.1.1' },
    S: { ip: '192.168.2.20', prefix: 24, gateway: '192.168.2.1' },
    W: { ip: '198.51.100.10', prefix: 24, gateway: '198.51.100.1' },
  },
  nat: true,
  defaultRoute: true,
  down: [],
};

export const emptyState: NetState = { arp: {}, macTable: {}, nat: [] };

export function interfaces(config: SimConfig): Iface[] {
  const host = (node: HostId, mac: string, segment: SegmentId, link: LinkId): Iface => ({
    node,
    name: 'eth0',
    ip: config.hosts[node].ip,
    prefix: config.hosts[node].prefix,
    mac,
    segment,
    link,
  });

  return [
    host('A', '02:aa:00:00:00:0a', 'lan1', 'A-SW1'),
    host('B', '02:bb:00:00:00:0b', 'lan1', 'B-SW1'),
    { node: 'R1', name: 'eth0', ip: '192.168.1.1', prefix: 24, mac: '02:cc:00:00:01:00', segment: 'lan1', link: 'SW1-R1' },
    { node: 'R1', name: 'eth1', ip: '192.168.2.1', prefix: 24, mac: '02:cc:00:00:01:01', segment: 'lan2', link: 'R1-S' },
    host('S', '02:ee:00:00:00:05', 'lan2', 'R1-S'),
    { node: 'R1', name: 'eth2', ip: R1_OUTSIDE, prefix: 30, mac: '02:cc:00:00:01:02', segment: 'wan', link: 'R1-ISP' },
    { node: 'ISP', name: 'wan', ip: '203.0.113.1', prefix: 30, mac: '02:dd:00:00:00:01', segment: 'wan', link: 'R1-ISP' },
    { node: 'ISP', name: 'lan', ip: '198.51.100.1', prefix: 24, mac: '02:dd:00:00:00:02', segment: 'net', link: 'ISP-W' },
    host('W', '02:ff:00:00:00:0f', 'net', 'ISP-W'),
  ];
}

export function routingTable(node: 'R1' | 'ISP', config: SimConfig): Route[] {
  if (node === 'ISP') {
    // Router ngoài Internet chỉ biết mạng public; không ai quảng bá đường tới dải private 192.168.x.x.
    return [
      { cidr: '203.0.113.0/30', iface: 'wan' },
      { cidr: '198.51.100.0/24', iface: 'lan' },
    ];
  }
  return [
    { cidr: '192.168.1.0/24', iface: 'eth0' },
    { cidr: '192.168.2.0/24', iface: 'eth1' },
    { cidr: '203.0.113.0/30', iface: 'eth2' },
    ...(config.defaultRoute ? [{ cidr: '0.0.0.0/0', iface: 'eth2', via: '203.0.113.1' }] : []),
  ];
}

function lookup(routes: Route[], ip: number) {
  return routes
    .filter((route) => inCidr(ip, route.cidr))
    .sort((left, right) => Number(right.cidr.split('/')[1]) - Number(left.cidr.split('/')[1]))[0];
}

function isPrivate(ip: string) {
  const value = parseIp(ip);
  return value !== null && ['10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16'].some((cidr) => inCidr(value, cidr));
}

function pathBetween(from: Iface, to: Iface): NodeId[] {
  return from.segment === 'lan1' ? [from.node, 'SW1', to.node] : [from.node, to.node];
}

export function simulatePing(config: SimConfig, initial: NetState, source: HostId, destination: string) {
  const state: NetState = structuredClone(initial);
  const events: SimEvent[] = [];
  const ifaces = interfaces(config);
  const emit = (event: Omit<SimEvent, 'state'>) => events.push({ ...event, state: structuredClone(state) });
  const finish = () => ({ events, state });
  const drop = (at: NodeId, title: string, detail: string) => {
    emit({ kind: 'drop', at, paths: [], title, detail });
    return finish();
  };

  const linkUp = (iface: Iface) => !config.down.includes(iface.link);
  const learn = (iface: Iface) => {
    const port = switchPorts[iface.link];
    if (port) state.macTable[iface.mac] = port;
  };

  const dstNum = parseIp(destination);
  if (dstNum === null) return drop(source, 'Địa chỉ đích không hợp lệ', `“${destination}” không phải địa chỉ IPv4.`);
  const srcIface = ifaces.find((iface) => iface.node === source)!;
  if (parseIp(srcIface.ip) === null) return drop(source, `IP của ${source} không hợp lệ`, 'Sửa lại IP trong phần cấu hình rồi thử lại.');

  let node: NodeId = source;
  let originating = true;
  let pkt: Packet = { srcIp: srcIface.ip, dstIp: formatIp(dstNum), ttl: 64, kind: 'request', id: 1 };

  if (pkt.dstIp === srcIface.ip) {
    emit({ kind: 'success', at: source, paths: [], title: 'Ping chính mình', detail: 'Gói tin không rời khỏi máy: hệ điều hành trả lời ngay qua loopback.' });
    return finish();
  }

  for (let guard = 0; guard < 40; guard++) {
    const own = ifaces.filter((iface) => iface.node === node);
    const isRouter = node === 'R1' || node === 'ISP';

    if (!originating && own.some((iface) => iface.ip === pkt.dstIp)) {
      const entry = state.nat.find((item) => item.outsideId === pkt.id);
      if (node === 'R1' && config.nat && pkt.dstIp === R1_OUTSIDE && pkt.kind === 'reply' && entry) {
        emit({
          kind: 'nat',
          at: 'R1',
          paths: [],
          title: 'NAT: dịch ngược địa chỉ đích',
          detail: `Reply gửi tới ${R1_OUTSIDE} với ICMP id ${pkt.id}. Bảng NAT cho biết id này thuộc về ${entry.inside} (id ${entry.insideId}), nên R1 đổi đích thành ${entry.inside} rồi định tuyến vào trong.`,
        });
        pkt = { ...pkt, dstIp: entry.inside, id: entry.insideId };
      } else if (pkt.kind === 'request') {
        emit({
          kind: 'deliver',
          at: node,
          paths: [],
          title: `${node} nhận echo request và trả lời`,
          detail: `Gói tin đã tới đúng ${pkt.dstIp}. ${node} tạo echo reply gửi ngược về ${pkt.srcIp}: từ đây chiều về được định tuyến độc lập với chiều đi.`,
        });
        pkt = { srcIp: pkt.dstIp, dstIp: pkt.srcIp, ttl: 64, kind: 'reply', id: pkt.id };
        originating = true;
        continue;
      } else {
        emit({ kind: 'success', at: node, paths: [], title: 'Ping thành công', detail: `${node} nhận được echo reply từ ${pkt.srcIp}. Cả chiều đi lẫn chiều về đều thông.` });
        return finish();
      }
    }

    if (!isRouter && !originating) {
      return drop(node, `${node} bỏ gói tin`, `Gói tin gửi tới ${pkt.dstIp} nhưng lại đến ${node}. Máy thường không chuyển tiếp gói của người khác như router.`);
    }

    let egress: Iface;
    let nextHop: string;

    if (!isRouter) {
      const me = own[0];
      const meNum = parseIp(me.ip)!;
      const dst = parseIp(pkt.dstIp)!;
      const myNet = formatIp(networkOf(meNum, me.prefix));
      const dstNet = formatIp(networkOf(dst, me.prefix));

      if (myNet === dstNet) {
        nextHop = pkt.dstIp;
        emit({
          kind: 'think',
          at: node,
          paths: [],
          title: `${node}: đích cùng subnet, gửi trực tiếp`,
          detail: `Theo mask /${me.prefix} của ${node}: mạng của mình là ${myNet}, mạng của ${pkt.dstIp} cũng là ${dstNet}. Vậy gửi thẳng, không cần gateway.`,
        });
      } else {
        const gateway = config.hosts[node as HostId].gateway;
        const gatewayNum = parseIp(gateway);
        if (gatewayNum === null) {
          return drop(node, `${node}: không có default gateway`, `${pkt.dstIp} thuộc mạng ${dstNet}, khác mạng ${myNet} của ${node}, nhưng ${node} chưa cấu hình gateway nên không biết gửi đi đâu.`);
        }
        if (formatIp(networkOf(gatewayNum, me.prefix)) !== myNet) {
          return drop(node, `${node}: gateway nằm ngoài subnet`, `Gateway ${gateway} không thuộc mạng ${myNet}/${me.prefix} của ${node}, nên không thể gửi frame trực tiếp tới nó.`);
        }
        nextHop = gateway;
        emit({
          kind: 'think',
          at: node,
          paths: [],
          title: `${node}: đích khác subnet, gửi cho gateway`,
          detail: `Mạng của ${node} là ${myNet}/${me.prefix}, còn ${pkt.dstIp} thuộc ${dstNet}. Gói tin vẫn ghi đích ${pkt.dstIp}, nhưng frame sẽ gửi tới gateway ${gateway}.`,
        });
      }
      egress = me;
    } else {
      if (!originating) {
        pkt = { ...pkt, ttl: pkt.ttl - 1 };
        if (pkt.ttl <= 0) return drop(node, 'TTL về 0', `${node} giảm TTL và thấy bằng 0 nên bỏ gói tin, để gói không chạy vòng mãi.`);
      }
      const route = lookup(routingTable(node as 'R1' | 'ISP', config), parseIp(pkt.dstIp)!);
      if (!route) {
        const reason =
          node === 'ISP' && isPrivate(pkt.dstIp)
            ? `${pkt.dstIp} là địa chỉ private: không router nào trên Internet có đường về dải này. Đó là lý do mạng nhà bạn cần NAT.`
            : `Không dòng nào trong bảng định tuyến khớp ${pkt.dstIp}, kể cả default route 0.0.0.0/0.`;
        return drop(node, `${node}: không có route tới ${pkt.dstIp}`, reason);
      }
      egress = own.find((iface) => iface.name === route.iface)!;
      nextHop = route.via ?? pkt.dstIp;
      emit({
        kind: 'route',
        at: node,
        paths: [],
        title: `${node} tra bảng định tuyến`,
        detail: `${pkt.dstIp} khớp ${route.cidr} (prefix dài nhất) → ra ${route.iface}${route.via ? `, chuyển cho next hop ${route.via}` : ', mạng nối trực tiếp nên gửi thẳng tới đích'}.${originating ? '' : ` TTL giảm còn ${pkt.ttl}.`}`,
      });

      if (node === 'R1' && config.nat && route.iface === 'eth2' && isPrivate(pkt.srcIp)) {
        let entry = state.nat.find((item) => item.inside === pkt.srcIp && item.insideId === pkt.id);
        if (!entry) {
          entry = { inside: pkt.srcIp, insideId: pkt.id, outsideId: 40001 + state.nat.length };
          state.nat.push(entry);
        }
        emit({
          kind: 'nat',
          at: 'R1',
          paths: [],
          title: 'NAT: đổi địa chỉ nguồn',
          detail: `Nguồn ${pkt.srcIp} là địa chỉ private, không dùng được trên Internet. R1 thay bằng IP public ${R1_OUTSIDE} và đổi ICMP id thành ${entry.outsideId}, ghi lại vào bảng NAT để dịch ngược khi reply quay về.`,
        });
        pkt = { ...pkt, srcIp: R1_OUTSIDE, id: entry.outsideId };
      }
    }
    originating = false;

    if (!linkUp(egress)) {
      return drop(node, `Dây ${egress.link} bị ngắt`, `${node} cần gửi ra ${egress.name}, nhưng dây nối ${egress.link} đang đứt nên frame không rời được cổng.`);
    }

    const neighbours = ifaces.filter((iface) => iface.segment === egress.segment && iface !== egress && linkUp(iface));
    let mac: string | undefined = state.arp[node]?.[nextHop];

    if (!mac) {
      learn(egress);
      emit({
        kind: 'arp',
        at: node,
        paths: neighbours.map((iface) => pathBetween(egress, iface)),
        title: `ARP request: “Ai có ${nextHop}?”`,
        detail: `${node} chưa có MAC của ${nextHop} trong ARP cache nên broadcast hỏi cả mạng (đích ${BROADCAST}).${egress.segment === 'lan1' ? ` Switch học được MAC ${egress.mac} ở cổng ${switchPorts[egress.link]}, rồi flood ra mọi cổng khác.` : ''}`,
        frame: { type: 'ARP', srcMac: egress.mac, dstMac: BROADCAST, info: `Who has ${nextHop}? Tell ${egress.ip}` },
      });

      const target = neighbours.find((iface) => iface.ip === nextHop);
      if (!target) {
        return drop(
          node,
          `Không ai trả lời ARP cho ${nextHop}`,
          nextHop !== pkt.dstIp
            ? `Trong mạng này không có thiết bị nào mang IP ${nextHop}: gateway cấu hình sai, hoặc dây tới gateway bị đứt.`
            : `${nextHop} không nằm trong mạng này (hoặc dây tới nó bị đứt). Nếu ${node} nghĩ đích cùng subnet trong khi thực tế không phải, hãy kiểm tra subnet mask.`,
        );
      }

      state.arp[target.node] = { ...state.arp[target.node], [egress.ip]: egress.mac };
      state.arp[node] = { ...state.arp[node], [nextHop]: target.mac };
      learn(target);
      emit({
        kind: 'arp',
        at: target.node,
        paths: [pathBetween(target, egress)],
        title: `ARP reply: “${nextHop} ở ${target.mac}”`,
        detail: `Chỉ ${target.node} trả lời, gửi thẳng (unicast) về ${node}. Cả hai bên lưu MAC của nhau vào ARP cache; lần sau không phải hỏi lại.`,
        frame: { type: 'ARP', srcMac: target.mac, dstMac: egress.mac, info: `${nextHop} is at ${target.mac}` },
      });
      mac = target.mac;
    }

    const receiver: Iface | undefined = neighbours.find((iface) => iface.mac === mac);
    if (!receiver) {
      return drop(node, 'Frame không tới nơi', `ARP cache của ${node} vẫn nhớ ${nextHop} ở ${mac}, nhưng đường tới thiết bị đó đang đứt.`);
    }

    let paths = [pathBetween(egress, receiver)];
    let switchNote = '';
    if (egress.segment === 'lan1') {
      learn(egress);
      const port = state.macTable[mac];
      if (port) {
        switchNote = ` Switch tra MAC table: ${mac} ở cổng ${port}, nên chỉ chuyển frame ra đúng cổng đó.`;
      } else {
        paths = neighbours.map((iface) => pathBetween(egress, iface));
        switchNote = ' Switch chưa biết MAC đích nên flood ra mọi cổng.';
      }
    }

    const sameAsDestination = receiver.ip === pkt.dstIp;
    emit({
      kind: 'frame',
      at: node,
      paths,
      title: `${node} gửi frame tới ${receiver.node}`,
      detail: `MAC đích là ${receiver.node} (${mac}), còn IP đích vẫn là ${pkt.dstIp}${sameAsDestination ? '' : ': MAC đổi theo từng chặng, IP giữ nguyên từ đầu đến cuối'}.${switchNote}`,
      frame: {
        type: 'IPv4',
        srcMac: egress.mac,
        dstMac: mac,
        srcIp: pkt.srcIp,
        dstIp: pkt.dstIp,
        ttl: pkt.ttl,
        info: pkt.kind === 'request' ? 'ICMP echo request' : 'ICMP echo reply',
      },
    });
    node = receiver.node;
  }

  return drop(node, 'Dừng mô phỏng', 'Gói tin đi quá nhiều chặng, có thể đang chạy vòng.');
}
