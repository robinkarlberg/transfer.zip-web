import { englishLandingText } from "@/lib/landing/en";
import Link from 'next/link';
import Squiggle from "./Squiggle";
import WordWheel from "./WordWheel";

const RINGS = ["size-[24rem]", "size-[40rem]", "size-[56rem]", "size-[72rem]"]

export default function CTA({ text = englishLandingText.cta }) {
  return (
    <section className="bg-white px-2 py-24 sm:px-4 sm:py-32">
      <div className="relative isolate mx-auto max-w-7xl overflow-hidden rounded-[2rem] px-6 py-24 text-center shadow-2xl sm:rounded-[3rem] sm:px-16 sm:py-32">
        <div aria-hidden="true" className="grain absolute inset-0 -z-10 bg-linear-to-b from-primary-600 to-primary-400 before:inset-0" />
        {RINGS.map(size => (
          <div
            key={size}
            aria-hidden="true"
            className={`absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary-300 opacity-60 ${size}`}
          />
        ))}
        <h2 className="mx-auto max-w-2xl text-balance text-4xl font-bold tracking-tight text-white sm:text-5xl">
          {text.titleBefore} <Squiggle className="text-primary-200"><WordWheel words={text.words} /></Squiggle> {text.titleAfter}
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-pretty text-lg/8 font-medium text-primary-50">
          {text.description}
        </p>
        <div className="mt-10 flex justify-center">
          <Link
            href={"/app"}
            className="flex h-12 items-center rounded-full bg-white px-6 text-sm font-semibold text-gray-900 shadow-lg hover:bg-primary-50"
          >
            {text.button} <span aria-hidden="true">&nbsp;&rarr;</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
