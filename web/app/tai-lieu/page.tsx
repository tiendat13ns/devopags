import type { Metadata } from 'next';
import { DocumentList } from '@/components/document-list';
import { PrimaryHeader } from '@/components/primary-header';
import { documents } from '@/lib/documents';

export const metadata: Metadata = {
  title: 'Tài liệu DevOps & AI | tiendat13ns',
  description: 'Tài liệu và ghi chép thực hành về Linux, Git, Docker, DevOps và AI, Machine Learning, Deep Learning.',
};

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

        <DocumentList items={documents} />
      </div>
    </main>
  );
}
