'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

type ContentItem = {
  id: string;
  number: string;
  title: string;
};

const HEADER_HEIGHT = 64;

export function ArticleContents() {
  const pathname = usePathname();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const lockUntil = useRef(0);

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('article section[id]'));
    const next = sections.flatMap((section) => {
      const title = section.querySelector('h2')?.textContent?.trim();
      if (!title) return [];
      return [{ id: section.id, number: section.querySelector('.section-number')?.textContent?.trim() ?? '', title }];
    });

    const frame = requestAnimationFrame(() => {
      setItems(next);
      setActiveId(next[0]?.id ?? null);
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  useEffect(() => {
    if (items.length === 0) return;

    const update = () => {
      if (Date.now() < lockUntil.current) return;

      const line = (HEADER_HEIGHT + window.innerHeight) / 2;
      let current = items[0].id;

      for (const item of items) {
        const el = document.getElementById(item.id);
        if (el && el.getBoundingClientRect().top <= line) current = item.id;
      }

      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        current = items[items.length - 1].id;
      }

      setActiveId(current);
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [items]);

  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const visibleHeight = window.innerHeight - HEADER_HEIGHT;
    // Section vừa khung nhìn thì đặt giữa màn hình, section dài hơn thì canh đầu section ngay dưới header.
    const offset = rect.height < visibleHeight
      ? HEADER_HEIGHT + (visibleHeight - rect.height) / 2
      : HEADER_HEIGHT + 16;

    lockUntil.current = Date.now() + 900;
    setActiveId(id);
    window.scrollTo({ top: window.scrollY + rect.top - offset });
    history.replaceState(null, '', `#${id}`);
  }, []);

  if (items.length === 0) return null;

  return (
    <nav className="article-toc sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto border border-border bg-card/55 p-5 backdrop-blur-sm" aria-label="Mục lục bài viết">
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.08em] text-primary">Nội dung</p>
      <ul className="mt-4 space-y-1">
        {items.map((item) => {
          const isActive = item.id === activeId;

          return (
            <li key={item.id}>
              <a
                className={`flex gap-2 border-l-2 py-1.5 pl-3 text-[0.82rem] font-semibold leading-5 transition-colors ${isActive ? 'border-primary bg-primary-soft text-primary' : 'border-transparent text-muted-foreground hover:border-primary/45 hover:text-primary'}`}
                href={`#${item.id}`}
                aria-current={isActive ? 'location' : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  scrollToSection(item.id);
                }}
              >
                {item.number ? <span className="shrink-0 font-mono text-[0.72rem] leading-5 opacity-70">{item.number}</span> : null}
                <span>{item.title}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
