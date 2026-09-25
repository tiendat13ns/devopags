import type { Metadata } from 'next';
import { ArticleIntro, ArticleSection, ArticleShell } from '@/components/article-shell';
import { RnnSequenceExplorer } from '@/components/rnn-sequence-explorer';

export const metadata: Metadata = {
  title: 'Kiến trúc RNN | tiendat13ns',
  description:
    'Cách mình hiểu Recurrent Neural Network: timestep, hidden state, parameter sharing, BPTT, vanishing gradient, LSTM và GRU.',
};

const rnnCode = `import torch
import torch.nn as nn

class LogSequenceClassifier(nn.Module):
    def __init__(self, vocab_size, embedding_dim=64, hidden_size=128):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, embedding_dim)
        self.rnn = nn.GRU(
            input_size=embedding_dim,
            hidden_size=hidden_size,
            batch_first=True
        )
        self.classifier = nn.Linear(hidden_size, 3)

    def forward(self, token_ids):
        x = self.embedding(token_ids)  # [B, T] → [B, T, 64]
        output, hidden = self.rnn(x)
        last_hidden = hidden[-1]       # [B, 128]
        return self.classifier(last_hidden)`;

export default function RnnArchitectureArticle() {
  return (
    <ArticleShell currentHref="/bai-viet/kien-truc-rnn-la-gi">
      <ArticleIntro
        eyebrow="AI · SEQUENCE MODEL"
        title="Kiến trúc RNN"
        description="RNN xử lý dữ liệu theo thứ tự. Ở mỗi bước, mạng không chỉ nhìn input hiện tại mà còn nhận lại hidden state của bước trước — một vector mang theo phần ngữ cảnh đã đọc."
        date="23/09/2026"
        readTime="15 phút đọc"
        tags={['AI', 'Deep Learning', 'RNN']}
      />

      <ArticleSection id="tai-sao-can-rnn" number="1" title="Tại sao dữ liệu tuần tự cần RNN?">
        <p>
          Với dữ liệu bảng, đổi thứ tự các hàng thường không làm thay đổi ý nghĩa của một sample. Nhưng trong câu chữ,
          log hệ thống, âm thanh hay time series, vị trí xuất hiện là một phần của thông tin. “Database restart sau API
          timeout” không giống “API restart sau database timeout”.
        </p>
        <p>
          MLP nhận một vector có kích thước cố định và không có bộ nhớ giữa các lần gọi. RNN đọc lần lượt từng phần tử
          của chuỗi và truyền một <strong>hidden state</strong> sang bước kế tiếp. Nhờ đó, output hiện tại có thể phụ thuộc
          vào những gì đã xuất hiện trước đó.
        </p>
        <div className="my-6 border-l-2 border-primary bg-primary-soft px-4 py-3 font-mono text-sm leading-7 text-primary-dark">
          input hiện tại + memory trước đó → memory mới + output hiện tại
        </div>
      </ArticleSection>

      <ArticleSection id="rnn-trai-theo-thoi-gian" number="2" title="Trải RNN theo thời gian">
        <p>
          Trên sơ đồ gọn, một RNN cell có mũi tên vòng lại chính nó. Khi “trải” mạng theo thời gian, mình thấy cùng một
          cell được dùng lặp lại tại các timestep. Hãy chọn từng bước trong mô phỏng để xem token, hidden state và output
          liên hệ với nhau.
        </p>
        <RnnSequenceExplorer />
        <p>
          Các ô RNN không phải năm layer khác nhau. Chúng là cùng một phép biến đổi với cùng bộ parameter được tái sử
          dụng năm lần. Chuỗi dài hơn chỉ làm phép tính lặp nhiều timestep hơn, không tự làm số parameter tăng lên.
        </p>
      </ArticleSection>

      <ArticleSection id="hidden-state" number="3" title="Hidden state thực sự là gì?">
        <p>
          Hidden state không phải một câu tóm tắt bằng chữ như trong hình minh họa. Nó là vector số có kích thước
          <code className="inline-code">hidden_size</code>. Vector này được cập nhật từ input mới và hidden state cũ:
        </p>
        <pre className="my-5 overflow-x-auto border border-code-border bg-code p-4 font-mono text-sm leading-7 text-code-foreground">
          <code>{`hₜ = tanh(Wₓₕxₜ + Wₕₕhₜ₋₁ + bₕ)\nyₜ = Wₕᵧhₜ + bᵧ`}</code>
        </pre>
        <p>
          <code className="inline-code">Wₓₕ</code> học cách đưa input vào memory, còn <code className="inline-code">Wₕₕ</code>
          học cách giữ, biến đổi hoặc quên thông tin từ memory cũ. Hàm tanh giới hạn giá trị hidden state trong khoảng
          -1 đến 1 và thêm tính phi tuyến.
        </p>
      </ArticleSection>

      <ArticleSection id="shape-cua-rnn" number="4" title="Tensor đi qua RNN có shape gì?">
        <p>
          Với PyTorch và <code className="inline-code">batch_first=True</code>, input thường có shape
          <code className="inline-code">[batch, sequence, feature]</code>. Ví dụ 32 chuỗi log, mỗi chuỗi 50 token và mỗi
          token có embedding 64 chiều sẽ tạo tensor <code className="inline-code">[32, 50, 64]</code>.
        </p>
        <div className="my-6 grid gap-px border border-border bg-border sm:grid-cols-3">
          <div className="border-t-2 border-primary bg-card p-5">
            <div className="flex items-center gap-2"><span className="grid h-6 min-w-8 place-items-center bg-primary px-2 font-mono text-xs font-bold text-primary-foreground">X</span><span className="font-mono text-xs font-semibold uppercase tracking-[0.08em] text-primary-dark">Input</span></div>
            <p className="mt-3 font-mono text-sm text-ink">[32, 50, 64]</p>
            <p className="mt-2 text-sm leading-6">Toàn bộ embedding của chuỗi.</p>
          </div>
          <div className="border-t-2 border-primary bg-card p-5">
            <div className="flex items-center gap-2"><span className="grid h-6 min-w-8 place-items-center bg-primary px-2 font-mono text-xs font-bold text-primary-foreground">Y</span><span className="font-mono text-xs font-semibold uppercase tracking-[0.08em] text-primary-dark">Output</span></div>
            <p className="mt-3 font-mono text-sm text-ink">[32, 50, 128]</p>
            <p className="mt-2 text-sm leading-6">Hidden state tại mọi timestep.</p>
          </div>
          <div className="border-t-2 border-primary bg-card p-5">
            <div className="flex items-center gap-2"><span className="grid h-6 min-w-8 place-items-center bg-primary px-2 font-mono text-xs font-bold text-primary-foreground">H</span><span className="font-mono text-xs font-semibold uppercase tracking-[0.08em] text-primary-dark">Final hidden</span></div>
            <p className="mt-3 font-mono text-sm text-ink">[1, 32, 128]</p>
            <p className="mt-2 text-sm leading-6">Memory cuối của một layer RNN.</p>
          </div>
        </div>
      </ArticleSection>

      <ArticleSection id="kieu-input-output" number="5" title="RNN không chỉ có một kiểu input–output">
        <div className="grid gap-3 md:grid-cols-2">
          {[
            ['Many-to-one', 'Cả chuỗi → một nhãn', 'Phân loại sentiment hoặc phát hiện incident từ chuỗi log.'],
            ['Many-to-many', 'Mỗi bước → một output', 'Gán nhãn từ loại, dự đoán metric ở từng timestep.'],
            ['One-to-many', 'Một input → một chuỗi', 'Sinh caption theo cách encoder–decoder cổ điển.'],
            ['Sequence-to-sequence', 'Một chuỗi → chuỗi khác', 'Dịch máy, speech recognition hoặc biến đổi chuỗi.'],
          ].map(([title, shape, description]) => (
            <div key={title} className="border border-border bg-card p-4">
              <h3 className="text-base font-semibold text-ink">{title}</h3>
              <p className="mt-2 font-mono text-xs text-primary">{shape}</p>
              <p className="mt-2 text-sm leading-6">{description}</p>
            </div>
          ))}
        </div>
      </ArticleSection>

      <ArticleSection id="bptt" number="6" title="RNN học bằng Backpropagation Through Time">
        <p>
          Forward pass tạo một chuỗi hidden state. Khi tính loss, gradient phải đi ngược từ timestep cuối qua những phép
          tính trước đó. Việc “trải” RNN ra rồi backpropagate trên chuỗi này được gọi là
          <strong> Backpropagation Through Time</strong> — BPTT.
        </p>
        <p>
          Chuỗi dài khiến graph tính toán lớn và tốn memory. Trong thực tế có thể dùng truncated BPTT: chỉ backpropagate
          qua một đoạn timestep gần nhất, sau đó tách hidden state khỏi graph trước khi xử lý đoạn tiếp theo.
        </p>
      </ArticleSection>

      <ArticleSection id="vanishing-gradient" number="7" title="Vì sao vanilla RNN khó nhớ xa?">
        <p>
          Gradient phải nhân lặp lại qua cùng ma trận recurrent. Nếu các giá trị làm gradient nhỏ dần, tín hiệu học từ
          timestep xa sẽ gần bằng 0 — vanishing gradient. Nếu gradient lớn dần, quá trình train có thể mất ổn định —
          exploding gradient.
        </p>
        <div className="my-6 grid gap-px border border-border bg-border sm:grid-cols-3">
          <div className="bg-card p-4">
            <p className="font-mono text-xs font-semibold text-primary">VANISHING</p>
            <p className="mt-2 text-sm leading-6">Model khó học quan hệ giữa hai timestep cách xa nhau.</p>
          </div>
          <div className="bg-card p-4">
            <p className="font-mono text-xs font-semibold text-primary">EXPLODING</p>
            <p className="mt-2 text-sm leading-6">Loss dao động, gradient có thể thành giá trị rất lớn hoặc NaN.</p>
          </div>
          <div className="bg-card p-4">
            <p className="font-mono text-xs font-semibold text-primary">GIẢM RỦI RO</p>
            <p className="mt-2 text-sm leading-6">LSTM/GRU, gradient clipping, initialization và sequence length hợp lý.</p>
          </div>
        </div>
      </ArticleSection>

      <ArticleSection id="lstm-gru" number="8" title="LSTM và GRU cải tiến điều gì?">
        <p>
          LSTM và GRU vẫn là recurrent network, nhưng thêm các gate để kiểm soát luồng thông tin. Gate có thể được hiểu
          như van đóng mở: phần nào của memory cũ nên giữ, phần nào nên quên và input mới nên ghi vào bao nhiêu.
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="border border-border bg-card p-5">
            <p className="font-mono text-xs font-semibold text-primary">LSTM</p>
            <h3 className="mt-2 text-base font-semibold text-ink">Cell state riêng</h3>
            <p className="mt-2 text-sm leading-6">Forget, input và output gate; nhiều parameter hơn nhưng kiểm soát memory chi tiết.</p>
          </div>
          <div className="border border-border bg-card p-5">
            <p className="font-mono text-xs font-semibold text-primary">GRU</p>
            <h3 className="mt-2 text-base font-semibold text-ink">Gọn hơn LSTM</h3>
            <p className="mt-2 text-sm leading-6">Update và reset gate; thường train nhanh hơn và là baseline tốt cho chuỗi vừa phải.</p>
          </div>
        </div>
      </ArticleSection>

      <ArticleSection id="rnn-pytorch" number="9" title="Một sequence classifier bằng PyTorch">
        <p>
          Ví dụ này nhận token ID của log, đổi chúng thành embedding rồi đưa qua GRU. Final hidden state tóm tắt chuỗi và
          Linear layer dự đoán ba trạng thái: bình thường, cảnh báo hoặc incident.
        </p>
        <pre className="my-5 overflow-x-auto border border-code-border bg-code p-4 font-mono text-sm leading-7 text-code-foreground">
          <code>{rnnCode}</code>
        </pre>
        <p>
          Với chuỗi có độ dài khác nhau, mình cần padding và mask, hoặc dùng
          <code className="inline-code">pack_padded_sequence</code>. Nếu lấy hidden state tại vị trí padding làm kết quả,
          model sẽ học từ phần dữ liệu giả thay vì token cuối thật sự.
        </p>
      </ArticleSection>

      <ArticleSection id="khi-nao-dung-rnn" number="10" title="Khi nào mình vẫn chọn RNN?">
        <p>
          Transformer hiện mạnh hơn trong nhiều bài toán ngôn ngữ và xử lý song song tốt hơn. Tuy vậy, RNN/GRU/LSTM vẫn
          hữu ích khi dữ liệu đến liên tục, model cần chạy từng bước, tài nguyên hạn chế hoặc chuỗi không quá dài. Các bài
          toán sensor, anomaly detection, forecasting nhỏ và streaming inference vẫn là những trường hợp hợp lý.
        </p>
        <p>
          Cách mình ghi nhớ: MLP biến đổi một vector, CNN quét các vùng không gian, còn RNN mang một vector memory đi dọc
          theo thời gian. Điểm mạnh và giới hạn của RNN đều xuất phát từ chính đường truyền memory tuần tự đó.
        </p>
      </ArticleSection>
    </ArticleShell>
  );
}
