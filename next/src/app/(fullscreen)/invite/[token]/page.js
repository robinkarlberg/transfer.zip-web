import dbConnect from "@/lib/server/mongoose/db"
import TeamInvite from "@/lib/server/mongoose/models/TeamInvite"
import Team from "@/lib/server/mongoose/models/Team"
import InviteAcceptForm from "./InviteAcceptForm"
import Image from "next/image"
import logo from "@/img/icon.png"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function InviteAcceptPage({ params }) {
  const { token } = await params

  if (!token || typeof token !== "string") {
    return (
      <InviteLayout title="Invalid invite" message="This invite link is invalid or expired.">
        <div className="w-full flex justify-center -mb-6">
          <Button asChild>
            <Link href={"/"}>Go back home</Link>
          </Button>
        </div>
      </InviteLayout>
    )
  }

  await dbConnect()

  const invite = await TeamInvite.findOne({ token: { $eq: token } })
  if (!invite) {
    return (
      <InviteLayout title="Invalid invite" message="This invite link is invalid or expired.">
        <div className="w-full flex justify-center -mb-6">
          <Button asChild>
            <Link href={"/"}>Go back home</Link>
          </Button>
        </div>
      </InviteLayout>
    )
  }

  const team = await Team.findById(invite.team)
  if (!team) {
    return (
      <InviteLayout title="Invalid invite" message="This invite link is invalid or expired.">
        <div className="w-full flex justify-center -mb-6">
          <Button asChild>
            <Link href={"/"}>Go back home</Link>
          </Button>
        </div>
      </InviteLayout>
    )
  }

  return (
    <InviteLayout
      title="Join your team"
      description={`You've been invited to join ${team.name}.`}
    >
      <InviteAcceptForm invite={invite.friendlyObj()} token={token} />
    </InviteLayout>
  )
}

function InviteLayout({ title, description, message, children }) {
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
        <p className="mt-10 text-center text-sm/6 text-gray-500">
          Having trouble?{' '}
          <Link href="mailto:support@transfer.zip" className="font-semibold text-primary hover:text-primary-light">
            Contact Us
          </Link>
        </p>
      </div>
    </div>
  )
}
