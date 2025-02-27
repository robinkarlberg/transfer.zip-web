import BIcon from "./BIcon"
import SponsorDemoScreenshot from "../img/SponsorDemoScreenshot.png"
import product_video from "../img/SponsorDemo.mp4"

const features = [
  {
    name: 'Higher Earnings',
    description: 'Unlike Google AdSense, which pays you less and keeps a large cut, we ensure you keep 90% of the revenue.',
    icon: "currency-dollar",
  },
  {
    name: 'Personalized Ads',
    description:
      'Sponsors tailor their message specifically for your audience, ensuring relevance and authenticity.',
    icon: "chat-right-dots",
  },
  {
    name: 'Adblock-Resistant',
    description:
      "33% of people use ad-blockers. SponsorApp's non-intrusive and privacy-respecting ads are not affected by this.",
    icon: "ban",
  },
  {
    name: "Respect Your Visitors",
    description:
      'No invasive tracking or irrelevant ads - your users will thank you for it.',
    icon: "emoji-smile",
  },
]

export default function Features2() {
  return (
    <div className="bg-white py-24 sm:py-32" id="features2">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          {/* <h2 className="text-base/7 font-semibold text-primary">Deploy faster</h2> */}
          <p className="mt-2 text-pretty text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl lg:text-balance">
            {/* Everything you need to deploy your app */}
            {/* Customize and deliver notices of <span className="underline decoration-dashed decoration-primary">every kind</span>. */}
            {/* Ditch Adsense. <span className="underline decoration-dashed decoration-primary">Monetize Ethically</span>. */}
            {/* Creators ❤️ SponsorApp */}
            Like BuyMeACoffee and AdSense got a baby.
          </p>
          <p className="mt-6 text-lg/8 text-gray-600">
            Give your supporters more than a thank-you note,<br />and your visitors more than annoying popup ads.
          </p>
        </div>
        <div className="mx-auto mt-4">
          <video
            // autoPlay
            width={2432}
            height={1442}
            className="mx-auto rounded-xl w-full max-w-5xl"
            loop
            controls
            poster={SponsorDemoScreenshot}
          >
            <source src={product_video} type="video/mp4" />
          </video>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
            {features.map((feature) => (
              <div key={feature.name} className="relative pl-16">
                <dt className="text-base/7 font-semibold text-gray-900">
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