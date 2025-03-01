"use client"

import { Link, useNavigate } from "react-router-dom"
import FileUpload from "./elements/FileUpload"
import BIcon from "./BIcon"
import { useEffect, useState } from "react"

export default function Example() {

  const navigate = useNavigate()

  const handleFiles = (files) => {
    navigate("/quick-share/progress", {
      state: {
        files,
        transferDirection: "S"
      }
    })
  }

  const handleReceiveClicked = e => {
    navigate("/quick-share/progress", {
      state: {
        transferDirection: "R"
      }
    })
  }

  const [stars, setStars] = useState(null)

  useEffect(() => {
    fetch("https://api.github.com/repos/robinkarlberg/transfer.zip-web", {
      "credentials": "omit",
      "method": "GET"
    }).then(res => res.json()).then(json => {
      setStars(json.stargazers_count)
    }).catch(err => {
      console.log("GitHub stars fetch error :(")
    })
  }, [])

  return (
    <div className="bg-white">
      <div className="relative isolate">
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
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:flex lg:items-center lg:gap-x-10 lg:px-8 lg:py-40">
          <div className="mx-auto max-w-2xl lg:mx-0 lg:flex-auto">
            <div className="flex">
              <div className="relative flex items-center gap-x-4 rounded-full px-4 py-1 text-sm leading-6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20">
                <span className="font-semibold text-primary">New Version</span>
                <span aria-hidden="true" className="h-4 w-px bg-gray-900/10" />
                <a href="#about" className="flex items-center gap-x-1">
                  <span aria-hidden="true" className="absolute inset-0" />
                  Explore new features! &rarr;
                </a>
              </div>
            </div>
            <h1 className="mt-10 max-w-lg text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Send Big Files
              Without Limits
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-lg">
              Send files with <span className="underline decoration-primary decoration-dashed font-semibold">no size limits</span> in real-time, with end-to-end encryption and blazingly fast speeds, all for free.
            </p>
            <div className="hidden sm:flex mt-10 items-center gap-x-6">
              <Link
                to="signup"
                className="rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Create Account
              </Link>
              <a href="https://github.com/robinkarlberg/transfer.zip-web" className="text-sm font-semibold leading-6 text-gray-900">
                <BIcon name={"star"} /> Star on GitHub {stars ? `(${stars})` : ""} <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
          <div className="mt-16 sm:mt-24 lg:mt-0 lg:flex-shrink-0 lg:flex-grow">
            <div className="mx-auto max-w-sm">
              <FileUpload onFiles={handleFiles} onReceiveClicked={handleReceiveClicked} />
            </div>
          </div>
          <div className="sm:hidden flex mt-16 justify-center items-center gap-x-6">
            <Link
              to="signup"
              className="rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Create Account
            </Link>
            <a href="https://github.com/robinkarlberg/transfer.zip-web" className="text-sm font-semibold leading-6 text-gray-900">
              <BIcon name={"star"} /> Star on GitHub <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
