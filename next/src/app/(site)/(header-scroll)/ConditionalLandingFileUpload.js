import NewTransferFileUploadNew from "@/components/newtransfer/NewTransferFileUploadNew"
import { listBrandProfilesForUser } from "@/lib/server/mongoose/helpers/brandProfiles"
import { useServerAuth } from "@/lib/server/wrappers/auth"

export default async function ConditionalLandingFileUpload({ text }) {
  const auth = await useServerAuth()

  if (!auth || auth.user.getPlan() === "free") {
    return <NewTransferFileUploadNew loaded={true} text={text} />
  }

  const [storage, brandProfilesDocs] = await Promise.all([
    auth.user.getStorage(),
    listBrandProfilesForUser(auth.user),
  ])

  const brandProfiles = brandProfilesDocs.map(profile => profile.toJsonAsClient())

  return (
    <NewTransferFileUploadNew
      loaded={true} text={text}
      user={auth.user.toJsonAsClient()}
      storage={storage}
      brandProfiles={brandProfiles}
    />
  )
}
