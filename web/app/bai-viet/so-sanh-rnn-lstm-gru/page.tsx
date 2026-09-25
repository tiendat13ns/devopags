import type { Metadata } from 'next';
import { ArticleIntro, ArticleSection, ArticleShell, ReferenceLink } from '@/components/article-shell';
import { RecurrentModelComparison } from '@/components/recurrent-model-comparison';

export const metadata: Metadata = {
  title: 'So sánh RNN, LSTM và GRU | tiendat13ns',
  description:
    'So sánh RNN, LSTM và GRU về memory, gate, parameter, tốc độ, độ ổn định và kết quả benchmark time series từ một nghiên cứu MethodsX năm 2025.',
};

const comparisonRows = [
  ['Memory', 'Hidden state', 'Hidden + cell state', 'Hidden state'],
  ['Số gate', '0', '3 gate chính', '2 gate'],
  ['Khả năng nhớ xa', 'Yếu', 'Tốt, kiểm soát chi tiết', 'Tốt'],
  ['Parameter tương đối', 'Thấp nhất', 'Cao nhất', 'Ở giữa'],
  ['Tốc độ mỗi bước', 'Nhanh nhất', 'Chậm nhất', 'Nhanh hơn LSTM'],
  ['Rủi ro vanishing gradient', 'Cao', 'Giảm đáng kể', 'Giảm đáng kể'],
  ['Streaming', 'Tốt', 'Tốt nhưng nặng hơn', 'Cân bằng tốt'],
  ['Điểm bắt đầu phù hợp', 'Baseline chuỗi ngắn', 'Dependency dài', 'Baseline gated RNN'],
];

export default function RecurrentComparisonArticle() {
  return (
    <ArticleShell currentHref="/bai-viet/so-sanh-rnn-lstm-gru">
      <ArticleIntro
        eyebrow="AI · SEQUENCE MODEL"
        title="So sánh RNN, LSTM và GRU"
        description="Ba kiến trúc đều đọc dữ liệu theo thời gian, nhưng khác nhau ở cách giữ memory, số gate, chi phí tính toán và độ ổn định. Bài này kết hợp kiến thức kiến trúc với kết quả từ một benchmark time series chạy lặp 100 lần."
        date="23/09/2026"
        readTime="16 phút đọc"
        tags={['AI', 'Deep Learning', 'Time Series']}
      />

      <ArticleSection id="khong-co-model-thang-moi-noi" number="1" title="Không có model thắng ở mọi nơi">
        <p>
          Nếu chỉ nhìn sơ đồ, mình rất dễ kết luận LSTM nhiều gate hơn nên chắc chắn tốt hơn RNN, hoặc GRU ít gate hơn nên
          luôn nhanh và hiệu quả hơn LSTM. Thực tế không đơn giản như vậy. Kết quả còn phụ thuộc độ dài chuỗi, lượng dữ
          liệu, nhiễu, cách chia train–test, hidden size, learning rate và cả random initialization.
        </p>
        <p>
          Vì vậy mình tách câu hỏi thành hai phần: <strong>kiến trúc cho phép model làm gì</strong>, và
          <strong> model thực sự làm tốt đến đâu trên dữ liệu cụ thể</strong>. Phần đầu có thể suy ra từ cấu trúc; phần sau
          phải đo bằng thí nghiệm lặp lại đủ nhiều lần.
        </p>
      </ArticleSection>

      <ArticleSection id="so-sanh-truc-quan" number="2" title="So sánh cấu trúc và benchmark">
        <p>
          Công cụ dưới đây cho phép đổi giữa RNN, LSTM và GRU để xem state, gate và chi phí tương đối. Phần thứ hai dùng
          đúng số liệu trung bình trong nghiên cứu cho ba kiến trúc đơn trên từng bộ dữ liệu.
        </p>
        <RecurrentModelComparison />
        <p>
          Ô màu tím chỉ đánh dấu metric thấp nhất trong ba model đơn, không có nghĩa model đó thắng về mặt thống kê. Nghiên
          cứu còn đánh giá sáu kiến trúc hybrid, nên bảng này được rút gọn để trả lời đúng câu hỏi RNN–LSTM–GRU.
        </p>
      </ArticleSection>

      <ArticleSection id="bang-so-sanh" number="3" title="Nhìn nhanh trên nhiều phương diện">
        <div className="my-6 overflow-x-auto border border-border bg-card">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-primary-soft text-primary-dark">
                <th className="px-4 py-3 font-semibold">Phương diện</th>
                <th className="px-4 py-3 font-semibold">RNN</th>
                <th className="px-4 py-3 font-semibold">LSTM</th>
                <th className="px-4 py-3 font-semibold">GRU</th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row) => (
                <tr key={row[0]} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-semibold text-ink">{row[0]}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row[1]}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row[2]}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ArticleSection>

      <ArticleSection id="memory-va-gate" number="4" title="Khác biệt nằm ở đường truyền memory">
        <p>
          Vanilla RNN tạo hidden state mới bằng input hiện tại và hidden state trước. Không có gate, nên mạng phải liên tục
          ghi đè lên cùng một vector. Cấu trúc này gọn nhưng tín hiệu cũ dễ bị mất khi chuỗi dài.
        </p>
        <p>
          LSTM thêm cell state <code className="inline-code">cₜ</code> như một đường memory riêng. Forget gate quyết định
          giữ gì từ quá khứ, input gate quyết định ghi gì mới và output gate quyết định phần nào trở thành hidden state.
          GRU gộp cell state vào hidden state, dùng update gate và reset gate để đạt mục tiêu tương tự với ít phép tính hơn.
        </p>
        <div className="my-6 grid gap-px border border-border bg-border md:grid-cols-3">
          {[
            ['RNN', 'hₜ', 'Một state, không gate'],
            ['LSTM', 'hₜ + cₜ', 'Ba gate chính'],
            ['GRU', 'hₜ', 'Hai gate'],
          ].map(([model, state, note]) => (
            <div key={model} className="border-t-2 border-primary bg-card p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-xs font-semibold text-primary">{model}</span>
                <span className="font-mono text-xs text-muted-foreground">{state}</span>
              </div>
              <p className="mt-3 text-sm font-semibold text-ink">{note}</p>
            </div>
          ))}
        </div>
      </ArticleSection>

      <ArticleSection id="parameter-va-chi-phi" number="5" title="Parameter, memory và tốc độ">
        <p>
          Nếu input có D feature và hidden size là H, một cách ước lượng parameter recurrent cho một layer là:
        </p>
        <pre className="my-5 overflow-x-auto border border-code-border bg-code p-4 font-mono text-sm leading-7 text-code-foreground">
          <code>{`RNN  ≈     H × (D + H + 1)\nGRU  ≈ 3 × H × (D + H + 1)\nLSTM ≈ 4 × H × (D + H + 1)`}</code>
        </pre>
        <p>
          Framework có thể tổ chức bias hơi khác nên con số thực tế có thể lệch nhẹ, nhưng tỷ lệ cho thấy trade-off. LSTM
          tính bốn nhóm phép biến đổi, GRU tính ba, còn RNN chỉ một. Điều này ảnh hưởng parameter, activation cần lưu để
          backpropagate, băng thông memory và thời gian mỗi timestep.
        </p>
        <p>
          Trong paper, với cùng pipeline Conv1D và hai hidden layer 64 unit, RNN có 16.833 parameter, GRU 50.241 và LSTM
          66.369. Đây là số của cấu hình nghiên cứu, không phải hằng số cho mọi model.
        </p>
      </ArticleSection>

      <ArticleSection id="do-on-dinh" number="6" title="Độ ổn định quan trọng hơn một lần train đẹp">
        <p>
          Neural network bắt đầu từ weight ngẫu nhiên và học theo mini-batch, nên hai lần train cùng cấu hình vẫn có thể
          cho kết quả khác. Chọn model từ một lần chạy tốt nhất dễ dẫn đến kết luận quá lạc quan.
        </p>
        <p>
          Nghiên cứu giải quyết việc này bằng 100 lần chạy độc lập cho mỗi cấu hình, mỗi lần 100 epoch. Tác giả theo dõi
          MAE, MAPE, RMSE, thời gian train và phân phối kết quả. Cách làm này cho thấy không chỉ model sai bao nhiêu, mà còn
          cho thấy kết quả có nhạy với initialization hay không.
        </p>
      </ArticleSection>

      <ArticleSection id="doc-ket-qua-nghien-cuu" number="7" title="Nghiên cứu thực sự kết luận điều gì?">
        <p>
          Paper so sánh chín kiến trúc: RNN, LSTM, GRU cùng sáu hybrid. Ba bộ dữ liệu gồm sunspot, số ca COVID-19 mới tại
          Jakarta và nồng độ oxy hòa tan. Friedman test cho kết quả <code className="inline-code">p = 0.127</code>, lớn hơn
          ngưỡng 0.05. Nói chính xác: thí nghiệm chưa cung cấp đủ bằng chứng để khẳng định hiệu năng chín kiến trúc khác nhau
          có ý nghĩa thống kê.
        </p>
        <p>
          Tuy vậy, phân tích mô tả vẫn có giá trị thực hành. LSTM-GRU có mean rank tốt nhất 2.23; LSTM-RNN đứng thứ hai
          3.24; GRU là kiến trúc đơn tốt nhất với 3.62. Vanilla RNN đứng cuối với mean rank 8.57 và thường có sai số cùng
          độ phân tán lớn hơn, dù train nhanh nhất.
        </p>
        <div className="my-6 border-l-2 border-primary bg-primary-soft px-4 py-3 text-sm leading-7 text-primary-dark">
          “Có pattern thực tế đáng chú ý” không đồng nghĩa với “đã chứng minh khác biệt thống kê”. Chỉ có ba dataset nên statistical power của nghiên cứu còn hạn chế.
        </div>
      </ArticleSection>

      <ArticleSection id="chon-model" number="8" title="Mình sẽ chọn model theo cách nào?">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="border border-border bg-card p-5">
            <p className="font-mono text-xs font-semibold text-primary">RNN</p>
            <h3 className="mt-2 text-base font-semibold text-ink">Baseline rẻ nhất</h3>
            <p className="mt-2 text-sm leading-6">Dùng khi chuỗi ngắn, latency và tài nguyên quan trọng, hoặc cần một mốc so sánh đơn giản.</p>
          </div>
          <div className="border border-border bg-card p-5">
            <p className="font-mono text-xs font-semibold text-primary">GRU</p>
            <h3 className="mt-2 text-base font-semibold text-ink">Điểm bắt đầu thực dụng</h3>
            <p className="mt-2 text-sm leading-6">Dùng khi cần gated memory nhưng muốn model gọn và train nhanh hơn LSTM.</p>
          </div>
          <div className="border border-border bg-card p-5">
            <p className="font-mono text-xs font-semibold text-primary">LSTM</p>
            <h3 className="mt-2 text-base font-semibold text-ink">Kiểm soát memory kỹ</h3>
            <p className="mt-2 text-sm leading-6">Thử khi dependency dài, GRU chưa ổn định hoặc cell state riêng mang lại lợi ích rõ ràng.</p>
          </div>
        </div>
        <p>
          Quy trình hợp lý là giữ nguyên preprocessing, window size, hidden size, budget epoch và cách chia time series;
          chạy nhiều seed; theo dõi cả metric, độ lệch chuẩn, thời gian và memory. Model cuối cùng nên là model đạt trade-off
          phù hợp với hệ thống, không chỉ có một con số MAE nhỏ nhất.
        </p>
      </ArticleSection>

      <ArticleSection id="hybrid-co-can-thiet" number="9" title="Có nên dùng kiến trúc hybrid?">
        <p>
          Kết quả mô tả trong nghiên cứu nghiêng về LSTM-GRU và LSTM-RNN, nhưng hybrid không phải nâng cấp miễn phí. Xếp
          hai cell khác nhau làm không gian tìm kiếm lớn hơn, tăng độ khó debug và có thể chỉ cải thiện rất ít trên dataset
          cụ thể.
        </p>
        <p>
          Mình chỉ thử hybrid sau khi baseline GRU/LSTM đã được tune hợp lý và khi cải thiện nhỏ thực sự có giá trị. Nếu
          một GRU đơn cho kết quả gần tương đương nhưng chạy nhanh, dễ deploy và ổn định hơn, đó thường là lựa chọn tốt hơn
          cho production.
        </p>
      </ArticleSection>

      <ArticleSection id="ket-luan" number="10" title="Kết luận ngắn">
        <p>
          RNN đơn giản và nhanh nhưng khó nhớ xa. LSTM có cơ chế memory đầy đủ nhất nhưng nặng nhất. GRU lược bớt gate để
          giữ phần lớn lợi ích của LSTM với chi phí thấp hơn. Kiến trúc chỉ tạo ra một giả định ban đầu; dataset và phép đo
          lặp lại mới quyết định model nào phù hợp.
        </p>
        <p>
          Từ nghiên cứu này, bài học hữu ích nhất với mình không phải “hãy luôn chọn LSTM-GRU”, mà là: đừng đánh giá neural
          network từ một lần train, đừng nhầm xếp hạng mô tả với ý nghĩa thống kê và luôn đặt accuracy cạnh chi phí vận hành.
        </p>
      </ArticleSection>

      <ArticleSection id="tai-lieu-tham-khao" number="11" title="Tài liệu tham khảo">
        <ul className="space-y-3">
          <ReferenceLink
            href="https://doi.org/10.1016/j.mex.2025.103462"
            label="Yunita et al. (2025) — Performance analysis of neural network architectures for time series forecasting: A comparative study of RNN, LSTM, GRU, and hybrid models"
          />
        </ul>
      </ArticleSection>
    </ArticleShell>
  );
}
