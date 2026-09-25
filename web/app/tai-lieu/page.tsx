import type { Metadata } from 'next';
import { DocumentList, type DocumentEntry } from '@/components/document-list';
import { PrimaryHeader } from '@/components/primary-header';

export const metadata: Metadata = {
  title: 'Tài liệu DevOps & AI | tiendat13ns',
  description: 'Tài liệu và ghi chép thực hành về Linux, Git, Docker, DevOps và AI, Machine Learning, Deep Learning.',
};

const posts: DocumentEntry[] = [
  {
    title: 'Decision Tree và cách kiểm soát bias–variance',
    description: 'Từ root, branch, leaf, Gini và Entropy đến max_depth, learning curve, bias–variance và cross-validation.',
    date: '23/09/2026',
    readTime: '18 phút đọc',
    tags: ['Machine Learning', 'Decision Tree', 'Model Selection'],
    href: '/bai-viet/decision-tree-va-bias-variance',
    accent: 'amethyst',
  },  {
    title: 'Nhập môn Machine Learning với KNN',
    description: 'Từ input, feature, label, loss và generalisation đến KNN, distance metric, scaling, validation và giới hạn của dữ liệu nhiều chiều.',
    date: '23/09/2026',
    readTime: '18 phút đọc',
    tags: ['Machine Learning', 'Supervised Learning', 'KNN'],
    href: '/bai-viet/nhap-mon-machine-learning-va-knn',
    accent: 'amethyst',
  },
  {
    title: 'Kiến trúc Transformer',
    description: 'Từ embedding và positional encoding đến multi-head attention, residual, feed-forward cùng ba họ Transformer phổ biến.',
    date: '23/09/2026',
    readTime: '17 phút đọc',
    tags: ['AI', 'Attention', 'Transformer'],
    href: '/bai-viet/kien-truc-transformer',
    accent: 'amethyst',
  },
  {
    title: 'Cơ chế Attention',
    description: 'Hiểu Query, Key, Value, scaled dot-product, mask và multi-head attention qua mô phỏng trọng số giữa các token.',
    date: '23/09/2026',
    readTime: '15 phút đọc',
    tags: ['AI', 'Deep Learning', 'Attention'],
    href: '/bai-viet/co-che-attention',
    accent: 'amethyst',
  },
  {
    title: 'So sánh RNN, LSTM và GRU',
    description: 'So sánh memory, gate, parameter, tốc độ và độ ổn định; đối chiếu với benchmark 100 lần chạy trên ba bộ time series.',
    date: '23/09/2026',
    readTime: '16 phút đọc',
    tags: ['AI', 'RNN', 'Time Series'],
    href: '/bai-viet/so-sanh-rnn-lstm-gru',
    accent: 'amethyst',
  },
  {
    title: 'Kiến trúc RNN',
    description: 'Hiểu cách RNN đọc chuỗi theo từng timestep, truyền hidden state và vì sao LSTM, GRU giúp mạng ghi nhớ tốt hơn.',
    date: '23/09/2026',
    readTime: '15 phút đọc',
    tags: ['AI', 'Deep Learning', 'RNN'],
    href: '/bai-viet/kien-truc-rnn-la-gi',
    accent: 'amethyst',
  },
  {
    title: 'Kiến trúc CNN',
    description: 'Hiểu cách kernel quét ảnh, tạo feature map và cách channel, stride, padding, pooling phối hợp trong một CNN.',
    date: '23/09/2026',
    readTime: '15 phút đọc',
    tags: ['AI', 'Deep Learning', 'CNN'],
    href: '/bai-viet/kien-truc-cnn-la-gi',
    accent: 'amethyst',
  },
  {
    title: 'Kiến trúc MLP',
    description: 'Từ vector đầu vào qua các fully connected layer, activation, logits và cách tính parameter của một MLP.',
    date: '23/09/2026',
    readTime: '14 phút đọc',
    tags: ['AI', 'Deep Learning', 'MLP'],
    href: '/bai-viet/kien-truc-mlp-la-gi',
    accent: 'amethyst',
  },
  {
    title: 'Đọc kết quả model: Loss, Accuracy, Precision, Recall và F1',
    description: 'Phân biệt loss và metric, đọc confusion matrix, hiểu threshold và chọn metric phù hợp với chi phí sai của sản phẩm.',
    date: '22/09/2026',
    readTime: '13 phút đọc',
    tags: ['AI', 'Deep Learning'],
    href: '/bai-viet/danh-gia-model-loss-accuracy-precision-recall-f1',
    accent: 'amethyst',
  },
  {
    title: 'Dữ liệu đi vào mạng dưới dạng gì?',
    description: 'Hiểu cách ảnh, text, bảng và graph được biểu diễn thành vector, tensor, token ID, embedding và cấu trúc số cho model.',
    date: '22/09/2026',
    readTime: '14 phút đọc',
    tags: ['AI', 'Deep Learning'],
    href: '/bai-viet/du-lieu-vao-mang-vector-tensor-token-embedding-graph',
    accent: 'amethyst',
  },
  {
    title: 'Hàm kích hoạt',
    description: 'Hiểu vai trò của tính phi tuyến, ReLU, Sigmoid, Tanh, GELU, Softmax và cách chọn activation cho từng bài toán.',
    date: '22/09/2026',
    readTime: '12 phút đọc',
    tags: ['AI', 'Deep Learning'],
    href: '/bai-viet/ham-kich-hoat-la-gi',
    accent: 'amethyst',
  },
  {
    title: 'Deep Learning',
    description: 'Cách mình hiểu Deep Learning: vị trí trong AI, parameter, weight, bias, training, inference và các architecture phổ biến.',
    date: '22/09/2026',
    readTime: '14 phút đọc',
    tags: ['AI', 'Deep Learning'],
    href: '/bai-viet/deep-learning-la-gi',
    accent: 'amethyst',
  },
  {
    title: 'Tư duy triển khai bất kỳ dự án nào cho DevOps',
    description: 'Cách xác định runtime, phiên bản, cấu hình, quy trình build và cách chạy một ứng dụng an toàn trên Linux.',
    date: '16/09/2026',
    readTime: '10 phút đọc',
    tags: ['Linux', 'DevOps', 'Deployment'],
    href: '/bai-viet/tu-duy-trien-khai-du-an',
    accent: 'amethyst',
  },
  {
    title: 'Linux là gì và tại sao Linux cần thiết cho DevOps?',
    description: 'Hiểu Linux từ kernel, distribution đến vai trò của Linux trong server, container, cloud và công việc DevOps hằng ngày.',
    date: '16/09/2026',
    readTime: '9 phút đọc',
    tags: ['Linux', 'DevOps', 'Cơ bản'],
    href: '/bai-viet/linux-la-gi',
    accent: 'amethyst',
  },
  {
    title: 'Docker là gì và tại sao nên dùng Docker?',
    description: 'Tìm hiểu image, container, registry và cách Docker giúp môi trường phát triển, CI và production nhất quán hơn.',
    date: '16/09/2026',
    readTime: '10 phút đọc',
    tags: ['Docker', 'Container', 'DevOps'],
    href: '/bai-viet/docker-la-gi',
    accent: 'docker',
  },
  {
    title: 'Linux & Git Cheatsheet cho DevOps Intern',
    description: 'Các lệnh thường dùng trên server và workflow Git hằng ngày, được nhóm lại để tra cứu nhanh.',
    date: '15/09/2026',
    readTime: '15 phút đọc',
    tags: ['Linux', 'Git'],
    href: '/bai-viet/linux-git-cheatsheet',
    accent: 'amethyst',
  },
];

export default function DocumentsPage() {
  return (
    <main className="article-reading-bg min-h-screen text-foreground">
      <PrimaryHeader active="tai-lieu" />
      <div className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
        <header className="max-w-3xl">
          <h1 className="mt-3 text-4xl font-bold tracking-[-0.045em] text-ink sm:text-5xl">Tài liệu</h1>
          <p className="mt-5 text-base leading-7 text-muted-foreground">
            Ghi chép kỹ thuật, cheatsheet và bài thực hành về DevOps cùng AI, Machine Learning, Deep Learning — sắp xếp để dễ tìm lại khi học và làm.
          </p>
        </header>

        <DocumentList items={posts} />
      </div>
    </main>
  );
}
