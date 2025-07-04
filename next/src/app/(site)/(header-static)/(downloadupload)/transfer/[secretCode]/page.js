import Transfer from "@/lib/server/mongoose/models/Transfer";
import DownloadArea from "./DownloadArea";
import { notFound } from "next/navigation";
import dbConnect from "@/lib/server/mongoose/db";
import { humanFileSize } from "@/lib/transferUtils";
import { humanTimeUntil, parseTransferExpiryDate } from "@/lib/utils";

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

  const transfer = await Transfer.findOne({ secretCode: { $eq: secretCode } })

  if (!transfer) {
    notFound()
  }

  const expiryDate = parseTransferExpiryDate(transfer.expiresAt)

  return (
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
  )
}