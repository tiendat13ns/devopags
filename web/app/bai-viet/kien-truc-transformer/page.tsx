import type { Metadata } from 'next';
import { ArticleIntro, ArticleSection, ArticleShell, ReferenceLink } from '@/components/article-shell';
import { TransformerFlowExplorer } from '@/components/transformer-flow-explorer';

export const metadata: Metadata = {
  title: 'Kiến trúc Transformer | tiendat13ns',
  description:
    'Cách mình hiểu Transformer: embedding, positional encoding, multi-head attention, residual, normalization, feed-forward, encoder và decoder.',
};

const encoderCode = `import torch.nn as nn

layer = nn.TransformerEncoderLayer(
    d_model=256,
    nhead=8,
    dim_feedforward=1024,
    dropout=0.1,
    batch_first=True,
    norm_first=True,
)

encoder = nn.TransformerEncoder(layer, num_layers=6)
output = encoder(embeddings, src_key_padding_mask=padding_mask)
# embeddings: [batch, sequence, 256]
# output:     [batch, sequence, 256]`;

export default function TransformerArticle() {
  return (
    <ArticleShell currentHref="/bai-viet/kien-truc-transformer">
      <ArticleIntro
        eyebrow="AI · FOUNDATION MODEL"
        title="Kiến trúc Transformer"
        description="Transformer xếp attention, residual connection, normalization và feed-forward network thành các block có thể lặp sâu. Kiến trúc này xử lý cả chuỗi song song khi training và là nền tảng của nhiều model ngôn ngữ, thị giác và đa phương thức."
        date="23/09/2026"
        readTime="17 phút đọc"
        tags={['AI', 'Deep Learning', 'Transformer']}
      />

      <ArticleSection id="tu-rnn-den-transformer" number="1" title="Từ RNN đến Transformer">
        <p>
          RNN đọc token lần lượt nên hidden state của bước t phải đợi bước t−1. Cách làm này tự nhiên với streaming nhưng
          khó tận dụng GPU khi training chuỗi dài, và thông tin xa phải đi qua nhiều phép biến đổi liên tiếp.
        </p>
        <p>
          Transformer bỏ recurrence khỏi block chính. Self-attention cho phép mỗi token kết nối trực tiếp với các token
          khác; toàn bộ vị trí có thể được tính cùng lúc trong training. Đổi lại, model phải được cung cấp thông tin vị trí
          và chi phí full attention tăng theo bình phương sequence length.
        </p>
      </ArticleSection>

      <ArticleSection id="luong-du-lieu" number="2" title="Luồng dữ liệu qua Transformer">
        <p>
          Transformer không chỉ có một dạng. Encoder-only phù hợp để hiểu input, decoder-only phù hợp để sinh token, còn
          encoder–decoder tách chuỗi nguồn và chuỗi đích. Chọn từng chế độ bên dưới để xem các block thay đổi ra sao.
        </p>
        <TransformerFlowExplorer />
      </ArticleSection>

      <ArticleSection id="embedding-va-position" number="3" title="Token embedding cần thông tin vị trí">
        <p>
          Token ID được tra trong embedding table để thành vector D chiều. Self-attention thuần túy không tự biết token
          nào đứng trước hoặc sau, nên Transformer cộng hoặc kết hợp thêm positional encoding vào embedding.
        </p>
        <div className="my-6 grid gap-px border border-border bg-border sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-stretch">
          <div className="bg-card p-4">
            <p className="font-mono text-xs text-primary">TOKEN</p>
            <strong className="mt-2 block text-sm text-ink">Nội dung</strong>
            <p className="mt-2 text-sm leading-6">Vector học được cho mỗi token.</p>
          </div>
          <span className="hidden place-items-center bg-card px-2 font-mono text-primary sm:grid">+</span>
          <div className="bg-card p-4">
            <p className="font-mono text-xs text-primary">POSITION</p>
            <strong className="mt-2 block text-sm text-ink">Thứ tự</strong>
            <p className="mt-2 text-sm leading-6">Sinusoidal, learned hoặc rotary position.</p>
          </div>
          <span className="hidden place-items-center bg-card px-2 font-mono text-primary sm:grid">→</span>
          <div className="bg-primary-soft p-4">
            <p className="font-mono text-xs text-primary-dark">INPUT</p>
            <strong className="mt-2 block text-sm text-primary-dark">[B, T, D]</strong>
            <p className="mt-2 text-sm leading-6 text-primary-dark">Đi vào Transformer block.</p>
          </div>
        </div>
      </ArticleSection>

      <ArticleSection id="transformer-block" number="4" title="Bên trong một Transformer block">
        <p>
          Một block thường có hai phần lớn: multi-head attention để trao đổi thông tin giữa token, và feed-forward network
          để biến đổi representation tại từng token. Mỗi phần được đặt cạnh residual connection và normalization.
        </p>
        <div className="my-6 overflow-x-auto border border-border bg-card p-4">
          <div className="flex min-w-[680px] items-center gap-2 font-mono text-xs">
            {['Input x', 'Norm', 'Attention', '+ x', 'Norm', 'FFN', '+ residual', 'Output'].map((item, index, items) => (
              <div key={`${item}-${index}`} className="contents">
                <span className={`border px-3 py-3 ${item.includes('+') ? 'border-primary bg-primary-soft text-primary-dark' : 'border-border bg-surface text-ink'}`}>{item}</span>
                {index < items.length - 1 ? <span className="text-primary">→</span> : null}
              </div>
            ))}
          </div>
        </div>
        <p>
          Pre-norm đặt normalization trước attention/FFN; post-norm đặt sau residual. Pre-norm thường giúp gradient ổn
          định hơn khi xếp nhiều layer, nhưng lựa chọn thực tế còn tùy họ model.
        </p>
      </ArticleSection>

      <ArticleSection id="multi-head-attention" number="5" title="Multi-head attention trong block">
        <p>
          Với model dimension D và H head, mỗi head thường xử lý vector kích thước <code className="inline-code">D/H</code>.
          Các head tính attention song song, nối output lại thành D chiều rồi đi qua output projection.
        </p>
        <pre className="my-5 overflow-x-auto border border-code-border bg-code p-4 font-mono text-sm leading-7 text-code-foreground">
          <code>{`Q, K, V: [B, T, D]\nreshape: [B, H, T, D/H]\nscores:  [B, H, T, T]\noutput:  [B, T, D]`}</code>
        </pre>
        <p>
          Shape <code className="inline-code">[B, H, T, T]</code> giải thích vì sao attention matrix tốn memory khi T
          lớn. Multi-head không làm mất dimension tổng, nhưng tạo nhiều không gian so khớp độc lập.
        </p>
      </ArticleSection>

      <ArticleSection id="feed-forward" number="6" title="Feed-forward network xử lý từng token">
        <p>
          Sau khi attention trao đổi thông tin giữa vị trí, FFN áp dụng cùng một MLP lên từng token. Cấu trúc phổ biến là
          mở rộng D lên <code className="inline-code">Dff</code>, dùng activation rồi chiếu về D. GELU, SwiGLU và các gated
          activation thường xuất hiện trong model hiện đại.
        </p>
        <div className="my-6 border-l-2 border-primary bg-primary-soft px-4 py-3 font-mono text-sm leading-7 text-primary-dark">
          FFN(x) = W₂ · activation(W₁x + b₁) + b₂
        </div>
        <p>
          Attention trộn thông tin giữa token; FFN trộn thông tin giữa các feature bên trong từng token. Hai phép biến đổi
          đảm nhận hai loại tương tác khác nhau.
        </p>
      </ArticleSection>

      <ArticleSection id="ba-ho-transformer" number="7" title="Encoder-only, decoder-only và encoder–decoder">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="border border-border bg-card p-5">
            <p className="font-mono text-xs font-semibold text-primary">ENCODER-ONLY</p>
            <h3 className="mt-2 text-base font-semibold text-ink">Hiểu input</h3>
            <p className="mt-2 text-sm leading-6">Bidirectional self-attention. Phù hợp classification, retrieval, embedding và token labeling.</p>
          </div>
          <div className="border border-border bg-card p-5">
            <p className="font-mono text-xs font-semibold text-primary">DECODER-ONLY</p>
            <h3 className="mt-2 text-base font-semibold text-ink">Sinh tiếp chuỗi</h3>
            <p className="mt-2 text-sm leading-6">Causal self-attention. Dự đoán token kế tiếp và là cấu trúc phổ biến của LLM.</p>
          </div>
          <div className="border border-border bg-card p-5">
            <p className="font-mono text-xs font-semibold text-primary">ENCODER–DECODER</p>
            <h3 className="mt-2 text-base font-semibold text-ink">Biến đổi chuỗi</h3>
            <p className="mt-2 text-sm leading-6">Cross-attention nối source với target. Phù hợp dịch, tóm tắt và speech-to-text.</p>
          </div>
        </div>
      </ArticleSection>

      <ArticleSection id="training-va-generation" number="8" title="Training song song, generation tuần tự">
        <p>
          Khi training decoder, teacher forcing cung cấp toàn bộ target đã dịch phải một vị trí. Causal mask bảo đảm token
          không nhìn đáp án tương lai, nhưng GPU vẫn tính các vị trí cùng lúc. Khi inference, token kế tiếp chưa tồn tại nên
          model phải sinh tuần tự.
        </p>
        <p>
          KV cache lưu Key và Value của token cũ để mỗi bước không tính lại toàn bộ prefix. Cache giúp generation nhanh hơn
          nhưng tiêu thụ memory theo số layer, số token, số KV head và head dimension.
        </p>
      </ArticleSection>

      <ArticleSection id="transformer-pytorch" number="9" title="Một Transformer encoder bằng PyTorch">
        <p>
          Ví dụ này giả sử token đã được embedding và cộng positional information. Padding mask đánh dấu vị trí không nên
          tham gia attention.
        </p>
        <pre className="my-5 overflow-x-auto border border-code-border bg-code p-4 font-mono text-sm leading-7 text-code-foreground">
          <code>{encoderCode}</code>
        </pre>
        <p>
          Điều kiện quan trọng là <code className="inline-code">d_model</code> chia hết cho <code className="inline-code">nhead</code>.
          Output giữ nguyên T và D; muốn classification toàn chuỗi, mình cần pooling, CLS token hoặc một head lấy representation phù hợp.
        </p>
      </ArticleSection>

      <ArticleSection id="trade-off" number="10" title="Điểm mạnh và giới hạn">
        <p>
          Transformer kết nối dependency xa trực tiếp, scale tốt với dữ liệu và compute, đồng thời dùng chung khung cho text,
          ảnh, âm thanh và multimodal. Nhưng model lớn cần nhiều dữ liệu, attention dài tốn memory và generation vẫn chịu độ
          trễ tuần tự theo số token output.
        </p>
        <p>
          Cách mình ghi nhớ: attention là phép trao đổi thông tin; Transformer là hệ thống đóng gói phép trao đổi đó cùng
          FFN, residual và normalization thành block có thể lặp sâu. Hiểu từng block giúp mình đọc kiến trúc model mới mà
          không xem nó như một hộp đen duy nhất.
        </p>
      </ArticleSection>

      <ArticleSection id="tai-lieu" number="11" title="Đọc thêm">
        <ul className="space-y-3">
          <ReferenceLink href="https://arxiv.org/abs/1706.03762" label="Vaswani et al. — Attention Is All You Need" />
        </ul>
      </ArticleSection>
    </ArticleShell>
  );
}
