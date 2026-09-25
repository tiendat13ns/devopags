import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { PrimaryHeader } from '@/components/primary-header';

export const metadata: Metadata = {
  title: 'Three Wise Monkeys | tiendat13ns',
  description:
    'Từ màn ăn mừng của ba cầu thủ PSV đến câu chuyện về biểu tượng không nhìn, không nghe, không nói điều ác.',
};

const sectionClassName = 'scroll-mt-24 pt-6';
const headingClassName = 'text-xl font-semibold tracking-normal text-ink sm:text-2xl';
const copyClassName = 'mt-5 space-y-5 text-base leading-8 text-muted-foreground';

export default function ThreeWiseMonkeysPage() {
  return (
    <main className="article-reading-bg min-h-screen text-foreground">
      <PrimaryHeader active="chia-se" />

      <article className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-8 sm:py-16">
        <Link
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
          href="/chia-se"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Trở lại Chia sẻ
        </Link>

        <header className="mt-9 border-l-2 border-primary pl-6 sm:pl-8">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-primary">Văn hóa · Bóng đá</p>
          <h1 className="mt-3 text-2xl font-semibold leading-[1.25] tracking-normal text-ink sm:text-3xl">
            Three Wise Monkeys
          </h1>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            Từ màn ăn mừng của ba cầu thủ PSV đến câu chuyện phía sau biểu tượng “không nhìn, không nghe, không nói điều ác”.
          </p>
          <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 font-mono text-xs text-muted-foreground">
            <time dateTime="2026-09-16">16/09/2026</time>
            <span>5 phút đọc</span>
          </div>
        </header>

        <div className="mt-12 space-y-12">
          <p className="text-lg leading-9 text-ink">
            Hôm nay tôi có xem TikTok và thấy 3 cầu thủ PSV: Noa Lang, Flamingo và một cầu thủ tôi không biết tên, pose dáng khi ăn mừng bàn thắng. Mỗi cầu thủ đều có hand sign hay celebration riêng khi họ ăn mừng. Tôi đã đọc comment và thấy họ nói về “three wise monkeys”, tôi search trên Google và đọc nhiều hơn về cái này — hoá ra nó xuất hiện ở khá nhiều nơi.
          </p>

          <section id="khoanh-khac-tren-san-co" className={sectionClassName}>
            <h2 className={headingClassName}>Khoảnh khắc trên sân cỏ</h2>
            <div className={copyClassName}>
              <p>
                Cầu thủ thứ ba trong video chính là <strong className="text-ink">Johan Bakayoko</strong>, cùng với <strong className="text-ink">Noa Lang</strong> và <strong className="text-ink">Ryan Flamingo</strong>. Celebration này được họ trình diễn trong trận lượt về vòng play-off Champions League 2024/25, khi PSV đánh bại Juventus với tỷ số 3-1 (thắng chung cuộc 4-3) để giành vé vào vòng 1/8.
              </p>
              <p>
                Theo mô tả từ báo chí thể thao, mỗi người đảm nhận một vai trong bộ ba: Lang thực hiện động tác “suỵt” bằng tay che miệng, Bakayoko khoanh tay che tai, còn Flamingo dùng hai tay che mắt. Đây chính là hình ảnh tái hiện lại biểu tượng “không nhìn – không nghe – không nói điều ác” nổi tiếng. Màn ăn mừng phối hợp ăn ý này sau đó lan truyền mạnh trên TikTok và X (Twitter), được gọi vui là “AURA” celebration của bộ ba PSV.
              </p>
            </div>
          </section>

          <section id="three-wise-monkeys-la-gi" className={sectionClassName}>
            <h2 className={headingClassName}>Vậy “Three Wise Monkeys” là gì?</h2>
            <div className={copyClassName}>
              <p>
                <strong className="text-ink">Ba con khỉ khôn ngoan</strong> (Three Wise Monkeys) là biểu tượng văn hóa nổi tiếng, gắn liền với câu châm ngôn: <em>“Không nhìn điều ác, không nghe điều ác, không nói điều ác”</em> — tiếng Nhật: 見ざる、聞かざる、言わざる (Mizaru, Kikazaru, Iwazaru).
              </p>
              <p>Ba con khỉ tượng trưng cho:</p>
              <ul className="border-l-2 border-primary/35 pl-5">
                <li className="py-2"><strong className="text-ink">Mizaru</strong> (見猿) – bịt mắt – “không nhìn điều xấu”</li>
                <li className="py-2"><strong className="text-ink">Kikazaru</strong> (聞か猿) – bịt tai – “không nghe điều xấu”</li>
                <li className="py-2"><strong className="text-ink">Iwazaru</strong> (言わ猿) – bịt miệng – “không nói điều xấu”</li>
              </ul>
            </div>
          </section>

          <section id="nguon-goc" className={sectionClassName}>
            <h2 className={headingClassName}>Nguồn gốc</h2>
            <div className={copyClassName}>
              <ul className="space-y-4 pl-5 [list-style:square] marker:text-primary">
                <li>Hình tượng nổi tiếng nhất được chạm khắc tại đền <strong className="text-ink">Toshogu</strong> ở Nikko, Nhật Bản, vào thế kỷ 17, do nghệ nhân Hidari Jingoro thực hiện.</li>
                <li>Nhiều học giả cho rằng gốc rễ triết lý này đến sâu xa hơn, từ <strong className="text-ink">Nho giáo Trung Quốc</strong> — cụ thể là lời dạy của Khổng Tử trong sách Luận Ngữ, khuyên con người tránh nhìn, nghe, nói và hành động trái với lễ nghĩa.</li>
                <li>Cách chơi chữ thú vị: hậu tố phủ định “-zaru” trong tiếng Nhật cổ phát âm gần giống “saru” (con khỉ), nên hình ảnh con khỉ được chọn để minh họa cho triết lý này một cách dí dỏm.</li>
                <li>Một số phiên bản còn có thêm con khỉ thứ tư — <strong className="text-ink">Shizaru</strong> — khoanh tay che bụng, tượng trưng cho “không làm điều ác” (do no evil).</li>
              </ul>
            </div>
          </section>

          <section id="y-nghia" className={sectionClassName}>
            <h2 className={headingClassName}>Ý nghĩa</h2>
            <div className={copyClassName}>
              <p>
                Ở Nhật Bản và Đông Á nói chung, ba con khỉ là biểu tượng cho lối sống đạo đức: tránh xa thị phi, không chứng kiến, không lan truyền, không dự phần vào điều xấu. Ngày nay, hình ảnh này đã vượt ra khỏi ý nghĩa tôn giáo – triết học ban đầu, trở thành một biểu tượng văn hóa đại chúng toàn cầu — xuất hiện trong đồ lưu niệm, thiết kế, meme, và giờ đây là cả... celebration ăn mừng bàn thắng trên sân cỏ châu Âu.
              </p>
            </div>
          </section>

          <section id="ket" className={sectionClassName}>
            <h2 className={headingClassName}>Kết</h2>
            <div className={copyClassName}>
              <p>
                Với bản thân, hình tượng ba con khỉ này tôi nhận ra đã được gặp ở khá nhiều bộ phim, truyện tranh Nhật Bản mà các tác giả đã đưa vào, tuy nhiên chúng ta không hề hay biết. Không chỉ là một biểu tượng văn hóa mà là những triết lý sâu xa trong cuộc sống mà con người nên áp dụng vào để hoàn thiện bản thân mình.
              </p>
              <p>
                Đây là bài viết mở đầu cho những gì tôi thấy hay, ý nghĩa. Tôi sẽ viết ở đây để chia sẻ lại, biết đâu sẽ có người đọc và thích về những gì tôi viết kk.
              </p>
            </div>
          </section>

          <section id="nguon-tham-khao" className={sectionClassName}>
            <h2 className={headingClassName}>Nguồn tham khảo</h2>
            <a
              className="mt-5 inline-flex items-center gap-2 font-semibold text-primary hover:text-primary-dark hover:underline"
              href="https://en.wikipedia.org/wiki/Three_wise_monkeys"
              target="_blank"
              rel="noreferrer"
            >
              Wikipedia — Three Wise Monkeys
              <ExternalLink size={15} aria-hidden="true" />
            </a>
          </section>
        </div>
      </article>

      <footer className="mt-8 border-t border-border bg-card/50">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-8 text-sm sm:px-8">
          <span className="font-bold text-ink">tiendat13ns</span>
          <Link className="font-semibold text-muted-foreground hover:text-primary" href="/chia-se">
            Xem các bài chia sẻ
          </Link>
        </div>
      </footer>
    </main>
  );
}
