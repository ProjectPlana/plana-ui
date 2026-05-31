'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSyncExternalStore } from 'react';
import { useTheme } from 'next-themes';
import { Code as Github, LogOut, Moon, Plus, Settings, Shield, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/auth-context';
import { getBotInviteUrl, getDiscordAvatarUrl } from '@/lib/sdk';
import { Wordmark } from './wordmark';

const NAV = [
  { label: 'Features', href: '/features' },
  { label: 'Commands', href: '/commands' },
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Wiki', href: '/wiki' },
  { label: 'Support', href: '/support' },
];

const GITHUB_URL = 'https://github.com/ProjectPlana/project-plana';

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function ShellHeader() {
  const pathname = usePathname();
  const { user, login, logout, loading } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
  const isDark = mounted ? resolvedTheme === 'dark' : true;

  return (
    <header
      className="relative z-[5] flex h-16 items-center gap-7 px-8"
      style={{
        borderBottom: '1px solid var(--os-line)',
        background: 'var(--os-header)',
        backdropFilter: 'blur(14px)',
      }}
    >
      <Link
        href="/"
        className="inline-flex"
        style={{ textDecoration: 'none', color: 'var(--foreground)' }}
      >
        <Wordmark size={13} />
      </Link>
      <nav className="ml-2 flex gap-[22px]">
        {NAV.map((n) => {
          const active = pathname === n.href || pathname.startsWith(`${n.href}/`);
          return (
            <Link
              key={n.label}
              href={n.href}
              className="text-sm font-medium"
              style={{
                color: active ? 'var(--foreground)' : 'var(--muted-foreground)',
                textDecoration: 'none',
              }}
            >
              {n.label}
            </Link>
          );
        })}
      </nav>
      <div className="flex-1" />
      <button
        type="button"
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        aria-label="Toggle theme"
        className="inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-[var(--accent)]"
        style={{ color: 'var(--muted-foreground)' }}
      >
        {mounted && (isDark ? <Sun size={16} /> : <Moon size={16} />)}
      </button>
      <a
        href={GITHUB_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-sm"
        style={{ color: 'var(--muted-foreground)', textDecoration: 'none' }}
      >
        <Github size={16} /> GitHub
      </a>
      {!loading &&
        (user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                <Avatar className="h-9 w-9">
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
          <Button onClick={login} className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Login with Discord
          </Button>
        ))}
      <Button asChild>
        <a href={getBotInviteUrl()} target="_blank" rel="noopener noreferrer">
          <Plus className="mr-1.5 h-4 w-4" /> Invite Bot
        </a>
      </Button>
    </header>
  );
}
