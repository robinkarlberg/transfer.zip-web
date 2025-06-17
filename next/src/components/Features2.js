import BIcon from "./BIcon"
import Link from 'next/link'

const features = [
  {
    name: 'The Easiest Way to Receive Files',
    description: 'No Transfer.zip account is needed for others - simply provide them with an upload link. It is the easiest way to receive files on the web.',
    icon: "arrow-down",
    cta: "Easily Receive Files",
    href: "/signup"
  },
  {
    name: 'Complete Control',
    description: "You can disable or re-enable your personal links at any time. Create as many links as you desire.",
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
    <div className="bg-white py-24 sm:py-32" id="features-receive">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base/7 font-semibold text-primary">Receive Files with a Link</h2>
          <p className="mt-2 text-pretty text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-balance">
            Easily Receive Files from Anyone
          </p>
          <p className="mt-6 text-lg/8 text-gray-600">
            Generate dedicated links for others to upload files directly to you. You can embed these upload links on your website, distribute them, or email them.
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
