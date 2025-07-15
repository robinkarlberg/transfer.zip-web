import GenericPage from "@/components/dashboard/GenericPage"
import BrandProfile from "@/lib/server/mongoose/models/BrandProfile"
import { isValidObjectId } from "mongoose"
import { redirect } from "next/navigation"
import BrandProfileEditor from "../BrandProfileEditor"

export default async function () {
  const brandProfile = new BrandProfile()

  return (
    <BrandProfileEditor isNew={true} initialProfile={brandProfile.friendlyObj()}/>
  )
}