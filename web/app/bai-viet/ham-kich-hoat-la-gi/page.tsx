import type { Metadata } from 'next';
import { AlertTriangle, Binary, BrainCircuit, CheckCircle2, GitBranch } from 'lucide-react';
import { ActivationFunctionVisualizer } from '@/components/activation-function-visualizer';
import { ArticleIntro, ArticleSection, ArticleShell } from '@/components/article-shell';

export const metadata: Metadata = {
  title: 'Hàm kích hoạt | tiendat13ns',
  description: 'Cách mình hiểu activation function trong neural network: tính phi tuyến, ReLU, Sigmoid, Tanh, GELU, Softmax và cách chọn cho từng bài toán.',
};

const activationCards = [
  {
    name: 'ReLU',
    formula: 'max(0, x)',
    use: 'Lựa chọn baseline cho hidden layer của MLP và CNN.',
    tradeoff: 'Nhanh, gradient tốt ở vùng dương nhưng có thể tạo dying ReLU.',
  },
  {
    name: 'Leaky ReLU',
    formula: 'max(αx, x)',
    use: 'Dùng khi muốn tín hiệu và gradient vẫn đi qua vùng âm.',
    tradeoff: 'Thêm hệ số α; thường α là một giá trị nhỏ như 0.01.',
  },
  {
    name: 'Sigmoid',
    formula: '1 / (1 + e⁻ˣ)',
    use: 'Output cho binary classification hoặc từng nhãn độc lập.',
    tradeoff: 'Output dễ hiểu như xác suất nhưng gradient nhỏ ở hai đầu.',
  },
  {
    name: 'Tanh',
    formula: 'tanh(x)',
    use: 'Các trạng thái cần giá trị âm và dương; thường gặp trong RNN cũ.',
    tradeoff: 'Có tâm tại 0 nhưng vẫn bị bão hòa.',
  },
  {
    name: 'GELU',
    formula: 'x · Φ(x)',
    use: 'Phổ biến trong Transformer và các model ngôn ngữ.',
    tradeoff: 'Mượt hơn ReLU nhưng tốn phép tính hơn một chút.',
  },
  {
    name: 'Softmax',
    formula: 'eᶻⁱ / Σeᶻʲ',
    use: 'Biến một vector logits thành phân phối xác suất nhiều lớp.',
    tradeoff: 'Hoạt động trên cả vector, không phải từng scalar độc lập.',
  },
];

const outputChoices = [
  ['Binary classification', '1 logit', 'Sigmoid khi inference', 'BCEWithLogitsLoss'],
  ['Multi-class', 'K logits', 'Softmax khi inference', 'CrossEntropyLoss'],
  ['Multi-label', 'K logits độc lập', 'Sigmoid cho từng nhãn', 'BCEWithLogitsLoss'],
  ['Regression', '1 hoặc nhiều giá trị', 'Thường để tuyến tính', 'MSE / MAE / Huber'],
];

export default function ActivationFunctionArticlePage() {
  return (
    <ArticleShell currentHref="/bai-viet/ham-kich-hoat-la-gi">
      <ArticleIntro
        eyebrow="Deep Learning · Neural Network"
        title="Hàm kích hoạt"
        description="Sau khi hiểu weight và bias, câu hỏi tiếp theo của mình là: tại sao neuron còn cần activation function? Đây là phần giúp một chồng phép nhân ma trận thật sự học được quan hệ phức tạp."
        date="22/09/2026"
        readTime="12 phút đọc"
        tags={['AI', 'Deep Learning', 'Activation']}
      />

      <div className="mb-2 grid gap-4 border border-primary/20 bg-primary-soft p-5 sm:grid-cols-[auto_1fr] sm:p-6">
        <BrainCircuit className="text-primary" size={24} />
        <p className="text-sm leading-7 text-muted-foreground">
          Cách mình ghi nhớ: neuron tính <code className="inline-code">z = weight × input + bias</code>, sau đó activation function quyết định tín hiệu <code className="inline-code">z</code> sẽ được truyền tiếp như thế nào. Nó không tạo thêm parameter; nó thay đổi hình dạng của phép biến đổi.
        </p>
      </div>

      <ArticleSection id="activation-o-dau" number="1" title="Activation nằm ở đâu trong một neuron?">
        <p>
          Ở bài trước, mình rút gọn một neuron thành <code className="inline-code">output = activation(weight × input + bias)</code>. Phần <code className="inline-code">weight × input + bias</code> tạo ra một giá trị trung gian thường được gọi là <strong className="text-ink">logit</strong> hoặc <strong className="text-ink">pre-activation</strong>. Hàm kích hoạt nhận giá trị đó và tạo output gửi sang layer tiếp theo.
        </p>

        <div className="grid gap-3 border border-border bg-card p-4 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center sm:p-5">
          <div className="border border-border bg-background p-4">
            <span className="font-mono text-[10px] text-primary">INPUT</span>
            <strong className="mt-2 block text-ink">x và parameter</strong>
            <p className="mt-1 text-sm">Weight, bias và dữ liệu đầu vào.</p>
          </div>
          <span className="hidden font-mono text-primary sm:block">→</span>
          <div className="border border-primary/40 bg-primary-soft p-4">
            <span className="font-mono text-[10px] text-primary">LINEAR</span>
            <strong className="mt-2 block text-ink">z = wx + b</strong>
            <p className="mt-1 text-sm">Tổng có trọng số trước activation.</p>
          </div>
          <span className="hidden font-mono text-primary sm:block">→</span>
          <div className="border border-primary bg-primary p-4 text-primary-foreground">
            <span className="font-mono text-[10px] opacity-75">NON-LINEAR</span>
            <strong className="mt-2 block">a = f(z)</strong>
            <p className="mt-1 text-sm opacity-90">Tín hiệu truyền sang layer sau.</p>
          </div>
        </div>

        <p>
          Nếu liên hệ với code, linear layer giống một hàm chuẩn bị dữ liệu, còn activation giống một rule nhỏ đặt ngay sau đó. Rule này đơn giản nhưng ảnh hưởng trực tiếp tới loại pattern mà cả network có thể học.
        </p>
      </ArticleSection>

      <ArticleSection id="tai-sao-can" number="2" title="Tại sao mạng cần tính phi tuyến?">
        <p>
          Đây là lý do quan trọng nhất. Nếu bỏ activation, mỗi layer chỉ là một phép biến đổi tuyến tính. Dù xếp nhiều layer, ta vẫn có thể gộp chúng thành đúng một phép biến đổi:
        </p>

        <div className="border border-code-border bg-code p-5 font-mono text-sm leading-7 text-code-foreground">
          <p>layer_1 = W₁x + b₁</p>
          <p>layer_2 = W₂(layer_1) + b₂</p>
          <p className="mt-3 text-primary">⇒ layer_2 = (W₂W₁)x + (W₂b₁ + b₂)</p>
        </div>

        <div className="flex gap-3 border-l-2 border-primary bg-primary-soft px-5 py-4">
          <GitBranch className="mt-1 shrink-0 text-primary" size={19} />
          <p className="text-sm leading-7">
            Không có phi tuyến, network 100 layer về khả năng biểu diễn vẫn chỉ như một linear layer lớn. Activation tạo ra những “khúc rẽ”, giúp decision boundary uốn cong và mô tả dữ liệu phức tạp hơn.
          </p>
        </div>

        <p>
          Ví dụ dữ liệu XOR: hai điểm cùng nhãn nằm chéo nhau nên không thể tách bằng một đường thẳng. Khi thêm hidden layer cùng activation phi tuyến, network có thể ghép nhiều vùng tuyến tính nhỏ để tạo boundary phù hợp.
        </p>
      </ArticleSection>

      <ArticleSection id="do-thi" number="3" title="Nhìn hình dạng để hiểu activation">
        <p>
          Công thức dễ làm mình mất phương hướng, còn đồ thị cho biết ngay tín hiệu âm, gần 0 và dương sẽ bị biến đổi ra sao. Hãy chuyển giữa các hàm bên dưới và so sánh output tại <code className="inline-code">x = -2, 0, 2</code>.
        </p>
        <ActivationFunctionVisualizer />
      </ArticleSection>

      <ArticleSection id="cac-ham-pho-bien" number="4" title="Các hàm kích hoạt phổ biến">
        <div className="grid gap-px border border-border bg-border sm:grid-cols-2">
          {activationCards.map((item) => (
            <div className="bg-card p-4" key={item.name}>
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold text-ink">{item.name}</h3>
                <code className="font-mono text-[11px] text-primary">{item.formula}</code>
              </div>
              <p className="mt-3 text-sm leading-6">{item.use}</p>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">{item.tradeoff}</p>
            </div>
          ))}
        </div>
        <p>
          Softmax khác các hàm còn lại ở chỗ nó nhìn toàn bộ vector logits cùng lúc. Nếu model trả ba logits cho ba class, Softmax chuẩn hóa chúng để tổng xác suất bằng 1. Vì vậy nó phù hợp với bài toán các class loại trừ lẫn nhau, nhưng không phù hợp trực tiếp với multi-label.
        </p>
      </ArticleSection>

      <ArticleSection id="hidden-output" number="5" title="Hidden layer và output layer không chọn giống nhau">
        <p>
          Mình tách quyết định thành hai câu hỏi. Với <strong className="text-ink">hidden layer</strong>, activation cần giúp gradient đi qua network ổn định; ReLU là baseline tốt, GELU thường gặp trong Transformer. Với <strong className="text-ink">output layer</strong>, activation phải khớp với ý nghĩa của output và loss function.
        </p>

        <div className="overflow-x-auto border border-border bg-card">
          <div className="min-w-[720px]">
            <div className="grid grid-cols-[170px_140px_190px_1fr] border-b border-border bg-surface px-4 py-3 text-sm font-semibold text-ink">
              <span>Bài toán</span><span>Model trả về</span><span>Khi inference</span><span>Loss thường dùng</span>
            </div>
            {outputChoices.map(([task, modelOutput, inference, loss]) => (
              <div className="grid grid-cols-[170px_140px_190px_1fr] border-b border-border px-4 py-4 text-sm leading-6 last:border-b-0" key={task}>
                <strong className="text-primary">{task}</strong><span>{modelOutput}</span><span>{inference}</span><code className="font-mono text-xs text-ink">{loss}</code>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 border border-primary/20 bg-primary-soft p-4">
          <Binary className="mt-1 shrink-0 text-primary" size={18} />
          <p className="text-sm leading-7">
            Trong PyTorch, <code className="inline-code">CrossEntropyLoss</code> nhận logits và tự xử lý log-softmax; <code className="inline-code">BCEWithLogitsLoss</code> cũng kết hợp sigmoid bên trong. Không nên tự áp dụng activation trước loss lần nữa.
          </p>
        </div>
      </ArticleSection>

      <ArticleSection id="gradient" number="6" title="Activation ảnh hưởng trực tiếp tới gradient">
        <p>
          Backpropagation dùng đạo hàm của activation để truyền gradient về layer trước. Nếu đạo hàm gần 0 qua quá nhiều layer, gradient nhỏ dần và các layer đầu gần như không học được — đây là <strong className="text-ink">vanishing gradient</strong>.
        </p>

        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ['Bão hòa', 'Sigmoid và Tanh có vùng rất âm hoặc rất dương với đạo hàm gần 0.'],
            ['Dying ReLU', 'Nếu z luôn âm, ReLU cho output 0 và gradient 0 ở neuron đó.'],
            ['Exploding signal', 'Activation, initialization và normalization không phù hợp có thể làm giá trị tăng mất kiểm soát.'],
          ].map(([title, text]) => (
            <div className="border border-border bg-card p-4" key={title}>
              <AlertTriangle className="text-primary" size={18} />
              <h3 className="mt-3 font-semibold text-ink">{title}</h3>
              <p className="mt-2 text-sm leading-6">{text}</p>
            </div>
          ))}
        </div>

        <p>
          Vì vậy activation không được chọn độc lập. Nó đi cùng weight initialization, normalization, learning rate và architecture. Khi loss không giảm, mình không chỉ nhìn optimizer mà còn kiểm tra phân phối activation và gradient theo từng layer.
        </p>
      </ArticleSection>

      <ArticleSection id="pytorch" number="7" title="Một ví dụ ngắn với PyTorch">
        <p>
          Trong MLP dưới đây, ReLU nằm giữa hai linear layer. Layer cuối trả logits vì loss đã xử lý bước chuẩn hóa phù hợp cho multi-class classification.
        </p>

        <div className="overflow-x-auto border border-code-border bg-code text-code-foreground">
          <div className="border-b border-white/10 px-5 py-3 font-mono text-xs text-white/50">model.py</div>
          <pre className="p-5 font-mono text-sm leading-7"><code>{`import torch.nn as nn
import torch.nn.functional as F

class TicketClassifier(nn.Module):
    def __init__(self):
        super().__init__()
        self.hidden = nn.Linear(32, 64)
        self.output = nn.Linear(64, 3)

    def forward(self, x):
        x = F.relu(self.hidden(x))
        return self.output(x)  # logits

logits = model(features)
loss = F.cross_entropy(logits, labels)`}</code></pre>
        </div>

        <p>
          Nếu đổi ReLU thành GELU, kiến trúc và số parameter không đổi; chỉ cách tín hiệu đi qua hidden layer thay đổi. Đây là một thử nghiệm nhỏ nhưng cần đánh giá bằng validation set thay vì chọn theo cảm giác.
        </p>
      </ArticleSection>

      <ArticleSection id="cach-chon" number="8" title="Cách mình chọn activation khi bắt đầu">
        <div className="space-y-3">
          {[
            'MLP hoặc CNN thông thường: bắt đầu với ReLU; thử Leaky ReLU nếu có nhiều neuron chết.',
            'Transformer: theo architecture gốc, thường là GELU hoặc biến thể được chỉ định.',
            'Binary và multi-label output: dùng logits khi train; áp dụng sigmoid khi cần xác suất inference.',
            'Multi-class output: dùng logits với cross-entropy; Softmax khi cần hiển thị xác suất.',
            'Regression: thường không activation ở output, trừ khi miền giá trị có ràng buộc rõ ràng.',
          ].map((item) => (
            <div className="flex gap-3 border border-border bg-card px-4 py-3" key={item}>
              <CheckCircle2 className="mt-1 shrink-0 text-primary" size={17} />
              <p className="text-sm leading-6">{item}</p>
            </div>
          ))}
        </div>
        <p>
          Tóm lại, activation trả lời hai việc: network có học được quan hệ phi tuyến hay không, và output cuối mang ý nghĩa gì. Với mình, cách chọn dễ nhất là bắt đầu từ output của bài toán, chọn loss tương ứng, rồi mới quay lại kiểm tra activation trong hidden layer.
        </p>
      </ArticleSection>
    </ArticleShell>
  );
}
