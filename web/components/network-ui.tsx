import type { ReactNode } from 'react';
import { Info, Lightbulb, TriangleAlert } from 'lucide-react';

export function CodeBlock({ title, children }: { title?: string; children: string }) {
  return (
    <div className="overflow-hidden border border-code-border bg-code text-code-foreground">
      {title ? <div className="border-b border-white/10 px-5 py-3 font-mono text-xs text-white/50">{title}</div> : null}
      <pre className="overflow-x-auto p-5 font-mono text-sm leading-7"><code>{children}</code></pre>
    </div>
  );
}

const calloutTones = {
  info: { icon: Info, box: 'border-primary/15 bg-primary-soft', iconClass: 'text-primary' },
  tip: { icon: Lightbulb, box: 'border-emerald-500/25 bg-emerald-500/10', iconClass: 'text-emerald-600 dark:text-emerald-400' },
  warn: { icon: TriangleAlert, box: 'border-amber-500/30 bg-amber-500/10', iconClass: 'text-amber-600 dark:text-amber-400' },
};

export function Callout({
  tone = 'info',
  title,
  children,
}: {
  tone?: keyof typeof calloutTones;
  title?: string;
  children: ReactNode;
}) {
  const { icon: Icon, box, iconClass } = calloutTones[tone];

  return (
    <div className={`flex gap-3 border p-5 ${box}`}>
      <Icon className={`mt-0.5 shrink-0 ${iconClass}`} size={20} />
      <div className="text-sm leading-6 text-muted-foreground">
        {title ? <p className="mb-1 font-bold text-ink">{title}</p> : null}
        {children}
      </div>
    </div>
  );
}

export type AnnotatedLine = {
  text: string;
  note?: ReactNode;
  kind?: 'command' | 'plain';
};

// Mỗi dòng output đi kèm lời giải thích, để người đọc biết cần nhìn vào đâu thay vì chép lệnh một cách máy móc.
export function AnnotatedOutput({ title, lines }: { title: string; lines: AnnotatedLine[] }) {
  return (
    <div className="overflow-hidden border border-code-border bg-code text-code-foreground">
      <div className="border-b border-white/10 px-5 py-3 font-mono text-xs text-white/50">{title}</div>
      <div>
        {lines.map((line, index) => (
          <div
            className="grid gap-x-6 gap-y-1 border-b border-white/5 px-5 py-2.5 last:border-b-0 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]"
            key={`${index}-${line.text}`}
          >
            <pre className={`overflow-x-auto font-mono text-[0.8125rem] leading-6 ${line.kind === 'command' ? 'text-emerald-300' : 'text-code-foreground'}`}>
              <code>{line.text}</code>
            </pre>
            {line.note ? (
              <p className="border-l-2 border-primary/50 pl-3 text-[0.8125rem] leading-6 text-white/70">{line.note}</p>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

export function Code({ children }: { children: ReactNode }) {
  return <code className="inline-code">{children}</code>;
}

// Bảng so sánh dùng chung: cột đầu là tiêu chí (in đậm); để trống tiêu đề cột đầu thì chỉ còn nhãn cho screen reader.
export function DataTable({ head, rows, minWidth = 640 }: { head: string[]; rows: ReactNode[][]; minWidth?: number }) {
  return (
    <div className="overflow-x-auto border border-border bg-card">
      <table className="w-full text-left text-sm" style={{ minWidth }}>
        <thead className="bg-surface font-mono text-xs uppercase tracking-[0.06em] text-muted-foreground">
          <tr>
            {head.map((label, index) => (
              <th className="px-4 py-3" key={`${index}-${label}`}>
                {label || <span className="sr-only">Tiêu chí</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr className="border-t border-border" key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td className={`px-4 py-3 ${cellIndex === 0 ? 'font-semibold text-ink' : ''}`} key={cellIndex}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
