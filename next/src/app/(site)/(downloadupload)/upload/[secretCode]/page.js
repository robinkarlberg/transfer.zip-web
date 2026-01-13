import FAQ from "@/components/FAQ";
import Features1 from "@/components/Features1";
import Header from "@/components/Header";
import IndieStatement from "@/components/IndieStatement";
import NewTransferFileUploadForRequest from "@/components/newtransfer/NewTransferFileUploadForRequest";
import TestimonialCloud from "@/components/TestimonialCloud";
import { IS_SELFHOST } from "@/lib/isSelfHosted";
import dbConnect from "@/lib/server/mongoose/db";
import TransferRequest from "@/lib/server/mongoose/models/TransferRequest";
import Image from "next/image";
import { notFound } from "next/navigation";
import BrandHeader from "../../BrandHeader";

export default async function ({ params }) {
  const { secretCode } = await params

  await dbConnect()

  const transferRequest = await TransferRequest.findOne({ secretCode: { $eq: secretCode } }).populate("brandProfile")

  if (!transferRequest) {
    notFound()
  }

  let { brandProfile } = transferRequest

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
        <NewTransferFileUploadForRequest brandProfile={brandProfile?.friendlyObj()} transferRequest={transferRequest.friendlyObj()} />
      </div>
      {(!IS_SELFHOST && !brandProfile) && (
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