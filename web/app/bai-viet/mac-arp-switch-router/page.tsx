import type { Metadata } from 'next';
import { ArticleIntro, ArticleSection, ArticleShell, ReferenceLink } from '@/components/article-shell';
import { LanPacketTrace } from '@/components/lan-packet-trace';
import { AnnotatedOutput, Callout, Code } from '@/components/network-ui';

export const metadata: Metadata = {
  title: 'MAC, ARP, Switch và Router: gói tin đi qua LAN như thế nào? | tiendat13ns',
  description: 'Phân biệt địa chỉ MAC và IP, hiểu ARP, switch học MAC, router định tuyến và cách đọc ip neigh, ip route qua một mô phỏng gói tin từng chặng.',
};

const devices = [
  {
    name: 'Hub',
    tag: 'Lặp lại',
    text: 'Nhận tín hiệu ở một cổng rồi chép ra tất cả cổng còn lại. Mọi máy đều thấy mọi thứ và dễ đụng độ. Gần như đã biến mất.',
  },
  {
    name: 'Switch',
    tag: 'Tầng 2',
    text: 'Đọc MAC nguồn để học “máy nào ở cổng nào”, rồi chỉ chuyển frame đến đúng cổng. MAC lạ hoặc broadcast thì flood ra mọi cổng.',
  },
  {
    name: 'Router',
    tag: 'Tầng 3',
    text: 'Nối các mạng khác nhau. Đọc IP đích, tra bảng định tuyến, chọn chặng kế tiếp. Mỗi cổng của router thuộc một subnet riêng.',
  },
];

export default function MacArpSwitchRouterPage() {
  return (
    <ArticleShell currentHref="/bai-viet/mac-arp-switch-router">
      <ArticleIntro
        eyebrow="Network cho DevOps · Bài 3"
        title="MAC, ARP, Switch và Router: gói tin đi qua LAN như thế nào?"
        description="IP cho biết gói tin muốn đến đâu, MAC cho biết chặng tiếp theo là ai. Bài này đi theo từng bước của một gói tin trong mạng nội bộ để thấy hai loại địa chỉ ấy phối hợp ra sao."
        date="22/10/2026"
        readTime="15 phút đọc"
        tags={['Network', 'MAC', 'ARP', 'Routing']}
      />

      <div className="grid gap-px border border-border bg-border sm:grid-cols-2">
        <div className="bg-card p-5">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.08em] text-primary">Hình dung bằng bưu điện</p>
          <p className="mt-2 text-sm leading-6">
            Bạn gửi thư từ Hà Nội cho một người ở Đà Nẵng. Địa chỉ người nhận ghi trên bao thư từ đầu đến cuối và không đổi. Nhưng chặng đầu do xe máy của bưu cục quận giao, chặng sau do xe tải liên tỉnh, chặng cuối do bưu tá phường.
          </p>
        </div>
        <div className="bg-surface p-5">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.08em] text-primary">Trong network</p>
          <p className="mt-2 text-sm leading-6">
            <strong className="text-ink">IP</strong> là địa chỉ ghi trên bao thư, giữ nguyên cả hành trình. <strong className="text-ink">MAC</strong> là “người giao nhận của từng chặng”: mỗi lần qua một router, cặp MAC lại được thay bằng cặp của chặng kế tiếp.
          </p>
        </div>
      </div>

      <ArticleSection id="hai-dia-chi" number="01" eyebrow="So sánh" title="Hai địa chỉ, hai nhiệm vụ">
        <div className="overflow-x-auto border border-border bg-card">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="bg-surface font-mono text-xs uppercase tracking-[0.06em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3"><span className="sr-only">Tiêu chí</span></th>
                <th className="px-4 py-3">Địa chỉ MAC</th>
                <th className="px-4 py-3">Địa chỉ IP</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Tầng', 'Tầng 2 (Data Link)', 'Tầng 3 (Network)'],
                ['Kích thước', '48 bit, ví dụ 02:aa:00:00:00:0a', '32 bit (IPv4), ví dụ 192.168.1.10'],
                ['Gắn với', 'Card mạng (NIC), gần như cố định', 'Mạng đang kết nối, có thể thay đổi'],
                ['Phạm vi', 'Chỉ có nghĩa trong cùng một LAN', 'Có nghĩa xuyên qua nhiều mạng'],
                ['Thay đổi khi qua router', 'Có, mỗi chặng một cặp', 'Không (trừ khi có NAT, xem bài 7)'],
              ].map(([label, mac, ip]) => (
                <tr className="border-t border-border" key={label}>
                  <td className="px-4 py-3 font-semibold text-ink">{label}</td>
                  <td className="px-4 py-3">{mac}</td>
                  <td className="px-4 py-3">{ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ArticleSection>

      <ArticleSection id="mo-phong" number="02" eyebrow="Quan sát trực tiếp" title="Lần theo từng frame">
        <p>
          Hãy chạy kịch bản đầu tiên hết một lượt, rồi chuyển sang kịch bản thứ hai và đặc biệt chú ý hai điểm: <strong className="text-ink">A ARP cho ai</strong> và <strong className="text-ink">ở frame 2, những trường nào đã đổi màu vàng</strong>.
        </p>
        <LanPacketTrace />
        <Callout tone="tip" title="Điều rút ra">
          Khi đích ở ngoài subnet, máy gửi <em>không ARP cho đích</em> mà ARP cho gateway. Ở frame đầu tiên, Ethernet đích là router còn IP đích là server. Khi bạn gặp bài toán “ping được gateway nhưng không ra ngoài”, ranh giới giữa hai địa chỉ này là chỗ đáng nghi ngờ.
        </Callout>
      </ArticleSection>

      <ArticleSection id="arp" number="03" eyebrow="Keo dính hai tầng" title="ARP: đổi IP thành MAC">
        <p>
          <strong className="text-ink">ARP</strong> (Address Resolution Protocol) giải quyết một câu hỏi duy nhất: <em>trong LAN này, IP này có MAC nào?</em> Máy broadcast câu hỏi, chủ nhân của IP trả lời, kết quả được lưu một thời gian trong ARP cache (còn gọi là neighbor table).
        </p>
        <AnnotatedOutput
          title="neighbor table trên máy PC-A"
          lines={[
            { kind: 'command', text: '$ ip neigh show' },
            {
              text: '192.168.1.1  dev eth0 lladdr 02:cc:00:00:00:01 REACHABLE',
              note: 'Gateway đã được xác nhận gần đây: đang liên lạc bình thường.',
            },
            {
              text: '192.168.1.20 dev eth0 lladdr 02:bb:00:00:00:0b STALE',
              note: 'Có trong cache nhưng lâu chưa dùng. Lần gửi kế tiếp sẽ kiểm tra lại, không phải lỗi.',
            },
            {
              text: '192.168.1.77 dev eth0  FAILED',
              note: 'ARP hỏi mà không ai trả lời: máy đó tắt, sai subnet, hoặc bị chặn ở tầng 2.',
            },
          ]}
        />
        <p>
          Trạng thái <Code>FAILED</Code> hay <Code>INCOMPLETE</Code> cho bạn một manh mối đắt giá: sự cố xảy ra ngay ở tầng 2, trước cả khi IP hay port có cơ hội tham gia. Cũng vì ARP không có xác thực, một máy độc hại trong LAN có thể trả lời giả để đứng giữa hai máy khác (ARP spoofing). Đó là lý do mạng nội bộ không nên được tin tưởng mặc định.
        </p>
      </ArticleSection>

      <ArticleSection id="switch-router" number="04" eyebrow="Thiết bị" title="Hub, switch và router khác nhau ở đâu?">
        <div className="grid gap-4 sm:grid-cols-3">
          {devices.map((device) => (
            <div className="border border-border bg-card p-5" key={device.name}>
              <span className="border border-primary/20 bg-primary-soft px-2 py-0.5 font-mono text-[0.7rem] font-bold text-primary-dark">{device.tag}</span>
              <h3 className="mt-3 font-bold text-ink">{device.name}</h3>
              <p className="mt-2 text-sm leading-6">{device.text}</p>
            </div>
          ))}
        </div>
        <p>
          Tập hợp những máy nghe được broadcast của nhau gọi là <strong className="text-ink">broadcast domain</strong>. Một mạng phẳng quá lớn sẽ có quá nhiều broadcast. <strong className="text-ink">VLAN</strong> giải quyết việc này ngay trên switch: cùng một switch vật lý nhưng được chia thành nhiều mạng ảo tách biệt, mỗi VLAN là một broadcast domain riêng và muốn nói chuyện với VLAN khác phải đi qua router.
        </p>
        <p>
          Router còn làm một việc quan trọng: giảm <Code>TTL</Code> của mỗi gói tin đi một đơn vị. Khi TTL về 0, gói tin bị hủy và router báo lỗi ICMP về cho người gửi. Công cụ <Code>traceroute</Code> khai thác đúng điều đó: gửi gói tin với TTL 1, 2, 3… để mỗi router trên đường lần lượt “khai danh tính”.
        </p>
      </ArticleSection>

      <ArticleSection id="bang-dinh-tuyen" number="05" eyebrow="Trên Linux" title="Đọc bảng định tuyến">
        <p>
          Cả máy tính thường cũng có routing table. Mỗi dòng là một câu: <em>“đích nằm trong dải này thì đi đường kia”</em>. Khi nhiều dòng cùng khớp, dòng có prefix dài nhất (cụ thể nhất) thắng. Dòng <Code>default</Code> là dải 0.0.0.0/0, nghĩa là “mọi thứ còn lại”.
        </p>
        <AnnotatedOutput
          title="routing table trên PC-A"
          lines={[
            { kind: 'command', text: '$ ip route' },
            {
              text: 'default via 192.168.1.1 dev eth0 proto dhcp src 192.168.1.10',
              note: 'Mọi thứ không khớp dòng nào khác sẽ gửi cho gateway 192.168.1.1. Đây là dòng “thần thánh” để ra Internet.',
            },
            {
              text: '192.168.1.0/24 dev eth0 proto kernel scope link src 192.168.1.10',
              note: 'Dải cùng LAN: gửi trực tiếp (ARP rồi gửi), không qua gateway.',
            },
            {
              text: '172.17.0.0/16 dev docker0 proto kernel scope link src 172.17.0.1',
              note: 'Docker thêm dòng này cho bridge của nó: docker0 cũng là một “switch ảo” có subnet riêng.',
            },
            { kind: 'command', text: '$ ip route get 198.51.100.20' },
            {
              text: '198.51.100.20 via 192.168.1.1 dev eth0 src 192.168.1.10',
              note: 'Hỏi kernel: “gói tin tới IP này sẽ đi đường nào?”. Lệnh debug rất đáng nhớ.',
            },
          ]}
        />
        <div className="border border-border bg-card p-5">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.08em] text-primary">Longest prefix match</p>
          <p className="mt-2 text-sm leading-6">
            Giả sử router có ba tuyến: <Code>10.0.0.0/8 → R1</Code>, <Code>10.1.0.0/16 → R2</Code> và <Code>default → R3</Code>. Gói tin tới <Code>10.1.2.3</Code> khớp cả ba, nhưng /16 cụ thể hơn /8 và /0, nên đi qua R2. Gói tin tới <Code>10.9.9.9</Code> chỉ khớp /8 và default, nên đi qua R1.
          </p>
        </div>
      </ArticleSection>

      <ArticleSection id="cloud-container" number="06" eyebrow="Trong công việc" title="Tầng 2 ở đâu khi chạy cloud và container?">
        <p>
          Bạn hiếm khi chạm vào switch thật, nhưng các khái niệm này vẫn xuất hiện dưới dạng ảo:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li><strong className="text-ink">Docker bridge</strong> (<Code>docker0</Code>) là một switch ảo trong kernel; mỗi container nối vào bằng một cặp card ảo (veth).</li>
          <li><strong className="text-ink">VM trên hypervisor</strong> có card mạng ảo với MAC riêng, nối vào virtual switch của host.</li>
          <li><strong className="text-ink">Cloud VPC</strong> thực chất không cho bạn một mạng tầng 2 thật: nền tảng tự xử lý ARP và định tuyến. Vì thế broadcast hay multicast thông thường không dùng được như trong LAN truyền thống, và “subnet” ở đó chủ yếu là khái niệm của tầng 3.</li>
        </ul>
        <p>
          Hiểu mô hình LAN truyền thống vẫn đáng giá, vì các nền tảng ảo đều mô phỏng lại hành vi của nó. Khi hai container không nói chuyện được, câu hỏi “chúng có cùng bridge, cùng subnet không?” chính là câu hỏi của bài này.
        </p>
      </ArticleSection>

      <section id="references" className="mt-14 scroll-mt-24 border-t border-border pt-10">
        <p className="section-eyebrow">Đọc thêm</p>
        <h2 className="article-h2">Tài liệu tham khảo</h2>
        <ul className="mt-5 space-y-3 text-sm">
          <ReferenceLink href="https://www.rfc-editor.org/rfc/rfc826" label="RFC 826 — Address Resolution Protocol" />
          <ReferenceLink href="https://man7.org/linux/man-pages/man8/ip-neighbour.8.html" label="man ip-neighbour — quản lý neighbor table trên Linux" />
          <ReferenceLink href="https://man7.org/linux/man-pages/man8/ip-route.8.html" label="man ip-route — quản lý routing table trên Linux" />
        </ul>
      </section>
    </ArticleShell>
  );
}
