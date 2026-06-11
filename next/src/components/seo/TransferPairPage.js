import { Fragment } from "react"
import Link from "next/link"
import { ZapIcon } from "lucide-react"
import ToolLanding from "@/components/tools/ToolLanding"
import ContentArticle from "@/components/content/ContentArticle"
import TransferPairWidget from "@/components/seo/TransferPairWidget"
import { DEVICES, getTransferPair, getRelatedPairs } from "@/lib/seo/transferPairs"
import { mdxComponents } from "@/mdx-components"

// ToolLanding's defaults claim "works offline" - true for the browser tools,
// wrong for transfers, which need both devices online.
const heroFeatures = [
  { icon: <ZapIcon size={16} />, text: "Never stored on a server", mobile: false },
  { icon: <ZapIcon size={16} />, text: <Link className="hover:underline" href="https://github.com/robinkarlberg/transfer.zip-web">Open source</Link>, mobile: false },
  { icon: <ZapIcon size={16} />, text: "No size limit, no app or account", mobile: false },
  { icon: <ZapIcon size={16} />, text: "No size limit, no app or account", mobile: true },
]

// Article body uses the same column and typography as the MDX guides - the
// element renderers come straight from mdx-components so they can't drift.
const { h2: H2, p: P, ol: Ol, li: Li } = mdxComponents()

// Must match mdx-components' generateId so the ToC anchors line up.
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

  const sectionTitles = [
    "How does it work?",
    pair.heading,
    ...pair.tips.map(tip => tip.heading),
    "FAQ",
  ]
  const toc = sectionTitles.map(title => ({ level: 2, title, id: headingId(title) }))

  const relatedGuides = getRelatedPairs(pair.slug).map(p => ({
    slug: `how-to/${p.slug}`,
    href: `/how-to/${p.slug}`,
    title: p.heading,
    description: p.description,
    imgSrc: p.image,
  }))

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ToolLanding
        title={pair.headline.title}
        highlightedWord={pair.headline.highlightedWord}
        subtitle={pair.subtitle}
        features={heroFeatures}
      >
        <TransferPairWidget
          slug={pair.slug}
          fromKey={from.key}
          fromName={from.name}
          toKey={to.key}
          toName={to.name}
        />
      </ToolLanding>

      <div className="bg-white pt-10">
        <ContentArticle toc={toc} childContent={relatedGuides}>
          <H2>How does it work?</H2>
          {pair.howItWorks.map((paragraph, i) => (
            <P key={i}>{paragraph}</P>
          ))}

          <H2>{pair.heading}</H2>
          <Ol>
            {pair.steps.map((step, i) => (
              <Li key={i}>{step.text}</Li>
            ))}
          </Ol>

          {pair.tips.map(tip => (
            <Fragment key={tip.heading}>
              <H2>{tip.heading}</H2>
              {tip.body.map((paragraph, i) => (
                <P key={i}>{paragraph}</P>
              ))}
            </Fragment>
          ))}

          <H2>FAQ</H2>
          {pair.faq.map(({ q, a }) => (
            <P key={q}><strong>{q}</strong>{" "}{a}</P>
          ))}
        </ContentArticle>
      </div>
    </div>
  )
}
