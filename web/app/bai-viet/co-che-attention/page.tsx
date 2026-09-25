import type { Metadata } from 'next';
import { ArticleIntro, ArticleSection, ArticleShell, ReferenceLink } from '@/components/article-shell';
import { AttentionWeightExplorer } from '@/components/attention-weight-explorer';

export const metadata: Metadata = {
  title: 'Cơ chế Attention | tiendat13ns',
  description:
    'Cách mình hiểu attention: Query, Key, Value, scaled dot-product, self-attention, cross-attention, mask và multi-head attention.',
};

const attentionCode = `import torch
import torch.nn.functional as F

def scaled_dot_product_attention(q, k, v, mask=None):
    d_k = q.size(-1)
    scores = q @ k.transpose(-2, -1) / (d_k ** 0.5)

    if mask is not None:
        scores = scores.masked_fill(mask == 0, float('-inf'))

    weights = F.softmax(scores, dim=-1)
    context = weights @ v
    return context, weights`;

export default function AttentionArticle() {
  return (
    <ArticleShell currentHref="/bai-viet/co-che-attention">
      <ArticleIntro
        eyebrow="AI · SEQUENCE MODEL"
        title="Cơ chế Attention"
        description="Attention cho phép mỗi token chủ động tìm những token liên quan, quyết định nên đọc bao nhiêu thông tin từ từng vị trí rồi trộn chúng thành một representation mới."
        date="23/09/2026"
        readTime="15 phút đọc"
        tags={['AI', 'Deep Learning', 'Attention']}
      />

      <ArticleSection id="van-de-cua-mot-vector" number="1" title="Vấn đề khi nén cả chuỗi vào một vector">
        <p>
          Trong encoder–decoder RNN cổ điển, encoder thường phải nén toàn bộ câu nguồn vào final hidden state. Với chuỗi
          dài, một vector cố định trở thành nút thắt: thông tin ở đầu câu phải đi qua nhiều timestep trước khi đến decoder.
        </p>
        <p>
          Attention thay đổi cách làm này. Thay vì chỉ nhận một bản tóm tắt, decoder có thể nhìn lại toàn bộ output của
          encoder và chọn phần liên quan cho từng token đang sinh. Sau đó ý tưởng này được mở rộng thành self-attention,
          nơi các token trong cùng một chuỗi đọc lẫn nhau.
        </p>
      </ArticleSection>

      <ArticleSection id="truc-giac-attention" number="2" title="Trực giác: tìm, so khớp và lấy thông tin">
        <p>
          Mình ghi nhớ attention bằng ba câu hỏi. <strong>Query</strong> mô tả thông tin token hiện tại đang tìm.
          <strong> Key</strong> mô tả mỗi token có thể được tìm thấy bằng đặc điểm nào. <strong>Value</strong> là nội dung
          thực sự được lấy về nếu Query và Key phù hợp.
        </p>
        <AttentionWeightExplorer />
        <p>
          Các phần trăm trong mô phỏng chỉ dùng để minh họa. Trong model thật, Q, K và V là vector được tạo bởi ba phép
          chiếu tuyến tính có parameter học được. Attention weight cũng thay đổi theo input và theo từng layer.
        </p>
      </ArticleSection>

      <ArticleSection id="q-k-v" number="3" title="Q, K và V được tạo ra thế nào?">
        <p>
          Giả sử input embedding là ma trận <code className="inline-code">X ∈ ℝᵀˣᴰ</code>. Model nhân X với ba ma trận
          weight khác nhau:
        </p>
        <pre className="my-5 overflow-x-auto border border-code-border bg-code p-4 font-mono text-sm leading-7 text-code-foreground">
          <code>{`Q = XWq\nK = XWk\nV = XWv`}</code>
        </pre>
        <p>
          Khi self-attention, Q, K và V cùng xuất phát từ một chuỗi. Với cross-attention, Q thường đến từ decoder còn K,
          V đến từ encoder output. Tách ba vai trò này giúp model học một không gian để so khớp và một không gian khác để
          mang nội dung.
        </p>
      </ArticleSection>

      <ArticleSection id="scaled-dot-product" number="4" title="Scaled dot-product attention">
        <p>
          Attention lấy dot product giữa từng Query và tất cả Key. Điểm càng lớn nghĩa là hai vector càng phù hợp. Softmax
          đổi score thành trọng số có tổng bằng 1, rồi dùng các trọng số đó để lấy weighted sum của Value.
        </p>
        <pre className="my-5 overflow-x-auto border border-code-border bg-code p-4 font-mono text-sm leading-7 text-code-foreground">
          <code>{`Attention(Q, K, V) = softmax(QKᵀ / √dₖ)V`}</code>
        </pre>
        <p>
          Chia cho <code className="inline-code">√dₖ</code> giữ score không tăng quá lớn khi chiều vector tăng. Nếu score
          quá lớn, softmax dễ bão hòa, xác suất gần như dồn hết vào một vị trí và gradient trở nên kém hữu ích.
        </p>
      </ArticleSection>

      <ArticleSection id="self-va-cross-attention" number="5" title="Self-attention và cross-attention">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="border border-border bg-card p-5">
            <p className="font-mono text-xs font-semibold text-primary">SELF-ATTENTION</p>
            <h3 className="mt-2 text-base font-semibold text-ink">Một chuỗi đọc chính nó</h3>
            <p className="mt-2 text-sm leading-6">Q, K, V cùng đến từ input. Mỗi token tạo representation có ngữ cảnh từ các token còn lại.</p>
          </div>
          <div className="border border-border bg-card p-5">
            <p className="font-mono text-xs font-semibold text-primary">CROSS-ATTENTION</p>
            <h3 className="mt-2 text-base font-semibold text-ink">Một chuỗi đọc chuỗi khác</h3>
            <p className="mt-2 text-sm leading-6">Q đến từ decoder; K, V đến từ encoder hoặc nguồn dữ liệu khác.</p>
          </div>
        </div>
      </ArticleSection>

      <ArticleSection id="attention-mask" number="6" title="Mask quyết định token được phép nhìn đâu">
        <p>
          Padding mask chặn các vị trí padding để chúng không đóng góp vào context. Causal mask chặn token tương lai:
          khi dự đoán token thứ t, model chỉ được nhìn các vị trí từ 1 đến t. Cách triển khai phổ biến là đặt score bị chặn
          thành âm vô cùng trước softmax, khiến attention weight tại đó bằng 0.
        </p>
        <div className="my-6 overflow-x-auto border border-border bg-card p-4">
          <div className="grid min-w-[500px] grid-cols-5 gap-1 font-mono text-center text-xs">
            {Array.from({ length: 25 }, (_, index) => {
              const row = Math.floor(index / 5);
              const column = index % 5;
              const allowed = column <= row;
              return (
                <div key={index} className={`border px-2 py-3 ${allowed ? 'border-primary/40 bg-primary-soft text-primary-dark' : 'border-border bg-surface text-muted-foreground'}`}>
                  {allowed ? 'đọc' : 'mask'}
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-sm text-muted-foreground">Causal mask tạo ma trận tam giác dưới: mỗi hàng chỉ nhìn chính nó và quá khứ.</p>
        </div>
      </ArticleSection>

      <ArticleSection id="multi-head" number="7" title="Multi-head attention">
        <p>
          Một attention head chỉ tạo một kiểu không gian Q–K–V. Multi-head attention chia representation thành nhiều
          head, để các head có thể học những quan hệ khác nhau: token gần nhau, quan hệ cú pháp, tham chiếu xa hoặc pattern
          theo domain. Output của các head được nối lại rồi chiếu qua một linear layer.
        </p>
        <p>
          Không nên hiểu mỗi head luôn có một ý nghĩa cố định và dễ gọi tên. Một số pattern có thể quan sát được, nhưng
          representation thường phân tán qua nhiều head và layer.
        </p>
      </ArticleSection>

      <ArticleSection id="chi-phi" number="8" title="Attention đổi memory lấy khả năng nhìn xa">
        <p>
          Full self-attention tạo ma trận score kích thước T × T, nên chi phí theo chiều dài chuỗi thường là
          <code className="inline-code">O(T²)</code>. Đổi lại, mỗi token có đường kết nối trực tiếp tới mọi token khác và
          các vị trí có thể được tính song song khi training.
        </p>
        <p>
          Với context dài, ma trận attention có thể chiếm nhiều memory hơn parameter của layer. FlashAttention, local
          attention, sliding window và sparse attention là các hướng tối ưu cách tính hoặc giới hạn số cặp token cần xét.
        </p>
      </ArticleSection>

      <ArticleSection id="code-attention" number="9" title="Attention tối giản bằng PyTorch">
        <p>
          Đoạn code dưới đây bộc lộ đúng bốn bước: tính score, scale, áp mask, softmax rồi trộn Value. Code production còn
          cần xử lý nhiều head, dropout, dtype và kernel tối ưu.
        </p>
        <pre className="my-5 overflow-x-auto border border-code-border bg-code p-4 font-mono text-sm leading-7 text-code-foreground">
          <code>{attentionCode}</code>
        </pre>
      </ArticleSection>

      <ArticleSection id="ghi-nho-attention" number="10" title="Cách mình ghi nhớ Attention">
        <p>
          Attention không phải một database search và attention weight không tự động là lời giải thích hoàn chỉnh cho dự
          đoán. Về mặt tính toán, nó là phép trộn Value có trọng số; các trọng số được sinh từ độ phù hợp giữa Query và Key.
          Điểm mạnh nằm ở việc quan hệ được tạo theo từng input, thay vì bị cố định bởi khoảng cách timestep như RNN.
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
