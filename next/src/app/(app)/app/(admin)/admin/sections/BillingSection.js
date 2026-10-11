
"use client"
import { useLanguage } from "@/context/LanguageContext"
import Link from "next/link";
import BIcon from "@/components/BIcon";
import { Button } from "@/components/ui/button";
import { API_URL } from "@/lib/client/Api";
import { humanTimeUntil } from "@/lib/utils";
import pricing, { PLANS } from "@/lib/pricing";
import AdminCard from "../AdminCard";
import SeatManager from "../SeatManager";

export default function BillingSection({ team, memberCount, pendingInvites }) {
  const { t, landingText , language, locale } = useLanguage()
  const tier = pricing.teamTier;
  const { name } = tier;
  const { displayFeatures } = landingText.plans?.[tier.id] || tier;
  const { seats, planCancelling, planValidUntil } = team;

  const timeLeft = planValidUntil ? humanTimeUntil(new Date(planValidUntil), language) : null;
  const statusLabel = planCancelling
    ? t("Cancelling - {0} left", { "0": timeLeft })
    : t("Active");
  const statusColor = planCancelling ? "bg-amber-100 text-amber-700" : "bg-primary-100 text-primary-700";

  return (
    <AdminCard>
      <div className="border rounded-xl p-5">
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg">{name}</span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor}`}>
            {statusLabel}
          </span>
          <span className="ml-auto text-sm text-gray-500">
            {memberCount + pendingInvites} {t("of")} {seats} {t("seats used")}</span>
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
          <Button variant="secondary" className="w-full sm:w-fit">{t("Cancel or Manage Billing")}</Button>
        </form>
        <hr className="my-4" />
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">{t("Seats")}</p>
            <p className="text-sm text-gray-500">
              {seats} {t("paid")} {seats === 1 ? t("seat") : t("seats")} {t("on your subscription.")}{pendingInvites > 0 && t(" {0} pending {1}.", { "0": pendingInvites, "1": pendingInvites === 1 ? "invite" : "invites" })}
            </p>
          </div>
          <SeatManager
            currentSeats={seats || 0}
            memberCount={memberCount}
            pendingInvites={pendingInvites || 0}
            minSeats={PLANS.teams.minSeats}
            maxSeats={PLANS.teams.maxSeats}
          />
        </div>
        <hr className="my-4" />
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">{t("Looking for something else?")}</p>
            <p className="text-sm text-gray-500">{t("Need custom seats, volume pricing, or enterprise terms?")}</p>
          </div>
          <Button asChild variant="default">
            {/* /contact is live on the production branch, it will work once we merge */}
            <Link href={`/contact`} target="_blank" className="w-full sm:w-fit">{t("Talk to sales")}</Link>
          </Button>
        </div>
      </div>
    </AdminCard>
  );
}
