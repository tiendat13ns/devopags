import type { Metadata } from 'next';
import { ArticleIntro, ArticleSection, ArticleShell } from '@/components/article-shell';

export const metadata: Metadata = {
  title: 'Tư duy triển khai bất kỳ dự án nào cho DevOps | tiendat13ns',
  description:
    'Cách nhìn một dự án từ góc độ DevOps: xác định runtime, phiên bản, cấu hình, quy trình build và cách chạy ứng dụng an toàn trên Linux.',
};

export default function DeploymentMindsetPage() {
  return (
    <ArticleShell currentHref="/bai-viet/tu-duy-trien-khai-du-an">
      <ArticleIntro
        eyebrow="Linux · Deployment"
        title="Tư duy triển khai bất kỳ dự án nào cho DevOps"
        description="DevOps không cần viết mọi chức năng của ứng dụng, nhưng phải biết ứng dụng cần gì, được build ra sao và chạy thế nào trên một hệ thống an toàn."
        readTime="10 phút đọc"
        tags={['Linux', 'DevOps', 'Deployment']}
      />

      <ArticleSection id="devops-lam-gi" number="1" title="DevOps đứng ở đâu trong một dự án?">
        <p>
          Trước đây mình từng nghĩ làm DevOps là phải biết thật nhiều công cụ: cài Jenkins, dựng monitoring, viết pipeline rồi quản lý server. Những việc đó đúng là có liên quan, nhưng nếu chỉ tập trung vào công cụ thì rất dễ bỏ qua mục tiêu quan trọng nhất: <strong className="text-ink">đưa ứng dụng từ source code thành một dịch vụ có thể chạy ổn định</strong>.
        </p>
        <p>
          DevOps thường không trực tiếp viết chức năng như giỏ hàng, đăng ký người dùng hay xử lý thanh toán. Không giỏi code ứng dụng ngay từ đầu cũng chưa phải vấn đề lớn. Điều cần hiểu là cấu trúc của dự án, những thành phần mà nó phụ thuộc và cách đưa nó lên môi trường chạy thật.
        </p>
        <p>
          Vì vậy, một người có thể triển khai nhiều loại dự án sẽ có giá trị hơn một người chỉ biết bấm theo một bộ công cụ cố định. Hôm nay có thể là React, ngày mai là Java, .NET, PHP, Go hoặc Python. Công nghệ thay đổi nhưng cách đặt câu hỏi trước khi triển khai vẫn khá giống nhau.
        </p>
      </ArticleSection>

      <ArticleSection id="loai-du-an-va-cong-cu" number="2" title="Dự án nào cũng có công cụ tương ứng">
        <p>
          Có thể tạm chia ứng dụng thành hai phần quen thuộc là frontend và backend. Mỗi công nghệ dùng một runtime hoặc bộ công cụ riêng để cài dependency, build và chạy.
        </p>
        <div className="overflow-x-auto border border-border bg-card">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="border-b border-border bg-surface text-ink">
              <tr>
                <th className="px-4 py-3 font-semibold">Loại dự án</th>
                <th className="px-4 py-3 font-semibold">Công cụ thường gặp</th>
                <th className="px-4 py-3 font-semibold">Kết quả cần chạy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr><td className="px-4 py-3">React, Angular, Vue</td><td className="px-4 py-3">Node.js và package manager</td><td className="px-4 py-3">Các file tĩnh trong thư mục build</td></tr>
              <tr><td className="px-4 py-3">Node.js</td><td className="px-4 py-3">Node.js, npm/pnpm/yarn</td><td className="px-4 py-3">Tiến trình Node.js</td></tr>
              <tr><td className="px-4 py-3">Java</td><td className="px-4 py-3">JDK, Maven hoặc Gradle</td><td className="px-4 py-3">File JAR/WAR</td></tr>
              <tr><td className="px-4 py-3">.NET</td><td className="px-4 py-3">.NET SDK và runtime</td><td className="px-4 py-3">Ứng dụng đã publish</td></tr>
              <tr><td className="px-4 py-3">PHP</td><td className="px-4 py-3">PHP, Composer, web server</td><td className="px-4 py-3">Mã nguồn được web server phục vụ</td></tr>
              <tr><td className="px-4 py-3">Go</td><td className="px-4 py-3">Go toolchain</td><td className="px-4 py-3">Một file binary</td></tr>
              <tr><td className="px-4 py-3">Python</td><td className="px-4 py-3">Python, pip/uv, virtual environment</td><td className="px-4 py-3">Tiến trình Python hoặc application server</td></tr>
            </tbody>
          </table>
        </div>
        <p>
          Mình không cần thuộc ngay mọi câu lệnh. Trước hết chỉ cần xác định đúng dự án đang dùng công nghệ gì, sau đó đọc tài liệu của chính dự án để biết công cụ cần cài.
        </p>
      </ArticleSection>

      <ArticleSection id="phien-ban" number="3" title="Đúng công cụ nhưng cũng phải đúng phiên bản">
        <p>
          Cài đúng tên công cụ vẫn chưa đủ. Phiên bản trên server phải đáp ứng yêu cầu của dự án. Nếu dự án yêu cầu Node.js từ phiên bản 16 trở lên mà máy chủ chỉ có Node.js 12 thì quá trình cài dependency hoặc khởi động ứng dụng có thể lỗi.
        </p>
        <p>
          Thông tin phiên bản thường nằm trong các file như <code className="inline-code">package.json</code>, <code className="inline-code">.nvmrc</code>, <code className="inline-code">pom.xml</code>, <code className="inline-code">global.json</code>, <code className="inline-code">go.mod</code> hoặc tài liệu README. Khi tiếp nhận một dự án, đây là một trong những thứ mình nên kiểm tra đầu tiên.
        </p>
        <p>
          Nguyên tắc đơn giản là không tự chọn phiên bản theo thói quen. Hãy lấy yêu cầu từ repository, pipeline hiện tại hoặc xác nhận lại với đội phát triển.
        </p>
      </ArticleSection>

      <ArticleSection id="nhom-file" number="4" title="DevOps cần quan tâm những file nào?">
        <p>Khi mở một repository mới, mình có thể nhìn các file theo ba nhóm:</p>
        <div className="space-y-3">
          <div className="border-l-2 border-primary pl-4">
            <h3 className="font-semibold text-ink">Source code chức năng</h3>
            <p className="mt-1 text-sm leading-6">Đây là nơi xử lý nghiệp vụ như tạo user, thêm sản phẩm vào giỏ hàng hoặc gọi API. DevOps chưa cần hiểu từng hàm để có thể triển khai dự án.</p>
          </div>
          <div className="border-l-2 border-primary pl-4">
            <h3 className="font-semibold text-ink">File cấu hình, dependency và build</h3>
            <p className="mt-1 text-sm leading-6">Đây là nhóm cần chú ý nhất: biến môi trường, kết nối database, port, dịch vụ bên ngoài, dependency, câu lệnh build và entry point của ứng dụng.</p>
          </div>
          <div className="border-l-2 border-primary pl-4">
            <h3 className="font-semibold text-ink">Tài liệu và các file hỗ trợ</h3>
            <p className="mt-1 text-sm leading-6">README, tài liệu kiến trúc và script mẫu có thể cho biết cách tác giả dự án mong muốn ứng dụng được cài và chạy. Không nên bỏ qua chúng chỉ vì chúng không phải code.</p>
          </div>
        </div>
        <p>
          Mục tiêu không phải là đọc hết repository. Mục tiêu là tìm được đường đi từ source code đến một tiến trình đang chạy, đồng thời biết ứng dụng cần kết nối tới đâu.
        </p>
      </ArticleSection>

      <ArticleSection id="build-va-run" number="5" title="Nhìn quy trình triển khai thành hai giai đoạn">
        <p>
          Với hầu hết dự án, mình có thể hình dung việc triển khai bằng hai giai đoạn: <strong className="text-ink">chuẩn bị/build</strong> và <strong className="text-ink">run/serve</strong>.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="border border-border bg-card p-5">
            <h3 className="font-semibold text-ink">1. Chuẩn bị hoặc build</h3>
            <p className="mt-2 text-sm leading-6">Cài dependency, compile, chạy kiểm tra cần thiết và tạo ra artifact như thư mục <code className="inline-code">dist</code>, file JAR hoặc binary.</p>
          </div>
          <div className="border border-border bg-card p-5">
            <h3 className="font-semibold text-ink">2. Run hoặc serve</h3>
            <p className="mt-2 text-sm leading-6">Dùng artifact vừa tạo để khởi động tiến trình, hoặc đưa các file tĩnh cho Nginx/web server phục vụ.</p>
          </div>
        </div>
        <p>
          Không phải công nghệ nào cũng có bước compile rõ ràng. Với Python hoặc PHP, bước đầu có thể chủ yếu là cài dependency và chuẩn bị cấu hình. Dù vậy, cách tách này vẫn giúp mình phân biệt việc tạo ra thứ cần chạy với việc vận hành nó.
        </p>
      </ArticleSection>

      <ArticleSection id="bon-cau-hoi" number="6" title="Bốn câu hỏi trước khi triển khai">
        <p>Khi nhận một dự án mới, mình chỉ cần bắt đầu bằng bốn câu hỏi:</p>
        <ol className="space-y-3 pl-5 [list-style:decimal] marker:font-mono marker:font-bold marker:text-primary">
          <li className="pl-2"><strong className="text-ink">Dự án cần công cụ và runtime gì?</strong></li>
          <li className="pl-2"><strong className="text-ink">Phiên bản tối thiểu hoặc phiên bản được hỗ trợ là bao nhiêu?</strong></li>
          <li className="pl-2"><strong className="text-ink">Cấu hình nằm ở đâu, cần những biến môi trường và kết nối nào?</strong></li>
          <li className="pl-2"><strong className="text-ink">Lệnh chuẩn để build và chạy dự án là gì?</strong></li>
        </ol>
        <p>
          Trả lời được bốn câu hỏi này chưa có nghĩa là đã xử lý hết logging, backup, scaling hay high availability. Nhưng nó tạo ra nền móng để mình có thể đưa một dự án lạ lên chạy thay vì phụ thuộc vào một hướng dẫn có sẵn.
        </p>
      </ArticleSection>

      <ArticleSection id="thu-muc-va-user" number="7" title="Mỗi dự án cần thư mục và user riêng">
        <p>
          Trên Linux, mỗi ứng dụng nên có thư mục làm việc riêng, chẳng hạn <code className="inline-code">/srv/my-app</code> hoặc <code className="inline-code">/opt/my-app</code>. Việc tách thư mục giúp quản lý quyền, log, phiên bản triển khai và thao tác rollback rõ ràng hơn.
        </p>
        <p>
          Ứng dụng cũng không nên chạy bằng user <code className="inline-code">root</code>. Root có quyền cao nhất trên hệ thống; nếu ứng dụng có lỗ hổng và tiến trình bị chiếm quyền, kẻ tấn công cũng có thể nhận được phạm vi quyền rất lớn.
        </p>
        <p>
          Cách an toàn hơn là tạo một service user riêng cho từng ứng dụng, chỉ cấp quyền trên những thư mục và tài nguyên cần thiết, rồi cấu hình systemd hoặc process manager chạy tiến trình bằng user đó. Nếu có sự cố, phạm vi ảnh hưởng sẽ được giới hạn đáng kể.
        </p>
      </ArticleSection>

      <ArticleSection id="ket-luan" number="8" title="Điều mình cần nhớ">
        <p>
          DevOps không nhất thiết phải hiểu toàn bộ code nghiệp vụ trước khi triển khai. Nhưng mình phải biết cách đọc dấu hiệu mà dự án để lại: runtime, phiên bản, dependency, file cấu hình, artifact và lệnh khởi động.
        </p>
        <p>
          Khi đã hình thành được cách nhìn này, việc chuyển từ React sang Java hay từ Python sang Go không còn là bắt đầu lại từ đầu. Công cụ thay đổi, còn quy trình đặt câu hỏi gần như vẫn giữ nguyên.
        </p>
        <p>
          Ở những bài tiếp theo, mình sẽ đi vào từng loại dự án cụ thể và triển khai chúng theo đúng bốn câu hỏi trên để thấy rõ sự khác nhau giữa mỗi công nghệ.
        </p>
      </ArticleSection>
    </ArticleShell>
  );
}
