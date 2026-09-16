'use client';

import { useEffect, useRef, useState, type MouseEvent } from 'react';
import Link from 'next/link';
import { ArrowUpRight, CalendarDays, Clock } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from '@/components/ui/pagination';

export type Post = {
  title: string;
  description: string;
  date: string;
  readTime: string;
  tags: string[];
  href: string;
  accent: 'amethyst' | 'docker';
};

const POSTS_PER_PAGE = 2;

export function PaginatedPostList({ posts }: { posts: Post[] }) {
  const [page, setPage] = useState(1);
  const [hasChangedPage, setHasChangedPage] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const totalPages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE));
  const visiblePosts = posts.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);

  useEffect(() => {
    if (!hasChangedPage) return;
    listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [hasChangedPage, page]);

  function goToPage(event: MouseEvent<HTMLAnchorElement>, nextPage: number) {
    event.preventDefault();
    if (nextPage < 1 || nextPage > totalPages || nextPage === page) return;
    setHasChangedPage(true);
    setPage(nextPage);
  }

  return (
    <div ref={listRef} className="scroll-mt-24">
      <span className="sr-only" aria-live="polite">Trang {page} trên {totalPages}</span>

      <div className="min-h-[30rem] pt-5">
        <div className="post-page-enter space-y-4" key={page}>
          {visiblePosts.map((post) => (
            <article key={post.href}>
              <Link
                className={`group block border border-border bg-card/80 p-5 backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:border-primary/50 hover:bg-card sm:p-7 ${post.accent === 'docker' ? 'docker-post-card' : ''}`}
                href={post.href}
              >
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5"><CalendarDays size={14} /> {post.date}</span>
                  <span className="inline-flex items-center gap-1.5"><Clock size={14} /> {post.readTime}</span>
                </div>

                <div className="mt-4 flex items-start justify-between gap-5">
                  <div>
                    <h2 className="post-title text-xl font-bold leading-snug tracking-[-0.025em] text-ink transition-colors group-hover:text-primary sm:text-2xl">
                      {post.title}
                    </h2>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
                      {post.description}
                    </p>
                  </div>
                  <span className="post-arrow grid size-9 shrink-0 place-items-center border border-primary/30 text-primary transition group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground">
                    <ArrowUpRight size={16} />
                  </span>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span key={tag} className="post-tag border border-primary/20 bg-primary-soft px-2.5 py-1 font-mono text-xs font-semibold text-primary-dark">{tag}</span>
                  ))}
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>

      {totalPages > 1 && (
        <Pagination className="mt-6" aria-label="Phân trang bài viết">
          <PaginationContent className="gap-1.5">
            <PaginationItem>
              <PaginationLink
                href="#bai-viet"
                aria-label="Trang trước"
                title="Trang trước"
                aria-disabled={page === 1}
                tabIndex={page === 1 ? -1 : 0}
                className="border border-border bg-card text-muted-foreground hover:border-primary/40 hover:bg-accent hover:text-primary aria-disabled:pointer-events-none aria-disabled:opacity-40"
                onClick={(event) => goToPage(event, page - 1)}
              >
                <span aria-hidden="true" className="font-mono text-sm font-bold tracking-[-0.12em]">←_</span>
              </PaginationLink>
            </PaginationItem>

            {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
              <PaginationItem key={pageNumber}>
                <PaginationLink
                  href="#bai-viet"
                  isActive={pageNumber === page}
                  aria-label={`Trang ${pageNumber}`}
                  className={pageNumber === page ? 'pagination-current-page' : 'pagination-page border border-border bg-card hover:border-primary/40 hover:bg-accent hover:text-primary'}
                  onClick={(event) => goToPage(event, pageNumber)}
                >
                  {pageNumber}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationLink
                href="#bai-viet"
                aria-label="Trang sau"
                title="Trang sau"
                aria-disabled={page === totalPages}
                tabIndex={page === totalPages ? -1 : 0}
                className="border border-border bg-card text-muted-foreground hover:border-primary/40 hover:bg-accent hover:text-primary aria-disabled:pointer-events-none aria-disabled:opacity-40"
                onClick={(event) => goToPage(event, page + 1)}
              >
                <span aria-hidden="true" className="font-mono text-sm font-bold tracking-[-0.12em]">→_</span>
              </PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
