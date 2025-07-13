import GenericPage from "@/components/dashboard/GenericPage"
import BrandProfile from "@/lib/server/mongoose/models/BrandProfile"
import { isValidObjectId } from "mongoose"
import { redirect } from "next/navigation"
import BrandProfileEditor from "../BrandProfileEditor"

export default async function ({ params }) {
  const { brandProfileId } = await params

  if (!isValidObjectId(brandProfileId)) {
    return redirect("/app/branding")
  }

  const profile = await BrandProfile.findById(brandProfileId)

  if (!profile) {
    return redirect("/app/branding")
  }

  return (
    <BrandProfileEditor initialProfile={profile.friendlyObj()} isNew={false}/>
  )
}