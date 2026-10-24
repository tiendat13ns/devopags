'use client';

import { useState } from 'react';
import { Check, Moon, Palette, Sun } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { accentFromHex, applyAccent, readStoredAccent, storeAccent } from '@/lib/accent';

const STORAGE_KEY = 'devopags-theme';

const presets = [
  { hex: '#7c3aed', label: 'Tím' },
  { hex: '#2563eb', label: 'Xanh dương' },
  { hex: '#0891b2', label: 'Xanh lơ' },
  { hex: '#0d9488', label: 'Xanh ngọc' },
  { hex: '#16a34a', label: 'Xanh lá' },
  { hex: '#d97706', label: 'Hổ phách' },
  { hex: '#ea580c', label: 'Cam' },
  { hex: '#e11d48', label: 'Hồng' },
  { hex: '#475569', label: 'Xám' },
];

function applyMode(dark: boolean) {
  const root = document.documentElement;
  root.classList.toggle('dark', dark);
  root.style.colorScheme = dark ? 'dark' : 'light';
  window.localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light');
}

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [accentHex, setAccentHex] = useState<string | null>(null);

  // Đọc trạng thái thật từ DOM mỗi lần mở bảng: script trong layout đã áp theme trước khi React chạy.
  function syncFromDocument(open: boolean) {
    if (!open) return;
    setIsDark(document.documentElement.classList.contains('dark'));
    setAccentHex(readStoredAccent()?.hex ?? null);
  }

  function setMode(dark: boolean) {
    applyMode(dark);
    setIsDark(dark);
  }

  function setAccent(hex: string | null) {
    const accent = hex ? accentFromHex(hex) : null;
    applyAccent(accent);
    storeAccent(accent);
    setAccentHex(accent?.hex ?? null);
  }

  const isPreset = presets.some((preset) => preset.hex === accentHex);

  return (
    <Popover onOpenChange={syncFromDocument}>
      <PopoverTrigger
        className="grid size-9 place-items-center rounded-lg border border-border bg-card text-ink transition hover:border-primary/40 hover:bg-accent hover:text-primary"
        aria-label="Chọn giao diện và màu"
        title="Giao diện và màu"
      >
        <Palette size={17} />
      </PopoverTrigger>

      <PopoverContent align="end" sideOffset={8} className="w-64 gap-4 rounded-none border border-border bg-card p-4 ring-0">
        <div>
          <p className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Giao diện</p>
          <div className="mt-2 grid grid-cols-2 gap-px border border-border bg-border">
            {[
              { dark: false, label: 'Sáng', icon: Sun },
              { dark: true, label: 'Tối', icon: Moon },
            ].map(({ dark, label, icon: Icon }) => (
              <button
                key={label}
                type="button"
                onClick={() => setMode(dark)}
                aria-pressed={isDark === dark}
                className={`flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold transition-colors ${isDark === dark ? 'bg-primary text-primary-foreground' : 'bg-card text-ink hover:bg-accent'}`}
              >
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Màu nhấn</p>
          <button
            type="button"
            onClick={() => setAccent(null)}
            aria-pressed={accentHex === null}
            className={`mt-2 flex w-full items-center justify-between border px-3 py-2 text-left text-xs transition-colors ${accentHex === null ? 'border-primary bg-primary-soft text-ink' : 'border-border text-ink hover:bg-accent'}`}
          >
            <span>
              <span className="block font-semibold">Mặc định</span>
              <span className="text-muted-foreground">Mỗi chủ đề một màu riêng</span>
            </span>
            {accentHex === null ? <Check className="shrink-0 text-primary" size={15} /> : null}
          </button>

          <div className="mt-2 grid grid-cols-5 gap-2">
            {presets.map((preset) => (
              <button
                key={preset.hex}
                type="button"
                onClick={() => setAccent(preset.hex)}
                aria-pressed={accentHex === preset.hex}
                aria-label={preset.label}
                title={preset.label}
                className={`grid aspect-square place-items-center border-2 transition-transform hover:scale-105 ${accentHex === preset.hex ? 'border-ink' : 'border-transparent'}`}
                style={{ backgroundColor: preset.hex }}
              >
                {accentHex === preset.hex ? <Check className="text-white" size={15} /> : null}
              </button>
            ))}

            <label
              className={`relative grid aspect-square cursor-pointer place-items-center border-2 bg-[conic-gradient(#ef4444,#eab308,#22c55e,#06b6d4,#3b82f6,#a855f7,#ef4444)] transition-transform hover:scale-105 ${accentHex && !isPreset ? 'border-ink' : 'border-transparent'}`}
              title="Tùy chỉnh"
            >
              <span className="sr-only">Chọn màu tùy chỉnh</span>
              <input
                type="color"
                value={accentHex ?? '#7c3aed'}
                onChange={(event) => setAccent(event.target.value)}
                className="absolute inset-0 size-full cursor-pointer opacity-0"
              />
              {accentHex && !isPreset ? <Check className="text-white drop-shadow" size={15} /> : null}
            </label>
          </div>
          <p className="mt-3 text-[0.7rem] leading-5 text-muted-foreground">Màu bạn chọn áp cho toàn bộ trang, kể cả các bài viết, và được nhớ cho lần sau.</p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
