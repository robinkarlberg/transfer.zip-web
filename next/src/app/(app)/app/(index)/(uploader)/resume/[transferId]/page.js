import Transfer from "@/lib/server/mongoose/models/Transfer";
import { useServerAuth } from "@/lib/server/wrappers/auth";
import { redirect } from "next/navigation";
import ResumeTransferFileUpload from "./ResumeTransferFileUpload";

export default async function ({ params }) {
  const { transferId } = await params

  if (
    typeof transferId !== 'string' ||
    !transferId.match(/^[a-f\d]{24}$/i)
  ) {
    return redirect("/app")
  }

  const { user } = await useServerAuth()
  const transfer = await Transfer.findOne({ author: user._id, _id: { $eq: transferId } })

  if (!transfer) {
    return redirect("/app")
  }

  if(transfer.finishedUploading) {
    return redirect(`/app/${transfer._id.toString()}`)
  }

  return (
    <div className="min-h-screen flex flex-col items-stretch bg-gray-50">
      <div className="">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-center mt-8 sm:mt-12 mb-8">Resume Transfer</h1>
        {/* <NewTransferFileUpload user={user.friendlyObj()} storage={storage} /> */}
        <ResumeTransferFileUpload transfer={transfer.friendlyObj()}/>
      </div>
    </div>
  )
}