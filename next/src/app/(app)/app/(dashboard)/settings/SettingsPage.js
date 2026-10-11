"use client"
import { useLanguage } from "@/context/LanguageContext"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import BIcon from "@/components/BIcon"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { API_URL, logout, putUserSettings } from "@/lib/client/Api"
import pricing, { getPlanById, FREE_PLAN, PLANS } from "@/lib/pricing"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { IS_SELFHOST } from "@/lib/isSelfHosted"
import { ArrowLeftIcon, UserIcon } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { humanFileSize } from "@/lib/transferUtils"
import { humanTimeUntil } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ROLES } from "@/lib/roles"
import ProfilePic from "@/components/ProfilePic"
import { useState } from "react"
import { toast } from "sonner"
import PrivacyDataSection from "./PrivacyDataSection"
import TeamSection from "./TeamSection"

function CurrentPlanCard({ plan, isTrial, planCancelling, planValidUntil }) {
  const { t, language, landingText , locale } = useLanguage()
  const tier = getPlanById(plan) || FREE_PLAN
  const { name } = tier
  const { displayFeatures } = landingText.plans?.[plan] || tier

  const timeLeft = planValidUntil ? humanTimeUntil(planValidUntil, language) : null
  const statusLabel = planCancelling
    ? `${t("Cancelling")}${timeLeft ? ` - ${t("{time} left", { time: timeLeft })}` : ""}`
    : (isTrial ? `${t("Trial")}${timeLeft ? ` - ${t("{time} left", { time: timeLeft })}` : ""}` : t("Active"))
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
        <Button variant="secondary" className={"w-full sm:w-fit"}>{t("Cancel or Manage Billing")}</Button>
      </form>
      <hr className="my-4" />
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div>
          <p className="font-medium text-gray-900">{t("Looking for more?")}</p>
          {name == PLANS.teams.name ?
            <p className="text-sm text-gray-500">{t("Switch plans to share bigger transfers with your team")}</p>
            : <p className="text-sm text-gray-500">{t("Switch plans to share bigger ideas with more features")}</p>
          }
        </div>
        <Button asChild>
          <Link
            href={language === "sv" ? "/sv#pricing" : "/pricing"}
            className="w-full sm:w-fit"
          >{t("Compare all plans")}</Link>
        </Button>
      </div>
    </div>
  )
}

export default function ({ user, storage, team }) {
  const { t, language, landingText } = useLanguage()

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

  const [savingLanguage, setSavingLanguage] = useState(false)
  const changeLanguage = async nextLanguage => {
    setSavingLanguage(true)
    try {
      await putUserSettings({ language: nextLanguage })
      router.refresh()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSavingLanguage(false)
    }
  }

  const [editingName, setEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState(user.fullName || "")
  const [savingName, setSavingName] = useState(false)

  const handleSaveName = async () => {
    const trimmed = nameDraft.trim()
    if (trimmed === (user.fullName || "")) {
      setEditingName(false)
      return
    }
    setSavingName(true)
    try {
      await putUserSettings({ fullName: trimmed })
      toast.success(trimmed ? t("Name updated") : t("Name cleared"))
      setEditingName(false)
      router.refresh()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSavingName(false)
    }
  }

  const { notificationSettings } = user

  return (
    <div className="space-y-4">
    <div className="p-5 sm:p-6 bg-white rounded-xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        <div className="sm:col-span-full flex gap-4">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <ProfilePic size={48} name={user.fullName || user.email} />
            <div className="flex flex-col justify-center min-w-0 flex-1">
              {editingName ? (
                <div className="flex items-center gap-2">
                  <Input
                    autoFocus
                    value={nameDraft}
                    onChange={e => setNameDraft(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter") handleSaveName()
                      if (e.key === "Escape") {
                        setNameDraft(user.fullName || "")
                        setEditingName(false)
                      }
                    }}
                    placeholder={t("Your name")}
                    maxLength={80}
                    disabled={savingName}
                    className="max-w-xs"
                  />
                  <Button size="sm" onClick={handleSaveName} disabled={savingName}>{t("Save")}</Button>
                  <Button size="sm" variant="ghost" onClick={() => {
                    setNameDraft(user.fullName || "")
                    setEditingName(false)
                  }} disabled={savingName}>{t("Cancel")}</Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <p className="text-gray-800 text-lg font-semibold truncate">
                      {user.fullName || user.email}
                    </p>
                    <button
                      type="button"
                      onClick={() => setEditingName(true)}
                      className="text-sm text-primary hover:underline"
                    >
                      {user.fullName ? t("Edit") : t("Add name")}
                    </button>
                  </div>
                  {user.fullName && <span className="text-gray-600 text-sm truncate">{user.email}</span>}
                </>
              )}
            </div>
          </div>
        </div>
        <div className="sm:col-span-1">
          <h2 className="text-lg font-semibold text-gray-900 ">{t("Notifications")}</h2>
          <div className="space-y-4 mt-4">
            <div className="flex items-center space-x-3">
              <Checkbox id="transferDownloaded" defaultChecked={notificationSettings.transferDownloaded} onCheckedChange={handleCheckedChange("transferDownloaded")} />
              <Label htmlFor="transferDownloaded" className="cursor-pointer">{t("User Downloaded your Files")}</Label>
            </div>
            <div className="flex items-center space-x-3">
              <Checkbox id="transferReceived" defaultChecked={notificationSettings.transferReceived} onCheckedChange={handleCheckedChange("transferReceived")} />
              <Label htmlFor="transferReceived" className="cursor-pointer">{t("Files Received from Transfer Request")}</Label>
            </div>
          </div>
        </div>
        <div className="sm:col-span-1">
          <h2 className="text-lg font-semibold text-gray-900">{t("Storage")}</h2>
          {storage && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">{storage.storagePercent}{t("% used")}</span>
                <span className="text-sm text-gray-600">
                  {humanFileSize(storage.usedStorageBytes, true)} / {humanFileSize(storage.maxStorageBytes, true)}
                </span>
              </div>
              <Progress className="h-2" value={storage.storagePercent} />
            </div>
          )}
        </div>
        <div>
          <Label htmlFor="account-language">{t("Language")}</Label>
          <div className="mt-3 max-w-xs">
            <Select value={language} onValueChange={changeLanguage} disabled={savingLanguage}>
              <SelectTrigger id="account-language"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="sv">Svenska</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
      <div className="mt-4 sm:col-span-full text-primary font-bold">
        <button className="text-sm inline-flex items-center gap-1" onClick={handleLogout}>
          <ArrowLeftIcon className="w-4 h-4" />{t("Log out of my account")}</button>
      </div>
    </div>
    {user.hasTeam && user.role !== ROLES.OWNER && team && (
      <TeamSection team={team} role={user.role} />
    )}
    <PrivacyDataSection user={user} />
    </div>
  )
}
