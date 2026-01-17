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
import NewTransferFileUploadNew from "@/components/newtransfer/NewTransferFileUploadNew"
import FreeConditional from "./FreeConditional"
import { GithubIcon, StarIcon, ZapIcon } from "lucide-react"
import NewTransferFileRequest from "@/components/newtransfer/NewTransferFileRequest"
import ConditionalLandingFileRequest from "./ConditionalLandingFileRequest"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default async function ({ mode }) {

  const res = await fetch("https://api.github.com/repos/robinkarlberg/transfer.zip-web",
    {
      next: { revalidate: 3600 }
    }
  )
  const json = await res.json()
  const stars = json?.stargazers_count

  return (
    <div>
      <div className="w-full h-screen overflow-hidden absolute grain bg-linear-to-b from-primary-600 to-primary-300" />
      <div className="relative isolate flex min-h-screen flex-col">
        <div className="mx-auto max-w-7xl w-full px-6 lg:px-8 mt-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-white px-2 py-1 rounded-xl fade-in-up-fast">
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
          <div className="fade-in-up-fast">
            <AuthConditional
              noauth={(
                <NoauthLandingHeaderCTAButton />
              )}
              auth={(
                <Link data-umami-event="landing_header_cta_click" data-umami-event-is_logged_in="true" href={"/app/sent"} className="flex items-center text-sm font-semibold text-gray-800 rounded-xl bg-white px-5 h-12 hover:bg-primary-50">
                  My Transfers <span aria-hidden="true">&rarr;</span>
                </Link>
              )}
            />
          </div>
        </div>
        <div className="grow mx-auto w-full max-w-7xl px-6 flex flex-col items-center justify-center mt-8 sm:mt-0">
          <h1 className="mx-auto text-center max-w-2xl text-4xl font-bold tracking-tight text-white fade-in-up">
            Try the{" "}
            <span className="relative">
              <span className="relative z-10">easiest</span>
              <svg
                className="absolute left-0 bottom-[0.08em] w-full text-primary-200"
                style={{ height: "0.15em" }}
                viewBox="0 0 100 20"
                preserveAspectRatio="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 15 C 20 22, 40 5, 60 12 S 90 18, 98 10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ vectorEffect: "non-scaling-stroke" }}
                />
              </svg>
            </span>
            {" "}way to{" "}
            {mode === "receive" ? "receive files." : "send files."}
          </h1>
          <Link href={"https://github.com/robinkarlberg/transfer.zip-web"} className={"mt-4 [&_svg:not([class*='size-'])]:size-4 text-white inline-flex items-center justify-center gap-2 text-shadow-sm text-sm hover:underline font-semibold fade-in-up-slow mb-24 2xl:mb-32"}>
            <StarIcon /> Star on GitHub ({stars})
          </Link>
          {/* <p className="mx-auto text-center text-lg leading-8 text-gray-700 max-w-md mb-12">
            No queue. No size limits.
          </p> */}
          <div className="fade-in-up-slow">
            {
              mode != "receive" ?
                <Suspense fallback={<NewTransferFileUploadNew loaded={false} />}>
                  <ConditionalLandingFileUpload />
                </Suspense>
                :
                <Suspense fallback={<NewTransferFileRequest loaded={false} />}>
                  <ConditionalLandingFileRequest />
                </Suspense>
            }
          </div>
        </div>
        <div className="mx-auto px-6 flex flex-col sm:flex-row items-center justify-center gap-8 mt-4 mb-16 fade-in-up-slow">
          {[
            { icon: <ZapIcon size={16} />, text: "Data is encrypted", mobile: false },
            { icon: <ZapIcon size={16} />, text: <Link className="hover:underline" href={"https://github.com/robinkarlberg/transfer.zip-web"}>Open source</Link>, mobile: false },
            { icon: <ZapIcon size={16} />, text: "Send 100GB+ for free", mobile: false },
            { icon: <ZapIcon size={16} />, text: "No size limit, data is encrypted", mobile: true },
          ].map(({ icon, text, mobile }) => <div key={text} className={cn(
            "text-shadow-sm items-center gap-2 rounded-xl font-semibold text-white",
            mobile ? "flex sm:hidden" : "hidden sm:flex"
          )}><span className="ms-0.5">{icon}</span> {text}</div>)}
        </div>
      </div>
    </div>
  )
}
