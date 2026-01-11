import { useContext } from "react"
import BIcon from "./BIcon"
import Link from 'next/link'
import { FastForwardIcon, MailIcon } from "lucide-react"

const features = [
  {
    name: 'Track Views and Downloads',
    description: "The dashboard allows you to track when download links are clicked, and files downloaded - ensuring you have full visibility over the distribution of your files.",
    icon: MailIcon,
    cta: "Send Files By Email",
    href: "/signin"
  },
  {
    name: 'Blazing Fast Speeds',
    description: "All files are downloaded from the same high-speed servers, ensuring your ideas get shared as quickly as possible.",
    icon: FastForwardIcon,
    cta: "Send Files Fast",
    href: "/signin"
  },
]

export default function Features3() {
  return (
    <div className="bg-white py-24 sm:py-32" id="send-files-by-email">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-base/7 font-semibold text-primary">Send Files By Email</h2>
          <p className="mt-2 text-pretty text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-balance">
            Share Files with Your Whole Organisation.
          </p>
          <p className="mt-6 text-lg/8 text-gray-600">
            Transfer files to as many as 50 email addresses at once - directly from the dashboard.
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
