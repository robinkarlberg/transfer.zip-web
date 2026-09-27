import GenericPage from "@/components/dashboard/GenericPage"
import TransferPage from "@/components/dashboard/TransferPage"
import { listBrandProfilesForUser } from "@/lib/server/mongoose/helpers/brandProfiles"
import Transfer from "@/lib/server/mongoose/models/Transfer"
import { useServerAuth } from "@/lib/server/wrappers/auth"
import { isValidObjectId } from "mongoose"
import { redirect } from "next/navigation"

export default async function ({ params }) {
  const auth = await useServerAuth()

  const { transferIdSlug } = await params

  let selectedTransfer
  if (transferIdSlug && transferIdSlug.length > 0) {
    if (!isValidObjectId(transferIdSlug)) {
      return redirect("/app")
    }
    selectedTransfer = await Transfer.findOne({ author: auth.user._id, _id: transferIdSlug }).populate("brandProfile")

    if (!selectedTransfer) {
      return redirect("/app")
    }
  }

  const brandProfiles = await listBrandProfilesForUser(auth.user)

  return (
    <TransferPage
      user={auth.user.toJsonAsClient()}
      transfer={await selectedTransfer.toJsonAsOwner()}
      brandProfiles={brandProfiles.map(profile => profile.toJsonAsClient())}
    />
  )
}