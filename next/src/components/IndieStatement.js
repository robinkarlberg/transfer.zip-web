import BIcon from "./BIcon"
import Image from "next/image"
import Link from "next/link";

import robin from "@/img/robin.jpg"

export default function IndieStatement({ compact }) {
  return (
    <section className="bg-white py-12 sm:py-12" id="message-from-founder">
      <div className="mx-auto max-w-7xl">
        {/* Who we are */}
        {/* <h2 className="text-base/7 font-semibold text-primary text-center">Message from the founder:</h2> */}
        <div className="mx-auto mt-8 max-w-3xl">
          <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex items-start gap-4 flex-col sm:flex-row">
              <div className="flex h-12 w-12 select-none items-center justify-center rounded-full text-xl overflow-clip">
                <Image alt="Portrait photo of Robin, the creator of Transfer.zip" src={robin}></Image>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900">
                  Hey 👋
                </h2>
                <p className="mt-2 text-gray-600">
                  I'm Robin, the founder.
                </p>
                <p className="mt-2 text-gray-600">
                  {/* Transfer.zip is a small, independent service. There are no big profit targets. 
                  We focus on building something fast, reliable, and user-friendly.
                  We keep costs down by running an efficient service without the overhead of a large corporation. */}
                  Transfer.zip is an independent service without big profit targets to chase. We put our energy into making file transfers fast, reliable, and simple, and we keep costs low by not carrying the overhead of a large corporation.
                </p>
                <ul className="mt-4 space-y-4 sm:space-y-2 text-gray-700">
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

