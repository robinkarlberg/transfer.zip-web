import pricing from "@/lib/pricing"
import PricingCards from "./PricingCards"
import BIcon from "./BIcon"

const features = [
  { name: "Full access to Expedited Astropathic Messages", good: true },
  { name: "Serve without an oath of allegiance", good: true },
  { name: "No limit on data-slate size", good: true },
  { name: "Transmissions expire when cogitator is deactivated", good: false },
  { name: "No data-vault", good: false },
]

export default function Pricing() {

  const { tiers } = pricing

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
      <div className="mx-auto max-w-xl text-center">
        <h2 className="text-base/7 font-semibold text-primary" id="pricing">Tithes</h2>
        <p className="mt-2 text-balance text-5xl font-semibold tracking-tight text-gray-900 sm:text-6xl">
          A Just and Simple Tithe Model
        </p>
      </div>
      <p className="mx-auto mt-6 max-w-2xl text-pretty text-center text-lg font-medium text-gray-600 sm:text-xl/8">
        We employ a tithing strategy that values piety and devotion, allowing you to focus on your sacred duties, without worrying about hidden levies.
      </p>
      <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 items-center gap-y-6 sm:mt-20 sm:gap-y-0 lg:max-w-4xl lg:grid-cols-2">
        <PricingCards tiers={tiers} hasFreeTrial={true} />
        <div className="col-span-full mt-16">
          <div className="border shadow rounded-3xl p-10 w-full flex flex-col lg:flex-row justify-between">
            <div>
              <h3 className="text-base/7 font-semibold text-primary">For the Emperor</h3>
              <p className="mt-4 flex items-baseline gap-x-2">
                <span
                  className={'text-gray-900 text-5xl font-semibold tracking-tight'}
                >
                  $0
                </span>
              </p>
              <p className={`text-gray-600 mt-6 text-base/7 max-w-md`}>
                <span className="hidden md:inline"> Transmit data-slates without size limits, with end-to-end sanctioned encryption.</span> This holy service can be used without an oath of allegiance, but without storing data-slates for very long.
              </p>
            </div>
            <div>
              <ul
                role="list"
                className={'text-gray-600 mt-2 space-y-3 text-sm/6 sm:mt-3'}
              >
                {features.map((feature) => (
                  <li key={feature.name} className="flex gap-x-3">
                    <BIcon
                      name={feature.good ? "check-lg" : "x-lg"}
                      aria-hidden="true"
                      className={`h-5 w-5 flex-none ${feature.good ? "text-primary" : "text-red-600"}`}
                    />
                    {feature.name}
                  </li>
                ))}
              </ul>
            </div>
            {/* <Link
              href={"/"}
              className={'text-primary ring-1 ring-inset ring-primary-200 hover:ring-primary-300 focus-visible:outline-primary mt-8 block rounded-md px-3.5 py-2.5 text-center text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:mt-10'}
            >
              Try it out!
            </Link> */}
          </div>
        </div>
      </div>
      <div>
      </div>
    </div>
  )
}
