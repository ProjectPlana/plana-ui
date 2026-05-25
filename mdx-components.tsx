import type { MDXComponents } from 'mdx/types';
import Link from 'next/link';
import type { AnchorHTMLAttributes, HTMLAttributes } from 'react';

function Heading2(props: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      {...props}
      className="scroll-mt-24 border-b pb-3 pt-2 text-2xl font-semibold tracking-tight"
    />
  );
}

function Heading3(props: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      {...props}
      className="scroll-mt-24 pt-4 text-xl font-semibold tracking-tight"
    />
  );
}

function Anchor({ href = '', ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  if (href.startsWith('/')) {
    return (
      <Link
        href={href}
        className="font-medium text-primary underline underline-offset-4"
        {...props}
      />
    );
  }

  return (
    <a
      href={href}
      className="font-medium text-primary underline underline-offset-4"
      rel="noopener noreferrer"
      target={href.startsWith('#') ? undefined : '_blank'}
      {...props}
    />
  );
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h2: Heading2,
    h3: Heading3,
    h4: (props) => <h4 {...props} className="pt-3 text-base font-semibold" />,
    p: (props) => <p {...props} className="leading-7 text-muted-foreground" />,
    a: Anchor,
    ul: (props) => <ul {...props} className="ml-5 list-disc space-y-2 text-muted-foreground" />,
    ol: (props) => <ol {...props} className="ml-5 list-decimal space-y-2 text-muted-foreground" />,
    li: (props) => <li {...props} className="pl-1 leading-7" />,
    strong: (props) => <strong {...props} className="font-semibold text-foreground" />,
    code: (props) => (
      <code
        {...props}
        className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground"
      />
    ),
    pre: (props) => (
      <pre
        {...props}
        className="overflow-x-auto rounded-lg border bg-muted p-4 text-sm"
      />
    ),
    blockquote: (props) => (
      <blockquote
        {...props}
        className="rounded-lg border-l-4 bg-muted/60 px-5 py-4 text-sm text-muted-foreground"
      />
    ),
    table: (props) => (
      <div className="overflow-x-auto rounded-lg border">
        <table {...props} className="w-full text-sm" />
      </div>
    ),
    th: (props) => (
      <th
        {...props}
        className="border-b bg-muted px-4 py-3 text-left font-semibold"
      />
    ),
    td: (props) => <td {...props} className="border-b px-4 py-3 text-muted-foreground" />,
    hr: (props) => <hr {...props} className="my-8 border-border" />,
    ...components,
  };
}
