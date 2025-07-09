import BIcon from "./BIcon"
// import ProductDemoScreenshot from "@/img/ProductDemoScreenshot.png"
import logo from "@/img/icon.png"
import Image from "next/image"

const features = [
  {
    name: 'Privacy First',
    description: 'Your privacy matters. All files are securely hosted in the EU, keeping your data safe and private.',
    icon: 'shield-check',
  },
  {
    name: 'Files Available All Year',
    description: 'Upgrade to Pro and keep your files available for download up to 365 days.',
    icon: 'calendar',
  },
  {
    name: 'Reliable Uploads',
    description: 'Transfers interrupted? No worries. ',
    icon: 'arrow-clockwise',
  },
  // {
  //   name: 'Resumable Uploads',
  //   description: 'Transfers interrupted? No worries. Easily resume uploads when your network goes down.',
  //   icon: 'arrow-clockwise',
  // },
  {
    name: 'Statistics',
    description: 'See when your files are downloaded and when your links are clicked, with simple stats.',
    icon: 'bar-chart',
  },
];

export default function Features1() {

  return (
    <div className="bg-white py-24 sm:py-32" id="about">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-xl text-center">
          {/* <Image alt="Logo" src={logo} className="w-16 mx-auto"></Image> */}
          {/* <p className="text-base/7 font-semibold text-primary">Benefits</p> */}
          <div className="text-blue-500 mb-4">{[1, 2, 3, 4, 5].map(i => <BIcon key={i} name={"star-fill"} />)}</div>
          <h2 className="mt-2 text-pretty text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-balance">
            Simple, Reliable, Secure
          </h2>
          <p className="mt-6 text-lg/8 text-gray-600">
            <span className="font-semibold">File sharing should be effortless.</span> No cookie popups, no complicated terms, and no tracking - just secure and easy transfers every time.
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
            // preload="none"
            poster={"/img/ProductDemoScreenshot.png"}
          >
            <source src={"/img/ProductDemo.mp4"} type="video/mp4" />
          </video>
        </div>
      </div>
    </div>
  )
}
