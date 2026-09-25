import type { Metadata } from 'next';
import { AlertTriangle, CheckCircle2, Gauge, Scale, Target } from 'lucide-react';
import { ArticleIntro, ArticleSection, ArticleShell } from '@/components/article-shell';
import { ClassificationMetricsLab } from '@/components/classification-metrics-lab';

export const metadata: Metadata = {
  title: 'Đọc kết quả model: Loss, Accuracy, Precision, Recall và F1 | tiendat13ns',
  description: 'Cách mình đọc kết quả classification model qua loss, confusion matrix, accuracy, precision, recall, F1 và threshold.',
};

const metricCards = [
  {
    name: 'Accuracy',
    question: 'Tổng thể model đúng bao nhiêu?',
    formula: '(TP + TN) / All',
    goodWhen: 'Các class tương đối cân bằng và chi phí sai giữa các class gần nhau.',
  },
  {
    name: 'Precision',
    question: 'Trong những mẫu model báo positive, bao nhiêu mẫu đúng?',
    formula: 'TP / (TP + FP)',
    goodWhen: 'False positive đắt, ví dụ tự động khóa nhầm tài khoản hợp lệ.',
  },
  {
    name: 'Recall',
    question: 'Trong toàn bộ positive thật, model tìm được bao nhiêu?',
    formula: 'TP / (TP + FN)',
    goodWhen: 'False negative nguy hiểm, ví dụ bỏ sót gian lận hoặc lỗi nghiêm trọng.',
  },
  {
    name: 'F1',
    question: 'Precision và recall cân bằng tới đâu?',
    formula: '2 × P × R / (P + R)',
    goodWhen: 'Cần một số duy nhất nhưng accuracy không đáng tin do lệch class.',
  },
];

export default function ModelMetricsArticlePage() {
  return (
    <ArticleShell currentHref="/bai-viet/danh-gia-model-loss-accuracy-precision-recall-f1">
      <ArticleIntro
        eyebrow="Machine Learning · Evaluation"
        title="Đọc kết quả model: Loss, Accuracy, Precision, Recall và F1"
        description="Một model trả về rất nhiều con số, nhưng mỗi con số đang trả lời một câu hỏi khác nhau. Đây là cách mình đọc chúng từ training loop tới hành vi thật của model trên dữ liệu mới."
        date="22/09/2026"
        readTime="13 phút đọc"
        tags={['AI', 'Machine Learning', 'Evaluation']}
      />

      <div className="mb-2 grid gap-4 border border-primary/20 bg-primary-soft p-5 sm:grid-cols-[auto_1fr] sm:p-6">
        <Gauge className="text-primary" size={24} />
        <p className="text-sm leading-7 text-muted-foreground">
          Điều mình luôn tách riêng: <strong className="text-ink">loss giúp model học, metric giúp con người đánh giá.</strong> Loss thấp hơn chưa chắc sản phẩm tốt hơn nếu metric không phản ánh đúng chi phí của false positive và false negative.
        </p>
      </div>

      <ArticleSection id="loss-la-gi" number="1" title="Loss là tín hiệu tối ưu, không phải điểm số để khoe">
        <p>
          Loss function biến mức độ sai của prediction thành một giá trị mà gradient descent có thể tối ưu. Trong classification, cross-entropy phạt model mạnh khi dự đoán sai nhưng lại rất tự tin. Trong regression, MSE phạt sai số lớn mạnh hơn vì sai số được bình phương.
        </p>
        <div className="grid gap-px border border-border bg-border sm:grid-cols-3">
          {[
            ['Training loss', 'Giá trị trên batch model đang dùng để cập nhật parameter.'],
            ['Validation loss', 'Giá trị trên dữ liệu không dùng để update; giúp phát hiện overfitting.'],
            ['Test loss', 'Đánh giá cuối cùng trên tập dữ liệu được giữ lại tới cuối quy trình.'],
          ].map(([title, text]) => (
            <div className="bg-card p-4" key={title}><h3 className="font-semibold text-ink">{title}</h3><p className="mt-2 text-sm leading-6">{text}</p></div>
          ))}
        </div>
        <p>
          Không nên so trực tiếp loss giữa hai bài toán hoặc hai loss function khác nhau. Con số <code className="inline-code">0.2</code> chỉ có ý nghĩa khi mình biết loss nào được dùng, cách reduce ra sao và nó thay đổi như thế nào so với baseline hoặc epoch trước.
        </p>
      </ArticleSection>

      <ArticleSection id="confusion-matrix" number="2" title="Bốn ô đứng sau các metric classification">
        <p>
          Với binary classification, mọi prediction rơi vào một trong bốn ô. <strong className="text-ink">True/False</strong> cho biết model đúng hay sai; <strong className="text-ink">Positive/Negative</strong> là class model dự đoán. Khi hiểu bốn ô này, công thức metric không còn là thứ phải học thuộc.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ['TP · True Positive', 'Model báo positive và thực tế cũng positive.'],
            ['FP · False Positive', 'Model báo positive nhưng thực tế negative — cảnh báo giả.'],
            ['FN · False Negative', 'Model báo negative nhưng thực tế positive — bỏ sót.'],
            ['TN · True Negative', 'Model báo negative và thực tế cũng negative.'],
          ].map(([title, text]) => (
            <div className="border border-border bg-card p-4" key={title}><h3 className="font-mono text-sm font-semibold text-primary">{title}</h3><p className="mt-2 text-sm leading-6">{text}</p></div>
          ))}
        </div>
      </ArticleSection>

      <ArticleSection id="metric-lab" number="3" title="Thử thay đổi confusion matrix">
        <p>
          Kéo từng thanh hoặc chọn một tình huống có sẵn. Hãy để ý accuracy có thể vẫn cao trong dữ liệu lệch class, trong khi recall của class quan trọng lại không tốt.
        </p>
        <ClassificationMetricsLab />
      </ArticleSection>

      <ArticleSection id="bon-metric" number="4" title="Mỗi metric trả lời một câu hỏi">
        <div className="grid gap-px border border-border bg-border sm:grid-cols-2">
          {metricCards.map((metric) => (
            <div className="bg-card p-5" key={metric.name}>
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold text-ink">{metric.name}</h3>
                <code className="font-mono text-[10px] text-primary">{metric.formula}</code>
              </div>
              <p className="mt-3 text-sm font-medium text-primary">{metric.question}</p>
              <p className="mt-2 text-sm leading-6">{metric.goodWhen}</p>
            </div>
          ))}
        </div>
        <p>
          F1 là harmonic mean nên chỉ cao khi cả precision lẫn recall đều khá. Nhưng F1 bỏ qua true negative; nếu TN quan trọng hoặc chi phí FP/FN rất khác nhau, mình vẫn cần nhìn confusion matrix và metric riêng thay vì chỉ giữ một con số F1.
        </p>
      </ArticleSection>

      <ArticleSection id="accuracy-trap" number="5" title="Cái bẫy của accuracy khi dữ liệu lệch class">
        <p>
          Giả sử 1.000 request chỉ có 10 request gian lận. Một model luôn trả về “bình thường” sẽ đúng 990 lần, tức accuracy 99%. Nhưng recall của fraud bằng 0% vì model bỏ sót cả 10 trường hợp cần tìm.
        </p>
        <div className="flex gap-3 border border-primary/25 bg-primary-soft p-5">
          <AlertTriangle className="mt-1 shrink-0 text-primary" size={20} />
          <p className="text-sm leading-7">
            Trước khi đọc accuracy, mình luôn kiểm tra phân phối class và baseline đơn giản nhất. Nếu class lớn nhất chiếm 99%, accuracy 99% chưa nói được model đã học gì.
          </p>
        </div>
        <p>
          Với dữ liệu lệch, mình thường theo dõi precision, recall, F1, PR-AUC và confusion matrix theo từng class. ROC-AUC vẫn hữu ích, nhưng trong một số bài toán positive rất hiếm, precision–recall curve phản ánh trực tiếp hơn chất lượng của class cần quan tâm.
        </p>
      </ArticleSection>

      <ArticleSection id="threshold" number="6" title="Threshold thay đổi precision và recall">
        <p>
          Model classification thường trả score hoặc probability, sau đó threshold biến score thành nhãn. Threshold không nhất thiết phải là 0.5. Hạ threshold giúp bắt được nhiều positive hơn, recall tăng nhưng thường kéo theo nhiều false positive hơn nên precision giảm.
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ['Threshold thấp', 'Nhiều mẫu được báo positive', 'Recall ↑ · FP có thể ↑'],
            ['Threshold vừa', 'Điểm cân bằng theo validation', 'Tùy chi phí nghiệp vụ'],
            ['Threshold cao', 'Chỉ báo positive khi rất tự tin', 'Precision ↑ · FN có thể ↑'],
          ].map(([title, text, result]) => (
            <div className="border border-border bg-card p-4" key={title}>
              <h3 className="font-semibold text-ink">{title}</h3><p className="mt-2 text-sm leading-6">{text}</p><p className="mt-3 font-mono text-xs text-primary">{result}</p>
            </div>
          ))}
        </div>
        <p>
          Vì vậy threshold nên được chọn trên validation set dựa trên mục tiêu sản phẩm: giới hạn số cảnh báo giả, đạt recall tối thiểu, hoặc tối thiểu hóa một cost function cụ thể. Đây là quyết định vận hành, không chỉ là quyết định của model.
        </p>
      </ArticleSection>

      <ArticleSection id="multiclass" number="7" title="Multi-class cần nói rõ cách average">
        <p>
          Với nhiều class, precision, recall và F1 được tính cho từng class rồi tổng hợp. Tên metric giống nhau nhưng kết quả khác đáng kể tùy cách average:
        </p>
        <div className="grid gap-px border border-border bg-border sm:grid-cols-3">
          {[
            ['Macro', 'Tính metric từng class rồi lấy trung bình. Mỗi class có trọng số như nhau, kể cả class hiếm.'],
            ['Weighted', 'Trung bình theo số mẫu của từng class. Class lớn ảnh hưởng nhiều hơn.'],
            ['Micro', 'Gộp toàn bộ TP, FP, FN trước khi tính. Phản ánh hiệu suất tổng thể trên từng sample.'],
          ].map(([title, text]) => (
            <div className="bg-card p-4" key={title}><h3 className="font-semibold text-primary">{title}</h3><p className="mt-2 text-sm leading-6">{text}</p></div>
          ))}
        </div>
        <p>
          Nếu báo cáo chỉ ghi “F1 = 0.86” mà không nói class nào, average gì và threshold bao nhiêu, mình chưa đủ thông tin để đánh giá model.
        </p>
      </ArticleSection>

      <ArticleSection id="train-validation" number="8" title="Đọc loss và metric theo thời gian">
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ['Đang học tốt', 'Train loss giảm; validation loss và metric cải thiện cùng hướng.'],
            ['Overfitting', 'Train loss tiếp tục giảm nhưng validation loss tăng hoặc metric xấu đi.'],
            ['Underfitting', 'Cả train và validation đều kém; model, feature hoặc training setup chưa đủ.'],
          ].map(([title, text]) => (
            <div className="border border-border bg-card p-4" key={title}><Target className="text-primary" size={18} /><h3 className="mt-3 font-semibold text-ink">{title}</h3><p className="mt-2 text-sm leading-6">{text}</p></div>
          ))}
        </div>
        <p>
          Mình không chọn checkpoint chỉ theo training loss. Thường checkpoint tốt nhất là nơi validation metric gắn với bài toán đạt mức tốt nhất, đồng thời loss và các class quan trọng không có dấu hiệu bất thường.
        </p>
      </ArticleSection>

      <ArticleSection id="chon-metric" number="9" title="Cách mình chọn metric chính">
        <div className="space-y-3">
          {[
            'Bắt đầu từ hậu quả của false positive và false negative trong sản phẩm.',
            'Kiểm tra tỷ lệ class trước khi nhìn accuracy.',
            'Chọn một primary metric để tối ưu nhưng vẫn theo dõi confusion matrix và metric phụ.',
            'Chọn threshold trên validation set, không dùng test set để điều chỉnh.',
            'Đánh giá lại trên dữ liệu production vì phân phối có thể khác dữ liệu training.',
          ].map((item) => (
            <div className="flex gap-3 border border-border bg-card px-4 py-3" key={item}><CheckCircle2 className="mt-1 shrink-0 text-primary" size={17} /><p className="text-sm leading-6">{item}</p></div>
          ))}
        </div>
        <div className="mt-5 flex gap-3 border-l-2 border-primary bg-primary-soft px-5 py-4">
          <Scale className="mt-1 shrink-0 text-primary" size={19} />
          <p className="text-sm leading-7">
            Metric tốt không phải metric cao nhất, mà là metric đo đúng loại sai lầm sản phẩm cần hạn chế. Model chỉ tối ưu con số mình đưa cho nó; trách nhiệm của mình là chọn con số có ý nghĩa.
          </p>
        </div>
      </ArticleSection>
    </ArticleShell>
  );
}
