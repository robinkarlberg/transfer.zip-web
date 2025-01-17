import { Link } from "react-router-dom"
import BIcon from "./BIcon"
import { useContext } from "react"
import { ApplicationContext } from "../providers/ApplicationProvider"
import { isWaitlist } from "../utils"

const tiers = [
  {
    name: 'Our Cut',
    id: 'our-cut',
    price: '10%',
    lifetime: true,
    description: "We retain a modest 10% to keep the service running and provide customer service.",
    features: [
      'We secure the payments',
      'We talk to the advertisers',
      'We display the advertisements',
      'We handle the business-side',
    ],
    featured: false
  },
  {
    name: 'Your Cut',
    id: 'your-cut',
    price: '90%',
    lifetime: true,
    description: 'Keep 90% of your income, empowering you to keep more of what you earn and invest in your passion.',
    features: [
      'Payouts directly to your bank account',
      'No hidden fees',
      'No subscription plan',
      'Use on unlimited websites',
      'Get sponsored without contacting sponsors',
      'Easiest way for sponsors to find you',
    ],
    featured: true
  },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Pricing() {

  const { setShowWaitlistModal } = useContext(ApplicationContext)

  return (
    <div className="relative isolate bg-white px-6 py-24 sm:py-32 lg:px-8">
      <div aria-hidden="true" className="absolute inset-x-0 -top-3 -z-10 transform-gpu overflow-hidden px-36 blur-3xl">
        <div
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
          className="mx-auto aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-primary to-primary-subtle opacity-30"
        />
      </div>
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-base/7 font-semibold text-primary" id="pricing">Pricing</h2>
        <p className="mt-2 text-balance text-5xl font-semibold tracking-tight text-gray-900 sm:text-6xl">
          A Fair and Transparent Pricing Model
        </p>
      </div>
      <p className="mx-auto mt-6 max-w-2xl text-pretty text-center text-lg font-medium text-gray-600 sm:text-xl/8">
        We employ a pricing strategy that values transparency and fairness, allowing you to focus on what truly matters, as we take care of the business-side of things.
      </p>
      <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 items-center gap-y-6 sm:mt-20 sm:gap-y-0 lg:max-w-4xl lg:grid-cols-2">
        {tiers.map((tier, tierIdx) => (
          <div
            key={tier.id}
            className={classNames(
              tier.featured ? 'relative bg-gray-900 shadow-2xl' : 'bg-white/60 sm:mx-8 lg:mx-0',
              tier.featured
                ? ''
                : tierIdx === 0
                  ? 'rounded-t-3xl sm:rounded-b-none lg:rounded-bl-3xl lg:rounded-tr-none'
                  : 'sm:rounded-t-none lg:rounded-bl-none lg:rounded-tr-3xl',
              'rounded-3xl p-8 ring-1 ring-gray-900/10 sm:p-10',
            )}
          >
            <h3
              id={tier.id}
              className={classNames(tier.featured ? 'text-primary-lighter' : 'text-primary', 'text-base/7 font-semibold')}
            >
              {tier.name}
            </h3>
            <p className="mt-4 flex items-baseline gap-x-2">
              <span
                className={classNames(
                  tier.featured ? 'text-white' : 'text-gray-900',
                  'text-5xl font-semibold tracking-tight',
                )}
              >
                {tier.price}
              </span>
              {/* <span className={classNames(tier.featured ? 'text-gray-400' : 'text-gray-500', 'text-base')}>{tier.lifetime ? "once" : "/month"}</span> */}
            </p>
            <p className={classNames(tier.featured ? 'text-gray-300' : 'text-gray-600', 'mt-6 text-base/7')}>
              {tier.description}
            </p>
            <ul
              role="list"
              className={classNames(
                tier.featured ? 'text-gray-300' : 'text-gray-600',
                'mt-8 space-y-3 text-sm/6 sm:mt-10',
              )}
            >
              {tier.features.map((feature) => (
                <li key={feature} className="flex gap-x-3">
                  <BIcon
                    name={"check-lg"}
                    aria-hidden="true"
                    className={classNames(tier.featured ? 'text-primary-lighter' : 'text-primary', 'h-6 w-5 flex-none')}
                  />
                  {feature}
                </li>
              ))}
            </ul>
            <Link
              to={"/signup"}
              onClick={e => {
                if(isWaitlist()) {
                  e.preventDefault()
                  setShowWaitlistModal(true)
                }
              }}
              aria-describedby={tier.id}
              className={classNames(
                tier.featured
                  ? 'bg-primary-light text-white shadow-sm hover:bg-primary-lighter focus-visible:outline-primary-light'
                  : 'text-primary ring-1 ring-inset ring-primary-200 hover:ring-primary-300 focus-visible:outline-primary',
                'mt-8 block rounded-md px-3.5 py-2.5 text-center text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:mt-10',
              )}
            >
              Get started today
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
