import BIcon from "./BIcon"
import Link from 'next/link'

const features = [
  {
    name: 'Much Larger Files',
    description: 'Quick Share supports files over 100GB, because the data is never stored on our servers. Instead it is streamed in real-time between your devices.',
    icon: "database-fill-up"
  },
  {
    name: 'End-to-end Encryption',
    description: 'Files sent with Quick Share is protected with end-to-end encryption, keeping your files secure and private - even from us.',
    icon: "lock-fill",
  },
]

export default function FeaturesNew() {
  return (
    <div className="bg-white py-24 sm:py-32" id="about-quick-share">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base/7 font-semibold text-primary">Quick Share</h2>
          <p className="mt-2 text-pretty text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-balance">
            {/* Unlimited File Size -<br/>Unlimited Privacy */}
            Keep Your Tab Open -<br />Send 100GB Files <span className="bg-primary-200 px-2 text-primary rounded-xl whitespace-nowrap">for Free</span>
          </p>
          <p className="mt-6 text-lg/8 text-gray-600">
            Use <Link href={"/quick"} className="text-primary hover:underline"><i>Quick</i></Link> to send large files for free.
            It has <b>no file size limit</b> whatsoever - as long as your browser tab is open, you are good to go.
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