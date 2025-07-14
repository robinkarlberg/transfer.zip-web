import TransferRequest from "@/lib/server/mongoose/models/TransferRequest";
import UploadArea from "./UploadArea";
import { notFound } from "next/navigation";
import dbConnect from "@/lib/server/mongoose/db";
import BrandHeader from "../../BrandHeader";
import Header from "@/components/Header";
import { IS_SELFHOST } from "@/lib/isSelfHosted";

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
        <div className={`bg-white backdrop-blur-sm rounded-2xl border shadow-xl w-full flex flex-col max-w-96`}>
          <div className="p-6">
            {/* <h1 className="text-3xl font-semibold tracking-tight text-gray-900 text-start mb-4">You got files!</h1> */}
            <h2 className="font-bold text-xl/8 text-gray-800">{transferRequest.name}</h2>
            <p className="text-gray-600">{transferRequest.description || "No description"}</p>
          </div>
          <hr className="my-2 mx-6" />
          <UploadArea />
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