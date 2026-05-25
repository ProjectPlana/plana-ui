import type { NextConfig } from "next";
import createMDX from "@next/mdx";

// Accept either the runtime name (set by docker-entrypoint.sh) or the
// NEXT_PUBLIC_* name used by .env.local for local dev.
// Use a placeholder so the entrypoint can sed-replace it in routes-manifest.json at container startup.
// NEXT_PUBLIC_PLANA_API_URL is not available at build time for public images.
const apiUrl = process.env.NEXT_PUBLIC_PLANA_API_URL || 'PLANA_API_CSP_PLACEHOLDER';

const isDev = process.env.NODE_ENV === 'development';
const discordCdnHost = 'cdn.discordapp.com';
const internalImageHost = 'i.projectplana.com';
const discordCdnUrl = `https://${discordCdnHost}`;
const internalImageUrl = `https://${internalImageHost}`;

const otherExternalUrls = [
  discordCdnUrl,
  internalImageUrl,
]

const connectSrc = ["'self'", apiUrl, ...otherExternalUrls].filter(Boolean).join(' ');

const csp = [
  "default-src 'self'",
  // Tailwind / styled-jsx need 'unsafe-inline' until we lift to nonces.
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' https://cdn.discordapp.com https://i.projectplana.com data: blob:",
  "font-src 'self' data:",
  // Next dev/runtime requires 'unsafe-eval'/'unsafe-inline' in development.
  // Next App Router also injects inline bootstrap scripts in prod, so we
  // keep 'unsafe-inline' until a nonce-based pipeline is wired up.
  isDev
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    : "script-src 'self' 'unsafe-inline'",
  `connect-src ${connectSrc}`,
  "frame-ancestors 'none'",
  "form-action 'self'",
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: discordCdnHost,
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: internalImageHost,
        port: '',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

const withMDX = createMDX({
  options: {
    remarkPlugins: ['remark-gfm'],
  },
});

export default withMDX(nextConfig);
