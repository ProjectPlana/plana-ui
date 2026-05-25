import { DocPage } from '@/components/docs/doc-page';
import { Button } from '@/components/ui/button';
import { getDocPage } from '@/content/docs/pages';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default function FeaturesPage() {
  const page = getDocPage('/features');

  if (!page) {
    notFound();
  }

  return (
    <DocPage
      meta={page.meta}
      actions={
        <Button variant="outline" asChild>
          <Link href="/wiki">Read Wiki</Link>
        </Button>
      }
    >
      {page.content}
    </DocPage>
  );
}
