import BIcon from "./BIcon"
import Link from 'next/link'

const features = [
  {
    name: 'Astropathic Relays & Vox-Casters',
    description: 'Establish astropathic relays on your data-slates or disseminate them via vox-casters and pict-feeds.',
    icon: "arrow-down",
    cta: "Easily Receive Files",
    href: "/signup"
  },
  {
    name: 'Total Domination',
    description: "You can activate or deactivate your personal relays at will. Forge as many as you require for your holy purpose.",
    icon: "toggle-on",
    cta: "Create Your First Link",
    href: "/signup"
  },
  // {
  //   name: 'Statistics',
  //   description: 'Easily see if people have viewed or downloaded your files. ',
  //   icon: "bar-chart",
  // },
]

export default function Features2() {

  return (
    <div className="bg-white py-24 sm:py-32" id="receive-files">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base/7 font-semibold text-primary">Receive Transmissions via Astropath</h2>
          <p className="mt-2 text-pretty text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-balance">
            Receive Vox-casts from any Corner of the Imperium
          </p>
          <p className="mt-6 text-lg/8 text-gray-600">
            Forge personalized astropathic relays to receive transmissions from anyone - even those who have not yet sworn allegiance to the Imperium.
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
