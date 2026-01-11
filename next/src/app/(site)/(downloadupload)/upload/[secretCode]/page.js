import TransferRequest from "@/lib/server/mongoose/models/TransferRequest";
import UploadArea from "./UploadArea";
import { notFound } from "next/navigation";
import dbConnect from "@/lib/server/mongoose/db";
import BrandHeader from "../../BrandHeader";
import Header from "@/components/Header";
import { IS_SELFHOST } from "@/lib/isSelfHosted";
import Features1 from "@/components/Features1";
import TestimonialCloud from "@/components/TestimonialCloud";
import FAQ from "@/components/FAQ";
import Image from "next/image";
import NewTransferFileUploadForRequest from "@/components/newtransfer/NewTransferFileUploadForRequest";

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
        <NewTransferFileUploadForRequest brandProfile={brandProfile.friendlyObj()} transferRequest={transferRequest.friendlyObj()} />
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