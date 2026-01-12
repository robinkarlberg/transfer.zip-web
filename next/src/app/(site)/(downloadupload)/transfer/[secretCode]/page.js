import Transfer from "@/lib/server/mongoose/models/Transfer";
import DownloadArea from "./DownloadArea";
import { notFound } from "next/navigation";
import dbConnect from "@/lib/server/mongoose/db";
import { humanFileSize } from "@/lib/transferUtils";
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

export async function generateMetadata({ params }) {
  const { secretCode } = await params

  await dbConnect()

  const transfer = await Transfer.findOne({ secretCode: { $eq: secretCode } })
  if (!transfer) {
    return undefined
  }

  const title = "Download " + transfer.files.length + " files" + " | Transfer.zip"
  const description = "Someone sent you files."

  return {
    title: title,
    description,
    openGraph: {
      title: title,
      description,
      images: ["https://cdn.transfer.zip/og.png"],
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

  if (!transfer?.author || !auth || auth.user._id.toString() !== transfer.author._id.toString()) {
    const headersList = await headers()
    const userAgent = headersList.get("user-agent") || ""
    if (!isBot(userAgent)) {
      transfer.logView()
      await transfer.save()
    }
  }

  const expiryDate = parseTransferExpiryDate(transfer.expiresAt)

  let { brandProfile } = transfer

  return (
    <>
      <div className="grid min-h-[100vh] place-items-center ">
        {brandProfile ? <BrandHeader brandProfile={brandProfile} /> : <Header />}
        {brandProfile && brandProfile.backgroundUrl && (
          <Image
            fill
            alt="Branding Background Image"
            className="object-center object-cover pointer-events-none"
            src={brandProfile.backgroundUrl}
          />
        )}
        <div className="bg-white backdrop-blur-sm rounded-2xl border p-6 shadow-xl w-full max-w-80 min-h-96 flex flex-col justify-between">
          <div>
            {/* <h1 className="text-3xl font-semibold tracking-tight text-gray-900 text-start mb-4">You got files!</h1> */}
            <h2 className="font-bold text-xl/8 text-gray-800">{transfer.name}</h2>
            <p className="text-gray-600">{transfer.description || "No description"}</p>
            <hr className="my-2" />
            {transfer.files.length > 0 &&
              <span><i className="bi bi-file-earmark me-1"></i>{transfer.files.length} File{transfer.files.length > 1 ? "s" : ""}</span>
            }
            <p className="text-gray-600">{humanFileSize(transfer.size, true)}</p>
          </div>
          <div>
            <div className="mt-auto text-center">
              {expiryDate && <p className="text-gray-600 mb-1 text-sm">Expires in {humanTimeUntil(expiryDate)}</p>}
            </div>
            <DownloadArea secretCode={secretCode} />
          </div>
        </div>
      </div>
      {(!IS_SELFHOST && !brandProfile) && (
        <>
          <Features1 />
          <TestimonialCloud />
          <FAQ />
        </>
      )}
    </>
  )
}