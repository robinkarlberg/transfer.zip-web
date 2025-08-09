import { useContext } from "react"
import BIcon from "./BIcon"
import Link from 'next/link'

const features = [
  {
    name: 'Monitor Vox-traffic and Data-retrieval',
    description: "The command console allows you to monitor when astropathic relays are accessed and data-slates retrieved - ensuring you have complete oversight of your transmissions.",
    icon: "envelope-fill",
    cta: "Send Files By Email",
    href: "/signup"
  },
  {
    name: 'Warp-speed Transmissions',
    description: "All data-slates are transmitted via the same high-speed astropathic network, ensuring your decrees are disseminated with the speed of thought.",
    icon: "fast-forward-fill",
    cta: "Send Files Fast",
    href: "/signup"
  },
]

export default function Features3() {
  return (
    <div className="bg-white py-24 sm:py-32" id="send-files-by-email">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-base/7 font-semibold text-primary">Deploy Servo Skulls</h2>
          <p className="mt-2 text-pretty text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-balance">
            Disseminate Imperial Decrees to Your Entire Chapter.
          </p>
          <p className="mt-6 text-lg/8 text-gray-600">
            Transmit data-slates to as many as 50 astropathic relays at once - directly from the command console.
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
