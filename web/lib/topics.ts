import type { DocumentEntry } from '@/lib/documents';

const tones = {
  violet: {
    card: 'border-violet-200 border-l-violet-500 dark:border-violet-500/30 dark:border-l-violet-400',
    header: 'bg-violet-50/80 hover:bg-violet-100/70 dark:bg-violet-500/10 dark:hover:bg-violet-500/15',
    row: 'hover:bg-violet-50/70 dark:hover:bg-violet-500/5',
    title: 'group-hover/article:text-violet-700 dark:group-hover/article:text-violet-300',
  },
  amber: {
    card: 'border-amber-200 border-l-amber-500 dark:border-amber-500/30 dark:border-l-amber-400',
    header: 'bg-amber-50/80 hover:bg-amber-100/70 dark:bg-amber-500/10 dark:hover:bg-amber-500/15',
    row: 'hover:bg-amber-50/70 dark:hover:bg-amber-500/5',
    title: 'group-hover/article:text-amber-700 dark:group-hover/article:text-amber-300',
  },
  teal: {
    card: 'border-teal-200 border-l-teal-500 dark:border-teal-500/30 dark:border-l-teal-400',
    header: 'bg-teal-50/80 hover:bg-teal-100/70 dark:bg-teal-500/10 dark:hover:bg-teal-500/15',
    row: 'hover:bg-teal-50/70 dark:hover:bg-teal-500/5',
    title: 'group-hover/article:text-teal-700 dark:group-hover/article:text-teal-300',
  },
  sky: {
    card: 'border-sky-200 border-l-sky-500 dark:border-sky-500/30 dark:border-l-sky-400',
    header: 'bg-sky-50/80 hover:bg-sky-100/70 dark:bg-sky-500/10 dark:hover:bg-sky-500/15',
    row: 'hover:bg-sky-50/70 dark:hover:bg-sky-500/5',
    title: 'group-hover/article:text-sky-700 dark:group-hover/article:text-sky-300',
  },
  orange: {
    card: 'border-orange-200 border-l-orange-500 dark:border-orange-500/30 dark:border-l-orange-400',
    header: 'bg-orange-50/80 hover:bg-orange-100/70 dark:bg-orange-500/10 dark:hover:bg-orange-500/15',
    row: 'hover:bg-orange-50/70 dark:hover:bg-orange-500/5',
    title: 'group-hover/article:text-orange-700 dark:group-hover/article:text-orange-300',
  },
  rose: {
    card: 'border-rose-200 border-l-rose-500 dark:border-rose-500/30 dark:border-l-rose-400',
    header: 'bg-rose-50/80 hover:bg-rose-100/70 dark:bg-rose-500/10 dark:hover:bg-rose-500/15',
    row: 'hover:bg-rose-50/70 dark:hover:bg-rose-500/5',
    title: 'group-hover/article:text-rose-700 dark:group-hover/article:text-rose-300',
  },
};

export type Tone = (typeof tones)[keyof typeof tones];

export type Category = {
  label: string;
  tags: string[];
};

export type Topic = {
  slug: string;
  label: string;
  summary: string;
  tone: Tone;
  // Class theme trong globals.css, trùng với theme của bài viết thuộc chủ đề này.
  themeClass: string;
  tags?: string[];
  subcategories?: Category[];
};

export const topics: Topic[] = [
  {
    slug: 'devops',
    label: 'DevOps',
    summary: 'Linux, Git, Docker, CI/CD và triển khai',
    tone: tones.violet,
    themeClass: '',
    subcategories: [
      { label: 'Linux', tags: ['Linux'] },
      { label: 'Git', tags: ['Git'] },
      { label: 'CI/CD', tags: ['CI/CD'] },
      { label: 'Docker', tags: ['Docker', 'Container'] },
      { label: 'Jenkins', tags: ['Jenkins'] },
      { label: 'Monitoring', tags: ['Monitoring'] },
    ],
  },
  {
    slug: 'network',
    label: 'Network',
    summary: 'IP, DNS, TCP, HTTP, firewall và SSH',
    tone: tones.sky,
    themeClass: 'network-article-theme',
    tags: ['Network'],
  },
  {
    slug: 'ai',
    label: 'AI',
    summary: 'Kiến trúc mạng, Attention và Transformer',
    tone: tones.amber,
    themeClass: 'ai-article-theme',
    tags: ['AI'],
  },
  {
    slug: 'machine-learning',
    label: 'Machine Learning',
    summary: 'Thuật toán, đánh giá và chọn model',
    tone: tones.teal,
    themeClass: 'ml-article-theme',
    tags: ['Machine Learning', 'ML'],
  },
  {
    slug: 'deep-learning',
    label: 'Deep Learning',
    summary: 'Neural network, dữ liệu và hàm kích hoạt',
    tone: tones.rose,
    themeClass: 'dl-article-theme',
    tags: ['Deep Learning', 'DL'],
  },
  {
    slug: 'cloud',
    label: 'Cloud',
    summary: 'AWS: IAM, VPC, EC2, S3, RDS và Terraform',
    tone: tones.orange,
    themeClass: 'cloud-article-theme',
    tags: ['Cloud'],
  },
];

export function findTopic(slug: string) {
  return topics.find((topic) => topic.slug === slug);
}

export function topicTags(topic: Topic) {
  return topic.tags ?? topic.subcategories?.flatMap((sub) => sub.tags) ?? [];
}

export function filterDocuments(items: DocumentEntry[], tags: string[]) {
  return items.filter((item) => item.tags.some((tag) => tags.includes(tag)));
}
