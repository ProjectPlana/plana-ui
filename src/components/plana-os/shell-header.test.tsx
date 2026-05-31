import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { ShellHeader } from './shell-header';

const pathnameMock = vi.fn<() => string>();
const setThemeMock = vi.fn();

vi.mock('next/navigation', () => ({
  usePathname: () => pathnameMock(),
}));

vi.mock('next-themes', () => ({
  useTheme: () => ({ resolvedTheme: 'dark', setTheme: setThemeMock }),
}));

vi.mock('@/contexts/auth-context', () => ({
  useAuth: () => ({ user: null, loading: false, login: vi.fn(), logout: vi.fn() }),
}));

// shadcn primitives drag in radix; stub them to keep the test focused on the header logic.
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...rest }: React.PropsWithChildren<Record<string, unknown>>) => (
    <button {...rest}>{children}</button>
  ),
}));

vi.mock('@/components/ui/dropdown-menu', () => {
  const Pass = ({ children }: { children?: React.ReactNode }) => <>{children}</>;
  return {
    DropdownMenu: Pass,
    DropdownMenuTrigger: Pass,
    DropdownMenuContent: Pass,
    DropdownMenuItem: Pass,
  };
});

vi.mock('@/components/ui/avatar', () => {
  const Pass = ({ children }: { children?: React.ReactNode }) => <>{children}</>;
  return { Avatar: Pass, AvatarImage: Pass, AvatarFallback: Pass };
});

describe('<ShellHeader />', () => {
  beforeEach(() => {
    cleanup();
    pathnameMock.mockReset();
    setThemeMock.mockReset();
  });

  it('marks the active nav link with the foreground color', () => {
    pathnameMock.mockReturnValue('/commands');
    render(<ShellHeader />);

    const commands = screen.getByRole('link', { name: 'Commands' });
    const features = screen.getByRole('link', { name: 'Features' });

    expect(commands).toHaveStyle({ color: 'var(--foreground)' });
    expect(features).toHaveStyle({ color: 'var(--muted-foreground)' });
  });

  it('treats `/dashboard/<id>` as the Dashboard nav being active', () => {
    pathnameMock.mockReturnValue('/dashboard/9876543210');
    render(<ShellHeader />);
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveStyle({
      color: 'var(--foreground)',
    });
  });

  it('renders a theme-toggle button that flips the theme on click', async () => {
    pathnameMock.mockReturnValue('/');
    const { default: userEvent } = await import('@testing-library/user-event');
    const user = userEvent.setup();

    render(<ShellHeader />);
    const toggle = screen.getByRole('button', { name: /toggle theme/i });
    await user.click(toggle);

    expect(setThemeMock).toHaveBeenCalledWith('light');
  });
});
