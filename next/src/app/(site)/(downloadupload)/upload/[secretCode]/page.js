import FAQ from "@/components/FAQ";
import Features1 from "@/components/Features1";
import Header from "@/components/Header";
import IndieStatement from "@/components/IndieStatement";
import NewTransferFileUploadForRequest from "@/components/newtransfer/NewTransferFileUploadForRequest";
import TestimonialCloud from "@/components/TestimonialCloud";
import { IS_SELFHOST } from "@/lib/isSelfHosted";
import { isCustomDomainHost } from "@/lib/hostUtils";
import dbConnect from "@/lib/server/mongoose/db";
import TransferRequest from "@/lib/server/mongoose/models/TransferRequest";
import { headers } from "next/headers";
import Image from "next/image";
import { notFound } from "next/navigation";
import BrandHeader from "../../BrandHeader";
import clouds from "@/img/download-clouds.png";

export async function generateMetadata({ params }) {
  const { secretCode } = await params

  await dbConnect()

  const transferRequest = await TransferRequest.findOne({ secretCode: { $eq: secretCode } }).populate("brandProfile")
  if (!transferRequest) {
    return undefined
  }

  const { brandProfile } = transferRequest
  const brandName = brandProfile?.name || "Transfer.zip"
  const title = "Upload files | " + brandName
  const description = "You have a file request waiting."
  const ogImage = brandProfile?.backgroundUrl || "https://cdn.transfer.zip/og.png"

  return {
    title: title,
    description,
    openGraph: {
      title: title,
      description,
      images: [ogImage],
    },
  };
}

export default async function ({ params }) {
  const { secretCode } = await params

  await dbConnect()

  const transferRequest = await TransferRequest.findOne({ secretCode: { $eq: secretCode } }).populate("brandProfile")

  if (!transferRequest) {
    notFound()
  }

  let { brandProfile } = transferRequest

  const headersList = await headers()
  const isCustomDomain = isCustomDomainHost(headersList.get("host"))

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
            <div className="absolute inset-x-0 top-0 h-[115%] sm:h-[135%]">
              <Image fill priority alt="" src={clouds} className="object-cover object-bottom" />
            </div>
            <div className="absolute inset-x-0 bottom-0 h-1/5 bg-linear-to-b from-transparent to-white" />
          </div>
        )}
        {transferRequest.active ? (
          <NewTransferFileUploadForRequest brandProfile={brandProfile?.toJsonAsClient()} transferRequest={await transferRequest.toJsonAsUploader()} />
        ) : (
          <div className="relative mx-4 max-w-md rounded-xl bg-white p-5 sm:p-6">
            <h1 className="text-xl font-semibold text-gray-900">This file request is closed</h1>
            <p className="mt-2 text-gray-600">Contact the person who requested your files to reopen it.</p>
          </div>
        )}
      </div>
      {(!IS_SELFHOST && !brandProfile && !isCustomDomain) && (
        <>
          <Features1 />
          <TestimonialCloud />
          {/* <div className="relative">
            <div className="w-full h-screen overflow-hidden absolute grain bg-linear-to-b from-primary-600 to-primary-300" />
            <div className="py-24 px-2 sm:px-8 relative">
              <p className="text-center mt-2 text-pretty text-3xl font-bold tracking-tight text-white sm:text-3xl lg:text-balance text-shadow-md">
                A quick message from the founder.
              </p>
              <IndieStatement compact />
            </div>
          </div> */}
          <FAQ />
        </>
      )}
    </>
  )
}
