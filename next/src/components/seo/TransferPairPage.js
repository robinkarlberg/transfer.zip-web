import Link from "next/link"
import { ArrowRightIcon, ChevronDownIcon, LockIcon, ZapIcon } from "lucide-react"
import LandingNav from "@/components/LandingNav"
import AuthConditional from "@/app/(site)/(header-scroll)/AuthConditional"
import NoauthLandingHeaderCTAButton from "@/app/(site)/(header-scroll)/NoauthLandingHeaderCTAButton"
import ContentToc from "@/components/content/ContentToc"
import TransferPairWidget from "@/components/seo/TransferPairWidget"
import { DEVICES, getTransferPair, getRelatedPairs } from "@/lib/seo/transferPairs"

const headingId = (text) => text.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-")

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
  const toc = ["How does it work?", ...pair.tips.map(tip => tip.heading), "FAQ"]
    .map(title => ({ level: 2, title, id: headingId(title) }))

  return (
    <main className="bg-white text-gray-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="relative isolate">
        <div aria-hidden="true" className="grain pointer-events-none absolute inset-0 bg-linear-to-b from-primary-600 to-primary-300 before:inset-0" />
        <div className="relative flex min-h-svh flex-col">
          <LandingNav
            fade={false}
            rightSlot={
              <AuthConditional
                noauth={<NoauthLandingHeaderCTAButton />}
                auth={<Link href="/app/sent" className="flex h-10 items-center rounded-xl bg-white px-5 text-sm font-semibold text-gray-800 hover:bg-primary-50">My Transfers <span aria-hidden="true">&nbsp;&rarr;</span></Link>}
              />
            }
          />
          <section aria-labelledby="transfer-heading" className="mx-auto flex w-full max-w-7xl grow flex-col items-center justify-center px-5 py-10 sm:px-6 sm:py-14">
            <h1 id="transfer-heading" className="max-w-2xl text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Send files from <span className="underline decoration-primary-200 decoration-4 underline-offset-4">{fromLabel} to {toLabel}</span>.
            </h1>
            <p className="mt-4 text-center text-sm font-medium text-white">Free to use. No app or account needed.</p>
            <div id="start-transfer" className="mt-9 w-full max-w-sm scroll-mt-24 sm:mt-12">
              <TransferPairWidget slug={pair.slug} fromKey={from.key} fromName={from.name} toKey={to.key} toName={to.name} />
            </div>
          </section>
          <div className="mx-auto flex flex-wrap items-center justify-center gap-x-8 gap-y-3 px-5 pb-8 text-sm font-medium text-white sm:pb-10 sm:text-base">
            <span className="flex items-center gap-2"><ZapIcon aria-hidden="true" size={16} />Data is encrypted</span>
            <Link href="https://github.com/robinkarlberg/transfer.zip-web" className="hidden items-center gap-2 hover:underline sm:flex"><ZapIcon aria-hidden="true" size={16} />Open source</Link>
            <span className="flex items-center gap-2"><ZapIcon aria-hidden="true" size={16} />No file size limit</span>
          </div>
        </div>
      </div>

      <section aria-labelledby={headingId(pair.heading)} className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 id={headingId(pair.heading)} className="text-2xl font-semibold tracking-tight sm:text-3xl">How to transfer your files</h2>
          <a href="#start-transfer" className="text-sm font-medium text-primary hover:underline">Start a transfer <span aria-hidden="true">&uarr;</span></a>
        </div>
        <ol className="mt-8 grid gap-7 md:grid-cols-3 md:gap-10">
          {pair.steps.map((step, i) => (
            <li key={step.text}>
              <div className="flex items-center gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-50 text-sm font-semibold text-primary-700">{i + 1}</span>
                <h3 className="font-semibold">{stepTitles[i]}</h3>
              </div>
              <p className="mt-3 text-base leading-7 text-gray-600">{step.text}</p>
            </li>
          ))}
        </ol>
        <div className="mt-8 flex items-start gap-3 rounded-xl bg-gray-50 p-5">
          <LockIcon aria-hidden="true" size={18} className="mt-1 shrink-0 text-primary" />
          <p className="text-sm leading-6 text-gray-600"><strong className="font-medium text-gray-900">Keep both devices online.</strong> Files are encrypted during transfer and never stored on our servers. Keep this page open until the transfer finishes.</p>
        </div>
      </section>

      <div className="border-t border-gray-200">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-20">
          <aside className="hidden lg:block"><ContentToc toc={toc} /></aside>
          <article className="min-w-0 space-y-12">
            <GuideSection title="How does it work?">{pair.howItWorks}</GuideSection>
            {pair.tips.map(tip => <GuideSection key={tip.heading} title={tip.heading}>{tip.body}</GuideSection>)}

            <section aria-labelledby="faq">
              <h2 id="faq" className="mb-6 text-2xl font-semibold tracking-tight">Frequently asked questions</h2>
              <div className="divide-y divide-gray-200 border-y border-gray-200">
                {pair.faq.map(({ q, a }) => (
                  <details key={q} className="group">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-5 py-5 text-base font-medium hover:text-primary focus-visible:outline-2 focus-visible:outline-primary [&::-webkit-details-marker]:hidden">
                      {q}<ChevronDownIcon aria-hidden="true" size={18} className="shrink-0 text-gray-400 group-open:rotate-180" />
                    </summary>
                    <p className="pb-5 pr-6 text-base leading-7 text-gray-600">{a}</p>
                  </details>
                ))}
              </div>
            </section>
          </article>
        </div>
      </div>

      <section aria-labelledby="related-guides" className="border-t border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
          <h2 id="related-guides" className="text-2xl font-semibold tracking-tight">A different pair of devices?</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {getRelatedPairs(pair.slug).map(related => (
              <Link key={related.slug} href={`/how-to/${related.slug}`} className="group flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-5 font-medium transition-colors hover:border-primary-300 hover:text-primary">
                {DEVICES[related.from].short || DEVICES[related.from].name} to {DEVICES[related.to].short || DEVICES[related.to].name}
                <ArrowRightIcon aria-hidden="true" size={18} className="shrink-0 text-gray-400 group-hover:text-primary" />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

function GuideSection({ title, children }) {
  return (
    <section aria-labelledby={headingId(title)}>
      <h2 id={headingId(title)} className="text-2xl font-semibold tracking-tight">{title}</h2>
      <div className="mt-5 space-y-5 text-base leading-8 text-gray-600">
        {children.map((paragraph, i) => <p key={i}>{paragraph}</p>)}
      </div>
    </section>
  )
}
