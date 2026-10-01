import Image from "next/image"
import Link from "next/link"
import { ArrowRightIcon, DownloadIcon, FileIcon, FilmIcon, FolderIcon, GithubIcon, ImageIcon, LinkIcon, LockIcon, Monitor, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"

const SOURCE_NOTES = {
  iphone: {
    icon: ImageIcon,
    title: "iPhone photos can arrive as HEIC",
    text: "Photos keep the format your iPhone supplies. If you need JPGs, convert them after the transfer.",
    href: "/tools/convert-heic-to-jpg",
    link: "Convert HEIC to JPG",
  },
  android: {
    icon: ImageIcon,
    title: "Choose from your phone",
    text: "Pick photos, videos or documents in your browser. Keep the browser open and your phone awake until the transfer finishes.",
  },
  pc: {
    icon: FolderIcon,
    title: "Whole folders work too",
    text: "Choose the folder option on your PC. Your files arrive together in a ZIP, with the folder structure intact.",
  },
  mac: {
    icon: FolderIcon,
    title: "Send a file or a whole folder",
    text: "Choose files or use the folder option on your Mac. Multiple files arrive together in a ZIP, keeping your folders intact.",
  },
}

const DESTINATION_NOTES = {
  iphone: {
    icon: DownloadIcon,
    title: "Find downloads in the Files app",
    text: "Open Downloads in the Files app on your iPhone. From there, save images to Photos or unpack a ZIP.",
  },
  android: {
    icon: DownloadIcon,
    title: "Your files land in Downloads",
    text: "Find them in your Android phone's Downloads folder or file manager. Multiple files arrive together as a ZIP.",
  },
  pc: {
    icon: DownloadIcon,
    title: "Ready in your Downloads folder",
    text: "Files arrive in your browser's download location, usually Downloads. Extract the ZIP if you sent several files together.",
  },
  mac: {
    icon: DownloadIcon,
    title: "Ready in Downloads on your Mac",
    text: "Find your files in your browser's download location. Double-click a ZIP to unpack a batch of files or a folder.",
  },
}

const FILE_TYPES = [
  { icon: ImageIcon, label: "Photos" },
  { icon: FilmIcon, label: "Videos" },
  { icon: FileIcon, label: "Documents" },
]

export default function TransferPairLanding({ from, to, subtitle }) {
  const fromLabel = from.short || from.name
  const toLabel = to.short || to.name
  const FromIcon = from.key === "pc" || from.key === "mac" ? Monitor : Smartphone
  const ToIcon = to.key === "pc" || to.key === "mac" ? Monitor : Smartphone
  const notes = [SOURCE_NOTES[from.key], DESTINATION_NOTES[to.key]]

  return (
    <>
      <section aria-labelledby="original-files" className="bg-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-2 lg:gap-20 lg:py-28">
          <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
            <div aria-hidden="true" className="absolute inset-8 rounded-full bg-primary-50 sm:inset-10" />
            <Image
              src="/img/landing/transfer-originals.webp"
              alt="Photo, video and document files wrapped in a blue ribbon"
              width={1200}
              height={1200}
              sizes="(min-width: 1280px) 568px, (min-width: 1024px) 45vw, (min-width: 640px) 512px, calc(100vw - 40px)"
              className="relative h-auto w-full"
            />
          </div>
          <div className="mx-auto w-full max-w-lg lg:max-w-none">
            <h2 id="original-files" className="text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              Big files.<br />Full quality.
            </h2>
            <p className="mt-6 max-w-md text-lg leading-8 text-gray-600">
              Send photos, videos and documents from your {from.name} to your {to.name} without compressing them. Your files arrive at their original size and quality.
            </p>
            <p className="mt-4 max-w-md text-lg leading-8 text-gray-600">
              There is no file size cap. Large transfers take as long as your internet connection needs.
            </p>
            <ul className="mt-7 flex flex-wrap gap-3" aria-label="Supported file types">
              {FILE_TYPES.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2 rounded-full bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-600">
                  <Icon aria-hidden="true" size={18} className="text-primary-600" />{label}
                </li>
              ))}
            </ul>
            <div className="mt-9">
              <Button asChild size="lg">
                <a href="#start-transfer">Start a transfer<ArrowRightIcon aria-hidden="true" /></a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="private-transfer" className="overflow-hidden bg-gray-900 text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-2 lg:gap-20 lg:py-28">
          <div className="mx-auto w-full max-w-lg lg:max-w-none">
            <div className="mb-6 flex items-center gap-2.5 text-sm font-medium text-primary-200">
              <LockIcon aria-hidden="true" size={18} />Encrypted transfers
            </div>
            <h2 id="private-transfer" className="text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              Private while<br />it moves.
            </h2>
            <p className="mt-6 max-w-md text-lg leading-8 text-gray-300">
              Files are encrypted before they leave your browser and are never stored on our servers. They travel to the other device while both of you are online.
            </p>
            <p className="mt-4 max-w-md text-lg leading-8 text-gray-300">
              Share a link, scan a QR code or enter a 6-digit code. Keep both tabs open until your files arrive.
            </p>
            <Link href="https://github.com/robinkarlberg/transfer.zip-web" target="_blank" rel="noreferrer" className="group mt-9 inline-flex items-center gap-3 rounded-sm text-base font-semibold text-white underline decoration-gray-500 underline-offset-4 hover:decoration-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-300">
              <GithubIcon aria-hidden="true" size={20} />View the source<ArrowRightIcon aria-hidden="true" size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="mx-auto w-full max-w-lg lg:max-w-none">
            <Image
              src="/img/landing/transfer-privacy.webp"
              alt="A document protected by a glass shield with a blue rim"
              width={1200}
              height={1200}
              sizes="(min-width: 1280px) 568px, (min-width: 1024px) 45vw, (min-width: 640px) 512px, calc(100vw - 40px)"
              className="h-auto w-full"
            />
          </div>
        </div>
      </section>

      <section aria-labelledby="device-details" className="bg-gray-50">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-2 lg:gap-20">
          <div>
            <div aria-hidden="true" className="mb-7 flex items-center gap-5 text-primary-600">
              <span className="grid size-16 place-items-center rounded-2xl bg-white"><FromIcon size={30} strokeWidth={1.5} /></span>
              <ArrowRightIcon size={24} className="text-gray-400" />
              <span className="grid size-16 place-items-center rounded-2xl bg-white"><ToIcon size={30} strokeWidth={1.5} /></span>
            </div>
            <h2 id="device-details" className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              {fromLabel} to {toLabel},<br />in your browser.
            </h2>
            <p className="mt-5 max-w-md text-lg leading-8 text-gray-600">{subtitle}</p>
            <p className="mt-5 flex items-center gap-2.5 text-sm font-medium text-gray-600"><LinkIcon aria-hidden="true" size={18} className="shrink-0 text-primary-600" />Works across different Wi-Fi and mobile networks.</p>
          </div>
          <div className="divide-y divide-gray-200">
            {notes.map(({ icon: Icon, title, text, href, link }) => (
              <div key={title} className="flex gap-5 py-7 first:pt-0 last:pb-0">
                <Icon aria-hidden="true" size={24} className="mt-1 shrink-0 text-primary-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                  <p className="mt-2 text-base leading-7 text-gray-600">{text}</p>
                  {href && <Link href={href} className="group mt-4 inline-flex items-center gap-2 rounded-sm text-sm font-semibold text-primary-600 hover:text-primary-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-600">{link}<ArrowRightIcon aria-hidden="true" size={16} className="transition-transform group-hover:translate-x-1" /></Link>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
