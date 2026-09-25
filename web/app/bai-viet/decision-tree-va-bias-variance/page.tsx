import type { Metadata } from 'next';
import { ArticleIntro, ArticleSection, ArticleShell } from '@/components/article-shell';
import { DecisionTreeExplorer } from '@/components/decision-tree-explorer';

export const metadata: Metadata = {
  title: 'Decision Tree và cách kiểm soát bias–variance | tiendat13ns',
  description:
    'Từ root, branch, leaf, Gini và Entropy đến max_depth, learning curve, bias–variance và cross-validation trong Decision Tree.',
};

const treeCode = `from sklearn.model_selection import GridSearchCV
from sklearn.tree import DecisionTreeClassifier

search = GridSearchCV(
    estimator=DecisionTreeClassifier(random_state=42),
    param_grid={"max_depth": range(1, 21)},
    scoring="accuracy",
    cv=5,
    return_train_score=True,
)

search.fit(X_train, y_train)

best_tree = search.best_estimator_
test_accuracy = best_tree.score(X_test, y_test)`;

export default function DecisionTreeAndBiasVarianceArticle() {
  return (
    <ArticleShell currentHref="/bai-viet/decision-tree-va-bias-variance">
      <ArticleIntro
        eyebrow="MACHINE LEARNING · WEEK 2"
        title="Decision Tree và cách kiểm soát bias–variance"
        description="Sau KNN, mình chuyển sang một model biết rút dữ liệu thành các câu hỏi. Decision Tree dễ đọc, prediction nhanh, nhưng độ sâu của cây quyết định nó đang học pattern hay chỉ ghi nhớ training set."
        date="23/09/2026"
        readTime="18 phút đọc"
        tags={['Machine Learning', 'Decision Tree', 'Model Selection']}
      />

      <ArticleSection id="tu-knn-den-decision-tree" number="1" title="Từ người hàng xóm đến một bộ rule">
        <p>
          KNN là một <strong>lazy learner</strong>: gần như không làm gì ở lúc train, giữ lại toàn bộ dữ liệu rồi tìm hàng xóm khi có
          query mới. Chi phí prediction vì thế tăng theo số điểm trong training set.
        </p>
        <p>
          Decision Tree làm ngược lại. Nó là <strong>eager learner</strong>: dành công sức ở lúc train để nén dữ liệu thành một chuỗi câu
          hỏi. Khi inference, model chỉ đi từ root xuống một leaf nên chi phí gần với độ sâu của cây thay vì quét lại toàn bộ dataset.
        </p>
        <div className="my-6 grid gap-px border border-border bg-border md:grid-cols-2">
          <div className="bg-card p-5">
            <p className="font-mono text-xs font-semibold text-primary">KNN · LAZY</p>
            <p className="mt-3 font-mono text-sm text-ink">train: lưu dữ liệu</p>
            <p className="mt-1 font-mono text-sm text-ink">predict: tìm K hàng xóm · O(N)</p>
          </div>
          <div className="bg-card p-5">
            <p className="font-mono text-xs font-semibold text-primary">TREE · EAGER</p>
            <p className="mt-3 font-mono text-sm text-ink">train: học các phép chia</p>
            <p className="mt-1 font-mono text-sm text-ink">predict: đi theo rule · O(depth)</p>
          </div>
        </div>
      </ArticleSection>

      <ArticleSection id="cau-truc-cay" number="2" title="Một prediction chỉ là đi từ root tới leaf">
        <p>
          Mỗi internal node đặt một câu hỏi về feature. Câu trả lời chọn một branch; leaf cuối cùng trả về majority class với
          classification hoặc giá trị trung bình với regression.
        </p>
        <div className="my-6 grid gap-px border border-border bg-border sm:grid-cols-4">
          {[
            ['Root', 'Câu hỏi đầu tiên'],
            ['Internal node', 'Một phép chia tiếp theo'],
            ['Branch', 'Đường đi theo câu trả lời'],
            ['Leaf', 'Nơi trả về prediction'],
          ].map(([name, note]) => (
            <div key={name} className="bg-card p-4">
              <strong className="text-sm text-ink">{name}</strong>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">{note}</p>
            </div>
          ))}
        </div>
        <p>
          Với feature liên tục, câu hỏi thường có dạng <code className="inline-code">xⱼ &lt; threshold</code>. Mỗi split tạo một đường
          biên song song với một trục, nên nhiều split liên tiếp tạo ra các vùng hình chữ nhật. Feature categorical cần được mã hóa
          trước khi dùng với implementation của scikit-learn.
        </p>
      </ArticleSection>

      <ArticleSection id="decision-tree-explorer" number="3" title="Đi qua cây và thử núm chỉnh độ sâu">
        <p>
          Mô phỏng dưới đây dùng ví dụ phân loại Lemon/Orange trong lecture. Hãy đổi width và height để quan sát path sáng lên; sau đó
          kéo <code className="inline-code">max_depth</code> để thấy training accuracy và validation accuracy tách khỏi nhau.
        </p>
        <DecisionTreeExplorer />
        <p>
          Điều đáng chú ý là cây càng sâu gần như luôn làm tốt hơn trên training set. Nhưng model tốt không phải model thắng trên dữ
          liệu đã thấy; nó phải giữ được chất lượng trên dữ liệu mới.
        </p>
      </ArticleSection>

      <ArticleSection id="cay-hoc-cau-hoi" number="4" title="Cây chọn câu hỏi tốt nhất theo kiểu greedy">
        <p>
          Tìm cây tối ưu toàn cục là bài toán rất khó vì số cấu trúc có thể thử tăng bùng nổ theo số feature và độ sâu. Trong thực tế,
          Decision Tree dùng top-down greedy induction:
        </p>
        <ol className="space-y-2 pl-5">
          <li>Bắt đầu ở root với toàn bộ training data.</li>
          <li>Thử các feature và threshold có thể dùng tại node hiện tại.</li>
          <li>Chọn split làm các child node “sạch” nhất.</li>
          <li>Lặp lại trên từng child cho tới khi gặp điều kiện dừng.</li>
        </ol>
        <p>
          “Greedy” nghĩa là mỗi node lấy lựa chọn tốt nhất ngay lúc đó và không quay lại sửa các node phía trên. Một split yếu ở root
          sẽ truyền sự lộn xộn xuống toàn bộ phần cây bên dưới.
        </p>
      </ArticleSection>

      <ArticleSection id="gini-impurity" number="5" title="Gini đo mức độ lẫn lộn trong một node">
        <p>
          Với K class, Gini impurity được tính bằng <code className="inline-code">G = 1 − Σ pₖ²</code>. Node chỉ có một class đạt
          Gini bằng 0; bài toán binary lẫn đều 50/50 có Gini bằng 0.5.
        </p>
        <div className="my-6 grid gap-px border border-border bg-border md:grid-cols-3">
          <div className="bg-card p-5">
            <p className="font-mono text-xs text-muted-foreground">PARENT</p>
            <strong className="mt-2 block text-lg text-ink">5 Lemon · 5 Orange</strong>
            <p className="mt-2 font-mono text-sm text-primary">G = 0.50</p>
          </div>
          <div className="bg-card p-5">
            <p className="font-mono text-xs text-muted-foreground">SPLIT A</p>
            <strong className="mt-2 block text-lg text-ink">Hai child vẫn lẫn</strong>
            <p className="mt-2 font-mono text-sm text-primary">weighted G = 0.48</p>
          </div>
          <div className="bg-primary-soft p-5">
            <p className="font-mono text-xs text-primary-dark">SPLIT B · CHỌN</p>
            <strong className="mt-2 block text-lg text-ink">Một child đã pure</strong>
            <p className="mt-2 font-mono text-sm text-primary">weighted G = 0.167</p>
          </div>
        </div>
        <p>
          Gini của một split phải lấy trung bình có trọng số theo số sample ở mỗi child. Split B thắng vì 0.167 thấp hơn 0.48: chỉ một
          câu hỏi đã mua được nhiều certainty hơn.
        </p>
      </ArticleSection>

      <ArticleSection id="entropy-information-gain" number="6" title="Entropy diễn đạt cùng câu hỏi bằng một thang đo khác">
        <p>
          Entropy dùng <code className="inline-code">H = −Σ pₖ log₂ pₖ</code>. Thay vì trực tiếp giảm Gini, ta tối đa hóa information
          gain: entropy của parent trừ entropy có trọng số của các child.
        </p>
        <div className="my-6 overflow-x-auto border border-border bg-card">
          <table className="w-full min-w-[580px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-primary-soft text-primary-dark">
                <th className="px-4 py-3">Criterion</th>
                <th className="px-4 py-3">Cây muốn</th>
                <th className="px-4 py-3">Trong sklearn</th>
                <th className="px-4 py-3">Thực tế</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="px-4 py-3 font-semibold text-ink">Gini</td>
                <td className="px-4 py-3 text-muted-foreground">Min weighted impurity</td>
                <td className="px-4 py-3 font-mono text-muted-foreground">criterion=&quot;gini&quot;</td>
                <td className="px-4 py-3 text-muted-foreground">Mặc định, tính nhanh</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-ink">Entropy</td>
                <td className="px-4 py-3 text-muted-foreground">Max information gain</td>
                <td className="px-4 py-3 font-mono text-muted-foreground">criterion=&quot;entropy&quot;</td>
                <td className="px-4 py-3 text-muted-foreground">Thường chọn split tương tự</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Hai criterion không tạo ra hai triết lý khác nhau. Cả hai đều hỏi: “Sau split này, các nhóm có đồng nhất hơn trước không?”
        </p>
      </ArticleSection>

      <ArticleSection id="max-depth" number="7" title="max_depth là núm chỉnh độ phức tạp">
        <p>
          Cây sâu thêm một tầng có thể tạo thêm boundary. Depth thấp làm model quá cứng; depth cao cho model đủ tự do để bao quanh từng
          điểm noise. Vì vậy <code className="inline-code">max_depth</code> là complexity dial rõ nhất của Decision Tree.
        </p>
        <div className="my-6 grid gap-px border border-border bg-border md:grid-cols-3">
          <div className="bg-card p-5">
            <p className="font-mono text-xs text-primary">DEPTH 1–2</p>
            <strong className="mt-2 block text-base text-ink">Underfitting</strong>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Ít rule, bỏ lỡ cấu trúc thật.</p>
          </div>
          <div className="bg-card p-5">
            <p className="font-mono text-xs text-primary">DEPTH VỪA</p>
            <strong className="mt-2 block text-base text-ink">Generalisation tốt</strong>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Đủ pattern, chưa bám noise.</p>
          </div>
          <div className="bg-card p-5">
            <p className="font-mono text-xs text-primary">DEPTH LỚN</p>
            <strong className="mt-2 block text-base text-ink">Overfitting</strong>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Boundary vụn, ghi nhớ sample.</p>
          </div>
        </div>
        <p>
          Ngoài depth còn có <code className="inline-code">min_samples_split</code>, <code className="inline-code">min_samples_leaf</code>
          và <code className="inline-code">max_leaf_nodes</code>. Nhưng khi bắt đầu, mình ưu tiên tune một núm chính trước để biết thay
          đổi hiệu năng đến từ đâu.
        </p>
      </ArticleSection>

      <ArticleSection id="bias-variance" number="8" title="Bias và variance mô tả model qua nhiều lần lấy mẫu">
        <p>
          Training set chỉ là một sample ngẫu nhiên từ thế giới. Nếu thu thập lại dữ liệu rồi train lại, ta có model khác. Bias và
          variance mô tả cả họ model có thể xuất hiện từ những sample đó.
        </p>
        <div className="my-6 border border-border bg-card p-5">
          <p className="font-mono text-sm text-primary">
            Expected error = Bias² + Variance + Bayes error
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div>
              <strong className="text-sm text-ink">Bias²</strong>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">Tâm của các prediction lệch khỏi đáp án thật bao xa.</p>
            </div>
            <div>
              <strong className="text-sm text-ink">Variance</strong>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">Prediction thay đổi mạnh đến đâu khi training sample đổi.</p>
            </div>
            <div>
              <strong className="text-sm text-ink">Bayes error</strong>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">Noise vốn có của dữ liệu, model không thể loại bỏ hoàn toàn.</p>
            </div>
          </div>
        </div>
        <p>
          Tăng complexity thường làm bias giảm nhưng variance tăng. Mục tiêu không phải giảm một phía về 0, mà tìm điểm tổng expected
          error thấp nhất.
        </p>
      </ArticleSection>

      <ArticleSection id="doc-learning-curve" number="9" title="Đọc learning curve theo gap rồi mới nhìn level">
        <p>
          Khi model chưa tốt, mình đọc train và validation curve theo hai bước. Đầu tiên nhìn khoảng cách giữa hai đường; sau đó mới
          nhìn mức accuracy mà cả hai đạt được.
        </p>
        <div className="my-6 grid gap-px border border-border bg-border md:grid-cols-2">
          <div className="bg-card p-5">
            <p className="font-mono text-xs font-semibold text-primary">HIGH VARIANCE</p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Train cao, validation thấp và gap lớn. Giảm depth, regularize hoặc thêm dữ liệu.
            </p>
          </div>
          <div className="bg-card p-5">
            <p className="font-mono text-xs font-semibold text-primary">HIGH BIAS</p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Cả train lẫn validation cùng thấp. Tăng complexity hoặc dùng feature giàu thông tin hơn.
            </p>
          </div>
        </div>
        <p>
          Gap nhỏ chưa chắc là tin tốt: hai đường có thể cùng dừng ở 55%. Accuracy riêng lẻ cho biết model đang tệ, nhưng hình dạng của
          hai curve mới giúp chẩn đoán vì sao nó tệ.
        </p>
      </ArticleSection>

      <ArticleSection id="cross-validation" number="10" title="Cross-validation chọn depth mà không đụng vào test set">
        <p>
          Một lần chia 80/20 có thể may hoặc xui. Với 5-fold cross-validation, dữ liệu được chia thành năm phần; mỗi vòng dùng một fold
          làm validation và bốn fold còn lại để train. Mỗi sample được đánh giá đúng một lần bởi model chưa train trên nó.
        </p>
        <div className="my-6 grid gap-2 border border-border bg-card p-4 font-mono text-xs sm:grid-cols-5">
          {['Fold 1', 'Fold 2', 'Fold 3', 'Fold 4', 'Fold 5'].map((fold, validationIndex) => (
            <div key={fold} className="border border-border">
              <p className="border-b border-border px-3 py-2 text-center text-primary">{fold}</p>
              <div className="grid grid-cols-5">
                {[0, 1, 2, 3, 4].map((index) => (
                  <span key={index} className={`px-1 py-2 text-center ${index === validationIndex ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>
                    {index === validationIndex ? 'V' : 'T'}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p>
          Chọn depth bằng mean validation score của các fold, fit model cuối trên training data rồi chỉ đánh giá test set một lần.
          Nếu test tham gia chọn hyperparameter, nó không còn là phép kiểm tra độc lập.
        </p>
      </ArticleSection>

      <ArticleSection id="code" number="11" title="Một pipeline chọn max_depth bằng 5-fold CV">
        <p>
          Đoạn code dưới đây tìm depth từ 1 tới 20 trên cross-validation. <code className="inline-code">best_estimator_</code> là cây đã
          được chọn bằng validation; test accuracy chỉ được tính sau cùng.
        </p>
        <pre className="my-5 overflow-x-auto border border-code-border bg-code p-4 font-mono text-sm leading-7 text-code-foreground">
          <code>{treeCode}</code>
        </pre>
      </ArticleSection>

      <ArticleSection id="tong-ket" number="12" title="Điều mình giữ lại sau Week 2">
        <p>
          Decision Tree biến dữ liệu thành một chuỗi câu hỏi dễ đọc. Gini hoặc Entropy giúp chọn câu hỏi tại từng node, còn max_depth
          quyết định model được phép phức tạp tới đâu.
        </p>
        <p>
          Phần quan trọng hơn thuật toán là cách chẩn đoán. Train tốt dần không đồng nghĩa model tốt dần. Khi validation giảm và gap mở
          rộng, cây đã đi từ học pattern sang ghi nhớ sample. Bias–variance và cross-validation cho mình ngôn ngữ lẫn quy trình để nhận
          ra điểm chuyển đó.
        </p>
        <div className="my-6 border border-border bg-card p-4 text-sm leading-7 text-muted-foreground">
          Nội dung được tổng hợp và viết lại từ MLA Week 2 — “Decision Trees” và “Bias-Variance Tradeoff”, MSc. Bui Quoc Khanh,
          Faculty of Information Technology, Hanoi University, Semester 1 AY 2026–2027.
        </div>
      </ArticleSection>
    </ArticleShell>
  );
}
