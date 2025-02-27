import { useContext } from "react"
import BIcon from "./BIcon"
import { ApplicationContext } from "../providers/ApplicationProvider"
import { Link } from "react-router-dom"
import { isWaitlist } from "../utils"
import ProductDemoScreenshot from "../img/ProductDemoScreenshot.png"
import ProductDemo from "../img/ProductDemo.mp4"

const features = [
  {
    name: 'Tough Encryption',
    description: 'Your files are protected by AES-256, the same algorithm used by militaries and governments around the world.',
    icon: "lock",
  },
  {
    name: 'Large Storage',
    description: "No other file transfer service supports storing such large files, for such a small price.",
    icon: "database",
  },
  // {
  //   name: 'Statistics',
  //   description: 'Easily see if people have viewed or downloaded your files. ',
  //   icon: "bar-chart",
  // },
]

export default function Features3() {
  const { setShowWaitlistModal } = useContext(ApplicationContext)

  return (
    <div className="bg-white py-24 sm:py-32" id="features2">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base/7 font-semibold text-primary">1TB Storage and Privacy</h2>
          <p className="mt-2 text-pretty text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-balance">
            Storage and Encryption - <br />
            for a whole year
          </p>
          <p className="mt-6 text-lg/8 text-gray-600">
            With the Pro plan, you can store up to 1TB of files for 365 days before they expire, ensuring they are always downloaded in time.
            All files are encrypted regardless of what plan you choose. Unlike many services, <Link to="/legal/privacy-policy" className="text-primary hover:underline">we value your privacy</Link>.
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
        <div className="mx-auto mt-16">
          <video
            // autoPlay
            width={2432}
            height={1442}
            className="mx-auto rounded-xl w-full max-w-4xl"
            loop
            controls
            poster={ProductDemoScreenshot}
          >
            <source src={ProductDemo} type="video/mp4" />
          </video>
        </div>
      </div>
    </div>
  )
}
