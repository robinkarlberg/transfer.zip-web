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
import { ZapIcon } from "lucide-react"
import NewTransferFileRequest from "@/components/newtransfer/NewTransferFileRequest"
import ConditionalLandingFileRequest from "./ConditionalLandingFileRequest"
import { Button } from "@/components/ui/button"

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
      <div className="w-full h-screen absolute grain bg-linear-to-b from-primary-600 to-primary-300" />
      <div className="relative isolate flex min-h-screen flex-col">
        {/* <svg
          aria-hidden="true"
          className="absolute inset-0 -z-10 h-full w-full stroke-gray-200 opacity-50 [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]"
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
        </svg> */}
        <div className="mx-auto max-w-7xl w-full px-6 lg:px-8 mt-6 flex justify-between items-center">
          <div className="flex items-center bg-white px-2 py-1 rounded-xl fade-in-up-fast">
            <div className="ms-2 flex items-center text-xl gap-x-2">
              <Image src={icon} width={40} alt='logo'></Image>
              {/* <span className="font-bold">Transfer.zip</span> */}
            </div>
            <div className="ms-2 flex">
              <Button asChild size={"sm"} variant={"ghost"}>
                <Link href={"/#message-from-founder"}>Who are we?</Link>
              </Button>
              <Button asChild size={"sm"} variant={"ghost"}>
                <Link href={"/#pricing"}>Pricing</Link>
              </Button>
              <Button asChild size={"sm"} variant={"ghost"}>
                <Link href={"/legal/privacy-policy"}>Privacy</Link>
              </Button>
            </div>
          </div>
          <div className="fade-in-up-fast">
            <FreeConditional
              free={(
                <NoauthLandingHeaderCTAButton />
              )}
              nofree={(
                <Link data-umami-event="landing_header_cta_click" data-umami-event-is_logged_in="true" href={"/app"} className="flex items-center text-sm font-semibold text-gray-800 rounded-xl bg-white px-5 h-12 hover:bg-primary-50">
                  My Transfers <span aria-hidden="true">&rarr;</span>
                </Link>
              )}
            />
          </div>
        </div>
        <div className="grow mx-auto w-full max-w-7xl px-6 flex flex-col items-center justify-center mt-12 sm:mt-0">
          <h1 className="mx-auto text-center max-w-2xl text-4xl font-bold tracking-tight text-white mb-24 fade-in-up">
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
        <div className="mx-auto px-6 flex flex-col md:flex-row items-center justify-center gap-8 mt-4 mb-16 fade-in-up-slow">
          {[
            { icon: <ZapIcon size={16} />, text: "No waiting queue" },
            { icon: <ZapIcon size={16} />, text: "No size limit" },
            { icon: <ZapIcon size={16} />, text: "Send 100GB+ for free" },
          ].map(({ icon, text }) => <div key={text} className="flex items-center gap-2 rounded-xl font-semibold text-white"><span className="ms-0.5">{icon}</span> {text}</div>)}
        </div>
      </div>
    </div>
  )
}
