import Link from "next/link"
import { ArrowRightIcon, GithubIcon, LockIcon, Monitor, PlusIcon, Smartphone, ZapIcon } from "lucide-react"
import HowItWorks from "@/components/quick/HowItWorks"
import TransferPairLanding from "@/components/seo/TransferPairLanding"
import TransferPairWidget from "@/components/seo/TransferPairWidget"
import { DEVICES, getTransferPair, getRelatedPairs } from "@/lib/seo/transferPairs"

const sceneDevice = key => (key === "pc" || key === "mac" ? "laptop" : "phone")

export function transferPairMetadata(slug) {
  const pair = getTransferPair(slug)
  return {
    title: pair.title,
    description: pair.description,
    alternates: { canonical: `https://transfer.zip/how-to/${pair.slug}` },
    openGraph: {
      title: pair.title,
      description: pair.description,
      images: [pair.image ? `https://transfer.zip${pair.image}` : "https://cdn.transfer.zip/og.png"],
    },
  }
}

export default function TransferPairPage({ slug }) {
  const pair = getTransferPair(slug)
  const from = DEVICES[pair.from]
  const to = DEVICES[pair.to]
  const fromLabel = from.short || from.name
  const toLabel = to.short || to.name
  const stepTitles = ["Choose your files", "Connect the other device", "Save your files"]
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "HowTo",
        name: pair.heading,
        description: pair.description,
        step: pair.steps.map((step, i) => ({
          "@type": "HowToStep",
          position: i + 1,
          name: stepTitles[i],
          text: step.text,
        })),
      },
      {
        "@type": "FAQPage",
        mainEntity: pair.faq.map(({ q, a }) => ({
          "@type": "Question",
          name: q,
          acceptedAnswer: { "@type": "Answer", text: a },
        })),
      },
    ],
  }
  return (
    <main className="bg-white text-gray-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="relative isolate">
        <div aria-hidden="true" className="grain pointer-events-none absolute inset-0 -z-10 flex flex-col">
          <div className="h-svh shrink-0 bg-linear-to-b from-primary-600 to-primary-300" />
          <div className="grow bg-primary-300" />
        </div>
        <div className="relative flex min-h-svh flex-col">
          <section aria-labelledby="transfer-heading" className="mx-auto flex w-full max-w-7xl grow flex-col items-center justify-center px-5 pt-28 pb-10 sm:px-6 sm:pt-32 sm:pb-14">
            <h1 id="transfer-heading" className="max-w-2xl text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Send files from <span className="underline decoration-primary-200 decoration-4 underline-offset-4">{fromLabel} to {toLabel}</span>.
            </h1>
            <p className="mt-4 text-center text-sm font-medium text-white">Free to use. No app or account needed.</p>
            <div id="start-transfer" className="mt-9 w-full max-w-md scroll-mt-24 sm:mt-12">
              <TransferPairWidget slug={pair.slug} fromKey={from.key} fromName={from.name} toKey={to.key} toName={to.name} />
            </div>
          </section>
          <div className="mx-auto flex flex-wrap items-center justify-center gap-x-8 gap-y-3 px-5 pb-8 text-sm font-medium text-white sm:pb-10 sm:text-base">
            <span className="flex items-center gap-2"><LockIcon aria-hidden="true" size={16} />Data is encrypted</span>
            <Link href="https://github.com/robinkarlberg/transfer.zip-web" className="hidden items-center gap-2 hover:underline sm:flex"><GithubIcon aria-hidden="true" size={16} />Open source</Link>
            <span className="flex items-center gap-2"><ZapIcon aria-hidden="true" size={16} />No file size limit</span>
          </div>
        </div>
        <HowItWorks
          steps={pair.steps.map((step, i) => ({ title: stepTitles[i], text: step.text }))}
          from={sceneDevice(pair.from)}
          to={sceneDevice(pair.to)}
        />
      </div>

      <TransferPairLanding from={from} to={to} subtitle={pair.subtitle} />

      <section aria-labelledby="faq">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[2fr_3fr] lg:gap-20">
          <div>
            <h2 id="faq" className="max-w-sm text-4xl font-bold leading-tight tracking-tight sm:text-5xl">A few answers<br />before you send.</h2>
            <p className="mt-5 text-base leading-7 text-gray-600">Need a hand? <Link href="/contact" className="font-semibold text-primary hover:underline">Get in touch.</Link></p>
          </div>
          <div className="divide-y divide-gray-200 border-y border-gray-200">
            {pair.faq.map(({ q, a }) => (
              <details key={q} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-5 rounded-sm py-5 text-base font-semibold hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary [&::-webkit-details-marker]:hidden">
                  {q}<span className="grid size-8 shrink-0 place-items-center rounded-full bg-gray-50 text-gray-500 transition-colors group-open:bg-primary-50 group-open:text-primary-600"><PlusIcon aria-hidden="true" size={18} className="transition-transform group-open:rotate-45" /></span>
                </summary>
                <p className="pb-6 pr-10 text-base leading-7 text-gray-600">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="related-guides" className="border-t border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
          <h2 id="related-guides" className="text-3xl font-bold tracking-tight sm:text-4xl">A different pair of devices?</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {getRelatedPairs(pair.slug).map(related => {
              const FromIcon = sceneDevice(related.from) === "laptop" ? Monitor : Smartphone
              const ToIcon = sceneDevice(related.to) === "laptop" ? Monitor : Smartphone

              return (
                <Link key={related.slug} href={`/how-to/${related.slug}`} className="group rounded-2xl border border-gray-200 bg-white p-6 transition-colors hover:border-primary-300 hover:bg-primary-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
                  <div aria-hidden="true" className="flex items-center gap-3 text-primary-600">
                    <FromIcon size={24} strokeWidth={1.5} /><ArrowRightIcon size={16} className="text-gray-400" /><ToIcon size={24} strokeWidth={1.5} />
                  </div>
                  <div className="mt-5 flex items-center justify-between gap-3 text-sm font-semibold text-gray-900 group-hover:text-primary-700">
                    {DEVICES[related.from].short || DEVICES[related.from].name} to {DEVICES[related.to].short || DEVICES[related.to].name}
                    <ArrowRightIcon aria-hidden="true" size={18} className="shrink-0 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>
    </main>
  )
}
