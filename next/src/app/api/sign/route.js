import dbConnect from "@/lib/server/mongoose/db"
import Transfer from "@/lib/server/mongoose/models/Transfer"
import { resp } from "@/lib/server/serverUtils"
import { workerSign } from "@/lib/server/workerApi"
import { useServerAuth } from "@/lib/server/wrappers/auth"
import { NextResponse } from "next/server"

// Signing token for auth to a transfer.zip node server
export async function POST(req) {
  await dbConnect()

  const { secretCode, scope } = await req.json()

  if (["upload", "download"].includes(scope)) {
    const transfer = await Transfer.findOne({ secretCode: { $eq: secretCode } }).populate("author transferRequest")
    if (!transfer) return NextResponse.json(resp("transfer not found"), { status: 404 })

    const basePayload = {
      tid: transfer._id.toString(),
      size: transfer.size,
      filesCount: transfer.files.length
    }

    if (scope == "upload") {
      // TODO: enforce auth for slightly better security (if someone sends the transfer before its uploaded??)
      // We use secretCode to upload, so we can assume the signing user is the same as the uploading user
      // if (!transfer.transferRequest) {
      //   const auth = await useServerAuth()
      //   if (auth) {
      //     if (transfer.author._id.toString() !== auth.user._id.toString()) {
      //       return NextResponse.json(resp("not authorized"), { status: 403 })
      //     }
      //   }
      //   else {
      //     return NextResponse.json(resp("not authenticated"), { status: 401 })
      //   }
      // }

      // const storage = await transfer.author.getStorage()

      // Let worker sign token, then return back to the user
      const { token } =
        await workerSign({
          ...basePayload,
          scope: "upload"
        }, "1d")

      return NextResponse.json(resp({ token }))
    }
    else if (scope == "download") {
      if (!transfer.finishedUploading) {
        return NextResponse.json(resp("Transfer has not finished uploading, so you can not download it yet."), { status: 409 })
      }

      // Let worker sign token, then return back to the user
      const { token } =
        await workerSign({
          ...basePayload,
          name: transfer.files.length == 1 ? transfer.files[0].name : `${transfer.name} - Transfer.zip`,
          scope: "download"
        }, "1m")

      return NextResponse.json(resp({ token, nodeUrl: transfer.nodeUrl }))
    }
  }
  else {
    return NextResponse.json(resp("No scope"), { status: 400 })
  }
}