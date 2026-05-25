import { DocPage } from '@/components/docs/doc-page';
import { Button } from '@/components/ui/button';
import { docsRoutes } from '@/content/docs/navigation';
import { getDocPage } from '@/content/docs/pages';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export function generateStaticParams() {
  return docsRoutes
    .filter((route) => route.group === 'features' && route.slug)
    .map((route) => ({ slug: route.slug! }));
}

export default async function FeaturePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getDocPage(`/features/${slug}`);

  if (!page) {
    notFound();
  }

  return (
    <DocPage
      meta={page.meta}
      actions={
        <Button variant="outline" asChild>
          <Link href="/commands">View Commands</Link>
        </Button>
      }
    >
      {page.content}
    </DocPage>
  );
}
