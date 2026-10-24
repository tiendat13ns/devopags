import type { Metadata } from 'next';
import { ArticleIntro, ArticleSection, ArticleShell, ReferenceLink } from '@/components/article-shell';
import { TransformerFlowExplorer } from '@/components/transformer-flow-explorer';

export const metadata: Metadata = {
  title: 'Kiến trúc Transformer | tiendat13ns',
  description:
    'Đọc Transformer từ paper gốc: encoder–decoder stack, positional encoding, multi-head attention, residual, layer norm, FFN, masking, training và inference.',
};

const encoderCode = `import torch.nn as nn

layer = nn.TransformerEncoderLayer(
    d_model=512,
    nhead=8,
    dim_feedforward=2048,
    dropout=0.1,
    activation="relu",
    batch_first=True,
    norm_first=False,  # post-norm như paper 2017
)

encoder = nn.TransformerEncoder(
    encoder_layer=layer,
    num_layers=6,
)

output = encoder(
    embeddings_with_position,
    src_key_padding_mask=padding_mask,
)
# input/output: [batch, sequence, 512]`;

export default function TransformerArticle() {
  return (
    <ArticleShell currentHref="/bai-viet/kien-truc-transformer">
      <ArticleIntro
        eyebrow="DEEP LEARNING · ARCHITECTURE"
        title="Kiến trúc Transformer"
        description="Transformer không chỉ là Attention. Paper gốc ghép multi-head attention với positional encoding, residual connection, layer normalization và feed-forward network thành encoder–decoder có thể train song song theo chiều sequence."
        date="25/09/2026"
        readTime="20 phút đọc"
        tags={['AI', 'Deep Learning', 'Transformer']}
      />

      <ArticleSection id="transformer-thay-doi-dieu-gi" number="1" title="Transformer bỏ recurrence khỏi đường truyền chính">
        <p>
          RNN tạo hidden state của bước t từ hidden state t−1, nên training trong một sequence có dependency tuần tự.
          Transformer thay recurrence bằng self-attention: mọi vị trí tạo Query, Key, Value và trao đổi thông tin trong cùng
          một phép tính ma trận.
        </p>
        <p>
          Điều này mang lại hai thay đổi. Các vị trí được xử lý song song khi training, và đường đi giữa hai token xa nhau
          rút xuống một attention layer. Cái giá là model không còn tự mang thứ tự như RNN và full attention phải xét T²
          cặp token.
        </p>
        <div className="my-6 grid gap-px border border-border bg-border md:grid-cols-3">
          <div className="bg-card p-5">
            <p className="font-mono text-xs font-semibold text-primary">RNN</p>
            <p className="mt-3 font-mono text-sm text-ink">h₁ → h₂ → … → hₜ</p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">O(T) bước tuần tự.</p>
          </div>
          <div className="bg-card p-5">
            <p className="font-mono text-xs font-semibold text-primary">SELF-ATTENTION</p>
            <p className="mt-3 font-mono text-sm text-ink">mọi token ↔ mọi token</p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">O(1) bước tuần tự mỗi layer.</p>
          </div>
          <div className="bg-card p-5">
            <p className="font-mono text-xs font-semibold text-primary">TRADE-OFF</p>
            <p className="mt-3 font-mono text-sm text-ink">score matrix [T, T]</p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">Compute tăng bậc hai theo T.</p>
          </div>
        </div>
      </ArticleSection>

      <ArticleSection id="luong-du-lieu" number="2" title="Luồng dữ liệu qua ba họ Transformer">
        <p>
          Paper năm 2017 trình bày encoder–decoder cho machine translation. Encoder-only và decoder-only là những cách giữ
          lại từng nửa của ý tưởng đó cho các mục tiêu khác. Chọn từng chế độ để xem đường đi của tensor.
        </p>
        <TransformerFlowExplorer />
      </ArticleSection>

      <ArticleSection id="paper-goc-trong-cac-con-so" number="3" title="Kiến trúc base trong paper gốc">
        <p>
          Để tránh lẫn paper gốc với các LLM hiện đại, mình giữ riêng cấu hình Transformer base được Vaswani và cộng sự
          mô tả:
        </p>
        <div className="my-6 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['N', '6 encoder + 6 decoder layer'],
            ['d_model', '512'],
            ['Heads', '8 × 64 chiều'],
            ['d_ff', '2048'],
            ['Norm', 'Post-norm'],
            ['Activation', 'ReLU'],
            ['Dropout', '0.1'],
            ['Parameters', 'Khoảng 65M'],
          ].map(([name, value]) => (
            <div key={name} className="bg-card p-4">
              <span className="font-mono text-xs text-primary">{name}</span>
              <strong className="mt-2 block text-sm leading-6 text-ink">{value}</strong>
            </div>
          ))}
        </div>
        <p>
          Những con số này là một mốc lịch sử, không phải quy tắc bắt buộc. Model sau này thay depth, width, activation,
          normalization order, positional method, số KV head và nhiều chi tiết khác.
        </p>
      </ArticleSection>

      <ArticleSection id="embedding-position" number="4" title="Không có recurrence thì phải đưa vị trí vào input">
        <p>
          Token ID được tra thành embedding D chiều. Self-attention thuần túy không phân biệt hoán vị: đổi thứ tự token mà
          không thêm tín hiệu vị trí sẽ chỉ đổi thứ tự output tương ứng. Vì vậy input của layer đầu là tổng token embedding
          và positional encoding.
        </p>
        <div className="my-6 grid gap-px border border-border bg-border sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-stretch">
          <div className="bg-card p-4">
            <p className="font-mono text-xs text-primary">TOKEN</p>
            <strong className="mt-2 block text-sm text-ink">Nội dung</strong>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Vector học được cho token.</p>
          </div>
          <span className="hidden place-items-center bg-card px-2 font-mono text-primary sm:grid">+</span>
          <div className="bg-card p-4">
            <p className="font-mono text-xs text-primary">POSITION</p>
            <strong className="mt-2 block text-sm text-ink">Thứ tự</strong>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Sin/cos trong paper gốc.</p>
          </div>
          <span className="hidden place-items-center bg-card px-2 font-mono text-primary sm:grid">→</span>
          <div className="bg-primary-soft p-4">
            <p className="font-mono text-xs text-primary-dark">INPUT</p>
            <strong className="mt-2 block text-sm text-primary-dark">[B, T, D]</strong>
            <p className="mt-2 text-sm leading-6 text-primary-dark">Đi vào stack.</p>
          </div>
        </div>
        <pre className="my-5 overflow-x-auto border border-code-border bg-code p-4 font-mono text-sm leading-7 text-code-foreground">
          <code>{`PE(pos, 2i)     = sin(pos / 10000^(2i/d_model))
PE(pos, 2i + 1) = cos(pos / 10000^(2i/d_model))`}</code>
        </pre>
        <p>
          Paper báo cáo learned positional embedding và sinusoidal encoding cho kết quả gần tương đương trong thử nghiệm
          của họ. Sinusoidal được chọn vì giả thuyết rằng nó có thể hỗ trợ extrapolate sang sequence dài hơn lúc train.
        </p>
      </ArticleSection>

      <ArticleSection id="encoder-block" number="5" title="Encoder layer có hai sublayer">
        <p>
          Mỗi encoder layer gồm multi-head self-attention và position-wise feed-forward network. Paper gốc đặt residual
          quanh từng sublayer rồi mới LayerNorm:
        </p>
        <div className="my-6 overflow-x-auto border border-border bg-card p-4">
          <div className="flex min-w-[760px] items-center gap-2 font-mono text-xs">
            {['Input x', 'Multi-head self-attention', 'Dropout', '+ x', 'LayerNorm', 'FFN', 'Dropout', '+ residual', 'LayerNorm'].map((item, index, items) => (
              <div key={`${item}-${index}`} className="contents">
                <span className={`border px-3 py-3 ${item.startsWith('+') ? 'border-primary bg-primary-soft text-primary-dark' : 'border-border bg-surface text-ink'}`}>{item}</span>
                {index < items.length - 1 ? <span className="text-primary">→</span> : null}
              </div>
            ))}
          </div>
        </div>
        <div className="my-6 border-l-2 border-primary bg-primary-soft px-4 py-3 font-mono text-sm leading-7 text-primary-dark">
          output = LayerNorm(x + Sublayer(x))
        </div>
        <p>
          Đây là <strong>post-norm</strong>. Nhiều model hiện đại dùng pre-norm
          <code className="inline-code">x + Sublayer(LayerNorm(x))</code> để train mạng sâu ổn định hơn. Hai cách không nên
          bị vẽ lẫn thành cùng một block.
        </p>
      </ArticleSection>

      <ArticleSection id="decoder-block" number="6" title="Decoder thêm masking và cross-attention">
        <p>
          Decoder layer có ba sublayer: masked self-attention, encoder–decoder attention và FFN. Causal mask đảm bảo vị trí
          i chỉ phụ thuộc các output token trước i; target embedding còn được shift sang phải một vị trí.
        </p>
        <div className="my-6 grid gap-px border border-border bg-border md:grid-cols-3">
          <div className="bg-card p-5">
            <p className="font-mono text-xs font-semibold text-primary">1 · MASKED SELF</p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">Decoder đọc prefix đã có, không nhìn token tương lai.</p>
          </div>
          <div className="bg-card p-5">
            <p className="font-mono text-xs font-semibold text-primary">2 · CROSS</p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">Q từ decoder; K và V từ encoder output.</p>
          </div>
          <div className="bg-card p-5">
            <p className="font-mono text-xs font-semibold text-primary">3 · FFN</p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">Biến đổi feature độc lập tại từng vị trí.</p>
          </div>
        </div>
      </ArticleSection>

      <ArticleSection id="multi-head-shape" number="7" title="Shape của multi-head attention">
        <p>
          Với D = 512 và H = 8, mỗi head trong paper base dùng head dimension 64. Model reshape tensor để đưa head thành
          một trục riêng, tính attention song song rồi ghép trở lại:
        </p>
        <pre className="my-5 overflow-x-auto border border-code-border bg-code p-4 font-mono text-sm leading-7 text-code-foreground">
          <code>{`input:   [B, T, D]
Q, K, V: [B, H, T, Dh]
scores:  [B, H, Tq, Tk]
context: [B, H, Tq, Dv]
concat:  [B, Tq, H × Dv]
output:  [B, Tq, D]`}</code>
        </pre>
        <p>
          Chia thành nhiều head không làm tăng tổng model dimension nếu H × Dh = D. Mục tiêu là cho model nhiều không gian
          chiếu để so khớp, thay vì ép mọi quan hệ vào một attention map duy nhất.
        </p>
      </ArticleSection>

      <ArticleSection id="feed-forward" number="8" title="FFN biến đổi feature tại từng token">
        <p>
          Attention trộn thông tin giữa các vị trí; FFN trộn các feature bên trong representation của từng vị trí. Paper
          gốc dùng hai linear layer với ReLU, mở rộng 512 lên 2048 rồi nén lại:
        </p>
        <div className="my-6 border-l-2 border-primary bg-primary-soft px-4 py-3 font-mono text-sm leading-7 text-primary-dark">
          FFN(x) = max(0, xW₁ + b₁)W₂ + b₂
        </div>
        <p>
          Cùng một FFN được dùng cho mọi position trong một layer, nhưng layer khác có parameter khác. Transformer vì vậy
          không phải “chỉ có attention”: residual và MLP ngăn representation suy biến và tạo thêm năng lực biến đổi phi
          tuyến.
        </p>
      </ArticleSection>

      <ArticleSection id="ba-ho-transformer" number="9" title="Ba họ Transformer phổ biến">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="border border-border bg-card p-5">
            <p className="font-mono text-xs font-semibold text-primary">ENCODER-ONLY</p>
            <h3 className="mt-2 text-base font-semibold text-ink">Hiểu input</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Bidirectional attention; phù hợp embedding, classification, retrieval và token labeling.</p>
          </div>
          <div className="border border-border bg-card p-5">
            <p className="font-mono text-xs font-semibold text-primary">DECODER-ONLY</p>
            <h3 className="mt-2 text-base font-semibold text-ink">Sinh tiếp chuỗi</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Causal attention; dự đoán token kế tiếp và là cấu trúc phổ biến của LLM.</p>
          </div>
          <div className="border border-border bg-card p-5">
            <p className="font-mono text-xs font-semibold text-primary">ENCODER–DECODER</p>
            <h3 className="mt-2 text-base font-semibold text-ink">Biến đổi chuỗi</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Cross-attention nối source với target; phù hợp dịch, tóm tắt và speech-to-text.</p>
          </div>
        </div>
        <p>
          Paper gốc thuộc họ encoder–decoder. Việc dùng từ “Transformer” cho mọi model chỉ có encoder hoặc decoder là sự
          phát triển sau đó của cùng bộ building block.
        </p>
      </ArticleSection>

      <ArticleSection id="training-generation" number="10" title="Training song song nhưng generation vẫn tuần tự">
        <p>
          Khi train decoder, toàn bộ target đã shift được đưa vào cùng lúc. Causal mask ngăn leakage nhưng GPU vẫn tính
          representation của nhiều vị trí song song. Khi inference, token tiếp theo chưa tồn tại nên model phải sinh từng
          bước.
        </p>
        <p>
          KV cache lưu Key và Value của prefix ở mỗi layer để không tính lại chúng ở bước sau. Cache giảm compute lặp lại
          nhưng memory tăng theo số token, layer, KV head và head dimension. Đây là tối ưu inference hiện đại, không phải
          thành phần được mô tả trong sơ đồ paper 2017.
        </p>
      </ArticleSection>

      <ArticleSection id="training-recipe" number="11" title="Paper gốc train model như thế nào?">
        <p>
          Kiến trúc và training recipe đi cùng nhau. Transformer base được train 100.000 step trong khoảng 12 giờ trên 8
          GPU P100; bản big train 300.000 step trong 3,5 ngày. Các chi tiết chính gồm:
        </p>
        <div className="my-6 grid gap-px border border-border bg-border sm:grid-cols-2">
          {[
            ['Optimizer', 'Adam · β₁=0.9 · β₂=0.98 · ε=10⁻⁹'],
            ['Learning rate', 'Warmup 4.000 step rồi giảm theo inverse square root'],
            ['Regularization', 'Dropout 0.1 ở base model'],
            ['Target', 'Label smoothing ε=0.1'],
          ].map(([name, value]) => (
            <div key={name} className="bg-card p-5">
              <p className="font-mono text-xs font-semibold text-primary">{name}</p>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{value}</p>
            </div>
          ))}
        </div>
        <p>
          Trên WMT 2014 English–German, Transformer big đạt 28.4 BLEU trong báo cáo của paper. Con số lịch sử này chỉ có ý
          nghĩa khi đi kèm dataset, preprocessing, beam search và setup training cụ thể.
        </p>
      </ArticleSection>

      <ArticleSection id="chi-phi-context-dai" number="12" title="Context dài làm attention trở thành bottleneck">
        <p>
          Full attention có complexity <code className="inline-code">O(T²·D)</code> và score tensor
          <code className="inline-code">[B,H,T,T]</code>. Khi T tăng gấp đôi, số cặp query–key tăng gần bốn lần.
        </p>
        <p>
          FlashAttention tối ưu exact attention bằng tiling và giảm traffic giữa các tầng memory GPU. Local, sliding-window
          và sparse attention lại giảm số kết nối cần xét. Hai hướng giải quyết khác nhau: một hướng giữ nguyên phép tính
          nhưng chạy hiệu quả hơn; hướng kia thay pattern kết nối để hạ complexity.
        </p>
      </ArticleSection>

      <ArticleSection id="pytorch" number="13" title="Dựng encoder gần với paper bằng PyTorch">
        <p>
          <code className="inline-code">norm_first=False</code> giữ thứ tự post-norm của kiến trúc gốc. Nếu đổi sang True,
          ta đang dùng pre-norm. Padding mask đánh dấu token đệm không được tham gia attention.
        </p>
        <pre className="my-5 overflow-x-auto border border-code-border bg-code p-4 font-mono text-sm leading-7 text-code-foreground">
          <code>{encoderCode}</code>
        </pre>
        <p>
          Output giữ shape [B,T,D]. Bài toán classification cần thêm pooling hoặc một token đại diện; decoder sinh token
          cần thêm output projection sang vocabulary và chiến lược decoding.
        </p>
      </ArticleSection>

      <ArticleSection id="ghi-nho-transformer" number="14" title="Cách mình đọc một Transformer mới">
        <p>
          Mình không bắt đầu bằng tên model. Mình kiểm tra sáu câu hỏi: token được biểu diễn và gắn vị trí thế nào; attention
          pattern là full hay restricted; dùng self hay cross-attention; norm đặt trước hay sau sublayer; FFN mở rộng bao
          nhiêu; training và inference có mask/cache gì.
        </p>
        <p>
          Khi sáu mảnh này rõ, encoder-only, decoder-only, multimodal Transformer hay một LLM lớn không còn là hộp đen hoàn
          toàn. Chúng là các cách sắp xếp và scale cùng một nhóm building block.
        </p>
      </ArticleSection>

      <ArticleSection id="tai-lieu" number="15" title="Nguồn tham khảo">
        <ul className="space-y-3">
          <ReferenceLink href="https://arxiv.org/abs/1706.03762" label="Vaswani et al. — Attention Is All You Need" />
          <ReferenceLink href="https://research.google/pubs/attention-is-all-you-need/" label="Google Research — Attention Is All You Need" />
          <ReferenceLink href="https://research.google/blog/transformer-a-novel-neural-network-architecture-for-language-understanding/" label="Google Research Blog — Transformer architecture" />
          <ReferenceLink href="https://docs.pytorch.org/docs/stable/generated/torch.nn.TransformerEncoderLayer.html" label="PyTorch — TransformerEncoderLayer" />
          <ReferenceLink href="https://research.google/pubs/attention-is-not-all-you-need-pure-attention-loses-rank-doubly-exponentially-with-depth/" label="Dong, Cordonnier & Loukas — Attention is Not All You Need" />
        </ul>
      </ArticleSection>
    </ArticleShell>
  );
}
