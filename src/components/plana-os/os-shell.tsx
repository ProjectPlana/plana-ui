import { cn } from '@/lib/utils';
import { ShellHeader } from './shell-header';
import { StatusBar } from './status-bar';
import { Dock } from './dock';
import { ShellFooter } from './shell-footer';

interface OSShellProps {
  children: React.ReactNode;
  hideHeader?: boolean;
  hideDock?: boolean;
  hideFooter?: boolean;
  className?: string;
}

export function OSShell({
  children,
  hideHeader = false,
  hideDock = false,
  hideFooter = false,
  className,
}: OSShellProps) {
  return (
    <div
      className={cn('relative min-h-screen overflow-hidden', className)}
      style={{
        background: 'var(--background)',
        color: 'var(--foreground)',
        fontFamily: 'var(--font-space-grotesk), -apple-system, system-ui, sans-serif',
        backgroundImage: 'radial-gradient(var(--grid) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute"
        style={{
          top: -260,
          right: -160,
          width: 640,
          height: 640,
          borderRadius: '50%',
          background: 'radial-gradient(circle, var(--halo) 0%, transparent 60%)',
          opacity: 0.1,
        }}
      />
      <StatusBar />
      {!hideHeader && <ShellHeader />}
      {children}
      {!hideDock && <Dock />}
      {!hideFooter && <ShellFooter />}
      <style>{`
        @keyframes v6cursor { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
      `}</style>
    </div>
  );
}
