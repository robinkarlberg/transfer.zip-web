import { useContext } from "react"
import BIcon from "./BIcon"
import { ApplicationContext } from "../providers/ApplicationProvider"
import { Link } from "react-router-dom"
import { isWaitlist } from "../utils"

const features = [
  {
    name: '1. Add the script',
    description:
      'Paste our lightweight script onto your site. No coding expertise required.',
    href: '#',
    icon: "code",
  },
  {
    name: '2. Connect your Bank',
    description:
      'Link your Stripe account and start accepting payments securely.',
    href: '#',
    icon: "clock",
  },
  {
    name: '3. Start Earning',
    description:
      "Sponsors can design, preview, and pay for recognition on your site. You'll see the revenue directly in your account.",
    href: '#',
    icon: "currency-dollar",
  },
]

export default function Features3() {
  const { setShowWaitlistModal } = useContext(ApplicationContext)

  return (
    <div className="bg-white py-24 sm:py-32" id="features2">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl max-w-lg mx-auto">
            Add a <span className="bg-primary text-white px-3 py-1 rounded-xl hover:cursor-pointer hover:bg-primary-light">support us ❤️</span> button to your website in minutes.
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            <Link
              to={isWaitlist() ? "" : "/signup"}
              className="hover:underline text-primary hover:text-primary-light"
              onClick={e => {
                if (isWaitlist()) {
                  e.preventDefault()
                  setShowWaitlistModal(true)
                }
              }}
            >
              Get going in minutes
            </Link>
            , so you can focus on creating outstanding content.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.name} className="flex flex-col">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                    <BIcon center name={feature.icon} aria-hidden="true" className="h-6 w-6 text-white" />
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">{feature.description}</p>
                  {/* <p className="mt-6">
                    <a href={feature.href} className="text-sm font-semibold leading-6 text-primary">
                      Learn more <span aria-hidden="true">→</span>
                    </a>
                  </p> */}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}
