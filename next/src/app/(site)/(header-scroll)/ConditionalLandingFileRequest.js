import NewTransferFileRequest from "@/components/newtransfer/NewTransferFileRequest"
import { listBrandProfilesForUser } from "@/lib/server/mongoose/helpers/brandProfiles"
import { useServerAuth } from "@/lib/server/wrappers/auth"

export default async function ConditionalLandingFileRequest({ text, homeHref }) {
  const auth = await useServerAuth()

  if (!auth || auth.user.getPlan() === "free") {
    return <NewTransferFileRequest loaded={true} text={text} homeHref={homeHref} />
  }

  const [storage, brandProfilesDocs] = await Promise.all([
    auth.user.getStorage(),
    listBrandProfilesForUser(auth.user),
  ])

  const brandProfiles = brandProfilesDocs.map(profile => profile.toJsonAsClient())

  return (
    <NewTransferFileRequest
      loaded={true}
      text={text}
      homeHref={homeHref}
      user={auth.user.toJsonAsClient()}
      storage={storage}
      brandProfiles={brandProfiles}
    />
  )
}
