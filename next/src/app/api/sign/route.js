import { getFilesListForHashing, getFilesListHash } from "@/lib/server/filesListHash"
import { getPrivateKey } from "@/lib/server/keyManager"
import dbConnect from "@/lib/server/mongoose/db"
import Transfer from "@/lib/server/mongoose/models/Transfer"
import TransferRequest from "@/lib/server/mongoose/models/TransferRequest"
import { resp } from "@/lib/server/serverUtils"
import { useServerAuth } from "@/lib/server/wrappers/auth"
import { SignJWT } from "jose"
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
      if (!transfer.transferRequest) {
        const auth = await useServerAuth()
        if (auth) {
          if (transfer.author._id.toString() !== auth.user._id.toString()) {
            return NextResponse.json(resp("not authorized"), { status: 403 })
          }
        }
        else {
          return NextResponse.json(resp("not authenticated"), { status: 401 })
        }
      }

      // const storage = await transfer.author.getStorage()

      const token = await new SignJWT({
        // sub: transfer.author._id.toString(),
        ...basePayload,
        scope: "upload"
      })
        .setProtectedHeader({ alg: "RS256" })
        .setAudience("transfer.zip")
        .setExpirationTime("1d")
        .sign(await getPrivateKey())

      return NextResponse.json(resp({ token }))
    }
    else if (scope == "download") {
      if (!transfer.finishedUploading) {
        return NextResponse.json(resp("Transfer has not finished uploading, so you can not download it yet."), { status: 409 })
      }

      const token = await new SignJWT({
        ...basePayload,
        name: transfer.files.length == 1 ? transfer.files[0].name : `${transfer.name} - Transfer.zip`,
        scope: "download"
      })
        .setProtectedHeader({ alg: "RS256" })
        .setAudience("transfer.zip")
        .setExpirationTime("1m")
        .sign(await getPrivateKey())

      return NextResponse.json(resp({ token, nodeUrl: transfer.nodeUrl }))
    }
  }
  else {
    return NextResponse.json(resp("No scope"), { status: 400 })
  }
}