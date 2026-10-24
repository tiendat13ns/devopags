import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { IamPolicyPlayground } from '@/components/iam-policy-playground';
import { PrimaryHeader } from '@/components/primary-header';

export const metadata: Metadata = {
  title: 'IAM Policy Playground: viết policy và thử request | tiendat13ns',
  description:
    'Viết identity policy, permissions boundary và SCP bằng JSON, dựng request với IP, MFA, region, tag và xem AWS quyết định Allow hay Deny.',
};

export default function IamPolicyPlaygroundPage() {
  return (
    <main className="article-reading-bg cloud-article-theme min-h-screen bg-background text-foreground transition-colors duration-300">
      <PrimaryHeader active="playground" />
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link
              className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-primary"
              href="/playground"
            >
              <ArrowLeft size={16} /> Tất cả playground
            </Link>
            <h1 className="mt-3 text-2xl font-bold tracking-[-0.035em] text-ink sm:text-3xl">
              IAM Policy Playground
            </h1>
          </div>
          <p className="max-w-md text-sm leading-6 text-muted-foreground">
            Viết policy JSON như trên AWS, dựng một request và xem quyết định Allow hay Deny cùng lý do khớp hoặc không khớp của từng statement.
          </p>
        </div>
        <IamPolicyPlayground />
      </div>
    </main>
  );
}
