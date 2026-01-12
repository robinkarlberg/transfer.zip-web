import BIcon from "./BIcon"
import Image from "next/image"
import Link from "next/link";

import robin from "@/img/robin.png"

export default function IndieStatement({ compact }) {
  return (
    <section className="py-12 sm:py-12 scroll-m-12 md:scroll-m-52" id="message-from-founder">
      <div className="mx-auto max-w-7xl">
        {/* Who we are */}
        {/* <h2 className="text-base/7 font-semibold text-primary text-center">Message from the founder:</h2> */}
        <div className="mx-auto max-w-3xl">
          <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 sm:py-10 shadow-sm">
            <div className="flex items-start gap-4 flex-col sm:flex-row">
              <div className="flex h-12 w-12 select-none items-center justify-center rounded-full text-xl overflow-clip">
                <Image alt="Portrait photo of Robin, the creator of Transfer.zip" src={robin}></Image>
              </div>
              <div className="flex-1">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
                  Hey 👋
                </h2>
                <p className="mt-2 sm:text-lg text-gray-800">
                  I'm Robin, the founder.
                </p>
                <p className="mt-2 sm:text-lg text-gray-800 text-justify">
                  Transfer.zip is an independent service without shareholders to appease to. We put our energy into making file transfers <span className="underline decoration-wavy decoration-primary-500">fast</span>, <span className="underline decoration-wavy decoration-primary-500">reliable</span>, and <span className="underline decoration-wavy decoration-primary-500">simple</span>, and we keep prices low by not carrying the overhead of a large corporation.
                </p>
                <p className="mt-2 sm:text-lg text-gray-800 text-justify">
                  In a world where your data has become the product, where companies now train AI on your content and sell your information to advertisers, we believe your files should stay yours.
                </p>
                <ul className="mt-4 space-y-4 sm:space-y-2 sm:text-lg text-gray-700">
                  <li className="flex gap-2">
                    <span className="text-primary">✓</span>
                    <span>We will <b>never</b> train AI on your content.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">✓</span>
                    <span>We will <b>never</b> sell your data.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">✓</span>
                    <span>We will <b>never</b> put shareholders before users.</span>
                  </li>
                  {/* <li className="flex gap-2">
                    <span className="text-primary">✓</span>
                    <span>The platform is fully open source.</span>
                  </li> */}
                </ul>
                {!compact && (
                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <a
                      href="/app"
                      className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-white font-semibold hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    >
                      Experience it free for 7 days
                    </a>
                    <a
                      href="#pricing"
                      className="inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-primary ring-1 ring-inset ring-primary/20 hover:bg-primary/5 font-semibold"
                    >
                      See Pricing
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Subtle background accent */}
            <div
              aria-hidden
              className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-amber-200/40 to-transparent blur-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

