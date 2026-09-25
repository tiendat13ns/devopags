import type { Metadata } from 'next';
import { Braces, CheckCircle2, Database, Network, ScanLine, Shapes } from 'lucide-react';
import { ArticleIntro, ArticleSection, ArticleShell } from '@/components/article-shell';
import { DataRepresentationExplorer } from '@/components/data-representation-explorer';

export const metadata: Metadata = {
  title: 'Dữ liệu đi vào mạng dưới dạng gì? Vector, tensor, token, embedding và graph | tiendat13ns',
  description: 'Cách dữ liệu ảnh, text, bảng và graph được biến thành vector, tensor, token ID, embedding và cấu trúc số trước khi đi vào neural network.',
};

const modalities = [
  ['Tabular', 'Hàng dữ liệu', '[batch, features]', 'Chuẩn hóa số, encode category, xử lý missing value'],
  ['Ảnh', 'Pixel RGB', '[batch, channel, height, width]', 'Resize, normalize, augmentation'],
  ['Văn bản', 'Token IDs + attention mask', '[batch, sequence]', 'Tokenize, pad, truncate'],
  ['Audio', 'Waveform hoặc spectrogram', '[batch, time] / [batch, freq, time]', 'Resample, window, normalize'],
  ['Graph', 'Node features + edge index', '[nodes, features] + [2, edges]', 'Tạo node, edge, feature và batch mapping'],
];

export default function DataIntoNetworkArticlePage() {
  return (
    <ArticleShell currentHref="/bai-viet/du-lieu-vao-mang-vector-tensor-token-embedding-graph">
      <ArticleIntro
        eyebrow="Deep Learning · Data Representation"
        title="Dữ liệu đi vào mạng dưới dạng gì?"
        description="Model không nhìn thấy ảnh, câu chữ hay user như mình nhìn thấy. Trước khi forward pass bắt đầu, mọi thứ phải được biểu diễn bằng số với shape, dtype và cấu trúc mà architecture hiểu được."
        date="22/09/2026"
        readTime="14 phút đọc"
        tags={['AI', 'Deep Learning', 'Data']}
      />

      <div className="mb-2 grid gap-4 border border-primary/20 bg-primary-soft p-5 sm:grid-cols-[auto_1fr] sm:p-6">
        <Database className="text-primary" size={24} />
        <p className="text-sm leading-7 text-muted-foreground">
          Cách mình ghi nhớ pipeline: <strong className="text-ink">raw data → numerical representation → batch tensor → model.</strong> Vector, token hay graph không cạnh tranh với nhau; chúng mô tả các lớp biểu diễn khác nhau trong pipeline.
        </p>
      </div>

      <ArticleSection id="model-chi-thay-so" number="1" title="Model cuối cùng chỉ nhận các con số">
        <p>
          Một file ảnh trên disk là chuỗi byte; một câu tiếng Việt là chuỗi ký tự; một user trong database là một record. Neural network không dùng trực tiếp ý nghĩa mà con người gán cho chúng. Data pipeline phải chuyển chúng thành các giá trị số và sắp xếp đúng cấu trúc.
        </p>

        <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center">
          <div className="border border-border bg-card p-4">
            <span className="font-mono text-[10px] text-primary">RAW</span>
            <strong className="mt-2 block text-ink">Ảnh · text · record</strong>
            <p className="mt-1 text-sm">Dữ liệu theo góc nhìn ứng dụng.</p>
          </div>
          <span className="hidden font-mono text-primary sm:block">→</span>
          <div className="border border-primary/40 bg-primary-soft p-4">
            <span className="font-mono text-[10px] text-primary">ENCODE</span>
            <strong className="mt-2 block text-ink">Parse · tokenize · normalize</strong>
            <p className="mt-1 text-sm">Biến ý nghĩa thành cấu trúc số.</p>
          </div>
          <span className="hidden font-mono text-primary sm:block">→</span>
          <div className="border border-primary bg-primary p-4 text-primary-foreground">
            <span className="font-mono text-[10px] opacity-75">MODEL INPUT</span>
            <strong className="mt-2 block">Tensor + metadata</strong>
            <p className="mt-1 text-sm opacity-90">Shape và dtype đã cố định.</p>
          </div>
        </div>

        <p>
          Việc chọn representation quyết định model giữ lại thông tin nào và bỏ đi thông tin nào. Nếu encode sai, model có thể chạy bình thường nhưng học từ một phiên bản méo mó của dữ liệu — loại bug này khó phát hiện hơn lỗi shape vì không có exception.
        </p>
      </ArticleSection>

      <ArticleSection id="shape-dtype" number="2" title="Ba thứ mình kiểm tra trước khi đưa dữ liệu vào model">
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { icon: Shapes, title: 'Shape', text: 'Số chiều và kích thước từng chiều: batch, sequence, channel, height, width hoặc feature.' },
            { icon: Braces, title: 'Dtype', text: 'float32 cho feature/weight, integer cho token ID hoặc label; dtype ảnh hưởng bộ nhớ và phép toán.' },
            { icon: Database, title: 'Scale', text: 'Phạm vi giá trị và phân phối: pixel 0–255, feature đã normalize hay embedding đã học.' },
          ].map(({ icon: Icon, title, text }) => (
            <div className="border border-border bg-card p-4" key={title}><Icon className="text-primary" size={19} /><h3 className="mt-3 font-semibold text-ink">{title}</h3><p className="mt-2 text-sm leading-6">{text}</p></div>
          ))}
        </div>
        <div className="border border-code-border bg-code p-5 font-mono text-sm leading-7 text-code-foreground">
          <p>images.shape     = [32, 3, 224, 224]</p>
          <p>input_ids.shape  = [32, 128]</p>
          <p>features.dtype   = float32</p>
          <p>input_ids.dtype  = int64</p>
          <p>device           = cuda:0</p>
        </div>
        <p>
          Batch dimension thường đứng đầu để model xử lý nhiều sample song song. Nhưng một số framework hoặc API dùng thứ tự khác, nên mình không đoán theo thói quen; mình đọc contract của layer và in shape tại ranh giới pipeline.
        </p>
      </ArticleSection>

      <ArticleSection id="explorer" number="3" title="Khám phá từng dạng biểu diễn">
        <p>
          Chuyển giữa năm tab để xem cấu trúc, shape và ý nghĩa của mỗi representation. Một pipeline có thể đi qua nhiều tab: text bắt đầu bằng token ID, sau đó embedding layer biến ID thành tensor vector liên tục.
        </p>
        <DataRepresentationExplorer />
      </ArticleSection>

      <ArticleSection id="vector-tensor" number="4" title="Vector và tensor khác nhau thế nào?">
        <p>
          <strong className="text-ink">Vector</strong> là một dãy số một chiều. Một server có thể được mô tả bằng vector <code className="inline-code">[cpu, ram, latency, error_rate]</code>. <strong className="text-ink">Tensor</strong> là tên tổng quát cho mảng nhiều chiều; vector và matrix đều là tensor ở số chiều thấp hơn.
        </p>
        <div className="grid gap-px border border-border bg-border sm:grid-cols-4">
          {[
            ['Scalar', '0D', '42'],
            ['Vector', '1D', '[0.2, 0.8, -0.1]'],
            ['Matrix', '2D', '[rows, columns]'],
            ['Tensor', 'nD', '[batch, channel, H, W]'],
          ].map(([name, rank, example]) => (
            <div className="bg-card p-4" key={name}><span className="font-mono text-[10px] text-primary">{rank}</span><h3 className="mt-2 font-semibold text-ink">{name}</h3><code className="mt-2 block break-words font-mono text-xs text-muted-foreground">{example}</code></div>
          ))}
        </div>
        <p>
          Tensor không tự mang ý nghĩa. Tensor shape <code className="inline-code">[32, 128, 768]</code> chỉ trở nên rõ khi mình biết đó là 32 sample, mỗi sample 128 token và mỗi token có embedding dimension 768.
        </p>
      </ArticleSection>

      <ArticleSection id="token" number="5" title="Token là đơn vị; token ID là con số tra cứu">
        <p>
          Tokenizer chia text thành các đơn vị có thể là từ, một phần của từ, dấu câu hoặc byte. Sau đó vocabulary ánh xạ token sang integer ID. Cùng một câu có thể tạo token khác nhau nếu dùng tokenizer khác.
        </p>
        <div className="border border-border bg-card p-5">
          <p className="font-mono text-xs text-primary">“deploying”</p>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
            <span className="border border-border bg-background px-3 py-2">deploy</span>
            <span className="text-primary">+</span>
            <span className="border border-border bg-background px-3 py-2">ing</span>
            <span className="text-primary">→</span>
            <code className="border border-primary/30 bg-primary-soft px-3 py-2 font-mono text-primary">[18432, 287]</code>
          </div>
        </div>
        <p>
          Sequence trong cùng batch thường phải dài bằng nhau. Pipeline dùng <strong className="text-ink">padding</strong> để bù vị trí thiếu và <strong className="text-ink">attention mask</strong> để model biết token nào là dữ liệu thật. Truncate quá ngắn có thể cắt mất thông tin quan trọng; để quá dài lại tăng memory và compute.
        </p>
      </ArticleSection>

      <ArticleSection id="embedding" number="6" title="Embedding biến ID rời rạc thành không gian liên tục">
        <p>
          Token ID không có khoảng cách ngữ nghĩa: ID 100 không gần ID 101 hơn ID 9. Embedding layer dùng ID như index để lấy một vector được học. Vector này có thể tham gia phép nhân ma trận, attention và tính similarity.
        </p>
        <div className="overflow-x-auto border border-code-border bg-code p-5 text-code-foreground">
          <pre className="font-mono text-sm leading-7"><code>{`token_ids.shape  = [batch, sequence]
embedding_table  = [vocab_size, embedding_dim]
embeddings.shape = [batch, sequence, embedding_dim]`}</code></pre>
        </div>
        <p>
          Embedding không chỉ dành cho text. User ID, product ID, category hoặc node trong graph đều có thể có embedding. Ý nghĩa hình học của embedding được hình thành từ objective training: hai vector gần nhau vì model học rằng chúng hữu ích theo cùng một cách, không phải vì ta gán nghĩa thủ công.
        </p>
      </ArticleSection>

      <ArticleSection id="graph" number="7" title="Graph cần node, edge và feature">
        <p>
          Với dữ liệu quan hệ, chỉ xếp tất cả node thành matrix là chưa đủ vì model cần biết node nào kết nối với node nào. Một graph input thường gồm:
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ['Node features', 'Matrix [num_nodes, num_features] mô tả từng node.'],
            ['Edge index', 'Các cặp source → target hoặc adjacency matrix mô tả kết nối.'],
            ['Graph metadata', 'Edge feature, graph label và batch index khi ghép nhiều graph.'],
          ].map(([title, text]) => (
            <div className="border border-border bg-card p-4" key={title}><Network className="text-primary" size={18} /><h3 className="mt-3 font-semibold text-ink">{title}</h3><p className="mt-2 text-sm leading-6">{text}</p></div>
          ))}
        </div>
        <p>
          Ví dụ hệ thống recommendation: user và item là node, lượt click hoặc mua hàng là edge. GNN có thể tổng hợp thông tin từ hàng xóm để cập nhật embedding của từng node trước khi dự đoán user sẽ quan tâm item nào.
        </p>
      </ArticleSection>

      <ArticleSection id="modality" number="8" title="Mỗi loại dữ liệu có một pipeline khác nhau">
        <div className="overflow-x-auto border border-border bg-card">
          <div className="min-w-[760px]">
            <div className="grid grid-cols-[100px_170px_220px_1fr] border-b border-border bg-surface px-4 py-3 text-sm font-semibold text-ink">
              <span>Loại</span><span>Biểu diễn</span><span>Shape thường gặp</span><span>Tiền xử lý</span>
            </div>
            {modalities.map(([type, representation, shape, preprocessing]) => (
              <div className="grid grid-cols-[100px_170px_220px_1fr] border-b border-border px-4 py-4 text-sm leading-6 last:border-b-0" key={type}>
                <strong className="text-primary">{type}</strong><span>{representation}</span><code className="font-mono text-xs text-ink">{shape}</code><span>{preprocessing}</span>
              </div>
            ))}
          </div>
        </div>
        <p>
          Architecture thường đi cùng assumption về representation. CNN tận dụng cấu trúc không gian của ảnh; Transformer làm việc với sequence embedding và mask; GNN dùng edge để truyền message. Đưa đúng số nhưng sai cấu trúc cũng giống như gọi đúng API với sai schema.
        </p>
      </ArticleSection>

      <ArticleSection id="production" number="9" title="Những thứ dễ lệch giữa training và inference">
        <div className="space-y-3">
          {[
            'Tokenizer, vocabulary và special token phải cùng version với lúc training.',
            'Thứ tự feature của vector phải cố định; thêm cột mới không được làm dịch vị trí cột cũ.',
            'Mean, standard deviation, resize và normalization phải dùng cùng cấu hình.',
            'Dtype, device và batch dimension phải đúng với model contract.',
            'Padding, mask, unknown category và missing value cần được xử lý giống nhau.',
            'Schema và preprocessing config nên được version cùng model artifact.',
          ].map((item) => (
            <div className="flex gap-3 border border-border bg-card px-4 py-3" key={item}><CheckCircle2 className="mt-1 shrink-0 text-primary" size={17} /><p className="text-sm leading-6">{item}</p></div>
          ))}
        </div>
        <div className="mt-5 flex gap-3 border-l-2 border-primary bg-primary-soft px-5 py-4">
          <ScanLine className="mt-1 shrink-0 text-primary" size={19} />
          <p className="text-sm leading-7">
            Khi model lỗi ở production, mình kiểm tra input contract trước: sample raw, output sau preprocessing, shape, dtype và thống kê phân phối. Nhiều “lỗi model” thực tế là training–serving skew trong data pipeline.
          </p>
        </div>
      </ArticleSection>
    </ArticleShell>
  );
}
