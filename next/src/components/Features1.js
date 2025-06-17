import BIcon from "./BIcon"
import ProductDemoScreenshot from "@/img/ProductDemoScreenshot.png"
import logo from "@/img/icon.png"
import Image from "next/image"

const features = [
  {
    name: 'Privacy by Default',
    description: 'Your files are protected by AES-256, the same algorithm used by militaries and governments around the world.',
    icon: "lock",
  },
  {
    name: 'Keep files for 365 days',
    description: 'With the Pro plan, your transfers are available for 365 days before they expire, ensuring they are always downloaded in time.',
    icon: "clock",
  },
  {
    name: 'No Tracking',
    description: `Unlike many services, we value your privacy. ${true ? "Everything is hosted in the EU." : "We do not share your information with third parties."}`,
    icon: "ban",
  },
  {
    name: 'Statistics',
    description: 'Easily see when people have clicked your link or downloaded your files.',
    icon: "bar-chart",
  },
]

export default function Features1() {

  return (
    <div className="bg-white py-24 sm:py-32" id="about">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-xl text-center">
          <Image alt="Logo" src={logo} className="w-16 mx-auto"></Image>
          {/* <p className="text-base/7 font-semibold text-primary">Benefits</p> */}
          <h2 className="mt-2 text-pretty text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-balance">
            {/* Send Your Files in Seconds */}
            {/* Why Choose Transfer.zip? */}
            The Best Way to Send Files
          </h2>
          <p className="mt-6 text-lg/8 text-gray-600">
            <span className="font-bold">We do things differently here:</span> We have no cookie popups, no terms of service box and no user tracking - just fast and secure file sharing.
            {/* With our Pro plan, you can send up to 1TB per transfer. */}
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
            <source src={"/img/ProductDemo.mp4"} type="video/mp4" />
          </video>
        </div>
      </div>
    </div>
  )
}
