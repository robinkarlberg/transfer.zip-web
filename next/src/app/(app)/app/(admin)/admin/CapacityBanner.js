
"use client"
import { useLanguage } from "@/context/LanguageContext"
import Link from "next/link";
import { AlertTriangleIcon } from "lucide-react";

export default function CapacityBanner({ memberCount, seats, isOwner }) {
  const { t, landingText } = useLanguage()
  const surplus = memberCount - seats;
  if (surplus <= 0) return null;

  return (
    <div className="mb-4 flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4">
      <AlertTriangleIcon size={20} className="text-amber-700 mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="font-medium text-amber-900">{t("Team is")} {surplus} {surplus === 1 ? t("seat") : t("seats")} {t("over capacity")}</div>
        <p className="text-sm text-amber-800 mt-0.5">{t("You have")} {memberCount} {t("members but only")} {seats} {t("paid")} {seats === 1 ? t("seat") : t("seats")}{t(". Add more seats or remove members to stay within your plan.")}</p>
      </div>
      {isOwner && (
        <Link
          href="/app/admin/billing"
          className="shrink-0 text-sm font-medium text-amber-900 underline hover:no-underline"
        >{t("Manage billing")}</Link>
      )}
    </div>
  );
}
