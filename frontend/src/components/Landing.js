'use client'

import { useContext } from "react";
import { ApplicationContext } from "../providers/ApplicationProvider";
import { Link } from "react-router-dom";
import LogoCloud from "./LogoCloud";
import { isEarlyOffer, isWaitlist } from "../utils";
import popup from "../img/popup.png"
import fazier from "../img/fazier.png"

const ctaBar = false

export default function Landing() {
  const { setShowWaitlistModal } = useContext(ApplicationContext)

  return (
    <div className="bg-white">

      <div className="relative isolate px-6 pt-12 lg:px-8">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80 pointer-events-none"
        >
          <div
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-primary-subtle opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          />
        </div>
        <div className="-z-10 absolute -rotate-6 bottom-44 2xl:left-60 3xl:left-60 hidden xl:block">
          <img className="shadow-lg rounded-xl" src={popup} width="360"></img>
        </div>
        <div className="mx-auto max-w-2xl py-32 sm:py-36 lg:pt-36 lg:pb-56">
          <div className="mb-8">
            <a href="https://fazier.com/launches/sponsorapp"><img className="mx-auto" src={fazier}></img></a>
          </div>
          {ctaBar && <div className="hidden sm:mb-8 sm:flex sm:justify-center">
            {isWaitlist() ?
              <div className="relative rounded-full px-3 py-1 text-sm/6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20">
                {/* Now 50% off for early adopters!{' '} */}
                Waitlist is now open for registration!{" "}
                <a href="#" onClick={() => setShowWaitlistModal(true)} className="font-semibold text-primary">
                  <span aria-hidden="true" className="absolute inset-0" />
                  Join Waitlist <span aria-hidden="true">&rarr;</span>
                </a>
              </div>
              :
              (isEarlyOffer() &&
                <div className="relative rounded-full px-3 py-1 text-sm/6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20">
                  0% platform fee for your first 30 days!{" "}
                  <a href="/signup" className="font-semibold text-primary">
                    <span aria-hidden="true" className="absolute inset-0" />
                    Offer Ends Soon <span aria-hidden="true">&rarr;</span>
                  </a>
                </div>)
            }
          </div>}
          <div className="text-center">
            <h1 className="text-balance text-5xl font-bold tracking-tight leading-none text-gray-900 sm:text-7xl">
              {/* <span className="underline decoration-primary decoration-dashed">Monetize</span> your website */}
              {/* Support what you love 🤑 */}
              {/* Give Back to Your Supporters ❤️ */}
              {/* Boost your Donations 🤑 */}
              Make money with your Website
            </h1>
            <p className="mt-8 text-pretty text-lg font-medium text-gray-700 sm:text-xl/8">
              {/* BuyMeACoffee meets the monetization power of AdSense. */}
              Reward your supporters for donating to you -{" "}
              <br className="hidden sm:block" />
              it's like BuyMeACoffee, but smarter.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                to={isWaitlist() ? "" : "/signup"}
                onClick={e => {
                  if (isWaitlist()) {
                    e.preventDefault()
                    setShowWaitlistModal(true)
                  }
                }}
                className="rounded-lg bg-primary-light px-4 py-2.5 text-lg font-semibold text-white shadow-sm transition-all hover:scale-105 hover:rotate-1 hover:bg-primary-lighter focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                {isWaitlist() ? "Join Waitlist" : "Start earning"} &rarr;
              </Link>
              {/* <Link to="#features2" className="text-sm/6 font-semibold text-gray-900">
                Learn more <span aria-hidden="true">→</span>
              </Link> */}
            </div>
            <div className="mt-8 font-medium text-gray-600 transition-transform hover:-rotate-1">
              (It's free and takes less than a minute!)
            </div>
          </div>
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
        >
          <div
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
            className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-primary to-primary-subtle opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
          />
        </div>
      </div>
    </div>
  )
}
