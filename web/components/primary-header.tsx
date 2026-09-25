import Link from 'next/link';
import { Menu } from 'lucide-react';
import { SocialLinks } from '@/components/social-links';
import { ThemeToggle } from '@/components/theme-toggle';

type ActivePage = 'tai-lieu' | 'playground' | 'chia-se';

const navigation = [
  { label: 'Tài liệu', href: '/tai-lieu', key: 'tai-lieu' },
  { label: 'Playground', href: '/playground', key: 'playground' },
  { label: 'Chia sẻ', href: '/chia-se', key: 'chia-se' },
  { label: 'Về mình', href: '/#gioi-thieu', key: 'about' },
] as const;

export function PrimaryHeader({ active }: { active?: ActivePage }) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link className="inline-flex items-center" href="/" aria-label="tiendat13ns - Trang chủ">
          <span className="text-[1.05rem] font-bold tracking-[-0.025em] text-ink">
            tiendat<span className="text-primary">13ns</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex" aria-label="Điều hướng chính">
          {navigation.map((item) => (
            <Link
              className={active === item.key ? 'text-primary' : 'transition hover:text-primary'}
              href={item.href}
              key={item.key}
              aria-current={active === item.key ? 'page' : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <SocialLinks />
          <a
            className="grid size-9 place-items-center border border-border bg-card text-ink transition hover:border-primary/40 hover:bg-accent hover:text-primary"
            href="https://github.com/tiendat13ns"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Mở GitHub"
            title="GitHub"
          >
            <svg aria-hidden="true" viewBox="0 0 16 16" className="size-[18px] fill-current">
              <path d="M8 0C3.58 0 0 3.64 0 8.13c0 3.59 2.29 6.64 5.47 7.71.4.08.55-.17.55-.39 0-.19-.01-.83-.01-1.51-2.01.38-2.53-.5-2.69-.96-.09-.23-.48-.96-.82-1.15-.28-.15-.68-.53-.01-.54.63-.01 1.08.59 1.23.83.72 1.23 1.87.88 2.33.67.07-.53.28-.88.51-1.08-1.78-.21-3.64-.91-3.64-4.02 0-.89.31-1.62.82-2.19-.08-.21-.36-1.04.08-2.16 0 0 .67-.22 2.2.84A7.37 7.37 0 0 1 8 3.91c.68 0 1.36.09 2 .27 1.53-1.06 2.2-.84 2.2-.84.44 1.12.16 1.95.08 2.16.51.57.82 1.29.82 2.19 0 3.12-1.87 3.81-3.65 4.02.29.25.54.74.54 1.5 0 1.08-.01 1.95-.01 2.23 0 .22.15.47.55.39A8.02 8.02 0 0 0 16 8.13C16 3.64 12.42 0 8 0Z" />
            </svg>
          </a>
          <ThemeToggle />
          <details className="relative md:hidden">
            <summary className="grid size-9 cursor-pointer list-none place-items-center border border-border bg-card text-foreground [&::-webkit-details-marker]:hidden" aria-label="Mở menu">
              <Menu size={18} />
            </summary>
            <nav className="absolute right-0 top-12 flex w-44 flex-col gap-1 border border-border bg-card p-2 text-sm font-medium text-muted-foreground shadow-2xl" aria-label="Điều hướng di động">
              {navigation.map((item) => (
                <Link
                  className={active === item.key ? 'bg-primary-soft px-3 py-2 text-primary' : 'px-3 py-2 hover:bg-accent hover:text-ink'}
                  href={item.href}
                  key={item.key}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
