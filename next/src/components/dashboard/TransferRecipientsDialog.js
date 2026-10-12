"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowDownToLineIcon, EyeIcon, MailIcon } from "lucide-react"
import { useLanguage } from "@/context/LanguageContext"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

function Activity({ icon: Icon, time, label, pending, locale }) {
  return (
    <div className="flex items-start gap-2">
      <Icon aria-hidden="true" size={16} className={`mt-0.5 shrink-0 ${time ? "text-primary-600" : "text-gray-400"}`} />
      <div className="min-w-0">
        <p className={time ? "font-medium text-gray-900" : "text-gray-500"}>{time ? label : pending}</p>
        {time && <time dateTime={new Date(time).toISOString()} className="mt-0.5 block text-xs text-gray-500">
          {new Date(time).toLocaleString(locale, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
        </time>}
      </div>
    </div>
  )
}

export default function TransferRecipientsDialog({ open, onOpenChange, onForward, recipients }) {
  const { t, locale } = useLanguage()
  const router = useRouter()
  const viewed = recipients.filter(entry => entry.viewedAt).length
  const downloaded = recipients.filter(entry => entry.downloadedAt).length

  useEffect(() => {
    if (open) router.refresh()
  }, [open, router])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader icon={<MailIcon />}>
          <DialogTitle>{t("Recipients")}</DialogTitle>
          <DialogDescription>{t("{viewed} of {total} viewed · {downloaded} downloaded", { viewed, total: recipients.length, downloaded })}</DialogDescription>
        </DialogHeader>
        <ul className="max-h-72 divide-y divide-gray-100 overflow-y-auto text-sm">
          {recipients.map((entry, index) => (
            <li key={index} className="py-4 first:pt-0 last:pb-0">
              <p className="break-all font-medium text-gray-900">{entry.email}</p>
              <p className="mt-0.5 text-xs text-gray-500">
                {t("Sent")} {new Date(entry.time).toLocaleString(locale, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              </p>
              {entry.trackingEnabled && (
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <Activity icon={EyeIcon} time={entry.viewedAt} label={t("Viewed")} pending={t("Not viewed")} locale={locale} />
                  <Activity icon={ArrowDownToLineIcon} time={entry.downloadedAt} label={t("Downloaded")} pending={t("Not downloaded")} locale={locale} />
                </div>
              )}
            </li>
          ))}
        </ul>
        <DialogFooter>
          <Button variant="outline" onClick={onForward}>
            <MailIcon aria-hidden="true" />{t("Forward")}
          </Button>
          <Button onClick={() => onOpenChange(false)}>{t("Close")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
