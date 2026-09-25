import type { Metadata } from 'next';
import { ArrowDown, ArrowRight, BrainCircuit, CheckCircle2, Code2, Cpu, Database, Gauge, Network, ScanLine } from 'lucide-react';
import { ArticleIntro, ArticleSection, ArticleShell } from '@/components/article-shell';
import { DeepLearningMap } from '@/components/deep-learning-map';
import { NeuralNetworkDiagram } from '@/components/neural-network-diagram';

export const metadata: Metadata = {
  title: 'Deep Learning | tiendat13ns',
  description: 'Cách mình hiểu Deep Learning: vị trí trong AI, parameter, weight, bias, learning rate, training, inference và các architecture phổ biến.',
};

const terms = [
  ['Parameter', 'Những giá trị model tự học trong quá trình training. Weight và bias là hai loại parameter quen thuộc nhất.'],
  ['Weight', 'Quyết định một tín hiệu đầu vào ảnh hưởng mạnh hay yếu, theo chiều dương hay âm tới output.'],
  ['Bias', 'Một độ lệch được cộng thêm, giúp neuron không bị buộc phải đi qua gốc tọa độ và linh hoạt hơn khi khớp dữ liệu.'],
  ['Hyperparameter', 'Giá trị do người train chọn trước như learning rate, batch size, số layer, số epoch; model không tự học trực tiếp các giá trị này.'],
  ['Learning rate', 'Độ dài mỗi bước cập nhật parameter. Quá lớn dễ vượt qua điểm tốt; quá nhỏ thì học chậm hoặc mắc kẹt.'],
  ['Loss function', 'Cách biến mức độ sai của dự đoán thành một con số để optimizer biết model đang tốt lên hay tệ đi.'],
  ['Gradient', 'Độ dốc cho biết loss thay đổi thế nào nếu một parameter thay đổi một chút.'],
  ['Optimizer', 'Thuật toán dùng gradient để cập nhật parameter, ví dụ SGD hoặc Adam.'],
];

const architectures = [
  { name: 'MLP / Feed-forward', fit: 'Dữ liệu dạng vector, tabular đơn giản', idea: 'Các layer fully connected truyền tín hiệu theo một chiều.' },
  { name: 'CNN', fit: 'Ảnh, video, dữ liệu có cấu trúc không gian', idea: 'Kernel quét và học các pattern cục bộ như cạnh, texture rồi hình dạng.' },
  { name: 'RNN / LSTM / GRU', fit: 'Chuỗi thời gian, văn bản tuần tự', idea: 'Mang trạng thái từ bước trước sang bước sau; hữu ích khi thứ tự quan trọng.' },
  { name: 'Transformer', fit: 'Ngôn ngữ, vision, audio, multimodal', idea: 'Attention cho phép mỗi token chọn thông tin liên quan từ các token khác.' },
  { name: 'Autoencoder', fit: 'Nén dữ liệu, phát hiện bất thường', idea: 'Học encode dữ liệu vào biểu diễn nhỏ rồi decode để tái tạo lại.' },
  { name: 'GNN', fit: 'Mạng xã hội, phân tử, hệ thống recommendation', idea: 'Lan truyền thông tin giữa các node dựa trên những edge trong graph.' },
];

export default function DeepLearningArticlePage() {
  return (
    <ArticleShell currentHref="/bai-viet/deep-learning-la-gi">
      <ArticleIntro
        eyebrow="AI · Deep Learning"
        title="Deep Learning"
        description="Đây là cách mình xếp lại những khái niệm Deep Learning sau khi học và làm ứng dụng AI: không bắt đầu bằng công thức, mà bắt đầu từ câu hỏi model đang học cái gì và một dự đoán được tạo ra như thế nào."
        date="22/09/2026"
        readTime="14 phút đọc"
        tags={['AI', 'Machine Learning', 'Deep Learning']}
      />

      <div className="mb-2 grid gap-4 border border-primary/20 bg-primary-soft p-5 sm:grid-cols-[auto_1fr] sm:p-6">
        <BrainCircuit className="text-primary" size={24} />
        <p className="text-sm leading-7 text-muted-foreground">
          Cách hiểu ngắn nhất của mình: <strong className="text-ink">Deep Learning là việc cho một mạng neural tự điều chỉnh rất nhiều parameter từ dữ liệu để biến input thành output hữu ích.</strong> “Deep” chỉ việc mạng có nhiều tầng biến đổi, không phải model có khả năng suy nghĩ sâu như con người.
        </p>
      </div>

      <ArticleSection id="dl-nam-o-dau" number="1" title="Deep Learning nằm ở đâu trong AI?">
        <p>
          Mình hay gặp ba từ AI, Machine Learning và Deep Learning bị dùng thay cho nhau. Cách phân biệt dễ nhớ nhất là xem chúng như các phạm vi lồng vào nhau: <strong className="text-ink">AI là mục tiêu lớn, Machine Learning là một cách để đạt mục tiêu đó, còn Deep Learning là một nhóm kỹ thuật bên trong Machine Learning.</strong>
        </p>

        <div className="border border-border bg-card">
          <div className="border-b border-border px-4 py-3 font-mono text-xs text-primary">Phạm vi rộng → chuyên biệt hơn</div>
          <div className="grid gap-3 p-4 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-stretch sm:p-5">
            <div className="border border-border bg-background p-4">
              <span className="font-mono text-[10px] text-primary">01 · PHẠM VI LỚN</span>
              <div className="mt-3 flex items-center gap-2">
                <BrainCircuit className="text-primary" size={19} />
                <strong className="text-ink">AI</strong>
              </div>
              <p className="mt-3 text-sm leading-6">Tạo hệ thống có thể nhận diện, lập kế hoạch, sinh nội dung hoặc ra quyết định.</p>
            </div>

            <div className="grid place-items-center text-primary" aria-hidden="true">
              <ArrowRight className="hidden sm:block" size={18} />
              <ArrowDown className="sm:hidden" size={18} />
            </div>

            <div className="border border-primary/45 bg-primary-soft p-4">
              <span className="font-mono text-[10px] text-primary">02 · MỘT NHÁNH CỦA AI</span>
              <strong className="mt-3 block text-ink">Machine Learning</strong>
              <p className="mt-3 text-sm leading-6">Cho thuật toán học pattern từ dữ liệu thay vì viết toàn bộ rule bằng tay.</p>
            </div>

            <div className="grid place-items-center text-primary" aria-hidden="true">
              <ArrowRight className="hidden sm:block" size={18} />
              <ArrowDown className="sm:hidden" size={18} />
            </div>

            <div className="border border-primary bg-primary p-4 text-primary-foreground">
              <span className="font-mono text-[10px] text-primary-foreground/75">03 · MỘT NHÁNH CỦA ML</span>
              <strong className="mt-3 block">Deep Learning</strong>
              <p className="mt-3 text-sm leading-6 opacity-90">Dùng neural network nhiều layer để tự học representation và ánh xạ input → output.</p>
            </div>
          </div>
        </div>

        <p>
          Ví dụ, một chatbot là <strong className="text-ink">ứng dụng AI</strong>. Model ngôn ngữ bên dưới được xây bằng <strong className="text-ink">Machine Learning</strong>, cụ thể là <strong className="text-ink">Deep Learning</strong> với architecture Transformer. Sản phẩm, phương pháp và architecture là ba lớp khác nhau.
        </p>
      </ArticleSection>

      <ArticleSection id="muc-tieu" number="2" title="Mục tiêu của Deep Learning">
        <p>
          Mục tiêu không phải là tạo mạng càng lớn càng tốt. Thứ mình thực sự cần là tìm một hàm <code className="inline-code">f(x)</code> có thể biến input thành output đúng trên cả dữ liệu model chưa từng thấy.
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { icon: Database, title: 'Học representation', text: 'Tự tìm đặc trưng hữu ích thay vì bắt con người định nghĩa toàn bộ feature bằng tay.' },
            { icon: Gauge, title: 'Giảm sai số', text: 'Tối ưu parameter để loss trên dữ liệu training giảm xuống.' },
            { icon: ScanLine, title: 'Generalize', text: 'Hoạt động tốt với dữ liệu mới, không chỉ ghi nhớ tập training.' },
          ].map(({ icon: Icon, title, text }) => (
            <div className="border border-border bg-card p-4" key={title}>
              <Icon className="text-primary" size={20} />
              <h3 className="mt-3 font-semibold text-ink">{title}</h3>
              <p className="mt-2 text-sm leading-6">{text}</p>
            </div>
          ))}
        </div>
        <p>
          Nếu accuracy training rất cao nhưng model thất bại ngoài production, model chưa đạt mục tiêu. Đây là <strong className="text-ink">overfitting</strong>: học thuộc dữ liệu cũ nhưng không học được quy luật đủ tổng quát.
        </p>
      </ArticleSection>

      <ArticleSection id="mot-neuron" number="3" title="Từ một neuron đến cả mạng neural">
        <p>
          Một neuron có thể được rút gọn thành <code className="inline-code">output = activation(weight × input + bias)</code>. Nếu liên hệ với code, weight và bias giống state nội bộ của model; activation là hàm biến đổi; còn input và output là dữ liệu đi qua function đó.
        </p>        <NeuralNetworkDiagram />

        <div className="overflow-x-auto border border-code-border bg-code p-5 text-code-foreground">
          <pre className="font-mono text-sm leading-7"><code>{`x = 10                    # số request trong một giây
w = 0.8                   # mức ảnh hưởng của input
b = -3                    # độ lệch
score = w * x + b          # 5.0
output = sigmoid(score)    # xác suất bất thường`}</code></pre>
        </div>
        <p>
          Khi nối rất nhiều neuron thành layer và nối nhiều layer thành network, model có thể học các phép biến đổi phức tạp hơn. Layer đầu có thể nhận ra pattern đơn giản; layer sau kết hợp chúng thành pattern có ý nghĩa hơn. Điều quan trọng là ta không viết tay từng weight — training sẽ tìm chúng.
        </p>
      </ArticleSection>

      <ArticleSection id="khai-niem" number="4" title="Những khái niệm mình luôn phải phân biệt">
        <div className="grid gap-px border border-border bg-border sm:grid-cols-2">
          {terms.map(([term, explanation]) => (
            <div className="bg-card p-4" key={term}>
              <h3 className="font-mono text-sm font-semibold text-primary">{term}</h3>
              <p className="mt-2 text-sm leading-6">{explanation}</p>
            </div>
          ))}
        </div>
        <div className="border-l-2 border-primary bg-primary-soft px-5 py-4 text-sm leading-7">
          <strong className="text-ink">Điểm dễ nhầm:</strong> parameter là thứ model học; hyperparameter là thứ mình cấu hình cho quá trình học. Weight là parameter, còn learning rate là hyperparameter.
        </div>
      </ArticleSection>

      <ArticleSection id="training-loop" number="5" title="Training thực sự diễn ra như thế nào?">
        <p>
          Training không phải model “đọc dữ liệu rồi hiểu”. Nó là một vòng lặp số học được chạy rất nhiều lần: dự đoán, đo lỗi, tính gradient rồi cập nhật parameter. Sơ đồ dưới đây là mental model mình dùng khi debug một pipeline training.
        </p>
        <DeepLearningMap />
        <ol className="space-y-3 pl-5 [list-style:decimal] marker:font-mono marker:font-semibold marker:text-primary">
          <li className="pl-2"><strong className="text-ink">Forward pass:</strong> batch dữ liệu chạy qua model để tạo prediction.</li>
          <li className="pl-2"><strong className="text-ink">Tính loss:</strong> so prediction với label hoặc mục tiêu cần tối ưu.</li>
          <li className="pl-2"><strong className="text-ink">Backpropagation:</strong> tính gradient của loss theo từng parameter.</li>
          <li className="pl-2"><strong className="text-ink">Optimizer step:</strong> cập nhật weight và bias theo gradient cùng learning rate.</li>
          <li className="pl-2"><strong className="text-ink">Lặp lại:</strong> đi qua nhiều batch; một lượt qua toàn bộ tập dữ liệu được gọi là một epoch.</li>
        </ol>
      </ArticleSection>

      <ArticleSection id="training-inference" number="6" title="Training và inference là hai chế độ khác nhau">
        <div className="grid gap-px border border-border bg-border sm:grid-cols-2">
          <div className="bg-card p-5">
            <Cpu className="text-primary" size={20} />
            <h3 className="mt-3 font-semibold text-ink">Training</h3>
            <ul className="mt-3 space-y-2 text-sm leading-6">
              <li>Cần dữ liệu và thường cần label.</li>
              <li>Có forward, loss, backward và update.</li>
              <li>Tốn nhiều compute và memory.</li>
              <li>Kết quả là checkpoint chứa parameter đã học.</li>
            </ul>
          </div>
          <div className="bg-card p-5">
            <Code2 className="text-primary" size={20} />
            <h3 className="mt-3 font-semibold text-ink">Inference</h3>
            <ul className="mt-3 space-y-2 text-sm leading-6">
              <li>Nhận input mới từ người dùng hoặc hệ thống.</li>
              <li>Chỉ chạy forward pass, không cập nhật weight.</li>
              <li>Quan tâm latency, throughput và chi phí.</li>
              <li>Kết quả là prediction, embedding hoặc nội dung sinh ra.</li>
            </ul>
          </div>
        </div>
        <p>
          Với góc nhìn làm ứng dụng, phần này rất quan trọng: train model và phục vụ model là hai workload khác nhau. Một notebook chạy được chưa đồng nghĩa API inference đã đủ nhanh, ổn định và quan sát được ở production.
        </p>
      </ArticleSection>

      <ArticleSection id="architecture" number="7" title="Các architecture phổ biến">
        <p>
          Architecture là cách sắp xếp layer và đường truyền thông tin. Mình không chọn architecture vì nó đang nổi, mà chọn dựa trên cấu trúc dữ liệu và bài toán cần giải quyết.
        </p>
        <div className="overflow-x-auto border border-border bg-card">
          <div className="min-w-[680px]">
            <div className="grid grid-cols-[170px_210px_1fr] border-b border-border bg-surface px-4 py-3 text-sm font-semibold text-ink">
              <span>Architecture</span><span>Thường phù hợp</span><span>Ý tưởng chính</span>
            </div>
            {architectures.map((item) => (
              <div className="grid grid-cols-[170px_210px_1fr] border-b border-border px-4 py-4 text-sm leading-6 last:border-b-0" key={item.name}>
                <strong className="text-primary">{item.name}</strong><span>{item.fit}</span><span>{item.idea}</span>
              </div>
            ))}
          </div>
        </div>
        <p>
          Transformer hiện xuất hiện ở nhiều lĩnh vực, nhưng không vì thế CNN, RNN hay các model nhỏ trở nên vô dụng. Nếu dữ liệu ít, latency chặt hoặc tài nguyên hạn chế, một architecture đơn giản hơn có thể là lựa chọn tốt hơn.
        </p>
      </ArticleSection>

      <ArticleSection id="vi-du" number="8" title="Ví dụ: từ model đến một tính năng trong sản phẩm">
        <p>
          Giả sử mình xây tính năng phân loại ticket hỗ trợ thành các nhóm <code className="inline-code">billing</code>, <code className="inline-code">bug</code> và <code className="inline-code">account</code>. Nhìn theo từng lớp, toàn bộ hệ thống sẽ như sau:
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ['1. Dữ liệu', 'Nội dung ticket và nhãn do đội support xác nhận.'],
            ['2. Training', 'Tokenizer → Transformer → classifier; tối ưu cross-entropy loss.'],
            ['3. Artifact', 'Model weight, tokenizer, label mapping và version cấu hình.'],
            ['4. Inference', 'API nhận text, chạy model và trả label cùng confidence score.'],
            ['5. Product rule', 'Confidence thấp thì chuyển người thật thay vì tự động route.'],
            ['6. Monitoring', 'Theo dõi latency, lỗi, phân phối label và chất lượng phản hồi.'],
          ].map(([title, text]) => (
            <div className="flex gap-3 border border-border bg-card p-4" key={title}>
              <CheckCircle2 className="mt-1 shrink-0 text-primary" size={17} />
              <div><h3 className="font-semibold text-ink">{title}</h3><p className="mt-1 text-sm leading-6">{text}</p></div>
            </div>
          ))}
        </div>
        <p>
          Deep Learning chỉ là một phần của feature. Xung quanh model vẫn cần API, validation, cache, logging, versioning và fallback. Đây cũng là lý do mình thấy hiểu cả AI Application và DevOps khá hữu ích: model tốt cần được đặt trong một hệ thống đủ tốt thì mới tạo ra giá trị thật.
        </p>
      </ArticleSection>

      <ArticleSection id="ket-luan" number="9" title="Cách mình ghi nhớ toàn bộ bài này">
        <div className="border border-primary/25 bg-primary-soft p-5 sm:p-6">
          <div className="flex items-center gap-3 text-ink">
            <Network className="text-primary" size={21} />
            <h3 className="font-semibold">Data → prediction → loss → gradient → update</h3>
          </div>
          <p className="mt-3 text-sm leading-7">
            Weight và bias là parameter được cập nhật. Learning rate và batch size là hyperparameter điều khiển cách cập nhật. Training tạo ra parameter tốt; inference dùng parameter đó để xử lý input mới. Architecture chỉ là bộ khung tổ chức những phép biến đổi bên trong.
          </p>
        </div>
        <p>
          Khi đã giữ được chuỗi này trong đầu, mình có thể học thêm CNN, Transformer hay bất kỳ model mới nào mà không bị lạc trong quá nhiều thuật ngữ. Câu hỏi đầu tiên luôn là: input là gì, output là gì, loss đo điều gì và parameter được cập nhật ra sao?
        </p>
      </ArticleSection>
    </ArticleShell>
  );
}