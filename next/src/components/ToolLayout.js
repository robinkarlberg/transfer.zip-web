export default function ToolLayout({ heroTitle, heroSubtitle, children, large }) {
  return (
    <div className="bg-white">
      <div className="relative isolate">
        <svg
          aria-hidden="true"
          className="absolute inset-0 -z-10 h-full w-full stroke-gray-200 [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]"
        >
          <defs>
            <pattern
              id="tool-pattern"
              x="50%"
              y={-1}
              width={200}
              height={200}
              patternUnits="userSpaceOnUse"
            >
              <path d="M100 200V.5M.5 .5H200" fill="none" />
            </pattern>
          </defs>
          <svg x="50%" y={-1} className="overflow-visible fill-gray-50">
            <path
              d="M-100.5 0h201v201h-201Z M699.5 0h201v201h-201Z M499.5 400h201v201h-201Z M-300.5 600h201v201h-201Z"
              strokeWidth={0}
            />
          </svg>
          <rect fill="url(#tool-pattern)" width="100%" height="100%" strokeWidth={0} />
        </svg>
        <div className={`mx-auto max-w-7xl px-6 py-24 sm:py-32 ${large ? "" : "lg:flex lg:items-center lg:gap-x-10 lg:px-8 lg:py-40"}`}>
          <div className="mx-auto max-w-2xl lg:mx-0 lg:flex-auto">
            <h1 className="mt-10 max-w-lg text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              {heroTitle}
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-lg">
              {heroSubtitle}
            </p>
          </div>
          <div className={`mt-16 sm:mt-24 lg:mt-0 lg:flex-shrink-0 lg:flex-grow`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
