import Link from "next/link"
import NewTransferFileUpload from '@/components/dashboard/NewTransferFileUpload'
import { useServerAuth } from '@/lib/server/wrappers/auth'
import { Suspense } from 'react'
import Image from 'next/image'
import icon from "@/img/icon.png"
import BIcon from "@/components/BIcon"
import ConditionalLandingFileUpload from "./ConditionalLandingFileUpload"
import { Button } from "@/components/ui/button"
import AuthConditional from "./AuthConditional"
import LandingQuickShare from "./LandingQuickShare"

export default async function ({ auth }) {

  const res = await fetch("https://api.github.com/repos/robinkarlberg/transfer.zip-web",
    {
      next: { revalidate: 3600 }
    }
  )
  const json = await res.json()
  const stars = json.stargazers_count

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
          <div className="flex items-center text-xl gap-x-2">
            <Image src={icon} width={40} alt='logo'></Image><span className="font-bold">Transfer.zip</span>
          </div>
          <div>
            <AuthConditional
              auth={(
                <Link href={"/app"} className="text-sm/6 font-semibold text-white rounded-full bg-primary px-4 py-2 hover:bg-primary-light">
                  My Transfers <span aria-hidden="true">&rarr;</span>
                </Link>
              )}
              noauth={(
                <Link href={"/app"} className="text-sm/6 font-semibold text-white rounded-full bg-primary px-4 py-2 hover:bg-primary-light">
                  Create Account <span aria-hidden="true">&rarr;</span>
                </Link>
              )}
            />
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-6 py-8 sm:py-32 lg:flex lg:items-center lg:gap-x-10 lg:px-8 lg:py-36">
          <div className="mx-auto max-w-2xl lg:mx-0 text-center lg:text-left lg:flex-auto">
            {/* <div className="flex justify-center lg:justify-start">
              <div className="relative flex items-center gap-x-4 rounded-full px-4 py-1 text-sm leading-6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20">
                <span className="font-semibold text-primary">New Version</span>
                <span aria-hidden="true" className="h-4 w-px bg-gray-900/10" />
                <Link href="https://blog.transfer.zip/" className="flex items-center gap-x-1">
                  <span aria-hidden="true" className="absolute inset-0" />
                  New blog design! &rarr;
                </Link>
              </div>
            </div> */}
            <h1 className="mx-auto lg:mx-0 mt-10 max-w-lg text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
              Send Big Files
              Without Limits
            </h1>
            <p className="mx-auto lg:mx-0 mt-6 text-lg leading-8 text-gray-600 max-w-md">
              {/* Send files with <span className="underline decoration-primary decoration-dashed font-semibold">no size limit</span> in real-time, with end-to-end encryption and blazingly fast speeds. */}
              Ultrafast, Reliable and Secure file transfers. <br className="hidden sm:inline" />
              No throttling. No size limits.
            </p>
            <div className="flex mt-10 items-center gap-6 justify-center lg:justify-start">
              <Link
                data-umami-event="landing-cta-click"
                href="/app"
                className="rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <AuthConditional
                  auth={(
                    <>
                      <span>My Transfers</span>{" "}&rarr;
                    </>
                  )}
                  noauth={(
                    <>
                      <span className="inline lg:hidden">Create Account</span>
                      <span className="hidden lg:inline">Create Account</span>
                      {" "}&rarr;
                    </>
                  )}
                />
              </Link>
              <a href="https://github.com/robinkarlberg/transfer.zip-web" className="hidden sm:inline-block text-sm font-semibold leading-6 text-gray-900">
                <BIcon name={"star"} /> Star on GitHub {stars ? `(${stars})` : ""}
              </a>
            </div>
          </div>
          <div className={`pt-16 sm:mt-8 lg:pt-0 lg:flex-shrink-0 lg:flex-grow`}>
            <div className={`mx-auto max-w-sm lg:h-56`}>
              <Suspense fallback={<LandingQuickShare />}>
                <ConditionalLandingFileUpload />
              </Suspense>
              {/* <LandingQuickShare/> */}
            </div>
          </div>
          {/* <div className="lg:hidden flex flex-col sm:flex-row mt-16 justify-center items-center gap-6">
            <Link
              href="signup"
              className="rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Send Large Files &rarr;
            </Link>
            <a href="https://github.com/robinkarlberg/transfer.zip-web" className="text-sm font-semibold leading-6 text-gray-900">
              <BIcon name={"star"} /> Star on GitHub {stars ? `(${stars})` : ""} <span aria-hidden="true"></span>
            </a>
          </div> */}
        </div>
      </div>
    </div>
  )
}
