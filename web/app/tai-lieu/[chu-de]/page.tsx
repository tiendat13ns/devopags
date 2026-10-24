import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { PrimaryHeader } from '@/components/primary-header';
import { documents, type DocumentEntry } from '@/lib/documents';
import { filterDocuments, findTopic, topicTags, topics } from '@/lib/topics';

type Params = Promise<{ 'chu-de': string }>;

export const dynamicParams = false;

export function generateStaticParams() {
  return topics.map((topic) => ({ 'chu-de': topic.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const topic = findTopic((await params)['chu-de']);
  if (!topic) return {};

  return {
    title: `${topic.label} | tiendat13ns`,
    description: `Toàn bộ bài viết về ${topic.label}: ${topic.summary}.`,
  };
}

function TopicArticles({ items }: { items: DocumentEntry[] }) {
  return (
    <ul className="border-t border-border">
      {items.map((item) => (
        <li key={item.href}>
          <Link
            className="group/article grid gap-2 border-b border-border px-1 py-5 no-underline! transition-colors hover:bg-primary-soft/60 sm:grid-cols-[1fr_auto] sm:gap-6 sm:px-4"
            href={item.href}
          >
            <span>
              <span className="block text-base font-semibold leading-6 text-ink transition-colors group-hover/article:text-primary">
                {item.title}
              </span>
              <span className="mt-1.5 block max-w-2xl text-sm leading-6 text-muted-foreground">{item.description}</span>
              <span className="mt-3 flex flex-wrap gap-1.5">
                {item.tags.map((tag) => (
                  <span className="border border-primary/20 bg-primary-soft px-2 py-0.5 font-mono text-[0.7rem] font-semibold text-primary-dark" key={tag}>
                    {tag}
                  </span>
                ))}
              </span>
            </span>
            <span className="font-mono text-xs text-muted-foreground sm:pt-1">
              {item.date} · {item.readTime}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default async function TopicPage({ params }: { params: Params }) {
  const topic = findTopic((await params)['chu-de']);
  if (!topic) notFound();

  const total = filterDocuments(documents, topicTags(topic)).length;
  const sections = topic.subcategories
    ? topic.subcategories
        .map((sub) => ({ label: sub.label, items: filterDocuments(documents, sub.tags) }))
        .filter((section) => section.items.length > 0)
    : [{ label: '', items: filterDocuments(documents, topicTags(topic)) }];

  return (
    <main className={`article-reading-bg min-h-screen text-foreground ${topic.themeClass}`}>
      <PrimaryHeader active="tai-lieu" />
      <div className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
        <Link className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground no-underline! transition-colors hover:text-primary" href="/tai-lieu">
          <ArrowLeft size={15} /> Tài liệu
        </Link>

        <header className="mt-6 max-w-3xl border-l-4 border-primary pl-5">
          <p className="section-eyebrow">Chủ đề</p>
          <h1 className="mt-2 text-4xl font-bold tracking-[-0.045em] text-ink sm:text-5xl">{topic.label}</h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground">{topic.summary}</p>
          <p className="mt-3 font-mono text-xs text-muted-foreground">{total} bài viết</p>
        </header>

        {total > 0 ? (
          <div className="mt-12 space-y-12">
            {sections.map((section) => (
              <section key={section.label || topic.slug} aria-label={section.label || topic.label}>
                {section.label ? (
                  <h2 className="mb-3 text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-primary">
                    {section.label} <span className="font-mono font-normal text-muted-foreground">· {section.items.length}</span>
                  </h2>
                ) : null}
                <TopicArticles items={section.items} />
              </section>
            ))}
          </div>
        ) : (
          <p className="mt-12 border border-border bg-card/45 px-4 py-8 text-sm text-muted-foreground">Chưa có bài viết trong chủ đề này.</p>
        )}
      </div>
    </main>
  );
}
