"use client"

import BIcon from "@/components/BIcon"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { API_URL, logout, putUserSettings } from "@/lib/client/Api"
import pricing, { getPlanById, FREE_PLAN } from "@/lib/pricing"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { IS_SELFHOST } from "@/lib/isSelfHosted"
import { UserIcon } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { humanFileSize } from "@/lib/transferUtils"
import { humanTimeUntil } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ROLES } from "@/lib/roles"

function CurrentPlanCard({ plan, isTrial, planCancelling, planValidUntil }) {
  const tier = getPlanById(plan) || FREE_PLAN
  const { name, displayFeatures } = tier

  const timeLeft = planValidUntil ? humanTimeUntil(planValidUntil) : null
  const statusLabel = planCancelling
    ? `Cancelling${timeLeft ? ` - ${timeLeft} left` : ""}`
    : (isTrial ? `Trial${timeLeft ? ` - ${timeLeft} left` : ""}` : "Active")
  const statusColor = planCancelling ? "bg-amber-100 text-amber-700" : "bg-primary-100 text-primary-700"

  return (
    <div className="border rounded-xl p-5">
      <div className="flex items-center gap-2">
        <span className="font-bold text-lg">{name}</span>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor}`}>
          {statusLabel}
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
          <p className="font-medium text-gray-900">Looking for more?</p>
          <p className="text-sm text-gray-500">Switch plans to share bigger transfers with your team</p>
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

export default function ({ user, storage, team }) {

  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    window.location.href = "/"
  }

  const handleCheckedChange = field => async e => {
    await putUserSettings({
      notificationSettings: {
        [field]: e
      }
    })
    router.refresh()
  }

  const { notificationSettings } = user

  return (
    <div className="p-5 sm:p-6 bg-white rounded-xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        <div className="sm:col-span-full">
          <div className="flex items-center gap-4">
            <UserIcon size={48} className="text-white bg-primary p-3 rounded-full" />
            <span className="text-gray-800 text-lg font-semibold">{user.email}</span>
          </div>
          {!IS_SELFHOST && (
            <p className="text-gray-600 text-sm/6 mt-4">
              To change your email or delete your account, <a className="text-primary" href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL}`}>contact us</a>.
            </p>
          )}
        </div>
        <div className="sm:col-span-1">
          <h2 className="text-lg font-semibold text-gray-900 ">Notifications</h2>
          <div className="space-y-4 mt-4">
            <div className="flex items-center space-x-3">
              <Checkbox id="transferDownloaded" defaultChecked={notificationSettings.transferDownloaded} onCheckedChange={handleCheckedChange("transferDownloaded")} />
              <Label htmlFor="transferDownloaded" className="cursor-pointer">
                User Downloaded your Files
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <Checkbox id="transferReceived" defaultChecked={notificationSettings.transferReceived} onCheckedChange={handleCheckedChange("transferReceived")} />
              <Label htmlFor="transferReceived" className="cursor-pointer">
                Files Received from Transfer Request
              </Label>
            </div>
          </div>
        </div>
        <div className="sm:col-span-1">
          <h2 className="text-lg font-semibold text-gray-900">Storage</h2>
          {storage && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">{storage.storagePercent}% used</span>
                <span className="text-sm text-gray-600">
                  {humanFileSize(storage.usedStorageBytes, true)} / {humanFileSize(storage.maxStorageBytes, true)}
                </span>
              </div>
              <Progress className="h-2" value={storage.storagePercent} />
            </div>
          )}
        </div>
        {!IS_SELFHOST && !user.hasTeam && (
          <div className="sm:col-span-full">
            {/* <h2 className="text-lg font-semibold text-gray-900">Subscription</h2> */}
            <div className="">
              <CurrentPlanCard
                plan={user.plan}
                isTrial={user.isTrial}
                planCancelling={user.planCancelling}
                planValidUntil={user.planValidUntil}
              />
            </div>
          </div>
        )}
      </div>
      <div className="mt-4 sm:col-span-full text-red-500 font-bold">
        <button className="text-sm" onClick={handleLogout}>&larr; Logout</button>
      </div>
    </div>
  )
}
