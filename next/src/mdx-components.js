import Link from "next/link";
import { cn } from "./lib/utils";
import { Button } from "./components/ui/button";

function HowToCard({ href, title, description, image, imageAlt, children }) {
  return (
    <Link
      href={href}
      className="group relative flex items-center gap-4 p-6 rounded-2xl border border-gray-200 bg-linear-to-br from-white to-gray-50/80 shadow-sm hover:shadow-md hover:border-primary/30 hover:from-primary/5 hover:to-white transition-all duration-200 min-h-[120px] overflow-hidden no-underline"
    >
      <img
        src={image}
        alt={imageAlt || title}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-32 h-32 object-contain opacity-10 group-hover:opacity-20 group-hover:scale-110 pointer-events-none select-none transition-all duration-300"
        aria-hidden="true"
      />
      <div className="relative flex-1 z-10">
        <span className="text-lg font-semibold text-gray-900 group-hover:text-primary transition-colors">
          {title}
        </span>
        <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">{children || description}</p>
      </div>
      <svg
        className="w-5 h-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all duration-200 flex-shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}

function HowToList({ children }) {
  return <div className="not-prose grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>;
}

export function mdxComponents(basePath) {
  return {
    h1: ({ className, ...props }) => (
      <h1
        className={cn(
          "text-3xl font-semibold tracking-tight",
          className
        )}
        {...props}
      />
    ),
    h2: ({ className, ...props }) => (
      <h2
        className={cn(
          "mt-12 text-2xl font-semibold tracking-tight",
          className
        )}
        {...props}
      />
    ),
    h3: ({ className, ...props }) => (
      <h3
        className={cn("mt-8 text-xl font-semibold", className)}
        {...props}
      />
    ),
    p: ({ className, ...props }) => (
      <p
        className={cn("mt-6 leading-7 text-lg", className)}
        {...props}
      />
    ),
    ul: ({ className, ...props }) => (
      <ul
        className={cn("mt-6 list-disc space-y-2 pl-6 text-lg", className)}
        {...props}
      />
    ),
    ol: ({ className, ...props }) => (
      <ol
        className={cn(
          "mt-6 list-decimal space-y-2 pl-6 text-lg",
          className
        )}
        {...props}
      />
    ),
    blockquote: ({ className, ...props }) => (
      <blockquote
        className={cn(
          "mt-6 border-l-4 border-primary-400 pl-4 text-base",
          className
        )}
        {...props}
      />
    ),
    pre: ({ className, ...props }) => (
      <pre
        className={cn(
          "mt-4 overflow-x-auto p-4 text-sm border border-gray-400 bg-gray-50 rounded-lg dark:bg-gray-800",
          className
        )}
        {...props}
      />
    ),
    table: ({ className, ...props }) => (
      <div className="mt-8 overflow-x-auto">
        <table
          className={cn(
            "min-w-full border-collapse text-left",
            className
          )}
          {...props}
        />
      </div>
    ),
    th: ({ className, ...props }) => (
      <th
        className={cn(
          "border-b border px-3 py-2 font-bold bg-gray-300 dark:bg-gray-600",
          className
        )}
        {...props}
      />
    ),
    tr: ({ className, ...props }) => (
      <tr
        className={cn("even:bg-gray-50 even:dark:bg-gray-800", className)}
        {...props}
      />
    ),
    td: ({ className, ...props }) => (
      <td
        className={cn("border px-3 py-2", className)}
        {...props}
      />
    ),
    a: ({ className, ...props }) => (
      <Link
        className={cn(
          "font-medium text-primary underline underline-offset-4 hover:text-primary-500",
          className
        )}
        {...props}
      />
    ),
    img: ({ src, alt, title, ...props }) => (
      <>
        <img
          className="border"
          src={basePath ? `${basePath}/${src}` : src}
          alt={alt}
          {...props}
        />
        {title && <span className="text-sm text-gray-400">{title}</span>}
      </>
    ),
    "Link": ({ className, ...props }) => (
      <Link
        className={cn(
          "font-medium text-primary underline underline-offset-4 hover:text-primary-500",
          className
        )}
        {...props}
      />
    ),
    "Button": ({ className, ...props }) => (
      <Button
        className={cn(
          "p-6 text-lg",
          className,
        )}
        {...props}
      />
    ),
    "HowToCard": HowToCard,
    "HowToList": HowToList,
  };
}

// For nextjs mdx loader (for page.mdx for example)
export function useMDXComponents(components) {
  return {
    ...mdxComponents(),
    ...components,
  }
}
