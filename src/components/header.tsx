'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/contexts/auth-context';
import { docsNavigationGroups } from '@/content/docs/navigation';
import { cn } from '@/lib/utils';
import { getDiscordAvatarUrl } from '@/lib/sdk';
import {
  Command,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Shield,
  X,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const featureLinks = docsNavigationGroups.find((group) => group.id === 'features')?.items ?? [];
const wikiLinks = docsNavigationGroups.find((group) => group.id === 'wiki')?.items ?? [];

const primaryLinks = [
  { href: '/commands', label: 'Commands', icon: Command },
  { href: '/support', label: 'Support', icon: HelpCircle },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
];

function isActive(pathname: string, href: string) {
  return href === '/' ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

function menuLinkClass(pathname: string, href: string) {
  return cn(
    'group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none',
    isActive(pathname, href) && 'bg-accent/60 text-accent-foreground'
  );
}

export function Header() {
  const { user, login, logout, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3 sm:gap-6">
          <Link href="/" className="flex flex-shrink-0 items-center gap-2">
            <Image
              src="/plana.png"
              alt="Project Plana"
              width={32}
              height={32}
              className="rounded-full"
            />
            <span className="truncate text-lg font-bold sm:text-xl">Project Plana</span>
          </Link>

          <NavigationMenu className="hidden lg:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger
                  className={cn('text-sm', isActive(pathname, '/features') && 'bg-accent/60')}
                >
                  Features
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid w-[520px] gap-2 p-3">
                    {featureLinks.map((item) => (
                      <NavigationMenuLink asChild key={item.href}>
                        <Link href={item.href} className="rounded-md p-3">
                          <div className="font-medium">{item.navTitle}</div>
                          <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
                            {item.navDescription}
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    ))}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger
                  className={cn('text-sm', isActive(pathname, '/wiki') && 'bg-accent/60')}
                >
                  Wiki
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid w-[460px] gap-2 p-3">
                    {wikiLinks.map((item) => (
                      <NavigationMenuLink asChild key={item.href}>
                        <Link href={item.href} className="rounded-md p-3">
                          <div className="font-medium">{item.navTitle}</div>
                          <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
                            {item.navDescription}
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    ))}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {primaryLinks.map((item) => {
                const Icon = item.icon;

                return (
                  <NavigationMenuItem key={item.href}>
                    <NavigationMenuLink asChild>
                      <Link href={item.href} className={menuLinkClass(pathname, item.href)}>
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                );
              })}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="flex flex-shrink-0 items-center gap-2 sm:gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <ThemeToggle />
          {!loading && (
            <>
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={getDiscordAvatarUrl(user)} alt={user.username} />
                        <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex min-w-0 flex-col space-y-1 leading-none">
                        <p className="truncate font-medium">{user.username}</p>
                      </div>
                    </div>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={logout} className="flex items-center gap-2">
                      <LogOut className="h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button onClick={login} className="flex items-center gap-2 px-3 text-sm sm:px-4">
                  <Shield className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden sm:inline">Login with Discord</span>
                  <span className="sm:hidden">Login</span>
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t bg-background lg:hidden">
          <div className="container mx-auto max-w-7xl px-4 py-4">
            <nav className="space-y-5" aria-label="Mobile navigation">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Features
                </p>
                <div className="grid gap-1">
                  {featureLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.navTitle}
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Wiki
                </p>
                <div className="grid gap-1">
                  {wikiLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.navTitle}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="grid gap-1 border-t pt-4">
                {primaryLinks.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
