import { useContext } from "react";
import { Link } from "react-router-dom";
import { ApplicationContext } from "../providers/ApplicationProvider";
import { isWaitlist } from "../utils";

export default function CTA() {
  const { setShowWaitlistModal } = useContext(ApplicationContext)

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="relative isolate overflow-hidden bg-gray-900 px-6 pt-16 shadow-2xl sm:rounded-3xl sm:px-16 md:pt-24 lg:flex lg:gap-x-20 lg:px-24 lg:pt-0 pb-16">
          <svg
            viewBox="0 0 1024 1024"
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 -z-10 size-[64rem] -translate-y-1/2 [mask-image:radial-gradient(closest-side,white,transparent)] sm:left-full sm:-ml-80 lg:left-1/2 lg:ml-0 lg:-translate-x-1/2 lg:translate-y-0"
          >
            <circle r={512} cx={512} cy={512} fill="url(#759c1415-0410-454c-8f7c-9a820de03642)" fillOpacity="0.7" />
            <defs>
              <radialGradient id="759c1415-0410-454c-8f7c-9a820de03642">
                <stop stopColor="#7775D6" />
                <stop offset={1} stopColor="#E935C1" />
              </radialGradient>
            </defs>
          </svg>
          <div className="mx-auto max-w-2xl text-center lg:flex-auto py-16 lg:pt-32 lg:pb-16">
            <h2 className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Join Thousands Who Switched to Us
            </h2>
            <p className="mt-6 text-pretty text-lg/8 text-gray-300">
              {/* Share your files effortlessly and securely. There are no hidden fees, and it only takes a minute to get started. */}
              Transfer.zip was created to solve the longest-standing problem on the web: sending files. Like thousands of people every month, try it out!
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                onClick={e => { if (isWaitlist()) { e.preventDefault(); setShowWaitlistModal(true) } }}
                to={isWaitlist() ? "" : "/signup"}
                className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Send Large Files Now &rarr;
              </Link>
              {/* <a href="#" className="text-sm/6 font-semibold text-white">
                Learn more <span aria-hidden="true">→</span>
              </a> */}
            </div>
          </div>
          {/* <div className="relative mt-16 h-80 lg:mt-8">
            <img
              alt="App screenshot"
              src="https://tailwindui.com/plus/img/component-images/dark-project-app-screenshot.png"
              width={1824}
              height={1080}
              className="absolute left-0 top-0 w-[57rem] max-w-none rounded-md bg-white/5 ring-1 ring-white/10"
            />
          </div> */}
        </div>
      </div>
    </div>
  )
}
