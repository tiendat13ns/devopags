import type { Metadata } from 'next';
import { ArticleIntro, ArticleSection, ArticleShell } from '@/components/article-shell';
import { KnnExplorer } from '@/components/knn-explorer';

export const metadata: Metadata = {
  title: 'Nhập môn Machine Learning với KNN | tiendat13ns',
  description:
    'Từ input, feature, label, loss và generalisation đến thuật toán K-Nearest Neighbours, chọn K, scaling, validation và giới hạn của khoảng cách.',
};

const knnCode = `from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier

model = make_pipeline(
    StandardScaler(),
    KNeighborsClassifier(n_neighbors=5)
)

model.fit(X_train, y_train)
validation_accuracy = model.score(X_validation, y_validation)
prediction = model.predict(X_new)`;

export default function MachineLearningAndKnnArticle() {
  return (
    <ArticleShell currentHref="/bai-viet/nhap-mon-machine-learning-va-knn">
      <ArticleIntro
        eyebrow="MACHINE LEARNING · WEEK 1"
        title="Nhập môn Machine Learning với KNN"
        description="Bài đầu tiên của topic Machine Learning đi từ cách đóng khung một bài toán dự đoán đến K-Nearest Neighbours — một thuật toán đủ đơn giản để mình nhìn rõ feature, label, loss, validation và generalisation cùng lúc."
        date="23/09/2026"
        readTime="18 phút đọc"
        tags={['Machine Learning', 'Supervised Learning', 'KNN']}
      />

      <ArticleSection id="ml-khong-phai-viet-rule" number="1" title="Machine Learning không phải viết thật nhiều rule">
        <p>
          Với hệ thống rule-based, lập trình viên viết trực tiếp điều kiện: nếu email chứa một cụm từ nào đó thì đánh dấu
          spam. Cách này dễ hiểu nhưng nhanh chóng trở nên giòn khi dữ liệu thay đổi hoặc số trường hợp ngoại lệ tăng lên.
        </p>
        <p>
          Trong Machine Learning, mình định nghĩa bài toán và cung cấp ví dụ. Learning algorithm tìm một mapping từ input
          tới output. Khi nhận input chưa từng xuất hiện, model dùng pattern đã học để đưa ra dự đoán thay vì tra một danh
          sách if–else do con người viết sẵn.
        </p>
        <div className="my-6 grid gap-px border border-border bg-border md:grid-cols-2">
          <div className="bg-card p-5">
            <p className="font-mono text-xs font-semibold text-primary">RULE-BASED</p>
            <p className="mt-3 font-mono text-sm text-ink">input → hand-written rules → output</p>
            <p className="mt-3 text-sm leading-6">Con người viết cả bài toán lẫn cách giải.</p>
          </div>
          <div className="bg-card p-5">
            <p className="font-mono text-xs font-semibold text-primary">MACHINE LEARNING</p>
            <p className="mt-3 font-mono text-sm text-ink">examples → learning algorithm → model f(x)</p>
            <p className="mt-3 text-sm leading-6">Con người định nghĩa mục tiêu; thuật toán học pattern từ dữ liệu.</p>
          </div>
        </div>
      </ArticleSection>

      <ArticleSection id="training-set" number="2" title="Training set định nghĩa bài toán supervised learning">
        <p>
          Một training set gồm N ví dụ có nhãn: <code className="inline-code">D = {'{'}(x₁,y₁), …, (xₙ,yₙ){'}'}</code>.
          Mỗi <code className="inline-code">xᵢ</code> là vector gồm d feature, còn <code className="inline-code">yᵢ</code>
          là đáp án model cần học để dự đoán.
        </p>
        <div className="my-6 grid gap-px border border-border bg-border sm:grid-cols-5">
          {[
            ['x', 'Input', 'Dữ liệu đi vào'],
            ['y', 'Label', 'Đáp án thật'],
            ['f', 'Model', 'Hàm được học'],
            ['ŷ', 'Prediction', 'Câu trả lời'],
            ['L', 'Loss', 'Mức độ sai'],
          ].map(([symbol, name, note]) => (
            <div key={name} className="border-t-2 border-primary bg-card p-4">
              <span className="font-mono text-sm font-bold text-primary">{symbol}</span>
              <strong className="mt-2 block text-sm text-ink">{name}</strong>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">{note}</p>
            </div>
          ))}
        </div>
        <p>
          Năm thành phần này không thay đổi khi mình chuyển từ KNN sang Decision Tree, SVM hay Neural Network. Thuật toán
          chỉ thay đổi cách xây dựng hàm f.
        </p>
      </ArticleSection>

      <ArticleSection id="classification-regression" number="3" title="Classification và regression khác nhau ở output">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="border border-border bg-card p-5">
            <p className="font-mono text-xs font-semibold text-primary">CLASSIFICATION</p>
            <h3 className="mt-2 text-base font-semibold text-ink">Output là một lớp</h3>
            <p className="mt-2 text-sm leading-6">Spam/không spam, cần review/chấp nhận, pass/fail hoặc nhiều category.</p>
          </div>
          <div className="border border-border bg-card p-5">
            <p className="font-mono text-xs font-semibold text-primary">REGRESSION</p>
            <h3 className="mt-2 text-base font-semibold text-ink">Output là một giá trị liên tục</h3>
            <p className="mt-2 text-sm leading-6">Điểm thi, thời gian phản hồi, giá nhà hoặc nhu cầu tài nguyên.</p>
          </div>
        </div>
        <p>
          Output type ảnh hưởng trực tiếp tới loss và metric. Classification cơ bản có thể dùng 0/1 loss; regression có
          thể dùng squared loss. Loss không phải chi tiết phụ: nó định nghĩa loại sai lầm mà model bị phạt.
        </p>
      </ArticleSection>

      <ArticleSection id="generalisation" number="4" title="Mục tiêu thật sự là generalisation">
        <p>
          Training error đo model làm tốt tới đâu trên dữ liệu đã học. Generalisation error đo model làm tốt tới đâu trên
          dữ liệu mới. Một model ghi nhớ toàn bộ training set có thể đạt training error bằng 0 nhưng vẫn thất bại khi deploy.
        </p>
        <div className="my-6 border-l-2 border-primary bg-primary-soft px-4 py-3 text-sm leading-7 text-primary-dark">
          Fitting training data tốt là điều cần thiết, nhưng không đủ. Memorisation không phải generalisation.
        </div>
        <p>
          Khi production nhận input x, ground truth y thường chưa tồn tại nên model chỉ trả về ŷ. Loss chủ yếu xuất hiện
          trong training và evaluation, không phải phép tính bắt buộc của mỗi lần inference.
        </p>
      </ArticleSection>

      <ArticleSection id="knn" number="5" title="KNN học bằng cách so sánh với hàng xóm">
        <p>
          K-Nearest Neighbours formalize một trực giác quen thuộc: muốn dự đoán một input mới, hãy tìm K training example
          giống nó nhất. Classification dùng majority vote; regression lấy trung bình label của các hàng xóm.
        </p>
        <ol className="space-y-2 pl-5">
          <li>Tính khoảng cách từ query tới mọi điểm trong training set.</li>
          <li>Sắp xếp khoảng cách tăng dần và lấy K điểm đầu.</li>
          <li>Đếm vote theo lớp hoặc lấy trung bình giá trị.</li>
        </ol>
        <p>
          KNN không học parameter. “Model” chính là training set cùng lựa chọn K, distance metric và quy tắc tie-breaking.
        </p>
      </ArticleSection>

      <ArticleSection id="knn-playground" number="6" title="Thử dự đoán và chọn K">
        <p>
          Ví dụ dưới dùng đúng năm điểm và query Q = (4,4) trong lecture. Đổi K để thấy tập hàng xóm và kết quả vote thay
          đổi; sau đó mở “Chọn K” để quan sát validation curve minh họa.
        </p>
        <KnnExplorer />
        <p>
          K = 1 có thể bám sát noise và đạt 100% training accuracy. K quá lớn làm boundary mượt đến mức mất local
          structure. K phù hợp nằm giữa hai cực và phải được chọn trên validation data.
        </p>
      </ArticleSection>

      <ArticleSection id="distance" number="7" title="Khoảng cách là một lựa chọn mô hình">
        <div className="my-6 overflow-x-auto border border-border bg-card">
          <table className="w-full min-w-[620px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-primary-soft text-primary-dark">
                <th className="px-4 py-3">Metric</th>
                <th className="px-4 py-3">Phù hợp</th>
                <th className="px-4 py-3">Cách hiểu</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Euclidean', 'Feature liên tục, scale tương đương', 'Khoảng cách đường thẳng'],
                ['Manhattan', 'Feature liên tục, muốn giảm ảnh hưởng outlier', 'Tổng quãng đường theo từng trục'],
                ['Hamming', 'Vector binary hoặc categorical đã mã hóa', 'Số vị trí không giống nhau'],
              ].map((row) => (
                <tr key={row[0]} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-semibold text-ink">{row[0]}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row[1]}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Khoảng cách chỉ có ý nghĩa khi nó phản ánh “giống nhau” trong domain. Hai learner có Hamming distance thấp nhưng
          chỉ cùng trả lời hai câu chưa chắc thực sự giống nhau; lượng evidence chung quan trọng không kém con số distance.
        </p>
      </ArticleSection>

      <ArticleSection id="feature-scaling" number="8" title="Không scaling, feature lớn sẽ chiếm toàn bộ khoảng cách">
        <p>
          Nếu quiz score nằm trong [0,10] còn số lần làm bài nằm trong [0,500], feature thứ hai sẽ thống trị Euclidean
          distance. KNN lúc đó gần như bỏ qua quiz score, dù nó có thể quan trọng hơn với bài toán.
        </p>
        <div className="my-6 grid gap-px border border-border bg-border sm:grid-cols-2">
          <div className="bg-card p-5">
            <p className="font-mono text-xs text-primary">TRƯỚC SCALING</p>
            <p className="mt-3 font-mono text-sm text-ink">score: 0–10 · attempts: 0–500</p>
            <p className="mt-2 text-sm leading-6">Attempts áp đảo phép tính distance.</p>
          </div>
          <div className="bg-card p-5">
            <p className="font-mono text-xs text-primary">SAU SCALING</p>
            <p className="mt-3 font-mono text-sm text-ink">các feature ở scale tương đương</p>
            <p className="mt-2 text-sm leading-6">Mỗi dimension có cơ hội đóng góp.</p>
          </div>
        </div>
        <p>
          Scaler phải fit trên training set rồi áp dụng sang validation và test. Dùng thống kê của test set để scaling là
          data leakage vì pipeline đã nhìn thấy thông tin từ dữ liệu dùng để báo cáo cuối cùng.
        </p>
      </ArticleSection>

      <ArticleSection id="split-data" number="9" title="Train chọn model, validation chọn K, test báo cáo một lần">
        <div className="my-6 grid grid-cols-[3fr_1fr_1fr] border border-border text-center text-sm">
          <div className="bg-primary px-3 py-5 font-semibold text-primary-foreground">Train · 60%</div>
          <div className="border-l border-border bg-primary-soft px-3 py-5 font-semibold text-primary-dark">Validation · 20%</div>
          <div className="border-l border-border bg-card px-3 py-5 font-semibold text-ink">Test · 20%</div>
        </div>
        <p>
          Mình thử nhiều K trên validation set, chọn K tốt nhất rồi mới đánh giá model cuối trên test set. Nếu thử K = 3 và
          K = 7 trực tiếp trên test rồi chọn kết quả cao hơn, test set đã trở thành validation set và con số báo cáo sẽ lạc
          quan hơn hiệu năng trên dữ liệu thực sự chưa thấy.
        </p>
      </ArticleSection>

      <ArticleSection id="gioi-han-knn" number="10" title="KNN đơn giản nhưng không rẻ ở mọi quy mô">
        <p>
          Training gần như chỉ lưu dữ liệu, nhưng một prediction phải tính N khoảng cách, mỗi khoảng cách qua d feature:
          chi phí <code className="inline-code">O(N·d)</code>. Với hàng triệu vector, brute-force KNN không còn phù hợp;
          hệ thống thường cần approximate nearest neighbours hoặc representation gọn hơn.
        </p>
        <p>
          Sparse, high-dimensional data còn làm distance mất ý nghĩa. Khi d tăng, các điểm trở nên gần như cách đều nhau;
          “nearest” có thể chỉ là điểm ít xa nhất chứ không phải một local neighbour đáng tin cậy. Đây là một biểu hiện của
          curse of dimensionality.
        </p>
      </ArticleSection>

      <ArticleSection id="human-in-the-loop" number="11" title="Prediction là tín hiệu hỗ trợ, không phải phán quyết">
        <p>
          Lecture dùng ví dụ “Second Pair of Eyes”: model có thể đánh dấu bản dịch hoặc câu trả lời cần được xem lại, nhưng
          giáo viên, dịch giả hoặc reviewer vẫn đưa ra quyết định. False positive làm tốn thời gian review; false negative
          khiến vấn đề thật bị bỏ sót.
        </p>
        <p>
          Vì vậy một ML application không kết thúc ở model.fit(). Mình còn phải chọn loss và metric phù hợp với chi phí sai,
          phân tích lỗi, kiểm tra data leakage và đặt output vào workflow nơi con người hiểu giới hạn của nó.
        </p>
      </ArticleSection>

      <ArticleSection id="code" number="12" title="Một pipeline KNN tối thiểu">
        <p>
          Pipeline giúp scaler chỉ học từ dữ liệu được truyền vào fit và bảo đảm cùng transformation được áp dụng khi
          validation hoặc inference.
        </p>
        <pre className="my-5 overflow-x-auto border border-code-border bg-code p-4 font-mono text-sm leading-7 text-code-foreground">
          <code>{knnCode}</code>
        </pre>
      </ArticleSection>

      <ArticleSection id="tong-ket" number="13" title="Điều mình giữ lại sau Week 1">
        <p>
          Machine Learning học mapping từ example, nhưng giá trị của model nằm ở dữ liệu chưa từng thấy. KNN giúp mình thấy
          rõ điều đó: K nhỏ có thể ghi nhớ, K lớn có thể đơn giản hóa quá mức, còn validation cho biết điểm cân bằng thực tế.
        </p>
        <p>
          Bài học lớn hơn thuật toán là mọi lựa chọn đều mang giả định: feature nào đại diện cho input, distance nào có ý
          nghĩa, dữ liệu nào được dùng để chọn model và metric nào phản ánh cái giá của sai lầm.
        </p>
        <div className="my-6 border border-border bg-card p-4 text-sm leading-7 text-muted-foreground">
          Nội dung được tổng hợp từ MLA Week 1 — “Introduction to Machine Learning and K-Nearest Neighbours”, Part 1 và Part 2, MSc. Bui Quoc Khanh, Faculty of Information Technology, Hanoi University, Semester 1 AY 2026–2027.
        </div>
      </ArticleSection>
    </ArticleShell>
  );
}
