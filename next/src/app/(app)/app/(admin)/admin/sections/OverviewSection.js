
"use client"
import { useLanguage } from "@/context/LanguageContext"
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { humanFileSize } from "@/lib/transferUtils";
import AdminCard from "../AdminCard";
import ActivityFeed from "./ActivityFeed";

function Stat({ label, value }) {
  return (
    <div>
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-3xl font-bold text-gray-900 tabular-nums mt-1">{value}</div>
    </div>
  );
}

export default function OverviewSection({ team, memberCount, stats, recentEvents, role, currentUserId }) {
  const { t, landingText } = useLanguage()
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <AdminCard>
          <Stat label={t("Members")} value={`${memberCount}/${team.seats}`} />
        </AdminCard>
        <AdminCard>
          <Stat label={t("Transfers this month")} value={stats.transfersThisMonth} />
        </AdminCard>
        <AdminCard>
          <Stat label={t("Total downloads")} value={stats.totalDownloads} />
        </AdminCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <AdminCard className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">{t("Recent activity")}</h2>
            <Link
              href="/app/admin/activity"
              className="text-sm text-gray-500 hover:text-gray-900 inline-flex items-center gap-1"
            >{t("View all")} <ArrowRightIcon size={14} />
            </Link>
          </div>
          {recentEvents.length === 0 ? (
            <div className="text-sm text-gray-500 py-8 text-center">{t("No team activity yet.")}</div>
          ) : (
            <ActivityFeed events={recentEvents} currentUserId={currentUserId} />
          )}
        </AdminCard>

        <AdminCard>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("Quick links")}</h2>
          <div className="space-y-1 -mx-2">
            <Link href="/app/admin/members" className="flex items-center justify-between px-2 py-2 rounded-lg hover:bg-gray-50 transition">
              <span className="text-sm text-gray-700">{t("Manage members")}</span>
              <ArrowRightIcon size={14} className="text-gray-400" />
            </Link>
            <Link href="/app/admin/transfers" className="flex items-center justify-between px-2 py-2 rounded-lg hover:bg-gray-50 transition">
              <span className="text-sm text-gray-700">{t("All transfers")}</span>
              <ArrowRightIcon size={14} className="text-gray-400" />
            </Link>
            {role === "owner" && (
              <Link href="/app/admin/billing" className="flex items-center justify-between px-2 py-2 rounded-lg hover:bg-gray-50 transition">
                <span className="text-sm text-gray-700">{t("Billing & seats")}</span>
                <ArrowRightIcon size={14} className="text-gray-400" />
              </Link>
            )}
          </div>
        </AdminCard>
      </div>
    </div>
  );
}
