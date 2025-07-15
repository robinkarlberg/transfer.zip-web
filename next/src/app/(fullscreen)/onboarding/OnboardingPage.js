"use client"

import BIcon from "@/components/BIcon"
import PricingCards from "@/components/PricingCards"
import pricing from "@/lib/pricing"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import logo from "@/img/icon.png"
import Image from "next/image"
import { API_URL, createCheckoutSession, logout } from "@/lib/client/Api"
import { ExternalLink, ExternalLinkIcon } from "lucide-react"

const testimonials = [
  {
    quote: "Love how simple and no-BS Transfer.zip is.",
    author: "maddogmdd",
    proof: "https://www.reddit.com/r/techsupport/comments/bjqmm6/comment/kilzfob/",
  },
  {
    quote: "... after spending hours browsing for a simple way to send a 23 GB file, this is the answer.",
    author: "amca12006",
    proof: "https://www.reddit.com/r/techsupport/comments/bjqmm6/comment/lgjz9lh/"
  },
  {
    quote: "F*****g THANK you. ...",
    author: "Bravo-Xray",
    proof: "https://www.reddit.com/r/techsupport/comments/bjqmm6/comment/lj01kxe/"
  },
]

export default function OnboardingPage({ user, hasStripeAccount, hasFreeTrial }) {
  const router = useRouter()

  const [isRequesting, setIsRequesting] = useState(false);

  if (!user) return <></>

  const handleLogout = async () => {
    await logout()
    window.location.href = "/"
  }

  const { tiers } = pricing

  const handleTierSelected = async (tier) => {
    if (isRequesting) return; // If a request is already in progress, exit the function.

    setIsRequesting(true); // Set the state to indicate a request is in progress.

    try {
      const res = await createCheckoutSession(tier);
      window.location.href = res.url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
    } finally {
      setIsRequesting(false); // Reset the state after the request is complete.
    }
  }

  return (
    <>
      <div className="flex min-h-[100vh] flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <Link href={"/"} className="absolute top-8 text-xl me-1 text-primary hover:text-primary-light">&larr; Back</Link>
        <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center">
          <Image
            alt="Transfer.zip logo"
            src={logo}
            className="mx-auto h-10 w-auto"
          />
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Welcome to Transfer.zip! 🎉
          </h1>
          <p className="text-gray-700 mt-4">
            {
              hasFreeTrial ?
                <>
                  You have a <b>7-day free trial</b> on any plan. You can cancel anytime during your trial, and you won't be charged a penny.
                </>
                :
                <>
                  Choose a plan that fits your needs. <b>Send files instantly</b> upon purchase.
                </>
            }
          </p>
        </div>
        <div className="mx-auto mt-8 grid max-w-lg grid-cols-1 items-center gap-y-6 sm:mt-12 sm:gap-y-0 lg:max-w-4xl lg:grid-cols-2">
          <PricingCards tiers={tiers} compact={false} onTierSelected={handleTierSelected} hasFreeTrial={hasFreeTrial} />
        </div>
        <div className={``}>
          <div className="mx-auto max-w-4xl px-6 lg:px-8 pt-16 mb-8">
            {/* <div className="mb-8 text-center">
              <h2 className="inline-block font-medium text-lg text-gray-500">
                Trusted by more than 11k users every month!
              </h2>
            </div> */}
            <div className="mx-auto grid max-w-lg grid-cols-1 items-center gap-x-8 gap-y-10 sm:max-w-xl sm:gap-x-10 lg:mx-0 md:max-w-none md:grid-cols-3">
              {testimonials.map(testimonial => {
                return (
                  <div key={testimonial.proof} className="col-span-1 text-center h-32">
                    <div className="text-blue-500 mb-2"><BIcon name={"reddit"} className={"me-1.5 text-orange-600"} />{[1, 2, 3, 4, 5].map(i => <BIcon key={i} name={"star-fill"} />)}</div>
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
        <div className="mt-0 rounded-lg shadow-lg p-2 px-4 border mx-auto">
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
                    View my invoices <BIcon name={"box-arrow-up-right"} />
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