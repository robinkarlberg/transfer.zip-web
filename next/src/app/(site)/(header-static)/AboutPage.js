import Image from "next/image"
import Link from "next/link"
import CTA from "@/components/CTA"
import ContentArticle from "@/components/content/ContentArticle"
import ContentLanding from "@/components/content/ContentLanding"
import TimelineProgress from "@/components/TimelineProgress"
import firstVersion from "@/img/history/2023-first-version.png"
import oldDashboard from "@/img/history/2024-dashboard.png"
import quickShare from "@/img/history/2024-quick-share.png"
import redesign from "@/img/history/2025-redesign.jpg"
import currentDashboard from "@/img/history/2026-dashboard.jpg"
import robin from "@/img/robin.png"
import { englishAboutText } from "@/lib/about/en"
import { swedishAboutText } from "@/lib/about/sv"
import { englishLandingText } from "@/lib/landing/en"
import { ABOUT_PATHS, LANDING_PATHS } from "@/lib/landing/routes"
import { swedishLandingText } from "@/lib/landing/sv"
import { cn } from "@/lib/utils"

const REPO_URL = "https://github.com/robinkarlberg/transfer.zip-web"
const PROFILE_URL = "https://github.com/robinkarlberg"
const FOUNDED = new Date("2023-05-15")
const YEAR_MS = 365.25 * 24 * 60 * 60 * 1000

// Same type scale as the MDX articles in mdx-components.js
const H2_CLASS = "mt-12 text-2xl font-semibold tracking-tight text-gray-900"
const P_CLASS = "mt-6 leading-7 text-[17px] text-gray-600 text-justify"
const LINK_CLASS = "font-medium text-primary underline underline-offset-4 hover:text-primary-500"

const TIMELINE_IMAGES = {
  "first-file": firstVersion,
  "stored-transfers": oldDashboard,
  "quick-share": quickShare,
  "redesign": redesign,
}

const organizationProfiles = [
  REPO_URL,
  process.env.NEXT_PUBLIC_FACEBOOK_URL,
  process.env.NEXT_PUBLIC_INSTAGRAM_URL,
  process.env.NEXT_PUBLIC_BLUESKY_URL,
  process.env.NEXT_PUBLIC_TWITTER_URL,
  process.env.NEXT_PUBLIC_GITHUB_URL,
].filter(Boolean)

// Other pages reference the person by this @id, so it stays on the English URL in both languages
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://transfer.zip/#organization",
      name: "Transfer.zip",
      url: "https://transfer.zip/",
      foundingDate: "2023-05-15",
      founder: { "@id": "https://transfer.zip/about-us#robin-karlberg" },
      sameAs: organizationProfiles,
    },
    {
      "@type": "Person",
      "@id": "https://transfer.zip/about-us#robin-karlberg",
      name: "Robin Karlberg",
      url: "https://transfer.zip/about-us",
      sameAs: [PROFILE_URL],
    },
  ],
}

export default function AboutPage({ language = "en" }) {
  const swedish = language === "sv"
  const text = swedish ? swedishAboutText : englishAboutText
  const landingText = swedish ? swedishLandingText : englishLandingText
  const years = Math.floor((Date.now() - FOUNDED) / YEAR_MS)
  const lastEntry = text.timeline.years.at(-1).entries.at(-1)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ContentLanding
        title={text.hero.title}
        description={text.hero.description}
        breadcrumbs={[
          { label: text.breadcrumbs.home, href: LANDING_PATHS[language] },
          { label: text.breadcrumbs.page, href: ABOUT_PATHS[language] },
        ]}
      />
      <ContentArticle>
        <dl className="mt-6 grid gap-6 rounded-2xl bg-primary-50 px-6 py-6 sm:grid-cols-3 lg:-mx-8 lg:px-8">
          {text.stats.map(stat => (
            <div key={stat.label} className="flex flex-col-reverse">
              <dt className="mt-1 text-sm text-gray-600">{stat.label}</dt>
              <dd className="font-heading text-2xl font-semibold tracking-tight text-gray-900">{stat.value.replace("{years}", years)}</dd>
            </div>
          ))}
        </dl>

        <h2 className={H2_CLASS}>{text.timeline.title}</h2>
        <div className="relative mt-10">
          <TimelineProgress className="left-[7px]" />
          {text.timeline.years.map(({ year, entries }) => (
            <div key={year} className="relative">
              {/* From lg the year hangs in the margin, like the article asides, and follows its entries */}
              <div className="pb-6 pl-10 lg:absolute lg:inset-y-0 lg:right-full lg:mr-8 lg:pb-0 lg:pl-0">
                <h3 className="font-heading text-4xl font-semibold tracking-tight text-gray-900 lg:sticky lg:top-28 lg:text-5xl">{year}</h3>
              </div>
              <ol>
                {entries.map(entry => (
                  <li key={entry.id} className={cn("relative pl-10", entry !== lastEntry && "pb-12")}>
                    <span aria-hidden="true" className="absolute left-0 top-0.5 size-4 rounded-full border-[3px] border-primary bg-white" />
                    <p className="text-sm font-semibold text-primary">{entry.date}</p>
                    <h4 className="mt-1 text-xl font-semibold text-gray-900">{entry.title}</h4>
                    <p className="mt-3 leading-7 text-[17px] text-gray-600 text-justify">{entry.body}</p>
                    {TIMELINE_IMAGES[entry.id] && (
                      <Image
                        src={TIMELINE_IMAGES[entry.id]}
                        alt={entry.imageAlt}
                        sizes="(min-width: 672px) 584px, 100vw"
                        className="mt-6 h-auto w-full rounded-xl border border-gray-200"
                      />
                    )}
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>

        <h2 className={H2_CLASS}>{text.today.title}</h2>
        <p className={P_CLASS}>{text.today.body}</p>
        <p className={P_CLASS}>{text.today.goal}</p>
        <div className="mt-8 flex items-center gap-4">
          <Image alt={landingText.founder.portrait} src={robin} className="size-14 rounded-full" />
          <div>
            <p className="font-semibold text-gray-900">Robin Karlberg</p>
            <p className="text-sm text-gray-500">{landingText.founder.role}</p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-[17px]">
          <Link href={REPO_URL} className={LINK_CLASS}>{text.today.sourceLink} &rarr;</Link>
          <Link href={PROFILE_URL} className={LINK_CLASS}>{text.today.profileLink} &rarr;</Link>
        </div>
        <div className="my-8 lg:-mx-8">
          <Image
            src={currentDashboard}
            alt={text.today.imageAlt}
            sizes="(min-width: 1024px) 688px, 100vw"
            className="h-auto w-full rounded-xl border border-gray-200"
          />
        </div>

        <h2 className={H2_CLASS}>{text.handling.title}</h2>
        {text.handling.items.map(item => (
          <div key={item.title}>
            <h3 className="mt-8 text-xl font-semibold text-gray-900">{item.title}</h3>
            <p className={P_CLASS}>{item.body}</p>
          </div>
        ))}
      </ContentArticle>
      <CTA text={landingText.cta} />
    </>
  )
}
