import Transfer from "@/lib/server/mongoose/models/Transfer";
import DownloadArea from "./DownloadArea";
import { notFound } from "next/navigation";
import dbConnect from "@/lib/server/mongoose/db";
import { formatCount, groupFilesByFolder, humanFileSize } from "@/lib/transferUtils";
import { humanTimeUntil, parseTransferExpiryDate } from "@/lib/utils";
import BrandHeader from "../../BrandHeader";
import Header from "@/components/Header";
import { IS_SELFHOST } from "@/lib/isSelfHosted";
import Features1 from "@/components/Features1";
import TestimonialCloud from "@/components/TestimonialCloud";
import FAQ from "@/components/FAQ";
import Image from "next/image";
import { headers } from "next/headers";
import { isBot } from "@/lib/isBot";
import { useServerAuth } from "@/lib/server/wrappers/auth";
import { isCustomDomainHost } from "@/lib/hostUtils";
import { FileIcon, FilmIcon, FolderIcon, ImageIcon, MusicIcon } from "lucide-react";
import Footer from "@/components/Footer";
import clouds from "@/img/download-clouds.png";

const ENTRIES_LISTED = 50


const iconFor = type => {
  if (!type) return FileIcon
  if (type.startsWith("image/")) return ImageIcon
  if (type.startsWith("video/")) return FilmIcon
  if (type.startsWith("audio/")) return MusicIcon
  return FileIcon
}

export async function generateMetadata({ params }) {
  const { secretCode } = await params

  await dbConnect()

  const transfer = await Transfer.findOne({ secretCode: { $eq: secretCode } }, { brandProfile: 1, fileCount: { $size: "$files" } }).populate("brandProfile").lean()
  if (!transfer) {
    return undefined
  }

  const { brandProfile } = transfer
  const brandName = brandProfile?.name || "Transfer.zip"
  const title = "Download " + formatCount(transfer.fileCount, "file") + " | " + brandName
  const description = "You've got files waiting for you."
  const ogImage = brandProfile?.backgroundUrl || "https://cdn.transfer.zip/og.png"

  return {
    title: title,
    description,
    openGraph: {
      title: title,
      description,
      images: [ogImage],
    },
    // twitter: {
    //   title: post.title,
    //   description,
    //   images: [imageUrl],
    //   card: "summary_large_image",
    // },
  };
}

export default async function ({ params }) {
  const { secretCode } = await params

  await dbConnect()

  const transfer = await Transfer.findOne({ secretCode: { $eq: secretCode } }).populate("author").populate("brandProfile")

  if (!transfer) {
    notFound()
  }

  const auth = await useServerAuth()

  const headersList = await headers()
  if (!transfer?.author || !auth || auth.user._id.toString() !== transfer.author._id.toString()) {
    const userAgent = headersList.get("user-agent") || ""
    if (!isBot(userAgent)) {
      await transfer.logView()
    }
  }

  const isCustomDomain = isCustomDomainHost(headersList.get("host"))

  const expiryDate = parseTransferExpiryDate(transfer.expiresAt)

  let { brandProfile } = transfer
  const fileCount = transfer.files.length
  const entries = groupFilesByFolder(transfer.files).slice(0, ENTRIES_LISTED)
  const unlistedCount = fileCount - entries.reduce((total, entry) => total + entry.count, 0)

  return (
    <>
      <div className="relative isolate grid min-h-svh grid-cols-1 place-items-center px-4 pt-28 pb-16">
        {brandProfile ? <BrandHeader brandProfile={brandProfile} /> : !isCustomDomain && <Header />}
        {brandProfile && brandProfile.backgroundUrl ? (
          <Image
            fill
            alt="Branding Background Image"
            className="object-center object-cover pointer-events-none"
            src={brandProfile.backgroundUrl}
          />
        ) : (
          <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden bg-linear-to-b from-primary-600 to-primary-300">
            {/* Taller than the section so the clouds sit lower, their base clipped under the fade */}
            <div className="absolute inset-x-0 top-0 h-[115%] sm:h-[135%]">
              <Image fill priority alt="" src={clouds} className="object-cover object-bottom" />
            </div>
            <div className="absolute inset-x-0 bottom-0 h-1/5 bg-linear-to-b from-transparent to-white" />
          </div>
        )}
        {/* Radius is the pill buttons' 24px plus the padding, so the corners stay concentric */}
        <div className="w-full max-w-md animate-poof-in rounded-[32px] bg-white p-2 shadow-2xl motion-reduce:animate-none sm:rounded-[36px] sm:p-3">
          <div className="px-2 pt-3 pb-1 sm:pt-4">
            <h1 className="text-2xl font-bold tracking-tight break-words text-gray-900 sm:text-3xl">{transfer.name || "You've got files"}</h1>
            {transfer.description && <p className="mt-2 whitespace-pre-line break-words text-gray-500">{transfer.description}</p>}
          </div>
          <ul className="mt-2 max-h-72 overflow-y-auto">
            {entries.map(entry => {
              const Icon = entry.folder ? FolderIcon : iconFor(entry.type)
              return (
                <li key={entry.key} className="flex items-center gap-3 py-2 pr-1 pl-2">
                  <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary-50 text-primary-600">
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0 grow">
                    <p className="truncate text-sm font-medium text-gray-900">{entry.name}</p>
                    <p className="text-xs text-gray-500">
                      {entry.folder && `${formatCount(entry.count, "file")} · `}{humanFileSize(entry.size, true, 1)}
                    </p>
                  </div>
                </li>
              )
            })}
            {unlistedCount > 0 && <li className="px-2 py-2 text-sm text-gray-500">and {formatCount(unlistedCount, "more file")}</li>}
          </ul>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-gray-100 px-2 pt-3 text-sm text-gray-500">
            <span>{formatCount(fileCount, "file")} · {humanFileSize(transfer.size, true, 1)}</span>
            {expiryDate && <span>Expires in {humanTimeUntil(expiryDate)}</span>}
          </div>
          <DownloadArea secretCode={secretCode} />
        </div>
      </div>
      {(!IS_SELFHOST && !brandProfile && !isCustomDomain) && (
        <>
          <Features1 />
          <TestimonialCloud />
          <FAQ />
          <Footer />
        </>
      )}
    </>
  )
}