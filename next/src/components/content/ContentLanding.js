import Link from "next/link"
import Image from 'next/image'
import icon from "@/img/icon.png"

export default async function ({ title, description, href, linkText, slugPath, children }) {
  return (
    <div className="bg-white mb-12">
      <div className="relative isolate">
        <svg
          aria-hidden="true"
          className="absolute inset-0 -z-10 h-full w-full stroke-gray-200 [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]"
        >
          <defs>
            <pattern
              x="50%"
              y={-1}
              id="83fd4e5a-9d52-42fc-97b6-718e5d7ee527"
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
          <rect fill="url(#83fd4e5a-9d52-42fc-97b6-718e5d7ee527)" width="100%" height="100%" strokeWidth={0} />
        </svg>
        <div className="mx-auto max-w-7xl px-6 lg:px-8 pt-8 flex justify-between items-center">
          <div className="text-xl">
            <Link className="flex items-center gap-x-2" href={"/"}><Image src={icon} width={40} alt='logo'></Image><span className="font-bold">Transfer.zip</span></Link>
          </div>
          <div className="hidden md:block">
            <nav className="flex items-center gap-2 text-sm lg:text-base text-gray-500">
              <Link
                href="/"
                className="hover:underline transition-colors duration-150 hover:text-blue-600"
              >
                Home
              </Link>
              {slugPath
                .split('/')
                .map((segment, i, arr) => {
                  const href = '/' + arr.slice(0, i + 1).join('/')
                  const isLast = i === arr.length - 1
                  const label = segment.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
                  return (
                    <span key={href} className="flex items-center gap-2">
                      <svg
                        width="16"
                        height="16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        className="mx-1 text-gray-300"
                        viewBox="0 0 16 16"
                      >
                        <path d="M6 4l4 4-4 4" />
                      </svg>
                      {isLast
                        ? (
                          <span className="text-gray-900 font-semibold bg-gray-100 px-2 py-0.5 rounded">
                            {label}
                          </span>
                        ) : (
                          <Link
                            href={href}
                            className="hover:underline hover:text-blue-600 transition-colors duration-150"
                          >
                            {label}
                          </Link>
                        )
                      }
                    </span>
                  )
                })}
            </nav>
          </div>
          <div>
            <Link href={"/app"} className="text-sm/6 font-semibold text-white rounded-full bg-primary px-4 py-2 hover:bg-primary-light">
              Create Account <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-6 py-8 sm:py-32 lg:flex lg:items-center lg:gap-x-10 lg:px-8 lg:py-36">
          <div className="mx-auto max-w-2xl lg:mx-0 text-center lg:text-left lg:flex-auto">
            <h1 className="mx-auto lg:mx-0 mt-10 max-w-xl text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
              {title}
            </h1>
            <p className="mx-auto lg:mx-0 mt-6 text-lg leading-8 text-gray-600 max-w-xl">
              {description}
            </p>
            <div className="flex mt-10 items-center gap-6 justify-center lg:justify-start">
              <Link
                href={href}
                className="rounded-md bg-primary px-3.5 py-2.5 text-base font-semibold text-white shadow-sm hover:bg-primary-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <>
                  <span>{linkText}</span>
                  {" "}&rarr;
                </>
              </Link>
            </div>
          </div>
          <div className={`hidden sm:mt-8 lg:pt-0 lg:flex items-center justify-center lg:flex-shrink-0 lg:flex-grow relative`}>
            <div className={`mx-auto max-w-sm absolute`}>
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
