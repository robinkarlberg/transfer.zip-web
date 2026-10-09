"use client"

import { useState } from "react"
import { InfoIcon, Loader2 } from "lucide-react"
import PricingToggle from "@/components/PricingToggle"
import TeamPricingCard from "@/components/TeamPricingCard"
import pricing from "@/lib/pricing"
import { createCheckoutSession, logout } from "@/lib/client/Api"
import { toast } from "sonner"

export default function TeamPausedPage({ user, team, isOwner, previousSeats }) {
  const [frequency, setFrequency] = useState("yearly")
  const [isRequesting, setIsRequesting] = useState(false)

  const handleLogout = async () => {
    await logout()
    window.location.href = "/"
  }

  const handleReactivate = async (tier, seats) => {
    if (isRequesting) return
    setIsRequesting(true)
    try {
      const res = await createCheckoutSession(tier, frequency, { seats }, team.planCurrency)
      window.location.href = res.url
    } catch (err) {
      toast.error(err.message)
      setIsRequesting(false)
    }
  }

  const teamTier = pricing.teamTier

  return (
    <>
      <div className="w-full h-screen overflow-hidden fixed grain bg-linear-to-b from-primary-700 to-primary-300 -z-10" />
      <div className="flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-xl mx-auto fade-in-up-600">
          <div className="text-center text-white mb-6">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              {team.name ? `${team.name} is paused` : "Your team is paused"}
            </h1>
            <p className="mt-3 text-white text-base sm:text-lg">
              {isOwner
                ? "Your team's subscription has ended. Reactivate to give your team access again."
                : "The team subscription has ended. Reach out to your team owner to reactivate it."}
            </p>
          </div>

          {isOwner ? (
            <>
              <div className="flex justify-center mb-6">
                <PricingToggle frequency={frequency} setFrequency={setFrequency} />
              </div>
              <div className="max-w-sm mx-auto">
                <TeamPricingCard
                  currency={team.planCurrency}
                  frequency={frequency}
                  tier={teamTier}
                  onTierSelected={handleReactivate}
                  eventName="team_paused_reactivate_click"
                />
              </div>
              {previousSeats > 0 && (
                <div className="text-center">
                  <p className="mx-auto inline-flex gap-2 font-medium items-center mt-3 text-center text-sm bg-white text-primary px-3 py-2 rounded-full">
                    <InfoIcon size={18}/>
                    You previously had {previousSeats} seat{previousSeats === 1 ? "" : "s"}.
                  </p>
                </div>
              )}
              {isRequesting && (
                <div className="mt-4 flex items-center justify-center text-white text-sm">
                  <Loader2 className="animate-spin mr-2" size={14} />
                  Starting checkout…
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-xl p-5 sm:p-6 shadow-xl">
              <p className="text-sm text-gray-700">
                Until the team is reactivated, you can't access your team's dashboard, transfers, or branding.
              </p>
              <p className="text-sm text-gray-500 mt-3">
                If you're not sure who the owner is, ask anyone on your team.
              </p>
            </div>
          )}

          <div className="mt-10 text-center text-xs">
            <p className="text-white">Logged in as {user.email}</p>
            <button onClick={handleLogout} className="mt-2 font-semibold text-white hover:underline">
              Log out
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
