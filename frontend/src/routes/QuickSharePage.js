import { Outlet, useLocation } from "react-router-dom";
import FileUpload from "../components/elements/FileUpload";
import { createContext } from "react";
import TestimonialCloud from "../components/TestimonialCloud";

export const QuickShareContext = createContext({})

export default function QuickSharePage({ }) {

  const { state } = useLocation()
  let { files, k, remoteSessionId, transferDirection } = state || {}

  /**
   * `true` if the user has been sent a link, either to receive or send a file
   */
  const hasBeenSentLink = !!(k && remoteSessionId && transferDirection)

  return (
    <div key={"prevent-scroll-bug-asdasd"}>
      <div className="grid min-h-[100vh] place-items-center px-6 py-24 sm:py-32 lg:px-8 relative">
        <svg
          aria-hidden="true"
          className="absolute inset-0 -z-10 h-full w-full stroke-gray-200 [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]"
        >
          <defs>
            <pattern
              x="50%"
              y={-1}
              id="83fd4e5a-9d52-42fc-97b6-718e5d7ee527"
              width={200}
              height={200}
              patternUnits="userSpaceOnUse"
            >
              <path d="M100 200V.5M.5 .5H200" fill="none" />
            </pattern>
          </defs>
          <svg x="50%" y={-1} className="overflow-visible fill-gray-50">
            <path
              d="M-100.5 0h201v201h-201Z M699.5 0h201v201h-201Z M499.5 400h201v201h-201Z M-300.5 600h201v201h-201Z"
              strokeWidth={0}
            />
          </svg>
          <rect fill="url(#83fd4e5a-9d52-42fc-97b6-718e5d7ee527)" width="100%" height="100%" strokeWidth={0} />
        </svg>
        <div className="backdrop-blur-sm rounded-xl">
          {/* <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">Quick Share</h1> */}
          <QuickShareContext.Provider value={{
            hasBeenSentLink,
            files, k, remoteSessionId, transferDirection
          }}>
            <Outlet />
          </QuickShareContext.Provider>
        </div>
      </div>
      {/* <div>
        <h2></h2>
      </div> */}
      {/* <TestimonialCloud/> */}
    </div>
  )
}