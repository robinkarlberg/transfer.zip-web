
"use client"
import { useLanguage } from "@/context/LanguageContext"
export default function TeamSection({ team, role }) {
  const { t, landingText } = useLanguage()
  return (
    <div className="p-5 sm:p-6 bg-white rounded-xl">
      <h2 className="text-lg font-semibold text-gray-900">{t("Team")}</h2>

      <div className="mt-4 flex items-center gap-2 flex-wrap">
        <p className="text-base font-semibold text-gray-900">{team.name || t("Your team")}</p>
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary-100 text-primary-700 capitalize">
          {t(role)}
        </span>
      </div>
      <p className="text-sm text-gray-500 mt-1">{t("Your plan, storage, and billing are managed by the team owner.")}</p>
    </div>
  )
}
