import { useContext } from "react"
import BIcon from "./BIcon"
import Link from 'next/link'

const features = [
  {
    name: 'Track Views and Downloads',
    description: "The dashboard allows you to track when download links are clicked, and files downloaded - ensuring you have full visibility over the distribution of your files.",
    icon: "envelope-fill",
    cta: "Send Files By Email",
    href: "/signup"
  },
  {
    name: 'Blazing Fast Speeds',
    description: "All files are downloaded from the same high-speed servers, ensuring your ideas get shared as quickly as possible.",
    icon: "fast-forward-fill",
    cta: "Send Files Fast",
    href: "/signup"
  },
]

export default function Features3() {
  return (
    <div className="bg-white py-24 sm:py-32" id="features">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-base/7 font-semibold text-primary">Send Files By Email</h2>
          <p className="mt-2 text-pretty text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-balance">
            Share Files with Your Whole Organisation.
          </p>
          <p className="mt-6 text-lg/8 text-gray-600">
            Transfer files to as many as 200 email addresses simultaneously - directly from the dashboard.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-2">
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
                  <p className="mt-6">
                    <Link href={feature.href} className="text-sm font-semibold leading-6 text-primary">
                      {feature.cta} <span aria-hidden="true">→</span>
                    </Link>
                  </p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}
