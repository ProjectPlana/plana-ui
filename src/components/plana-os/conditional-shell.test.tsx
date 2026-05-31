import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { ConditionalShell } from './conditional-shell';

const pathnameMock = vi.fn<() => string>();

vi.mock('next/navigation', () => ({
  usePathname: () => pathnameMock(),
}));

// Stub OSShell so we can detect when ConditionalShell decides to wrap.
vi.mock('./os-shell', () => ({
  OSShell: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="os-shell">{children}</div>
  ),
}));

const CHILD_TEST_ID = 'child';
const Child = () => <span data-testid={CHILD_TEST_ID}>child</span>;

describe('<ConditionalShell />', () => {
  beforeEach(() => {
    cleanup();
    pathnameMock.mockReset();
  });

  it('wraps content in OSShell on standard routes', () => {
    pathnameMock.mockReturnValue('/commands');
    render(
      <ConditionalShell>
        <Child />
      </ConditionalShell>,
    );
    expect(screen.getByTestId('os-shell')).toBeInTheDocument();
    expect(screen.getByTestId(CHILD_TEST_ID)).toBeInTheDocument();
  });

  it('renders bare children on guild-config routes (page provides its own shell)', () => {
    pathnameMock.mockReturnValue('/dashboard/9876543210');
    render(
      <ConditionalShell>
        <Child />
      </ConditionalShell>,
    );
    expect(screen.queryByTestId('os-shell')).not.toBeInTheDocument();
    expect(screen.getByTestId(CHILD_TEST_ID)).toBeInTheDocument();
  });

  it('renders bare children on auth routes', () => {
    pathnameMock.mockReturnValue('/auth/callback');
    render(
      <ConditionalShell>
        <Child />
      </ConditionalShell>,
    );
    expect(screen.queryByTestId('os-shell')).not.toBeInTheDocument();
  });

  it('falls back to standard when usePathname returns null', () => {
    // Next.js types allow null; ConditionalShell should default to '/'.
    pathnameMock.mockReturnValue(null as unknown as string);
    render(
      <ConditionalShell>
        <Child />
      </ConditionalShell>,
    );
    expect(screen.getByTestId('os-shell')).toBeInTheDocument();
  });
});
