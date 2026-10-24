import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'tiendat13ns — Ghi chép DevOps từ nền tảng',
  description: 'Kiến thức DevOps cơ bản, bài thực hành và những ghi chép từ hành trình của một DevOps Intern.',
  icons: {
    icon: [{ url: '/favicon.svg?v=16', type: 'image/svg+xml' }],
    shortcut: '/favicon.svg?v=16',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg?v=16" type="image/svg+xml" />
        <link rel="shortcut icon" href="/favicon.svg?v=16" type="image/svg+xml" />
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('devopags-theme');var d=t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);document.documentElement.style.colorScheme=d?'dark':'light';var a=JSON.parse(localStorage.getItem('devopags-accent')||'null');if(a){var r=document.documentElement;r.dataset.accent=a.hex;r.style.setProperty('--user-hue',a.hue);r.style.setProperty('--user-chroma',a.chroma)}}catch(e){}",
          }}
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
