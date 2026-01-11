import { ArrowDownIcon, LinkIcon, SettingsIcon, ToggleRightIcon } from "lucide-react"
import BIcon from "./BIcon"
import Link from 'next/link'

const features = [
  {
    name: 'Shareable & Embeddable',
    description: 'Easily place upload links on your site or share them through email and social media.',
    icon: LinkIcon,
    cta: "Easily Receive Files",
    href: "/signin"
  },
  {
    name: 'Complete Control',
    description: "You can disable or re-enable your personal links at any time. Create as many links as you desire.",
    icon: SettingsIcon,
    cta: "Create Your First Link",
    href: "/signin"
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
          <h2 className="text-base/7 font-semibold text-primary">Receive Files with a Link</h2>
          <p className="mt-2 text-pretty text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-balance">
            Receive Files from Anyone, Anywhere
          </p>
          <p className="mt-6 text-lg/8 text-gray-600">
            Create personalized upload links to easily receive files from anyone - even if they don't have a Transfer.zip account.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
            {features.map((feature) => (
              <div key={feature.name} className="relative pl-16">
                <dt className="text-lg font-bold text-gray-900">
                  <div className="absolute left-0 top-0 flex size-10 items-center justify-center rounded-lg bg-primary text-white">
                    <feature.icon size={16}/>
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
