"use client"
import { useLanguage } from "@/context/LanguageContext"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2, MinusIcon, PlusIcon } from "lucide-react"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { previewTeamSeatPurchase, updateTeamSeats } from "@/lib/client/Api"

function formatMoney(amount, currency, locale) {
  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: (currency || "usd").toUpperCase(),
  })
  return formatter.format((amount || 0) / 100)
}

export default function SeatManager({
  currentSeats,
  memberCount,
  pendingInvites,
  minSeats,
  maxSeats,
}) {
  const { t, locale } = useLanguage()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [target, setTarget] = useState(currentSeats)
  const [preview, setPreview] = useState(null)
  const [loadingPreview, setLoadingPreview] = useState(false)
  const [previewError, setPreviewError] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const occupied = memberCount + pendingInvites
  const floor = Math.max(minSeats || 1, occupied)
  const ceiling = maxSeats || 999
  const delta = target - currentSeats

  // Stripe preview only matters for increases - decreases just credit on the
  // next invoice, no immediate charge to show.
  useEffect(() => {
    if (!open) return
    setPreview(null)
    setPreviewError("")
    if (delta <= 0) return

    let cancelled = false
    setLoadingPreview(true)
    previewTeamSeatPurchase(delta)
      .then(res => { if (!cancelled) setPreview(res.preview) })
      .catch(err => { if (!cancelled) setPreviewError(err.message) })
      .finally(() => { if (!cancelled) setLoadingPreview(false) })
    return () => { cancelled = true }
  }, [open, delta])

  const handleOpenChange = (next) => {
    setOpen(next)
    if (!next) {
      setTarget(currentSeats)
      setError("")
      setPreview(null)
      setPreviewError("")
    }
  }

  const handleSave = async () => {
    if (delta === 0) {
      setOpen(false)
      return
    }
    setSaving(true)
    setError("")
    try {
      await updateTeamSeats(target)
      toast.success(
        delta > 0
          ? t("Added {0} {1}", { "0": delta, "1": delta === 1 ? "seat" : "seats" })
          : t("Reduced to {0} seats", { "0": target })
      )
      setOpen(false)
      router.refresh()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const canDecrement = target > floor
  const canIncrement = target < ceiling

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="secondary">{t("Manage seats")}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("Manage seats")}</DialogTitle>
          <DialogDescription>{t("Adjust how many paid seats your subscription covers.")}</DialogDescription>
        </DialogHeader>
        <div className="py-2 space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setTarget(entry => Math.max(entry - 1, floor))}
              disabled={!canDecrement || saving}
            >
              <MinusIcon size={16} />
            </Button>
            <div className="w-20 text-center text-3xl font-bold text-gray-900 tabular-nums">{target}</div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setTarget(entry => Math.min(entry + 1, ceiling))}
              disabled={!canIncrement || saving}
            >
              <PlusIcon size={16} />
            </Button>
          </div>

          <div className="text-center text-sm text-gray-500">
            {occupied} {occupied === 1 ? t("seat") : t("seats")} {t("in use")}{pendingInvites > 0 && t(" ({0} members + {1} pending)", { "0": memberCount, "1": pendingInvites })}
          </div>

          {delta > 0 && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm">
              {loadingPreview || !preview ? (
                <div className="flex items-center gap-2 text-gray-500">
                  <Loader2 className="animate-spin" size={16} /> {t("Calculating prorated cost...")}</div>
              ) : (
                <>
                  <div className="flex justify-between text-gray-600">
                    <span>{delta} {t("additional")} {delta === 1 ? t("seat") : t("seats")} ({preview.interval === "year" ? t("yearly") : t("monthly")})</span>
                    <span>{formatMoney(preview.unitAmount * delta, preview.currency, locale)}</span>
                  </div>
                  <div className="mt-2 flex justify-between font-semibold text-gray-900">
                    <span>{t("Due now (prorated)")}</span>
                    <span>{formatMoney(preview.amountDue, preview.currency, locale)}</span>
                  </div>
                </>
              )}
              {previewError && <p className="mt-2 text-xs text-red-500">{previewError}</p>}
            </div>
          )}

          {delta < 0 && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">{t("Removing")} {Math.abs(delta)} {Math.abs(delta) === 1 ? t("seat") : t("seats")}{t(". A prorated credit will be applied to your next invoice.")}</div>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={saving}>{t("Cancel")}</Button>
          <Button
            onClick={handleSave}
            disabled={saving || delta === 0 || (delta > 0 && (loadingPreview || !preview))}
          >
            {saving ? <><Loader2 className="animate-spin" size={16} /> {t("Saving...")}</> : (delta === 0 ? t("No change") : t("Confirm"))}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
