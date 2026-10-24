'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { DocumentEntry } from '@/lib/documents';
import { filterDocuments, topicTags, topics, type Tone } from '@/lib/topics';

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLocaleLowerCase('vi');
}

function matchesQuery(item: DocumentEntry, query: string) {
  return normalize([item.title, item.description, ...item.tags].join(' ')).includes(query);
}

function ArticleList({ documents, tone }: { documents: DocumentEntry[]; tone: Tone }) {
  return (
    <div className="bg-card/60 [&_a]:no-underline!">
      {documents.map((item) => (
        <Link
          className={`group/article grid gap-2 border-t border-border px-4 py-4 transition-colors sm:grid-cols-[1fr_auto] sm:items-start sm:gap-6 sm:px-6 ${tone.row}`}
          href={item.href}
          key={item.href}
        >
          <span>
            <span className={`block text-sm font-semibold leading-6 text-ink transition-colors sm:text-base ${tone.title}`}>
              {item.title}
            </span>
            <span className="mt-1 block max-w-2xl text-sm leading-6 text-muted-foreground">
              {item.description}
            </span>
          </span>
          <span className="font-mono text-xs text-muted-foreground sm:pt-1">
            {item.date} · {item.readTime}
          </span>
        </Link>
      ))}
    </div>
  );
}

export function DocumentList({ items }: { items: DocumentEntry[] }) {
  const [query, setQuery] = useState('');
  const normalizedQuery = normalize(query.trim());
  const searching = normalizedQuery.length > 0;

  const topicGroups = useMemo(
    () =>
      topics.map((topic) => {
        const documents = filterDocuments(items, topicTags(topic));
        return {
          ...topic,
          count: documents.length,
          matches: normalizedQuery ? documents.filter((item) => matchesQuery(item, normalizedQuery)) : [],
        };
      }),
    [items, normalizedQuery],
  );

  const visibleTopics = searching ? topicGroups.filter((topic) => topic.matches.length > 0) : topicGroups;

  return (
    <section id="bai-viet" className="mt-14 scroll-mt-24" aria-labelledby="topics-title">
      <div className="border-b border-border pb-3">
        <h2 id="topics-title" className="text-2xl font-semibold tracking-normal text-ink">Chủ đề</h2>
      </div>

      <div className="mt-4 max-w-sm">
        <label className="sr-only" htmlFor="document-search">Tìm tài liệu</label>
        <input
          id="document-search"
          className="h-11 w-full border border-border bg-card/50 px-3 text-sm text-ink outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Tìm bài viết"
        />
      </div>

      {visibleTopics.length > 0 ? (
        <div className={`mt-7 grid grid-cols-1 items-start gap-5 ${searching ? '' : 'md:grid-cols-2'}`}>
          {visibleTopics.map((topic) => (
            <div
              className={`overflow-hidden border border-l-4 bg-card/70 shadow-sm md:[&:last-child:nth-child(odd)]:col-span-2 ${topic.tone.card}`}
              key={topic.slug}
            >
              <Link
                className={`flex w-full items-center gap-3 px-4 py-4 text-base font-semibold text-ink no-underline! transition-colors sm:px-5 ${topic.tone.header}`}
                href={`/tai-lieu/${topic.slug}`}
              >
                <span className="min-w-0">
                  <span className="block">{topic.label}</span>
                  <span className="block truncate text-xs font-normal text-muted-foreground">{topic.summary}</span>
                </span>
                <span className="ml-auto shrink-0 font-mono text-xs font-normal text-muted-foreground">
                  {searching ? `${topic.matches.length}/${topic.count}` : topic.count} bài
                </span>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              </Link>

              {searching ? <ArticleList documents={topic.matches} tone={topic.tone} /> : null}
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-7 border border-border bg-card/45 px-4 py-8">
          <p className="font-semibold text-ink">Không tìm thấy bài viết phù hợp.</p>
          <p className="mt-2 text-sm text-muted-foreground">Thử tìm bằng một từ khóa khác.</p>
        </div>
      )}
    </section>
  );
}
