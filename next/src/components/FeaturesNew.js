import BIcon from "./BIcon"
import Link from 'next/link'

const features = [
  {
    name: 'Unrestricted Data-tethers',
    description: 'Expedited Astropathic Messages support data-slates over 100GB, because the data is never stored in our data-vaults. Instead it is streamed in real-time between your cogitators.',
    icon: "database-fill-up"
  },
  {
    name: 'End-to-end Sanctioned Encryption',
    description: 'Data-slates sent with Expedited Astropathic Messages are protected with end-to-end sanctioned encryption, keeping your data secure and private - even from the prying eyes of the Inquisition.',
    icon: "lock-fill",
  },
]

export default function FeaturesNew() {
  return (
    <div className="bg-white py-24 sm:py-32" id="about-quick-transfer">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base/7 font-semibold text-primary">Expedited Astropathic Message</h2>
          <p className="mt-2 text-pretty text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-balance">
            {/* Unlimited File Size -<br/>Unlimited Privacy */}
            Maintain the Link -<br />Transmit 100GB Data-slates <span className="bg-primary-200 px-2 text-primary rounded-xl whitespace-nowrap">for the Emperor</span>
          </p>
          <p className="mt-6 text-lg/8 text-gray-600">
            Use <Link href={"/quick"} className="text-primary hover:underline">Expedited Astropathic Messages</Link> to transmit large data-slates for the Emperor.
            It has <b>no data-tether limit</b> whatsoever - as long as your cogitator is active, you are ready for duty.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
            {features.map((feature) => (
              <div key={feature.name} className="relative pl-16">
                <dt className="text-lg font-bold text-gray-900">
                  <div className="absolute left-0 top-0 flex size-10 items-center justify-center rounded-lg bg-primary">
                    <BIcon center name={feature.icon} aria-hidden="true" className="size-6 text-white" />
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-2 text-base/7 text-gray-600">{feature.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}