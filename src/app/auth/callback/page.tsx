'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle } from 'lucide-react';

/**
 * OAuth redirect-flow landing page.
 *
 * Cookie-based auth means the API has already set the session by the time the
 * browser arrives here. We just inspect ``error`` (sanitised against an
 * allow-list — no user-controlled string ever reaches an outgoing URL) and
 * route the user to either the dashboard or back to the home page.
 */
const ERROR_CODE_RE = /^[a-z0-9_]{1,64}$/;

export default function AuthCallback() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');
  const status = errorParam ? 'error' : 'success';
  const message = errorParam
    ? 'Authentication failed. Redirecting...'
    : 'Authentication successful! Redirecting to dashboard...';

  useEffect(() => {
    if (errorParam) {
      const safeError = ERROR_CODE_RE.test(errorParam) ? errorParam : 'auth_failed';
      const target = `/?error=${encodeURIComponent(safeError)}`;
      window.setTimeout(() => {
        window.location.replace(target);
      }, 1500);
      return;
    }

    // Success path: the cookie is already set by the API; head to the dashboard.
    window.setTimeout(() => {
      window.location.replace('/dashboard');
    }, 1000);
  }, [errorParam]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center max-w-md mx-auto">
        <div className="mb-6">
          {status === 'success' && (
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
          )}
          {status === 'error' && (
            <XCircle className="h-12 w-12 text-red-500 mx-auto" />
          )}
        </div>

        <h1 className="text-xl font-semibold mb-2">
          {status === 'success' && 'Success!'}
          {status === 'error' && 'Authentication Failed'}
        </h1>

        <p className="text-muted-foreground mb-4">
          {message}
        </p>
      </div>
    </div>
  );
}
