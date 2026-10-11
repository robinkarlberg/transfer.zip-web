
import { getTranslations } from "@/lib/server/language"
import dbConnect from "@/lib/server/mongoose/db"
import TeamInvite from "@/lib/server/mongoose/models/TeamInvite"
import Team from "@/lib/server/mongoose/models/Team"
import InviteAcceptForm from "./InviteAcceptForm"
import Image from "next/image"
import logo from "@/img/icon.png"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useServerAuth } from "@/lib/server/wrappers/auth"

export default async function InviteAcceptPage({ params }) {
  const t = await getTranslations()
  const { token } = await params

  if (!token || typeof token !== "string") {
    return (
      <InviteLayout title={t("Invalid invite")} message={t("This invite link is invalid or expired.")}>
        <div className="w-full flex justify-center -mb-6">
          <Button asChild>
            <Link href={"/"}>{t("Go back home")}</Link>
          </Button>
        </div>
      </InviteLayout>
    )
  }

  await dbConnect()

  const invite = await TeamInvite.findOne({ token: { $eq: token } })
  if (!invite) {
    return (
      <InviteLayout title={t("Invalid invite")} message={t("This invite link is invalid or expired.")}>
        <div className="w-full flex justify-center -mb-6">
          <Button asChild>
            <Link href={"/"}>{t("Go back home")}</Link>
          </Button>
        </div>
      </InviteLayout>
    )
  }

  const team = await Team.findById(invite.team)
  if (!team) {
    return (
      <InviteLayout title={t("Invalid invite")} message={t("This invite link is invalid or expired.")}>
        <div className="w-full flex justify-center -mb-6">
          <Button asChild>
            <Link href={"/"}>{t("Go back home")}</Link>
          </Button>
        </div>
      </InviteLayout>
    )
  }

  const auth = await useServerAuth()
  const currentUserEmail = auth?.user?.email || null
  const isLoggedInAsInvitee = currentUserEmail === invite.email

  return (
    <InviteLayout
      title={t("Join your team")}
      description={t("You've been invited to join {0}.", { "0": team.name })}
    >
      <InviteAcceptForm
        invite={invite.toJsonAsClient()}
        token={token}
        isLoggedInAsInvitee={isLoggedInAsInvitee}
        currentUserEmail={currentUserEmail}
      />
    </InviteLayout>
  )
}

async function InviteLayout({ title, description, message, children }) {
  const t = await getTranslations()
  return (
    <div className="flex min-h-[100vh] flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <Image
          alt="Transfer.zip"
          src={logo}
          className="mx-auto h-10 w-auto"
        />
        <h2 className="mt-10 text-center text-3xl/9 font-bold tracking-tight text-gray-900">
          {title}
        </h2>
        {description && (
          <p className="mt-2 text-center text-sm text-gray-600">{description}</p>
        )}
        {message && (
          <p className="mt-2 text-center text-sm text-gray-600">{message}</p>
        )}
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        {children}
        <p className="mt-10 text-center text-sm/6 text-gray-500">{t("Having trouble?")}{' '}
          <Link href="mailto:support@transfer.zip" className="font-semibold text-primary hover:text-primary-light">{t("Contact Us")}</Link>
        </p>
      </div>
    </div>
  )
}
