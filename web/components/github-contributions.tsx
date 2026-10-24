const GITHUB_USER = 'tiendat13ns';
const API_URL = `https://github-contributions-api.jogruber.de/v4/${GITHUB_USER}?y=last`;

type Day = { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 };

type ContributionData = {
  total: { lastYear: number };
  contributions: Day[];
};

const levelClass = [
  'bg-foreground/[0.07]',
  'bg-primary/25',
  'bg-primary/50',
  'bg-primary/75',
  'bg-primary',
];

async function getContributions(): Promise<ContributionData | null> {
  try {
    const response = await fetch(API_URL, { next: { revalidate: 900 }, signal: AbortSignal.timeout(5000) });
    if (!response.ok) return null;

    const data = (await response.json()) as ContributionData;
    return data.contributions?.length ? data : null;
  } catch {
    return null;
  }
}

function parseDate(date: string) {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function formatDate(date: string) {
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
}

export async function GithubContributions() {
  const data = await getContributions();
  if (!data) return null;

  // Cột đầu bắt đầu từ Chủ nhật, nên đệm các ô trống cho tuần đầu chưa đủ 7 ngày.
  const leading = parseDate(data.contributions[0].date).getUTCDay();
  const cells: (Day | null)[] = [...Array<null>(leading).fill(null), ...data.contributions];
  const weeks = Math.ceil(cells.length / 7);

  const monthLabels: { column: number; label: string }[] = [];
  let previousMonth = -1;
  for (let column = 0; column < weeks; column++) {
    const firstDay = cells.slice(column * 7, column * 7 + 7).find(Boolean);
    if (!firstDay) continue;

    const month = parseDate(firstDay.date).getUTCMonth();
    if (month !== previousMonth) {
      monthLabels.push({ column, label: `T${month + 1}` });
      previousMonth = month;
    }
  }
  // Nhãn tháng đầu tiên bị đè lên nhãn kế tiếp khi tháng đó chỉ có vài tuần, nên bỏ đi.
  if (monthLabels.length > 1 && monthLabels[1].column - monthLabels[0].column < 3) monthLabels.shift();

  return (
    <section id="github" className="scroll-mt-24 pb-12 lg:pb-16" aria-labelledby="github-title">
      <div className="flex items-end justify-between gap-5 border-b border-border pb-3">
        <h2 id="github-title" className="text-xl font-bold tracking-tight text-ink">Hoạt động GitHub</h2>
        <a
          className="font-mono text-xs text-muted-foreground transition-colors hover:text-primary"
          href={`https://github.com/${GITHUB_USER}`}
          target="_blank"
          rel="noreferrer"
        >
          @{GITHUB_USER} ↗
        </a>
      </div>

      <p className="mt-4 text-sm text-muted-foreground">
        <span className="font-semibold text-ink">{data.total.lastYear}</span> đóng góp trong 12 tháng qua
      </p>

      <div className="mt-4 overflow-x-auto pb-2">
        <div className="min-w-[640px] max-w-[720px]">
          <div className="relative mb-2 grid h-4 font-mono text-[11px] text-muted-foreground" style={{ gridTemplateColumns: `repeat(${weeks}, minmax(0, 1fr))`, columnGap: 3 }}>
            {monthLabels.map(({ column, label }) => (
              <span className="whitespace-nowrap" key={column} style={{ gridColumnStart: column + 1, gridRowStart: 1 }}>{label}</span>
            ))}
          </div>

          <div className="grid grid-flow-col" style={{ gridTemplateRows: 'repeat(7, minmax(0, 1fr))', gridTemplateColumns: `repeat(${weeks}, minmax(0, 1fr))`, gap: 3 }}>
            {cells.map((day, index) =>
              day ? (
                <div
                  className={`aspect-square rounded-[3px] ${levelClass[day.level]}`}
                  key={day.date}
                  title={`${day.count} đóng góp ngày ${formatDate(day.date)}`}
                />
              ) : (
                <div key={`empty-${index}`} aria-hidden="true" />
              ),
            )}
          </div>

          <div className="mt-3 flex items-center justify-end gap-1.5 font-mono text-[11px] text-muted-foreground">
            <span>Ít</span>
            {levelClass.map((className) => (
              <span className={`size-[11px] rounded-[3px] ${className}`} key={className} aria-hidden="true" />
            ))}
            <span>Nhiều</span>
          </div>
        </div>
      </div>
    </section>
  );
}
