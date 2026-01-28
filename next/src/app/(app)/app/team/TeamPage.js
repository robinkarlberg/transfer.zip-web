import BIcon from "@/components/BIcon"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { API_URL } from "@/lib/client/Api"
import { IS_SELFHOST } from "@/lib/isSelfHosted"
import pricing from "@/lib/pricing"
import { ROLES } from "@/lib/roles"
import { humanTimeUntil } from "@/lib/utils"
import { UserIcon } from "lucide-react"
import Link from "next/link"
import UserList from "./UserList"

function CurrentTeamPlanCard({ team }) {
  const tier = pricing.teamTier
  const { name, displayFeatures } = tier
  const { seats, planCancelling, planValidUntil } = team

  const timeLeft = planValidUntil ? humanTimeUntil(planValidUntil) : null
  const statusLabel = planCancelling
    ? `Cancelling${timeLeft ? ` - ${timeLeft} left` : ""}`
    : "Active"
  const statusColor = planCancelling ? "bg-amber-100 text-amber-700" : "bg-primary-100 text-primary-700"

  return (
    <div className="border rounded-lg p-5">
      <div className="flex items-center gap-2">
        <span className="font-bold text-lg">{name}</span>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor}`}>
          {statusLabel}
        </span>
        <span className="inline-flex items-center text-xs text-gray-500 ml-auto">
          <BIcon name="people-fill" className="me-1" />
          {seats} seats
        </span>
      </div>
      <ul className="mt-4 space-y-2 text-sm text-gray-700 sm:grid grid-cols-2">
        {displayFeatures.map((feature, i) => (
          <li key={i} className="flex items-start gap-2">
            <BIcon className="text-gray-400 mt-0.5" name="check" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <form method="POST" className="mt-4 flex flex-row-reverse" action={API_URL + "/stripe/create-customer-portal-session"}>
        <Button variant="secondary" className={"w-full sm:w-fit"}>Cancel or Manage Billing</Button>
      </form>
      <hr className="my-4" />
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div>
          <p className="font-medium text-gray-900">Need to make changes?</p>
          <p className="text-sm text-gray-500">Manage your team subscription and billing</p>
        </div>
        <Button asChild>
          <Link
            href="/pricing"
            className="w-full sm:w-fit"
          >
            Compare all plans
          </Link>
        </Button>
      </div>
    </div>
  )
}

export default function ({ user, team, children }) {
  return (
    <div className="p-5 sm:p-6 bg-white rounded-xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        {/* <div className="sm:col-span-full">
          <div className="flex items-center gap-4">
            <UserIcon size={48} className="text-white bg-primary p-3 rounded-full" />
            <span className="text-gray-800 text-lg font-semibold">{user.email}</span>
          </div>
          {!IS_SELFHOST && (
            <p className="text-gray-600 text-sm/6 mt-4">
              To change your email or delete your account, <a className="text-primary" href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL}`}>contact us</a>.
            </p>
          )}
        </div> */}
        {!IS_SELFHOST && user.role === ROLES.OWNER && (
          <div className="sm:col-span-full">
            {/* <h2 className="text-lg font-semibold text-gray-900">Subscription</h2> */}
            <div className="">
              <CurrentTeamPlanCard team={team} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}