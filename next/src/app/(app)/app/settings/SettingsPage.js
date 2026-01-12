"use client"

import BIcon from "@/components/BIcon"
import QuestionCircle from "@/components/elements/QuestionCircle"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { API_URL, changeSubscription, changeSubscriptionPreview, logout, putUserSettings } from "@/lib/client/Api"
import pricing from "@/lib/pricing"
import { useRouter, useSearchParams } from "next/navigation"
import { useContext, useEffect, useState } from "react"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import Spinner from "@/components/elements/Spinner"
import { DashboardContext } from "@/context/DashboardContext"
import { humanTimeUntil, sleep } from "@/lib/utils"
import { IS_SELFHOST } from "@/lib/isSelfHosted"
import { User, UserIcon } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { humanFileSize } from "@/lib/transferUtils"

const parseDollar = cents => {
  const amount = Math.abs(cents / 100).toFixed(2)
  return `${cents < 0 ? '-' : ''}$${amount}`
}

function TierCard({ isCurrent, isTrial, planCancelling, planValidUntil, planInterval, tier, isUpgrade, onAction }) {
  const { id, name, priceInt, features } = tier
  return (
    <div className={`relative border-2 rounded-lg py-3 px-4 col-span-1 flex flex-col ${isCurrent ? "border-primary bg-primary-50" : "border-gray-200"}`}>
      {isCurrent && <p className="text-xs bg-primary-50 absolute -top-2 text-primary px-1 rounded-full font-bold uppercase">{isTrial || planCancelling ? <>{planCancelling ? "CANCELLING" : "FREE TRIAL"} - {humanTimeUntil(planValidUntil)} LEFT</> : "CURRENT PLAN"}</p>}
      <div>
        <div className="flex justify-between">
          <p className="font-bold">{name}</p>
          <p><span className="font-bold">${priceInt[planInterval == "month" ? "monthly" : "yearly"] * (planInterval == "month" ? 1 : 12)}</span><span className="font-medium text-gray-600">{planInterval == "month" ? "/mo" : "/year"}</span></p>
        </div>
        <ul className="text-sm mt-2 text-gray-700">
          {features.map((feature, i) => <li key={i}>{id == "pro" && <BIcon className={"text-primary me-2"} name={"check-lg"} />}{feature}</li>)}
        </ul>
      </div>
      <div className="mt-auto pt-8">
        {
          isCurrent ?
            <form method="POST" action={API_URL + "/stripe/create-customer-portal-session"}>
              <button className="text-sm bg-primary text-white px-3 py-1.5 rounded-md hover:bg-primary-light font-bold">Cancel Subscription &rarr;</button>
            </form>
            :
            <div>
              <button onClick={() => isUpgrade ? onAction("upgrade") : onAction("downgrade")} className="text-sm bg-white text-primary px-3 py-1.5 rounded-md hover:bg-primary-100 font-bold border border-primary">
                {isUpgrade ?
                  <>Upgrade &rarr;</>
                  :
                  <>Downgrade &rarr;</>
                }
              </button>
            </div>
        }
      </div>
    </div>
  )
}

export default function ({ user, storage }) {

  const { displayNotification } = useContext(DashboardContext)
  const searchParams = useSearchParams()
  const router = useRouter()

  const [showDowngrade, setShowDowngrade] = useState(false)

  const [showUpgrade, setShowUpgrade] = useState(false)
  const [newInvoice, setNewInvoice] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (searchParams.get("upgrade") !== null) {
      showUpgradePreview("pro")
      const params = new URLSearchParams(window.location.search)
      params.delete("upgrade")
      const newPath = window.location.pathname + (params.toString() ? `?${params}` : "")
      router.replace(newPath)
    }
  }, [])

  const showUpgradePreview = async tier => {
    setNewInvoice(null)
    setShowUpgrade(true)
    const { invoice } = await changeSubscriptionPreview(tier)
    setNewInvoice(invoice)
  }

  const confirmUpgrade = async tier => {
    try {
      setLoading(true)
      const res = await changeSubscription(tier)
      await sleep(1300)
      window.location.reload()
    }
    catch (err) {
      displayNotification("error", "Error", err?.message || err)
    }
    finally {
      setLoading(false)
    }
  }

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

  console.log(storage)
  return (
    <>
      <Dialog open={showUpgrade} onOpenChange={setShowUpgrade}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Upgrade</DialogTitle>
            {/* <DialogDescription>
              Upgrade your subscription to Pro to use advanced features and send bigger files.
            </DialogDescription> */}
          </DialogHeader>
          <div>
            {newInvoice ?
              <ul>
                {[...newInvoice.lines]
                  .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
                  .map((line, i) => (
                    <li key={i} className="flex justify-between mb-2">
                      <div>
                        <p className="text-gray-800 font-bold">{line.description}</p>
                        <p className="text-gray-600 text-sm">
                          {line.amount < 0 ? "Refunded amount for unused remaining time." : `Billed ${user.planInterval}ly, starting today.`}
                        </p>
                      </div>
                      <span className={`font-bold ${line.amount < 0 ? "text-green-600" : "text-gray-800"}`}>{parseDollar(line.amount)}</span>
                    </li>
                  ))}
                <hr className="my-2" />
                <li className="flex justify-between">
                  <span className="text-gray-800">Total</span>
                  <span className="font-bold text-gray-800">{parseDollar(newInvoice.total)}</span>
                </li>
              </ul>
              :
              <Spinner />
            }
            {/* {JSON.stringify(newInvoice || {})} */}
          </div>
          <DialogFooter className={"sm:justify-start"}>
            <Button onClick={() => confirmUpgrade("pro")} disabled={loading || !newInvoice}>Confirm {loading && <Spinner />}</Button>
            <DialogClose asChild>
              <Button variant={"outline"}>Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={showDowngrade} onOpenChange={setShowDowngrade}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Downgrade Subscription</DialogTitle>
            {/* <DialogDescription>
              Upgrade your subscription to Pro to use advanced features and send bigger files.
            </DialogDescription> */}
          </DialogHeader>
          <div>
            <p className="text-gray-600">
              Unfortunately, you cannot downgrade your subscription directly from the dashboard yet.
              Please contact us at <a className="text-primary hover:underline" href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL}`}>{process.env.NEXT_PUBLIC_SUPPORT_EMAIL}</a> to request a downgrade, and we will respond promply.
            </p>
          </div>
          <DialogFooter className={"sm:justify-start"}>
            <Button onClick={() => {
              window.location.href = `mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL}?subject=Downgrade%20Subscription`
            }}>Contact Us</Button>
            <DialogClose asChild>
              <Button variant={"outline"}>Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
              {/* <div className="flex items-center space-x-3">
              <Checkbox id="expiryWarnings" defaultChecked={notificationSettings.expiryWarnings} onCheckedChange={handleCheckedChange("expiryWarnings")} />
              <Label htmlFor="expiryWarnings" className="cursor-pointer">
                Expiry Warnings <QuestionCircle text={"Receive an email if a transfer is about to expire, but has not yet been downloaded."} />
              </Label>
            </div> */}
            </div>
          </div>
          <div className="sm:col-span-1">
            <h2 className="text-lg font-semibold text-gray-900 ">Storage</h2>
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
          {!IS_SELFHOST && (
            <div className="sm:col-span-full">
              <h2 className="text-lg font-semibold text-gray-900 ">Subscription</h2>
              <p className="mt-1 text-gray-600 text-sm/6">View and change your subscription details.</p>
              {/* {user.isTrial && (
              <div className="border-2 border-primary bg-primary-50 p-4 rounded-lg">
                <span className="font-bold">Free Trial</span>
              </div>
            )} */}
              <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
                {
                  pricing.tiers.map(tier => <TierCard key={tier.id} isTrial={user.isTrial} planCancelling={user.planCancelling} planValidUntil={user.planValidUntil} planInterval={user.planInterval} isCurrent={user.plan == tier.id} tier={tier} isUpgrade={user.plan != "pro" && tier.id == "pro"}
                    onAction={action => {
                      if (action == "upgrade") {
                        showUpgradePreview(tier.id)
                      }
                      else if (action == "downgrade") {
                        setShowDowngrade(true)
                      }
                    }}
                  />)
                }
              </div>
            </div>
          )}
        </div>
        <div className="mt-4 sm:col-span-full text-red-500 font-bold">
          <button className="text-sm" onClick={handleLogout}>&larr; Logout</button>
        </div>
      </div>
    </>
  )
}