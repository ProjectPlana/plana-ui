import { docsNavigationGroups } from '@/content/docs/navigation';
import { AtSign, Code, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const featureLinks = docsNavigationGroups.find((group) => group.id === 'features')?.items ?? [];
const wikiLinks = docsNavigationGroups.find((group) => group.id === 'wiki')?.items ?? [];

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-3 sm:col-span-2 lg:col-span-1">
            <h3 className="text-lg font-semibold">Project Plana</h3>
            <p className="max-w-sm text-sm leading-6 text-muted-foreground">
              A free, open-source Discord bot for moderation, automation, community
              systems, and server operations.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Features</h4>
            <ul className="space-y-2 text-sm">
              {featureLinks.slice(0, 5).map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-muted-foreground transition-colors hover:text-foreground">
                    {item.navTitle}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Wiki</h4>
            <ul className="space-y-2 text-sm">
              {wikiLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-muted-foreground transition-colors hover:text-foreground">
                    {item.navTitle}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/commands" className="text-muted-foreground transition-colors hover:text-foreground">
                  Commands
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-muted-foreground transition-colors hover:text-foreground">
                  Support
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-muted-foreground transition-colors hover:text-foreground">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground transition-colors hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground transition-colors hover:text-foreground">
                  Terms Of Service
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Community</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://discord.gg/9845afkhWT"
                  className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Discord Server
                  <ExternalLink className="h-3 w-3 flex-shrink-0" />
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/ProjectPlana/project-plana"
                  className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                  <Code className="h-3 w-3 flex-shrink-0" />
                </a>
              </li>
              <li>
                <a
                  href="https://twitter.com/projectplana"
                  className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Twitter
                  <AtSign className="h-3 w-3 flex-shrink-0" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row">
          <p className="text-center text-sm text-muted-foreground sm:text-left">
            © 2026 Project Plana. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm">
            <Link href="/privacy" className="text-muted-foreground transition-colors hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-muted-foreground transition-colors hover:text-foreground">
              Terms Of Service
            </Link>
            <Link href="/support" className="text-muted-foreground transition-colors hover:text-foreground">
              Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
