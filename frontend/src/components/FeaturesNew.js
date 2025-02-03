import BIcon from "./BIcon"

const features = [
  {
    name: 'Much Larger Files',
    description: '',
    icon: "database-fill-up"
  },
  {
    name: 'Much Faster Transfers',
    description: '',
    icon: "fast-forward-fill",
  },
]

export default function FeaturesNew() {
  return (
    <div className="bg-white py-24 sm:py-32" id="features2">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base/7 font-semibold text-primary">Transfer without limits</h2>
          <p className="mt-2 text-pretty text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-balance">
            Unlimited File Size -<br/>Unlimited Privacy
          </p>
          <p className="mt-6 text-lg/8 text-gray-600">
            Quick Share ensures your data is protected with end-to-end encryption, keeping your files secure and private - even from us, all while being larger than 100GB.
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
          // poster={SponsorDemoScreenshot}
          >
            {/* <source src={product_video} type="video/mp4" /> */}
          </video>
        </div>
      </div>
    </div>
  )
}