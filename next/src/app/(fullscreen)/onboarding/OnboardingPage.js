"use client"

import BIcon from "@/components/BIcon"
import PricingCards from "@/components/PricingCards"
import TeamPricingCard from "@/components/TeamPricingCard"
import pricing from "@/lib/pricing"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { API_URL, createCheckoutSession, logout } from "@/lib/client/Api"
import PricingToggle from "@/components/PricingToggle"
import IndieStatement from "@/components/IndieStatement"

const testimonials = [
  {
    quote: "Love how simple and no-BS Transfer.zip is.",
    author: "maddogmdd",
    proof: "https://www.reddit.com/r/techsupport/comments/bjqmm6/comment/kilzfob/",
  },
  {
    quote: "After spending hours browsing for a simple way to send a 23 GB file, this is the answer.",
    author: "amca12006",
    proof: "https://www.reddit.com/r/techsupport/comments/bjqmm6/comment/lgjz9lh/"
  },
  {
    quote: "This is amazing",
    author: "jormaig",
    proof: "https://www.reddit.com/r/techsupport/comments/bjqmm6/comment/lsqqo1h/"
  },
]

export default function OnboardingPage({ user, hasStripeAccount, hasFreeTrial }) {
  const router = useRouter()

  const [isRequesting, setIsRequesting] = useState(false);

  const [frequency, setFrequency] = useState("monthly")

  if (!user) return <></>

  const handleLogout = async () => {
    await logout()
    window.location.href = "/"
  }

  const { tiers, teamTier } = pricing

  const handleTierSelected = async (tier, seats = null) => {
    if (isRequesting) return; // If a request is already in progress, exit the function.

    setIsRequesting(true); // Set the state to indicate a request is in progress.

    try {
      const res = await createCheckoutSession(tier, frequency, { seats });
      window.location.href = res.url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
    } finally {
      setIsRequesting(false); // Reset the state after the request is complete.
    }
  }

  return (
    <>
      <div className="w-full h-screen overflow-hidden absolute grain bg-linear-to-b from-primary-700 to-primary-300 -z-10" />
      <div className="flex min-h-[100vh] flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <Link href={"/"} className="absolute top-8 text-xl me-1 text-white hover:underline fade-in-up-1000">&larr; Back</Link>
        <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center">
          {/* <Image
            alt="Transfer.zip logo"
            src={logo}
            className="mx-auto h-10 w-auto"
          /> */}
          <h1 className={`text-4xl ${hasStripeAccount ? "sm:text-6xl" : "sm:text-7xl"} font-bold mt-8 sm:mt-12 tracking-tight text-white fade-in-up-600`}>
            {hasStripeAccount ? "Welcome back :)" : "Welcome :)"}
          </h1>
          <p className="text-white mt-4 text-base sm:text-xl animate-delay-100 fade-in-up-600">
            {
              hasFreeTrial ?
                <>
                  We offer a <b>7-day free trial</b> on the Pro and Starter plans. You can cancel anytime during your trial, and you won't be charged a penny.
                </>
                :
                <>
                  Pick the perfect plan for you. Starting sharing files in seconds.
                </>
            }
          </p>
        </div>
        <div className="mt-8 animate-delay-200 fade-in-up-600">
          <PricingToggle frequency={frequency} setFrequency={setFrequency} />
        </div>
        <div className="mx-auto mt-4 grid max-w-sm grid-cols-1 gap-6 sm:mt-8 lg:max-w-5xl lg:grid-cols-3 animate-delay-200 fade-in-up-1000">
          <PricingCards frequency={frequency} tiers={tiers} compact={false} onTierSelected={handleTierSelected} hasFreeTrial={hasFreeTrial} eventName={"pricing_card_onboarding_click"} />
          <TeamPricingCard frequency={frequency} tier={teamTier} onTierSelected={handleTierSelected} hasFreeTrial={hasFreeTrial} eventName={"pricing_card_teams_onboarding_click"} />
        </div>
        <div className="mt-8">
          <IndieStatement compact />
        </div>
        <div className={``}>
          <div className="mx-auto max-w-4xl px-6 mt-4 lg:px-8">
            {/* <div className="mb-8 text-center">
              <h2 className="inline-block font-medium text-lg text-gray-500">
                Trusted by more than 11k users every month!
              </h2>
            </div> */}
            <div className="mx-auto grid max-w-lg grid-cols-1 items-center gap-x-8 gap-y-10 sm:max-w-xl sm:gap-x-10 lg:mx-0 md:max-w-none md:grid-cols-3">
              {testimonials.map(testimonial => {
                return (
                  <div key={testimonial.proof} className="col-span-1 text-center h-32">
                    <div className="text-blue-500 mb-2">{[1, 2, 3, 4, 5].map(i => <BIcon key={i} name={"star-fill"} />)}</div>
                    <div className="text-gray-600 mb-2 hover:underline"><a target="_blank" href={testimonial.proof}><BIcon name={"quote"} /> {testimonial.quote}</a></div>
                    {/* <div className="font-bold text-gray-700">
                      
                      <a className="hover:underline" target="_blank" href={testimonial.proof}>{testimonial.author}</a>
                    </div> */}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
        {/* <p className="text-primary text-center text-sm mb-2">
          <a href="/legal/terms-and-conditions" target="_blank" className="hover:underline"><BIcon name={"patch-check-fill"} className={"text-xs"} /> 7 day money-back guarantee</a>
        </p> */}
        <div className="mt-16 rounded-lg shadow-lg p-2 px-4 border mx-auto">
          <div className="text-xs">
            <p className="text-center text-gray-500">
              You are logged in as {user?.email}{" "}
            </p>
          </div>
          {hasStripeAccount && (
            <div className="mt-1 text-xs">
              <form method="POST" action={API_URL + "/stripe/create-customer-portal-session"}>
                <p className="text-center text-gray-500">
                  <button type="submit" className="font-semibold text-primary-dark text-nowrap hover:underline">
                    Cancel Subscription <BIcon name={"box-arrow-up-right"} />
                  </button>
                </p>
              </form>
            </div>
          )}
          <div className="mt-1 text-xs">
            <p className="text-center text-gray-500">
              <button onClick={handleLogout} className="font-semibold text-primary-dark text-nowrap hover:underline">
                {/* <BIcon name={"box-arrow-left"} className={"me-1"} /> */}
                Log out
              </button>
            </p>
          </div>
        </div>
        <p className="text-xs text-center mt-8 text-gray-500">
          Secure payments via Stripe. <Link className="text-primary-dark" target="_blank" href={"/legal/terms-and-conditions"}>Terms</Link> and <Link className="text-primary-dark" target="_blank" href={"/legal/privacy-policy"}>Privacy</Link> apply.
        </p>
      </div>
    </>
  )
}