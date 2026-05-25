import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  docsNavigationGroups,
  getAdjacentDocRoutes,
  type DocRouteMeta,
} from '@/content/docs/navigation';
import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, LayoutList } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

interface DocPageProps {
  meta: DocRouteMeta;
  children: ReactNode;
  actions?: ReactNode;
}

export function DocPage({ meta, children, actions }: DocPageProps) {
  const { previous, next } = getAdjacentDocRoutes(meta.href);

  return (
    <div className="border-t bg-muted/20">
      <section className="border-b bg-background">
        <div className="container mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <Badge variant="secondary" className="mb-4 gap-2">
            <BookOpen className="h-3.5 w-3.5" />
            {meta.eyebrow}
          </Badge>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="max-w-3xl">
              <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">{meta.title}</h1>
              <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
                {meta.description}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
              {actions}
              <Button asChild>
                <Link href="/dashboard">
                  Open Dashboard
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-8">
        <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
          <nav className="rounded-lg border bg-background p-4 shadow-sm" aria-label="Documentation">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <BookOpen className="h-4 w-4" />
              Documentation
            </div>
            <div className="space-y-5">
              {docsNavigationGroups.map((group) => (
                <div key={group.id}>
                  <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {group.title}
                  </p>
                  <ul className="space-y-1">
                    {group.items.map((item) => {
                      const active = item.href === meta.href;

                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            aria-current={active ? 'page' : undefined}
                            className={
                              active
                                ? 'block rounded-md bg-muted px-3 py-2 text-sm font-medium text-foreground'
                                : 'block rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
                            }
                          >
                            {item.navTitle}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </nav>

          <nav className="rounded-lg border bg-background p-4 shadow-sm" aria-label="On this page">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <LayoutList className="h-4 w-4" />
              On This Page
            </div>
            <ul className="space-y-1">
              {meta.sections.map((section) => (
                <li key={section.id}>
                  <Link
                    href={`#${section.id}`}
                    className="block rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {section.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <article className="min-w-0">
          <div className="doc-content">{children}</div>

          <nav className="mt-10 grid gap-3 border-t pt-6 sm:grid-cols-2" aria-label="Page navigation">
            {previous ? (
              <Button variant="outline" asChild className="h-auto justify-start px-4 py-3">
                <Link href={previous.href}>
                  <ArrowLeft className="h-4 w-4" />
                  <span className="flex min-w-0 flex-col items-start">
                    <span className="text-xs text-muted-foreground">Previous</span>
                    <span className="truncate">{previous.navTitle}</span>
                  </span>
                </Link>
              </Button>
            ) : (
              <div />
            )}

            {next ? (
              <Button variant="outline" asChild className="h-auto justify-start px-4 py-3 sm:justify-end">
                <Link href={next.href}>
                  <span className="flex min-w-0 flex-col items-start sm:items-end">
                    <span className="text-xs text-muted-foreground">Next</span>
                    <span className="truncate">{next.navTitle}</span>
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : null}
          </nav>
        </article>
      </div>
    </div>
  );
}
