import React from "react";
import BIcon from "../components/BIcon";

import SponsorDemoScreenshot from "../img/SponsorDemoScreenshot.png"
import product_video from "../img/SponsorDemo.mp4"
import PaymentDemo from "../img/PaymentDemo.png"
import SponsorDone from "../img/SponsorDone.gif"

export default function BlogPage() {

  return (
    <div className="bg-white px-6 py-32 lg:px-8">
      <div className="mx-auto max-w-3xl text-base leading-7 text-gray-700">
        <p className="text-base font-semibold leading-7 text-primary">For Sponsors</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Guide to Sponsoring a Website</h1>
        <p className="mt-6 text-xl leading-8">
          In this guide we will briefly explain how you can leverage {process.env.REACT_APP_SITE_NAME} for more impactful sponsorships.
        </p>
        <div className="mt-10 max-w-2xl">
          <p>
            &rarr; SponsorApp is a unique alternative to BuyMeACoffee:
          </p>
          <ul role="list" className="mt-8 max-w-xl space-y-8 text-gray-600">
            <li className="flex gap-x-3">
              <BIcon name="eye" aria-hidden="true" className="mt-1 h-5 w-5 flex-none text-primary" />
              <span>
                <strong className="font-semibold text-gray-900">Find the Best Audience.</strong> Sponsors identify and select sites that align with their target audience and brand objectives.
              </span>
            </li>
            <li className="flex gap-x-3">
              <BIcon name="pencil" aria-hidden="true" className="mt-1 h-5 w-5 flex-none text-primary" />
              <span>
                <strong className="font-semibold text-gray-900">Customize Your Message.</strong> Create ad content that resonates with your brand and appeals to site viewers directly.
              </span>
            </li>
            <li className="flex gap-x-3">
              <BIcon name="emoji-smile" aria-hidden="true" className="mt-1 h-5 w-5 flex-none text-primary" />
              <span>
                <strong className="font-semibold text-gray-900">Build Trust and Engagement.</strong> Sponsors see increased trust and engagement through transparent and ethical sponsorship deals.
              </span>
            </li>
          </ul>
        </div>
        <h2 className="mt-8 text-2xl font-bold text-gray-900">Step 1 &rarr;</h2>
        <h5 className="text-xl font-medium">Create your advertisement.</h5>
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
        <div className="mt-4 p-4 border rounded-lg">
          <h4 className="font-bold text-md mb-1"><BIcon name={"info-circle"} className={"me-2"} />Engage with your audience ethically and responsibly.</h4>
          <p>
            SponsorApp creates a respectful digital environment by using AI to block malicious or spammy ads. This approach nurtures trust, builds meaningful connections, and enhances your brand's success.
          </p>
        </div>
        <h2 className="mt-8 text-2xl font-bold text-gray-900">Step 2 &rarr;</h2>
        <h5 className="text-xl font-medium">Complete the payment.</h5>
        <div className="mx-auto mt-4">
          <img
            // autoPlay
            width={2432}
            height={1442}
            className="mx-auto rounded-xl w-full max-w-5xl"
            src={PaymentDemo}
          >
          </img>
          <p className="text-center text-gray-500 text-sm mt-1">
            You will be redirected to a secure payment gateway provided by our parter Stripe.
          </p>
        </div>
        <h2 className="mt-8 text-2xl font-bold text-gray-900">Step 3 &rarr;</h2>
        <h5 className="text-xl font-medium">See the advertisement in action.</h5>
        <div className="mx-auto mt-4">
          <img
            // autoPlay
            width={2432}
            height={1442}
            className="mx-auto rounded-xl w-full max-w-5xl"
            src={SponsorDone}
          >
          </img>
          <p className="text-center text-gray-500 text-sm mt-1">
            Upon successful payment, your advertisement is seamlessly integrated into the website and will follow the user's scroll for optimal visibility through the whole visit.
          </p>
        </div>
      </div>
    </div>
  )
}
