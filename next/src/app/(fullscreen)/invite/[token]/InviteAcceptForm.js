"use client"
import { useLanguage } from "@/context/LanguageContext"

import { useState } from "react"
import Spinner from "@/components/elements/Spinner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { redeemInvite } from "@/lib/client/Api"

export default function InviteAcceptForm({ invite, token, isLoggedInAsInvitee, currentUserEmail }) {
  const { t } = useLanguage()
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [fullName, setFullName] = useState("")

  const handleAccept = async (e) => {
    if (e) e.preventDefault()
    setMessage("")
    setLoading(true)
    try {
      await redeemInvite(token, fullName)
      window.location.href = "/app"
    } catch (err) {
      setMessage(err.message)
      setLoading(false)
    }
  }

  if (isLoggedInAsInvitee) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-gray-700">{t("Signed in as")} <span className="font-medium">{invite.email}</span>{t(". Click below to join the team.")}</p>
        {message && <span className="text-red-600 text-sm block">{message}</span>}
        <Button onClick={() => handleAccept()} disabled={loading} className="w-full">
          {loading && <Spinner className="me-2" />} {t("Accept invite")}</Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleAccept} className="space-y-5">
      <div className="grid gap-2">
        <Label htmlFor="invite-email">{t("Email")}</Label>
        <Input
          id="invite-email"
          type="email"
          value={invite.email}
          disabled
          className="bg-gray-50 text-gray-500"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="invite-name">{t("Full name")} <span className="text-gray-400 font-normal">{t("(optional)")}</span>
        </Label>
        <Input
          id="invite-name"
          type="text"
          autoComplete="name"
          placeholder={t("Jane Doe")}
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          maxLength={80}
        />
      </div>

      <p className="text-xs text-gray-500">{t("No password needed. Next time, sign in by clicking a link we email to")}{" "}
        <span className="font-medium">{invite.email}</span>.
      </p>

      {currentUserEmail && currentUserEmail !== invite.email && (
        <p className="text-xs text-gray-500">{t("You're currently signed in as")} {currentUserEmail}{t(". Accepting will sign you in as")} {invite.email} {t("on this device.")}</p>
      )}

      {message && <p className="text-red-600 text-sm">{message}</p>}

      <Button type="submit" disabled={loading} className="w-full">
        {loading && <Spinner className="me-2" />} {t("Accept invite")}</Button>
    </form>
  )
}
