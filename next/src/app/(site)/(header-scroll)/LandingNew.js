import BIcon from "@/components/BIcon"
import icon from "@/img/icon.png"
import Image from 'next/image'
import Link from "next/link"
import { Suspense } from 'react'
import AuthConditional from "./AuthConditional"
import ConditionalLandingFileUpload from "./ConditionalLandingFileUpload"
import LandingQuickShare from "./LandingQuickShare"
import NoauthLandingCTAButton from "./NoauthLandingCTAButton"
import NoauthLandingHeaderCTAButton from "./NoauthLandingHeaderCTAButton"
import NewTransferFileUploadNew from "@/components/NewTransferFileUploadNew"

export default async function ({ auth }) {

  const res = await fetch("https://api.github.com/repos/robinkarlberg/transfer.zip-web",
    {
      next: { revalidate: 3600 }
    }
  )
  const json = await res.json()
  const stars = json?.stargazers_count

  return (
    <div className="bg-white">
      <div className="relative isolate flex min-h-screen flex-col">
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
        <div className="mx-auto max-w-7xl w-full px-6 lg:px-8 pt-8 flex justify-between items-center">
          <div className="flex items-center text-xl gap-x-2">
            <Image src={icon} width={40} alt='logo'></Image><span className="font-bold">Transfer.zip</span>
          </div>
          <div>
            <AuthConditional
              auth={(
                <Link data-umami-event="landing_header_cta_click" data-umami-event-is_logged_in="true" href={"/app"} className="text-sm/6 font-semibold text-white rounded-full bg-primary px-4 py-2 hover:bg-primary-light">
                  My Transfers <span aria-hidden="true">&rarr;</span>
                </Link>
              )}
              noauth={(
                <NoauthLandingHeaderCTAButton />
              )}
            />
          </div>
        </div>
        <div className="grow mx-auto w-full max-w-7xl px-6 flex flex-col items-center justify-center mb-12">
          <h1 className="mx-auto text-center max-w-xl text-4xl font-bold tracking-tight text-gray-800 mb-2">
            Try the easiest way to send files.
          </h1>
          <p className="mx-auto text-center text-lg leading-8 text-gray-700 max-w-md mb-12">
            No queue. No size limits.
          </p>
          <Suspense fallback={<NewTransferFileUploadNew loaded={false} />}>
            <ConditionalLandingFileUpload/>
          </Suspense>
        </div>
      </div>
    </div>
  )
}
