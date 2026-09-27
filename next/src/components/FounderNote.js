"use client"

import { CheckIcon } from "lucide-react"
import { Homemade_Apple } from "next/font/google"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import CipherField from "@/components/CipherField"
import robin from "@/img/robin.png"
import { cn } from "@/lib/utils"

const signature = Homemade_Apple({
  weight: "400",
  subsets: ["latin"],
})

const promises = [
  "train AI on your content.",
  "sell your data.",
  "put shareholders before users.",
]

export default function FounderNote() {
  const sectionRef = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const section = sectionRef.current
    // Separate enter/exit lines so the page lights back up while the next section is still peeking in
    const update = () => {
      const { top, bottom } = section.getBoundingClientRect()
      setInView(top < window.innerHeight * 0.5 && bottom > window.innerHeight * 0.85)
    }
    update()
    window.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)
    return () => {
      window.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
    }
  }, [])

  return (
    <>
      {/* Same z as the section but earlier in the DOM: covers the page, not the section. Header is z-30 so nav stays usable */}
      <div aria-hidden="true" className={cn("pointer-events-none fixed inset-0 z-20 bg-black transition-opacity duration-700", inView ? "opacity-100" : "opacity-0")}>
        <CipherField active={inView} />
      </div>
      <section ref={sectionRef} id="message-from-founder" className="relative z-20 px-2 sm:px-4">
        <div className="py-24 sm:py-32">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
            {/* Starts on the white page and only goes dark mid-scroll, so the text has to flip with the backdrop */}
            <div className={cn("px-2 transition-colors duration-700 sm:px-0", inView ? "text-white" : "text-gray-900")}>
              <blockquote className="font-heading text-balance text-4xl font-bold tracking-tight sm:text-5xl">
                <p>&ldquo;Your files should stay yours.&rdquo;</p>
              </blockquote>
              <div className="mt-8 flex items-center gap-4">
                <Image
                  alt="Portrait photo of Robin, the creator of Transfer.zip"
                  src={robin}
                  className="size-14 rounded-full ring-4 ring-white"
                />
                <div>
                  <p className="font-semibold">Robin</p>
                  <p className={cn("text-sm transition-colors duration-700", inView ? "text-gray-400" : "text-gray-500")}>Founder of Transfer.zip</p>
                </div>
              </div>
            </div>
            <div className="relative lg:rotate-1">
              <div aria-hidden="true" className="absolute inset-0 -rotate-3 rounded-sm bg-gray-100 shadow-lg" />
              <div className="relative rounded-sm bg-white px-6 pt-12 pb-10 shadow-2xl sm:px-10">
                <div aria-hidden="true" className="absolute -top-3 left-1/2 h-7 w-32 -translate-x-1/2 -rotate-3 bg-primary-100 shadow-sm" />
                {/* Rules sit on the text baseline, so every block below must keep the 2rem line rhythm */}
                <div className="-mx-6 bg-[linear-gradient(to_bottom,transparent_calc(2rem-1px),var(--color-gray-200)_calc(2rem-1px))] bg-size-[100%_2rem] bg-position-[0_-5px] px-6 text-lg/8 text-gray-700 sm:-mx-10 sm:px-10">
                  <p>
                    Transfer.zip is an independent service without shareholders to appease. We put our energy into making file transfers <span className="underline decoration-wavy decoration-primary-500">fast</span>, <span className="underline decoration-wavy decoration-primary-500">reliable</span>, and <span className="underline decoration-wavy decoration-primary-500">simple</span>, and we keep prices low by not carrying the overhead of a large corporation.
                  </p>
                  <p className="mt-8">
                    In a world where your data has become the product, where companies now train AI on your content and sell your information to advertisers, we believe your files should stay yours.
                  </p>
                  <ul className="mt-8">
                    {promises.map(promise => (
                      <li key={promise} className="flex items-center gap-3 text-gray-900">
                        <CheckIcon size={18} strokeWidth={3} className="shrink-0 text-primary-600" />
                        <span>We will <b>never</b> {promise}</span>
                      </li>
                    ))}
                  </ul>
                  <p className={cn(signature.className, "mt-8 text-3xl/8 text-primary-700")}>Robin</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
