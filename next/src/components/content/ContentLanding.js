import Link from "next/link"
import Image from 'next/image'
import icon from "@/img/icon.png"
import { Button } from "@/components/ui/button"

export default async function ({ title, description, href, linkText, slugPath }) {
  return (
    <div className="mb-12">
      <div className="relative isolate">
        <div className="absolute inset-0 -z-10 overflow-hidden grain bg-linear-to-b from-primary-600 to-primary-400" />
        <div className="mx-auto max-w-7xl w-full px-6 lg:px-8 pt-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-white px-2 py-1 rounded-xl">
              <div className="ms-2 flex items-center text-xl gap-x-2">
                <Image src={icon} width={40} alt='logo'></Image>
              </div>
              <div className="ms-2 hidden sm:flex">
                <Button asChild size={"sm"} variant={"ghost"}>
                  <Link href={"/#why-choose-us"}>Features</Link>
                </Button>
                <Button asChild size={"sm"} variant={"ghost"}>
                  <Link href={"/#message-from-founder"}>About</Link>
                </Button>
                <Button asChild size={"sm"} variant={"ghost"}>
                  <Link href={"/#pricing"}>Pricing</Link>
                </Button>
                <Button asChild size={"sm"} variant={"ghost"}>
                  <Link href={"/legal/privacy-policy"}>Privacy</Link>
                </Button>
              </div>
            </div>
          </div>
          <div>
            <Link href={"/app"} className="flex items-center text-sm font-semibold text-gray-800 rounded-xl bg-white px-5 h-12 hover:bg-primary-50">
              Create Account <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <nav className="flex items-center justify-center gap-2 text-sm text-white/70 mb-6">
              <Link href="/" className="hover:underline hover:text-white">
                Home
              </Link>
              {slugPath
                .split('/')
                .map((segment, i, arr) => {
                  const segmentHref = '/' + arr.slice(0, i + 1).join('/')
                  const isLast = i === arr.length - 1
                  const label = segment.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
                  return (
                    <span key={segmentHref} className="flex items-center gap-2">
                      <span className="text-white/50">/</span>
                      {isLast ? (
                        <span className="text-white font-medium">{label}</span>
                      ) : (
                        <Link href={segmentHref} className="hover:underline hover:text-white">
                          {label}
                        </Link>
                      )}
                    </span>
                  )
                })}
            </nav>
            <h1 className="mx-auto max-w-xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
              {title}
            </h1>
            <p className="mx-auto mt-6 text-lg leading-8 text-white max-w-xl [&_a]:text-white [&_a]:hover:text-primary-200 [&_a]:font-semibold">
              {description}
            </p>
            <div className="flex mt-10 items-center gap-6 justify-center">
              <Link
                href={href}
                className="rounded-xl bg-white px-5 py-3 text-base font-semibold text-gray-800 shadow-sm hover:bg-primary-50"
              >
                <span>{linkText}</span>
                {" "}&rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
