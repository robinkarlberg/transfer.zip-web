import icon from "@/img/icon.png"
import Image from 'next/image'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ZapIcon } from "lucide-react"
import Breadcrumb from "@/components/Breadcrumb"

export default function ToolLanding({
  title,
  highlightedWord = "Easily",
  subtitle,
  features,
  children
}) {
  const defaultFeatures = [
    { icon: <ZapIcon size={16} />, text: "Files never leave your device", mobile: false },
    { icon: <ZapIcon size={16} />, text: <Link className="hover:underline" href={"https://github.com/robinkarlberg/transfer.zip-web"}>Open source</Link>, mobile: false },
    { icon: <ZapIcon size={16} />, text: "No size limit, works offline", mobile: false },
    { icon: <ZapIcon size={16} />, text: "Files never leave your device", mobile: true },
  ]

  const featureList = features || defaultFeatures

  return (
    <div>
      <div className="w-full min-h-screen overflow-hidden absolute grain bg-linear-to-b from-primary-600 to-primary-300" />
      <div className="relative isolate flex min-h-screen flex-col">
        <div className="mx-auto max-w-7xl w-full px-6 lg:px-8 mt-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-white px-2 py-1 rounded-xl fade-in-up-fast">
              <Link href="/" className="ms-2 flex items-center text-xl gap-x-2">
                <Image src={icon} width={40} alt='logo' />
              </Link>
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
            <Link href={"/app/sent"} className="flex items-center text-sm font-semibold text-gray-800 rounded-xl bg-white px-5 h-10 hover:bg-primary-50">
              Open App <span aria-hidden="true" className="ms-1">&rarr;</span>
            </Link>
          </div>
        </div>
        <div className="grow mx-auto w-full max-w-7xl px-6 flex flex-col items-center justify-center mt-8 sm:mt-0">
          <Breadcrumb className="mb-6 fade-in-up" />
          <h1 className="mx-auto text-center max-w-2xl text-4xl font-bold tracking-tight text-white fade-in-up">
            <span className="relative">
              <span className="relative z-10">{highlightedWord}</span>
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
            {" "}{title}
          </h1>
          <p className="mx-auto text-center text-lg leading-8 text-white/90 max-w-2xl mt-6 mb-12 fade-in-up-slow">
            {subtitle}
          </p>
          <div className="fade-in-up-slow w-full max-w-md">
            {children}
          </div>
        </div>
        <div className="mx-auto px-6 flex flex-col sm:flex-row items-center justify-center gap-8 mt-4 mb-16 fade-in-up-slow">
          {featureList.map(({ icon, text, mobile }, idx) => (
            <div key={idx} className={cn(
              "text-shadow-sm items-center gap-2 rounded-xl font-semibold text-white",
              mobile ? "flex sm:hidden" : "hidden sm:flex"
            )}>
              <span className="ms-0.5">{icon}</span> {text}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
