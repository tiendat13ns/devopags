import type { Metadata } from 'next';
import { ArticleIntro, ArticleSection, ArticleShell, ReferenceLink } from '@/components/article-shell';
import { AttentionWeightExplorer } from '@/components/attention-weight-explorer';

export const metadata: Metadata = {
  title: 'Cơ chế Attention | tiendat13ns',
  description:
    'Cách mình hiểu Attention từ Query, Key, Value, scaled dot-product và masking đến multi-head attention, shape tensor và giới hạn khi diễn giải attention weight.',
};

const attentionCode = `import math
import torch
import torch.nn.functional as F

def attention(q, k, v, mask=None):
    # q: [B, H, Tq, Dh]
    # k: [B, H, Tk, Dh]
    # v: [B, H, Tk, Dv]
    scores = q @ k.transpose(-2, -1)
    scores = scores / math.sqrt(q.size(-1))

    if mask is not None:
        scores = scores.masked_fill(~mask, float("-inf"))

    weights = F.softmax(scores, dim=-1)
    context = weights @ v
    return context, weights

# Khi không cần lấy weights thủ công:
context = F.scaled_dot_product_attention(
    q, k, v, attn_mask=mask, dropout_p=0.0
)`;

export default function AttentionArticle() {
  return (
    <ArticleShell currentHref="/bai-viet/co-che-attention">
      <ArticleIntro
        eyebrow="DEEP LEARNING · SEQUENCE MODEL"
        title="Cơ chế Attention"
        description="Attention không phải phép tìm kiếm bí ẩn. Nó chấm điểm độ phù hợp giữa Query và Key, chuẩn hóa điểm thành trọng số rồi dùng chúng để trộn các Value thành representation mới."
        date="25/09/2026"
        readTime="18 phút đọc"
        tags={['AI', 'Deep Learning', 'Attention']}
      />

      <ArticleSection id="tai-sao-can-attention" number="1" title="Nút thắt của một vector cố định">
        <p>
          Trong encoder–decoder RNN đời đầu, encoder phải nén cả câu nguồn vào final hidden state. Câu càng dài, vector cố
          định này càng phải gánh nhiều thông tin; chi tiết ở đầu câu còn phải đi qua rất nhiều timestep mới tới được decoder.
        </p>
        <p>
          Bahdanau và cộng sự thay cách truyền thông tin đó bằng một phép <strong>soft search</strong>: ở mỗi bước sinh,
          decoder nhìn lại toàn bộ encoder state và lấy nhiều hay ít thông tin từ từng vị trí. Attention ban đầu vì thế là
          một lối thoát khỏi bottleneck của fixed-length context, trước khi trở thành thành phần trung tâm của Transformer.
        </p>
        <div className="my-6 grid gap-px border border-border bg-border md:grid-cols-2">
          <div className="bg-card p-5">
            <p className="font-mono text-xs font-semibold text-primary">KHÔNG ATTENTION</p>
            <p className="mt-3 font-mono text-sm text-ink">source → một context vector → decoder</p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">Mọi thông tin phải đi qua cùng một nút thắt.</p>
          </div>
          <div className="bg-card p-5">
            <p className="font-mono text-xs font-semibold text-primary">CÓ ATTENTION</p>
            <p className="mt-3 font-mono text-sm text-ink">query → so khớp toàn bộ memory → context</p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">Mỗi bước tự chọn phần memory liên quan.</p>
          </div>
        </div>
      </ArticleSection>

      <ArticleSection id="query-key-value" number="2" title="Query hỏi, Key để so khớp, Value mang nội dung">
        <p>
          Mình ghi nhớ Q–K–V bằng một API tìm kiếm. <strong>Query</strong> mô tả thứ đang cần; <strong>Key</strong> mô tả
          đặc điểm có thể dùng để đối chiếu; <strong>Value</strong> là payload thực sự được lấy về. Query không trực tiếp
          trộn với Value: nó dùng Key để quyết định mỗi Value đóng góp bao nhiêu.
        </p>
        <AttentionWeightExplorer />
        <p>
          Các tỷ lệ trong mô phỏng chỉ để nhìn luồng tính toán. Trong model thật, Q, K và V là vector được tạo bởi ba phép
          chiếu tuyến tính có parameter học được, nên attention pattern thay đổi theo input, head và layer.
        </p>
      </ArticleSection>

      <ArticleSection id="qkv-tu-input" number="3" title="Từ embedding tới ma trận Q, K và V">
        <p>
          Với input <code className="inline-code">X ∈ ℝᴮˣᵀˣᴰ</code>, self-attention tạo ba representation:
        </p>
        <pre className="my-5 overflow-x-auto border border-code-border bg-code p-4 font-mono text-sm leading-7 text-code-foreground">
          <code>{`Q = XWq
K = XWk
V = XWv`}</code>
        </pre>
        <div className="my-6 overflow-x-auto border border-border bg-card">
          <table className="w-full min-w-[680px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-primary-soft text-primary-dark">
                <th className="px-4 py-3">Tensor</th>
                <th className="px-4 py-3">Shape theo từng head</th>
                <th className="px-4 py-3">Ý nghĩa</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Q', '[B, H, Tq, Dh]', 'Mỗi query token đang cần gì'],
                ['K', '[B, H, Tk, Dh]', 'Mỗi memory position có đặc điểm gì'],
                ['QKᵀ', '[B, H, Tq, Tk]', 'Score giữa mọi cặp query–key'],
                ['softmax(score)', '[B, H, Tq, Tk]', 'Trọng số trên trục key'],
                ['Attention output', '[B, H, Tq, Dv]', 'Weighted sum của Value'],
              ].map((row) => (
                <tr key={row[0]} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-mono font-semibold text-primary">{row[0]}</td>
                  <td className="px-4 py-3 font-mono text-muted-foreground">{row[1]}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Self-attention có <code className="inline-code">Tq = Tk</code>. Cross-attention không bắt buộc như vậy: số query
          của decoder có thể khác số key/value trong encoder memory.
        </p>
      </ArticleSection>

      <ArticleSection id="scaled-dot-product" number="4" title="Scaled dot-product attention theo từng bước">
        <p>
          Công thức trong paper gốc gói bốn thao tác vào một dòng:
        </p>
        <div className="my-6 border border-border bg-card p-5 text-center font-mono text-base text-primary">
          Attention(Q, K, V) = softmax(QKᵀ / √dₖ)V
        </div>
        <ol className="space-y-3 pl-5">
          <li><strong>Dot product:</strong> đo độ phù hợp giữa từng Query với tất cả Key.</li>
          <li><strong>Scale:</strong> chia score cho √dₖ để giữ độ lớn ổn định khi head dimension tăng.</li>
          <li><strong>Softmax:</strong> đổi mỗi hàng score thành phân phối có tổng bằng 1.</li>
          <li><strong>Weighted sum:</strong> dùng phân phối đó để trộn các Value.</li>
        </ol>
        <p>
          Nếu các thành phần của q và k có mean 0, variance 1 và gần độc lập, dot product có variance xấp xỉ dₖ. Không
          scale, dₖ càng lớn thì score càng dễ đẩy softmax vào vùng gần one-hot, nơi gradient rất nhỏ. Chia cho √dₖ đưa
          variance về thang dễ tối ưu hơn.
        </p>
      </ArticleSection>

      <ArticleSection id="ba-cach-dung-attention" number="5" title="Ba cách Attention xuất hiện trong Transformer gốc">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="border border-border bg-card p-5">
            <p className="font-mono text-xs font-semibold text-primary">ENCODER</p>
            <h3 className="mt-2 text-base font-semibold text-ink">Self-attention</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Q, K, V cùng đến từ encoder layer trước; mọi input position có thể đọc nhau.</p>
          </div>
          <div className="border border-border bg-card p-5">
            <p className="font-mono text-xs font-semibold text-primary">DECODER</p>
            <h3 className="mt-2 text-base font-semibold text-ink">Masked self-attention</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Q, K, V cùng từ decoder nhưng token t không được nhìn vị trí tương lai.</p>
          </div>
          <div className="border border-border bg-card p-5">
            <p className="font-mono text-xs font-semibold text-primary">ENCODER → DECODER</p>
            <h3 className="mt-2 text-base font-semibold text-ink">Cross-attention</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Q từ decoder; K và V là memory do encoder tạo ra.</p>
          </div>
        </div>
      </ArticleSection>

      <ArticleSection id="mask" number="6" title="Mask thay đổi những kết nối được phép tồn tại">
        <p>
          Padding mask loại token đệm khỏi phép trộn. Causal mask chặn tương lai để bài toán next-token prediction không
          nhìn trộm đáp án. Cách phổ biến là cộng âm vô cùng vào score bị chặn trước softmax, khiến weight tại đó về 0.
        </p>
        <div className="my-6 overflow-x-auto border border-border bg-card p-4">
          <div className="grid min-w-[520px] grid-cols-5 gap-1 font-mono text-center text-xs">
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
          <p className="mt-3 text-sm text-muted-foreground">Mỗi hàng là một Query; causal mask chỉ giữ đường chéo và phần bên trái.</p>
        </div>
        <p>
          Khi dùng API, cần đọc kỹ quy ước boolean mask. Chẳng hạn PyTorch SDPA và
          <code className="inline-code">nn.MultiheadAttention</code> dùng ý nghĩa True/False khác nhau cho một số loại mask.
        </p>
      </ArticleSection>

      <ArticleSection id="multi-head" number="7" title="Multi-head tạo nhiều không gian so khớp">
        <p>
          Thay vì một attention trên toàn bộ d_model, model chiếu Q, K, V sang H không gian nhỏ hơn, chạy H head song song,
          nối kết quả và chiếu thêm một lần:
        </p>
        <pre className="my-5 overflow-x-auto border border-code-border bg-code p-4 font-mono text-sm leading-7 text-code-foreground">
          <code>{`headᵢ = Attention(QWqᵢ, KWkᵢ, VWvᵢ)
MultiHead(Q,K,V) = Concat(head₁,…,headₕ)Wo`}</code>
        </pre>
        <p>
          Bản base trong paper dùng d_model = 512, H = 8 và head dimension 64. Nhiều head cho phép model tạo các pattern
          khác nhau ở những representation subspace khác nhau, nhưng không nên gán cứng mỗi head với một “vai trò ngôn
          ngữ” cố định.
        </p>
      </ArticleSection>

      <ArticleSection id="tai-sao-self-attention" number="8" title="Self-attention rút ngắn đường đi giữa token">
        <p>
          Paper so sánh ba yếu tố: chi phí mỗi layer, số phép tính tuần tự và path length lớn nhất giữa hai vị trí. Với full
          self-attention, mọi cặp token kết nối trong một layer và các vị trí được tính song song.
        </p>
        <div className="my-6 overflow-x-auto border border-border bg-card">
          <table className="w-full min-w-[690px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-primary-soft text-primary-dark">
                <th className="px-4 py-3">Layer</th>
                <th className="px-4 py-3">Complexity</th>
                <th className="px-4 py-3">Sequential operations</th>
                <th className="px-4 py-3">Max path</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Self-attention', 'O(n²·d)', 'O(1)', 'O(1)'],
                ['Recurrent', 'O(n·d²)', 'O(n)', 'O(n)'],
                ['Convolutional', 'O(k·n·d²)', 'O(1)', 'O(logₖ n)'],
                ['Restricted attention', 'O(r·n·d)', 'O(1)', 'O(n/r)'],
              ].map((row) => (
                <tr key={row[0]} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-semibold text-ink">{row[0]}</td>
                  <td className="px-4 py-3 font-mono text-muted-foreground">{row[1]}</td>
                  <td className="px-4 py-3 font-mono text-muted-foreground">{row[2]}</td>
                  <td className="px-4 py-3 font-mono text-muted-foreground">{row[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Đổi lại, score matrix có kích thước T × T. Context dài làm compute tăng bậc hai và bản triển khai ngây thơ còn
          materialize ma trận lớn trong memory.
        </p>
      </ArticleSection>

      <ArticleSection id="attention-khong-phai-giai-thich" number="9" title="Attention weight không tự động là lời giải thích">
        <p>
          Heatmap attention rất hữu ích để quan sát model đang kết nối vị trí nào. Paper gốc cũng cho thấy một số head bám
          dependency xa hoặc pattern cú pháp. Nhưng weight cao không chứng minh token đó là nguyên nhân của prediction.
        </p>
        <p>
          Nghiên cứu sau đó tìm thấy attention weight có thể ít tương quan với gradient-based importance, và những phân
          phối attention rất khác nhau đôi khi vẫn cho output gần tương đương. Vì vậy mình dùng attention map như một
          tín hiệu chẩn đoán, không dùng nó một mình để kết luận model “đã suy luận như con người”.
        </p>
      </ArticleSection>

      <ArticleSection id="code-attention" number="10" title="Attention tối giản bằng PyTorch">
        <p>
          Bản thủ công dưới đây để nhìn rõ phép tính. Trong code thực tế, API
          <code className="inline-code">scaled_dot_product_attention</code> có thể chọn kernel fused phù hợp với input và
          phần cứng, thay vì bắt buộc tạo đầy đủ các tensor trung gian theo cách ngây thơ.
        </p>
        <pre className="my-5 overflow-x-auto border border-code-border bg-code p-4 font-mono text-sm leading-7 text-code-foreground">
          <code>{attentionCode}</code>
        </pre>
      </ArticleSection>

      <ArticleSection id="flash-attention" number="11" title="FlashAttention tối ưu đường đi của dữ liệu, không đổi công thức">
        <p>
          FlashAttention vẫn tính exact attention. Điểm mới là chia phép tính thành tile để giảm số lần đọc/ghi giữa HBM
          và SRAM trên GPU. Nó giải quyết bottleneck I/O và tránh materialize toàn bộ attention matrix trong memory,
          nhưng số cặp query–key của full attention vẫn tăng theo T².
        </p>
        <p>
          Đây là phân biệt quan trọng: tối ưu kernel có thể giảm memory thực tế và thời gian chạy mà không biến full
          attention thành một thuật toán tuyến tính theo sequence length.
        </p>
      </ArticleSection>

      <ArticleSection id="ghi-nho-attention" number="12" title="Cách mình ghi nhớ Attention">
        <p>
          Query chọn góc nhìn, Key cung cấp điểm đối chiếu, Value mang thông tin. Dot product tạo score, scale giữ softmax
          ổn định, mask loại kết nối không hợp lệ, còn multi-head lặp quy trình trong nhiều representation subspace.
        </p>
        <p>
          Attention là phép trộn thông tin phụ thuộc vào input. Transformer là kiến trúc đặt phép trộn đó cạnh residual,
          normalization và feed-forward network để có thể xếp thành một mạng sâu.
        </p>
      </ArticleSection>

      <ArticleSection id="tai-lieu" number="13" title="Nguồn tham khảo">
        <ul className="space-y-3">
          <ReferenceLink href="https://arxiv.org/abs/1409.0473" label="Bahdanau, Cho & Bengio — Neural Machine Translation by Jointly Learning to Align and Translate" />
          <ReferenceLink href="https://arxiv.org/abs/1706.03762" label="Vaswani et al. — Attention Is All You Need" />
          <ReferenceLink href="https://arxiv.org/abs/1902.10186" label="Jain & Wallace — Attention is not Explanation" />
          <ReferenceLink href="https://arxiv.org/abs/2205.14135" label="Dao et al. — FlashAttention" />
          <ReferenceLink href="https://docs.pytorch.org/docs/main/generated/torch.nn.functional.scaled_dot_product_attention.html" label="PyTorch — scaled_dot_product_attention" />
        </ul>
      </ArticleSection>
    </ArticleShell>
  );
}
