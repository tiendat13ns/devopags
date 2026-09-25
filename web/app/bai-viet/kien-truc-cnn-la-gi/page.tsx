import type { Metadata } from 'next';
import { CnnConvolutionExplorer } from '@/components/cnn-convolution-explorer';
import { ArticleIntro, ArticleSection, ArticleShell } from '@/components/article-shell';

export const metadata: Metadata = {
  title: 'Kiến trúc CNN | tiendat13ns',
  description:
    'Cách mình hiểu Convolutional Neural Network: kernel, convolution, feature map, channel, stride, padding, pooling và một CNN bằng PyTorch.',
};

const cnnCode = `import torch.nn as nn

class ImageClassifier(nn.Module):
    def __init__(self, num_classes=4):
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv2d(3, 16, kernel_size=3, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(2),

            nn.Conv2d(16, 32, kernel_size=3, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(2),
        )
        self.pool = nn.AdaptiveAvgPool2d(1)
        self.classifier = nn.Linear(32, num_classes)

    def forward(self, x):
        x = self.features(x)       # [B, 32, H/4, W/4]
        x = self.pool(x)           # [B, 32, 1, 1]
        x = x.flatten(1)           # [B, 32]
        return self.classifier(x)  # logits: [B, 4]`;

export default function CnnArchitectureArticle() {
  return (
    <ArticleShell currentHref="/bai-viet/kien-truc-cnn-la-gi">
      <ArticleIntro
        eyebrow="AI · COMPUTER VISION"
        title="Kiến trúc CNN"
        description="Nếu MLP nhìn một bức ảnh như một vector dài, CNN giữ lại vị trí của từng pixel và học cách phát hiện các mẫu nhỏ như cạnh, góc, texture rồi ghép chúng thành đặc trưng có ý nghĩa hơn."
        date="23/09/2026"
        readTime="15 phút đọc"
        tags={['AI', 'Deep Learning', 'CNN']}
      />

      <ArticleSection id="tai-sao-can-cnn" number="1" title="Tại sao ảnh cần một kiến trúc riêng?">
        <p>
          Một ảnh RGB kích thước 224 × 224 có hơn 150 nghìn giá trị. Nếu nối trực tiếp từng pixel với 1.000 neuron của
          một MLP, riêng layer đầu đã cần hơn 150 triệu weight. Quan trọng hơn, sau khi flatten ảnh, model không còn biết
          pixel nào nằm cạnh pixel nào.
        </p>
        <p>
          CNN giải quyết hai vấn đề này bằng một ý tưởng khá thực dụng: dùng một bộ lọc nhỏ quét trên toàn bộ ảnh. Cùng
          một bộ weight được tái sử dụng ở mọi vị trí, nên số parameter ít hơn và cấu trúc không gian vẫn được giữ lại.
        </p>
        <div className="my-6 grid gap-px border border-border bg-border sm:grid-cols-3">
          <div className="bg-card p-4">
            <p className="font-mono text-xs text-primary">LOCAL</p>
            <strong className="mt-2 block text-ink">Nhìn vùng lân cận</strong>
            <p className="mt-2 text-sm leading-6">Kernel chỉ đọc một vùng nhỏ thay vì toàn bộ ảnh cùng lúc.</p>
          </div>
          <div className="bg-card p-4">
            <p className="font-mono text-xs text-primary">SHARED</p>
            <strong className="mt-2 block text-ink">Dùng chung weight</strong>
            <p className="mt-2 text-sm leading-6">Một kernel được dùng lại tại mọi vị trí trên input.</p>
          </div>
          <div className="bg-card p-4">
            <p className="font-mono text-xs text-primary">SPATIAL</p>
            <strong className="mt-2 block text-ink">Giữ vị trí</strong>
            <p className="mt-2 text-sm leading-6">Feature map vẫn có chiều cao và chiều rộng.</p>
          </div>
        </div>
      </ArticleSection>

      <ArticleSection id="convolution-hoat-dong" number="2" title="Convolution hoạt động như thế nào?">
        <p>
          Kernel là một ma trận nhỏ, thường có kích thước 3 × 3. Tại mỗi vị trí, CNN nhân từng phần tử của kernel với
          vùng ảnh tương ứng rồi cộng tất cả kết quả lại. Một phép tính tạo ra một ô trên feature map; trượt kernel qua
          ảnh sẽ tạo ra toàn bộ feature map.
        </p>
        <CnnConvolutionExplorer />
        <p>
          Ba kernel trong ví dụ được đặt weight thủ công để dễ quan sát. Trong model thật, CNN không được đưa sẵn bộ lọc
          cạnh. Các weight của kernel được khởi tạo rồi cập nhật bằng backpropagation, giống parameter của MLP.
        </p>
      </ArticleSection>

      <ArticleSection id="feature-map-channel" number="3" title="Feature map và channel">
        <p>
          Ảnh màu thường có 3 input channel: Red, Green và Blue. Một kernel của Conv2d phải đi xuyên qua cả ba channel,
          nên shape của nó là <code className="inline-code">3 × 3 × 3</code>. Kết quả của một kernel là một output channel.
          Nếu layer có 16 kernel, output sẽ có 16 feature map.
        </p>
        <div className="my-6 border border-border bg-card">
          <div className="grid gap-px bg-border sm:grid-cols-4">
            {[
              ['Input', '[B, 3, 64, 64]'],
              ['Conv 3×3', '3 → 16 channel'],
              ['Activation', 'ReLU'],
              ['Output', '[B, 16, 64, 64]'],
            ].map(([label, value]) => (
              <div key={label} className="bg-card p-4">
                <p className="font-mono text-xs text-primary">{label}</p>
                <p className="mt-2 text-sm font-semibold text-ink">{value}</p>
              </div>
            ))}
          </div>
        </div>
        <p>
          Mình hình dung mỗi output channel là một cách nhìn khác về cùng bức ảnh. Channel này có thể phản ứng với cạnh
          dọc, channel khác với texture hoặc một tổ hợp phức tạp hơn. Tên gọi đó chỉ để con người diễn giải; model chỉ
          đang tối ưu các weight giúp giảm loss.
        </p>
      </ArticleSection>

      <ArticleSection id="stride-padding-pooling" number="4" title="Stride, padding và pooling">
        <p>
          Ba khái niệm này quyết định kernel di chuyển thế nào và feature map thay đổi kích thước ra sao.
        </p>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="border border-border bg-card p-4">
            <h3 className="text-base font-semibold text-ink">Stride</h3>
            <p className="mt-2 text-sm leading-6">Số ô kernel nhảy sau mỗi lần tính. Stride 2 làm giảm nhanh chiều cao và chiều rộng.</p>
          </div>
          <div className="border border-border bg-card p-4">
            <h3 className="text-base font-semibold text-ink">Padding</h3>
            <p className="mt-2 text-sm leading-6">Thêm viền quanh input. Với kernel 3 × 3, padding 1 thường giữ nguyên H và W.</p>
          </div>
          <div className="border border-border bg-card p-4">
            <h3 className="text-base font-semibold text-ink">Pooling</h3>
            <p className="mt-2 text-sm leading-6">Tóm tắt một vùng nhỏ bằng max hoặc average để giảm kích thước feature map.</p>
          </div>
        </div>
        <pre className="my-5 overflow-x-auto border border-code-border bg-code p-4 font-mono text-sm leading-7 text-code-foreground">
          <code>{`output = floor((input + 2 × padding - kernel) / stride) + 1`}</code>
        </pre>
        <p>
          Ví dụ input 32, kernel 3, padding 1 và stride 1 cho output 32. Đổi stride thành 2 thì output còn 16. Theo dõi
          công thức này giúp mình tránh lỗi shape khi nối nhiều block CNN.
        </p>
      </ArticleSection>

      <ArticleSection id="parameter-cua-conv" number="5" title="CNN có bao nhiêu parameter?">
        <p>
          Một Conv2d có số parameter bằng <code className="inline-code">out_channels × (in_channels × K × K + 1)</code>.
          Số 1 cuối là bias của mỗi output channel.
        </p>
        <div className="my-5 border-l-2 border-primary bg-primary-soft px-4 py-3 font-mono text-sm leading-7 text-primary-dark">
          Conv2d(3, 16, kernel_size=3) = 16 × (3 × 3 × 3 + 1) = 448 parameter
        </div>
        <p>
          Con số này không phụ thuộc ảnh rộng 64 hay 640 pixel vì kernel được dùng chung trên mọi vị trí. Đây chính là
          parameter sharing — lợi thế lớn của CNN so với việc flatten ảnh rồi dùng fully connected layer.
        </p>
      </ArticleSection>

      <ArticleSection id="kien-truc-cnn" number="6" title="Một CNN thường được ghép như thế nào?">
        <div className="my-6 overflow-x-auto border border-border bg-card p-4">
          <div className="flex min-w-[680px] items-center gap-2 font-mono text-xs">
            {['Ảnh', 'Conv', 'ReLU', 'Pool', 'Conv', 'ReLU', 'Pool', 'Global Avg Pool', 'Linear', 'Logits'].map((item, index, items) => (
              <div key={`${item}-${index}`} className="contents">
                <span className={`border px-3 py-3 ${item === 'Logits' ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-surface text-ink'}`}>
                  {item}
                </span>
                {index < items.length - 1 ? <span className="text-primary">→</span> : null}
              </div>
            ))}
          </div>
        </div>
        <p>
          Các block đầu thường học cạnh và texture đơn giản. Càng đi sâu, receptive field càng lớn nên feature có thể
          đại diện cho bộ phận hoặc hình dạng phức tạp hơn. Cuối mạng, Global Average Pooling tóm mỗi channel thành một
          giá trị và Linear layer đổi vector đó thành logits.
        </p>
      </ArticleSection>

      <ArticleSection id="cnn-pytorch" number="7" title="Một CNN nhỏ bằng PyTorch">
        <p>
          Model dưới đây nhận ảnh RGB và phân loại thành bốn lớp. AdaptiveAvgPool2d giúp phần classifier không phụ thuộc
          chặt vào kích thước H × W còn lại sau các convolution block.
        </p>
        <pre className="my-5 overflow-x-auto border border-code-border bg-code p-4 font-mono text-sm leading-7 text-code-foreground">
          <code>{cnnCode}</code>
        </pre>
        <p>
          Trong thực tế mình sẽ kiểm tra shape sau từng block trước, sau đó mới nhìn loss. Rất nhiều lỗi CNN ban đầu không
          nằm ở thuật toán học mà chỉ là nhầm thứ tự <code className="inline-code">[batch, channel, height, width]</code>.
        </p>
      </ArticleSection>

      <ArticleSection id="training-va-inference" number="8" title="Training và inference khác gì?">
        <p>
          Khi training, ảnh thường được augment bằng crop, flip hoặc thay đổi màu nhẹ; model chạy forward, tính loss rồi
          backpropagate qua cả kernel. Khi inference, model chỉ chạy forward trên ảnh đã preprocess đúng như lúc train.
        </p>
        <p>
          Hai phía phải thống nhất kích thước, thứ tự channel, cách scale pixel và mean/std normalization. Model tốt nhưng
          pipeline inference dùng BGR thay RGB hoặc quên normalization vẫn có thể cho kết quả sai rõ rệt.
        </p>
      </ArticleSection>

      <ArticleSection id="khi-nao-dung-cnn" number="9" title="Khi nào mình chọn CNN?">
        <p>
          CNN vẫn là lựa chọn mạnh cho classification, detection, segmentation và nhiều bài toán tín hiệu có cấu trúc
          lưới. Model nhỏ có thể inference nhanh, dễ tối ưu trên edge device và thường cần ít tài nguyên hơn một Vision
          Transformer có độ chính xác tương đương.
        </p>
        <p>
          Giới hạn của CNN là ưu tiên quan hệ cục bộ. Muốn kết nối hai vùng rất xa, mạng phải đi qua nhiều layer hoặc dùng
          kernel lớn hơn. Các kiến trúc hiện đại thường kết hợp convolution với attention, residual connection và
          normalization thay vì chỉ xếp Conv–Pool theo cách cổ điển.
        </p>
      </ArticleSection>

      <ArticleSection id="ghi-nho-cnn" number="10" title="Cách mình ghi nhớ CNN">
        <p>
          CNN không nhìn toàn bộ ảnh ngay từ đầu. Nó dùng nhiều kernel nhỏ để hỏi cùng một câu hỏi ở mọi vị trí: “mẫu mà
          tôi đang tìm có xuất hiện ở đây không?”. Kết quả của các câu hỏi tạo thành feature map. Nhiều layer liên tiếp
          ghép các tín hiệu nhỏ thành representation lớn hơn, rồi classifier dùng representation đó để đưa ra dự đoán.
        </p>
      </ArticleSection>
    </ArticleShell>
  );
}
