import { Link, Navigate, replace, useNavigate } from "react-router-dom";
import { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "../../../providers/AuthProvider";
import { createCheckoutSession, logout, onboard } from "../../../Api";
import logo from "../../../img/icon.png"
import PricingCards from "../../../components/PricingCards";
import pricing from "../../../pricing";
import BIcon from "../../../components/BIcon";
import TestimonialCloud from "../../../components/TestimonialCloud";

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

export default function OnboardingPage({ }) {
  const { user, isGuestUser, isFreeUser, refreshUser } = useContext(AuthContext)

  const navigate = useNavigate()

  const loading = useMemo(() => !user?.verified, [user])
  const [message, setMessage] = useState(null)

  const requestOnboard = async e => {
    await onboard({})
    await refreshUser()
  }

  useEffect(() => {
    if (isGuestUser) {
      navigate("/login", { replace: true })
    }
    else if (user && user.onboarded) {
      navigate("/app", { replace: true })
    }
    else if (user && user.verified) {
      // requestOnboard()
    }
  }, [user])

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (user) {
        if (!user.verified) {
          refreshUser()
        } else {
          clearInterval(intervalId)
        }
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  if (!user) return <></>

  const handleLogout = async () => {
    await logout()
    window.location.href = "/"
  }

  const { tiers } = pricing

  const handleTierSelected = async (tier) => {
    const res = await createCheckoutSession(tier)
    window.location.href = res.url;
  }

  return (
    <>
      <div className="flex min-h-[100vh] flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <Link to={"/"} className="absolute top-8 text-xl me-1 text-primary hover:text-primary-light">&larr; Back</Link>
        <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center">
          <img
            alt="Your Company"
            src={logo}
            className="mx-auto h-10 w-auto"
          />
          <h1 className="text-3xl mb-2 font-bold tracking-tight text-gray-900">
            Welcome to Transfer.zip! 🎉
          </h1>
          <p className="text-gray-700">
            Choose a plan that fits your needs. <b>Send files instantly</b> upon purchase.
          </p>
        </div>
        <div className="mx-auto mt-8 grid max-w-lg grid-cols-1 items-center gap-y-6 sm:mt-12 sm:gap-y-0 lg:max-w-4xl lg:grid-cols-2">
          <PricingCards tiers={tiers} compact={false} buttonText={"Subscribe"} onTierSelected={handleTierSelected} />
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
        <p className="text-primary text-center text-sm mb-2">
          <a href="/legal/terms-and-conditions" target="_blank" className="hover:underline"><BIcon name={"patch-check-fill"} className={"text-xs"} /> 7 day money-back guarantee</a>
        </p>
        <p className="text-xs text-center mt-4 text-gray-500">
          Secure payments via Stripe. <Link className="text-primary-dark" target="_blank" to={"/legal/terms-and-conditions"}>Terms</Link> and <Link className="text-primary-dark" target="_blank" to={"/legal/privacy-policy"}>Privacy</Link> apply.
        </p>
        <div className="mt-1 text-xs">
          <p className="text-center text-gray-500">
            {/* Got regrets?{' '} */}
            You are logged in as {user?.email}{" "}
            <Link onClick={handleLogout} className="font-semibold text-primary-dark text-nowrap">
              <BIcon name={"box-arrow-left"} className={"me-1"} />
              Log out
            </Link>
          </p>
        </div>
      </div>
    </>
  )
}