import type { Metadata } from 'next';
import {
  ArticleIntro,
  ArticleSection,
  ArticleShell,
} from '@/components/article-shell';
import { MlpArchitectureExplorer } from '@/components/mlp-architecture-explorer';

export const metadata: Metadata = {
  title: 'Kiến trúc MLP | tiendat13ns',
  description:
    'Tìm hiểu kiến trúc Multilayer Perceptron: fully connected layer, forward pass, parameter, activation và cách chọn độ sâu, độ rộng của mạng.',
};

const codeExample = `import torch.nn as nn

class ServerHealthMLP(nn.Module):
    def __init__(self):
        super().__init__()
        self.network = nn.Sequential(
            nn.Linear(8, 16),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(16, 8),
            nn.ReLU(),
            nn.Linear(8, 2)
        )

    def forward(self, x):
        return self.network(x)  # logits: [batch_size, 2]`;

export default function MlpArchitectureArticle() {
  return (
    <ArticleShell currentHref="/bai-viet/kien-truc-mlp-la-gi">
      <ArticleIntro
        eyebrow="AI · DEEP LEARNING"
        title="Kiến trúc MLP"
        description="MLP là kiến trúc neural network đơn giản nhất để mình nhìn rõ một model học như thế nào: dữ liệu đi qua các layer, được biến đổi bởi weight và bias, rồi trở thành dự đoán ở đầu ra."
        date="23/09/2026"
        readTime="14 phút đọc"
        tags={['AI', 'Deep Learning', 'MLP']}
      />

      <ArticleSection id="mlp-la-gi" number="1" title="MLP là gì?">
        <p>
          MLP là viết tắt của <strong>Multilayer Perceptron</strong>. Đây là một mạng neural truyền thẳng:
          dữ liệu chỉ đi từ input đến output, không quay ngược thành vòng lặp. Mỗi node ở một layer thường kết nối
          với toàn bộ node của layer kế tiếp, vì vậy ta còn gọi chúng là <strong>fully connected layer</strong>.
        </p>
        <p>
          Nếu hình dung theo một API, MLP giống một chuỗi middleware. Mỗi layer nhận một vector, biến đổi nó rồi
          chuyển kết quả cho layer sau. Khác biệt là các phép biến đổi không được mình viết cứng bằng rule; model
          tự tìm weight và bias trong quá trình training.
        </p>
        <div className="my-6 border-l-2 border-primary bg-[var(--surface)] px-4 py-3 text-sm leading-7 text-muted-foreground">
          Input vector → Linear → Activation → Linear → Activation → Output logits
        </div>
      </ArticleSection>

      <ArticleSection id="ba-phan-cua-mlp" number="2" title="Ba phần của một MLP">
        <div className="grid gap-px border border-border bg-border md:grid-cols-3">
          <div className="border-t-2 border-primary bg-card p-5">
            <div className="flex items-center gap-2"><span className="grid h-6 min-w-8 place-items-center bg-primary px-2 font-mono text-xs font-bold text-primary-foreground">01</span><span className="font-mono text-xs font-semibold uppercase tracking-[0.08em] text-primary-dark">Input layer</span></div>
            <h3 className="mt-2 text-base font-semibold">Đặc trưng đầu vào</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Một sample được biểu diễn thành vector có kích thước cố định, ví dụ CPU, RAM, latency và error rate.
            </p>
          </div>
          <div className="border-t-2 border-primary bg-card p-5">
            <div className="flex items-center gap-2"><span className="grid h-6 min-w-8 place-items-center bg-primary px-2 font-mono text-xs font-bold text-primary-foreground">02</span><span className="font-mono text-xs font-semibold uppercase tracking-[0.08em] text-primary-dark">Hidden layer</span></div>
            <h3 className="mt-2 text-base font-semibold">Học representation</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Linear trộn các feature; activation thêm tính phi tuyến để mạng học được quan hệ phức tạp hơn đường thẳng.
            </p>
          </div>
          <div className="border-t-2 border-primary bg-card p-5">
            <div className="flex items-center gap-2"><span className="grid h-6 min-w-8 place-items-center bg-primary px-2 font-mono text-xs font-bold text-primary-foreground">03</span><span className="font-mono text-xs font-semibold uppercase tracking-[0.08em] text-primary-dark">Output layer</span></div>
            <h3 className="mt-2 text-base font-semibold">Tạo kết quả</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Số node phụ thuộc bài toán: 1 giá trị cho regression, 1 logit cho binary hoặc C logits cho C lớp.
            </p>
          </div>
        </div>
      </ArticleSection>

      <ArticleSection id="thu-thay-doi-kien-truc" number="3" title="Thử thay đổi kiến trúc">
        <p>
          Phần dễ gây nhầm nhất của MLP là kích thước các layer và số parameter. Mình có thể thay kiến trúc bên dưới
          để nhìn trực tiếp: mỗi node của layer trước nối với mọi node ở layer sau, và mỗi đường nối là một weight cần học.
        </p>
        <MlpArchitectureExplorer />
        <p>
          Khi tăng width, số đường nối tăng rất nhanh. Layer từ 8 node sang 16 node có 8 × 16 = 128 weight và 16 bias,
          tổng cộng 144 parameter. Activation như ReLU không thêm parameter; nó chỉ biến đổi giá trị.
        </p>
      </ArticleSection>

      <ArticleSection id="forward-pass-va-shape" number="4" title="Forward pass đi qua những shape nào?">
        <p>
          Giả sử một batch có 32 server và mỗi server có 8 feature. Tensor ban đầu có shape <code>[32, 8]</code>.
          Với kiến trúc 8 → 16 → 8 → 2, shape sẽ lần lượt là:
        </p>
        <pre className="my-5 overflow-x-auto border border-code-border bg-code p-4 font-mono text-sm leading-7 text-code-foreground">
          <code>{`[32, 8] → [32, 16] → [32, 8] → [32, 2]`}</code>
        </pre>
        <p>
          Con số 32 là batch size nên được giữ nguyên. Chỉ chiều feature thay đổi theo số node của từng layer. Bên trong
          một linear layer, phép tính cốt lõi là <code>z = xW + b</code>, sau đó <code>h = activation(z)</code>.
        </p>
      </ArticleSection>

      <ArticleSection id="mlp-hoc-the-nao" number="5" title="MLP học bằng cách nào?">
        <ol className="space-y-3 pl-5">
          <li><strong>Forward:</strong> đưa batch qua mạng để tạo logits hoặc dự đoán.</li>
          <li><strong>Loss:</strong> đo khoảng cách giữa dự đoán và đáp án thật.</li>
          <li><strong>Backpropagation:</strong> tính gradient cho từng weight và bias.</li>
          <li><strong>Optimizer:</strong> dùng gradient để cập nhật parameter rồi lặp lại với batch tiếp theo.</li>
        </ol>
        <p>
          Output layer cần khớp với bài toán. Phân loại nhiều lớp thường dùng C logits cùng CrossEntropyLoss; regression
          thường dùng một hoặc nhiều giá trị liên tục cùng MSE hoặc MAE. Softmax thường chỉ cần khi mình muốn đổi logits
          thành xác suất để hiển thị hoặc inference.
        </p>
      </ArticleSection>

      <ArticleSection id="mlp-bang-pytorch" number="6" title="Một MLP bằng PyTorch">
        <p>
          Ví dụ này nhận 8 chỉ số vận hành của server và dự đoán hai trạng thái: bình thường hoặc cần cảnh báo. Mạng có
          hai hidden layer và Dropout để giảm phụ thuộc quá mức vào một nhóm neuron trong lúc training.
        </p>
        <pre className="my-5 overflow-x-auto border border-code-border bg-code p-4 font-mono text-sm leading-7 text-code-foreground">
          <code>{codeExample}</code>
        </pre>
        <p>
          Model trả về logits thay vì tự gọi softmax. Khi train với <code>CrossEntropyLoss</code>, loss đã xử lý phần đó
          theo cách ổn định về số học.
        </p>
      </ArticleSection>

      <ArticleSection id="khi-nao-dung-mlp" number="7" title="Khi nào MLP là lựa chọn hợp lý?">
        <p>
          MLP rất hợp với dữ liệu bảng có số feature cố định, làm classifier hoặc regression head sau một feature
          extractor, và làm baseline trước khi thử kiến trúc phức tạp hơn. Nó dễ viết, dễ debug và inference nhanh nếu
          số layer không quá lớn.
        </p>
        <p>
          Tuy nhiên, MLP không tự hiểu cấu trúc đặc biệt của dữ liệu. Flatten ảnh thành một vector sẽ làm mất quan hệ
          không gian giữa các pixel; đưa chuỗi vào mà không mã hóa vị trí sẽ làm mất thứ tự; graph cũng mất thông tin
          về cạnh. CNN, RNN, Transformer hay GNN tồn tại vì chúng đưa các inductive bias đó vào kiến trúc.
        </p>
      </ArticleSection>

      <ArticleSection id="chon-depth-width" number="8" title="Chọn depth, width và regularization">
        <p>
          Mình thường bắt đầu nhỏ: một hoặc hai hidden layer, width gần với số feature hoặc lớn hơn một chút. Sau đó
          theo dõi training loss và validation loss. Nếu cả hai cùng cao, model có thể chưa đủ khả năng học; nếu training
          tốt nhưng validation kém, model đang có dấu hiệu overfit.
        </p>
        <ul className="space-y-2 pl-5">
          <li>Tăng width hoặc depth khi model đang underfit và dữ liệu đủ nhiều.</li>
          <li>Dùng Dropout, weight decay hoặc early stopping khi model overfit.</li>
          <li>Chuẩn hóa feature để các giá trị như latency và error rate không lệch thang đo quá xa.</li>
          <li>Luôn so với baseline đơn giản; model nhiều parameter hơn chưa chắc mang lại metric tốt hơn.</li>
        </ul>
      </ArticleSection>

      <ArticleSection id="ghi-nho-mlp" number="9" title="Cách mình ghi nhớ MLP">
        <p>
          MLP là một chuỗi phép biến đổi vector. Linear layer quyết định trộn thông tin như thế nào, activation giúp mạng
          học quan hệ phi tuyến, loss cho biết sai ở đâu và backprop chỉ đường để optimizer sửa parameter. Khi đã nhìn rõ
          bốn phần này, những kiến trúc phức tạp hơn không còn là một khối hộp đen hoàn toàn — chúng chủ yếu thay đổi cách
          kết nối và cách dữ liệu được biểu diễn trước khi đi tới đầu ra.
        </p>
      </ArticleSection>
    </ArticleShell>
  );
}
