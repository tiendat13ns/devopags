'use client';

import { Moon, Sun } from 'lucide-react';

const STORAGE_KEY = 'devopags-theme';

export function ThemeToggle() {
  function toggleTheme() {
    const root = document.documentElement;
    const nextIsDark = !root.classList.contains('dark');

    root.classList.toggle('dark', nextIsDark);
    root.style.colorScheme = nextIsDark ? 'dark' : 'light';
    window.localStorage.setItem(STORAGE_KEY, nextIsDark ? 'dark' : 'light');
  }

  return (
    <button
      className="grid size-9 place-items-center rounded-lg border border-border bg-card text-ink transition hover:border-primary/40 hover:bg-accent hover:text-primary"
      type="button"
      onClick={toggleTheme}
      aria-label="Chuyển đổi giao diện sáng tối"
      title="Chuyển giao diện sáng/tối"
    >
      <Moon className="dark:hidden" size={17} />
      <Sun className="hidden dark:block" size={17} />
    </button>
  );
}
