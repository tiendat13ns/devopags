'use client';

import { useState, useSyncExternalStore, type ReactNode } from 'react';
import { PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen } from 'lucide-react';
import { ArticleContents } from '@/components/article-contents';

type Side = 'left' | 'right';

const STORAGE_KEY = 'article-hidden-sidebars';
const listeners = new Set<() => void>();

function readHidden() {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener('storage', listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', listener);
  };
}

function toggleSide(side: Side) {
  const hidden = new Set(readHidden().split(',').filter(Boolean));
  if (!hidden.delete(side)) hidden.add(side);

  try {
    localStorage.setItem(STORAGE_KEY, [...hidden].join(','));
  } catch {
    // Không lưu được thì chỉ mất trạng thái ở lần đọc sau.
  }
  listeners.forEach((listener) => listener());
}

export function ArticleLayout({ topics, children }: { topics: ReactNode; children: ReactNode }) {
  const hidden = useSyncExternalStore(subscribe, readHidden, () => '');
  // Bỏ transition cho tới khi người đọc bấm lần đầu, để trạng thái đã lưu không bị chạy animation lúc tải trang.
  const [animated, setAnimated] = useState(false);

  const toggle = (side: Side) => {
    setAnimated(true);
    toggleSide(side);
  };

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[230px_minmax(0,820px)] lg:justify-center lg:py-14 xl:max-w-[1400px] xl:grid-cols-[230px_minmax(0,820px)_230px]">
      <Sidebar side="left" className="hidden lg:block" hidden={hidden.includes('left')} animated={animated} onToggle={toggle}>
        {topics}
      </Sidebar>

      <article className="min-w-0">{children}</article>

      <Sidebar side="right" className="hidden xl:block" hidden={hidden.includes('right')} animated={animated} onToggle={toggle}>
        <ArticleContents />
      </Sidebar>
    </div>
  );
}

function Sidebar({
  side,
  className,
  hidden,
  animated,
  onToggle,
  children,
}: {
  side: Side;
  className: string;
  hidden: boolean;
  animated: boolean;
  onToggle: (side: Side) => void;
  children: ReactNode;
}) {
  const isLeft = side === 'left';
  const Icon = isLeft ? (hidden ? PanelLeftOpen : PanelLeftClose) : hidden ? PanelRightOpen : PanelRightClose;
  const name = isLeft ? 'danh sách bài viết' : 'mục lục';
  const label = `${hidden ? 'Hiện' : 'Ẩn'} ${name}`;

  // Cột luôn giữ chỗ trong grid để nội dung bài không bị dịch chuyển khi ẩn/hiện.
  return (
    <aside className={className}>
      <div className="sticky top-24">
        <div className={`mb-2 flex ${isLeft ? 'justify-start' : 'justify-end'}`}>
          <button
            className="grid size-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-primary"
            type="button"
            onClick={() => onToggle(side)}
            aria-label={label}
            aria-expanded={!hidden}
            title={label}
          >
            <Icon size={17} />
          </button>
        </div>

        <div
          className={`[&_nav]:max-h-[calc(100vh-10rem)] ${animated ? 'transition-[opacity,transform,visibility] duration-300 ease-out motion-reduce:transition-none' : ''} ${hidden ? `pointer-events-none invisible opacity-0 ${isLeft ? '-translate-x-3' : 'translate-x-3'}` : 'translate-x-0 opacity-100'}`}
          inert={hidden}
        >
          {children}
        </div>
      </div>
    </aside>
  );
}
