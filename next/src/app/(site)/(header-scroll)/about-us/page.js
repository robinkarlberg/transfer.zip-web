import Link from "next/link";
import LandingNav from "@/components/LandingNav";
import AuthConditional from "../AuthConditional";
import NoauthLandingHeaderCTAButton from "../NoauthLandingHeaderCTAButton";

const organizationProfiles = [
  "https://github.com/robinkarlberg/transfer.zip-web",
  process.env.NEXT_PUBLIC_FACEBOOK_URL,
  process.env.NEXT_PUBLIC_INSTAGRAM_URL,
  process.env.NEXT_PUBLIC_BLUESKY_URL,
  process.env.NEXT_PUBLIC_TWITTER_URL,
  process.env.NEXT_PUBLIC_GITHUB_URL,
].filter(Boolean);

export const metadata = {
  title: "About Transfer.zip",
  description: "Meet the people who maintain Transfer.zip and learn how its open-source file-sharing and browser file tools are built.",
  openGraph: {
    title: "About Transfer.zip",
    description: "Meet the people who maintain Transfer.zip and learn how its open-source file-sharing and browser file tools are built.",
    url: "https://transfer.zip/about-us",
    images: ["https://cdn.transfer.zip/og.png"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://transfer.zip/#organization",
      name: "Transfer.zip",
      url: "https://transfer.zip/",
      sameAs: organizationProfiles,
    },
    {
      "@type": "Person",
      "@id": "https://transfer.zip/about-us#robin-karlberg",
      name: "Robin Karlberg",
      url: "https://transfer.zip/about-us",
      sameAs: ["https://github.com/robinkarlberg"],
    },
  ],
};

export default function AboutPage() {
  const authCta = (
    <AuthConditional
      noauth={<NoauthLandingHeaderCTAButton />}
      auth={
        <Link
          href="/app/sent"
          className="flex items-center text-sm font-semibold text-gray-800 rounded-xl bg-white px-5 h-12 hover:bg-primary-50"
        >
          My Transfers <span aria-hidden="true">&rarr;</span>
        </Link>
      }
    />
  );

  return (
    <div className="relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="absolute inset-x-0 top-0 h-[34rem] overflow-hidden grain bg-linear-to-b from-primary-700 to-primary-300 -z-10 rounded-b-4xl" />

      <div className="relative isolate flex flex-col">
        <LandingNav rightSlot={authCta} />

        <main className="mx-auto w-full max-w-7xl px-6 lg:px-8 pb-28 pt-16">
          <div className="mx-auto max-w-3xl text-center mt-12 sm:mt-16">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl text-shadow-md fade-in-up">
              About Transfer.zip
            </h1>
            <p className="mt-5 text-lg leading-8 text-white text-shadow-sm fade-in-up-slow">
              Transfer.zip is an open-source file-sharing project led by Robin Karlberg and improved with help from contributors. It includes browser-based file tools, real-time encrypted transfers, and stored file transfers.
            </p>
          </div>

          <div className="mx-auto mt-20 grid max-w-5xl gap-6 md:grid-cols-2 fade-in-up-slow">
            <section className="rounded-2xl bg-white p-6 sm:p-8 shadow-xl ring-1 ring-gray-200">
              <p className="text-sm font-semibold text-primary-700">Maintainer</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">Robin Karlberg</h2>
              <p className="mt-4 leading-7 text-gray-600">
                Robin leads development of Transfer.zip. His work on the project covers local ZIP processing, encrypted browser file transfers, storage-backed transfers, and the infrastructure that connects them.
              </p>
              <div className="mt-6">
                <Link
                  href="https://github.com/robinkarlberg"
                  className="font-semibold text-primary underline underline-offset-4 hover:text-primary-500"
                >
                  View Robin&apos;s GitHub profile &rarr;
                </Link>
              </div>
            </section>

            <section className="rounded-2xl bg-white p-6 sm:p-8 shadow-xl ring-1 ring-gray-200">
              <p className="text-sm font-semibold text-primary-700">Open source</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">Built in public</h2>
              <p className="mt-4 leading-7 text-gray-600">
                The Transfer.zip source code and self-hosting documentation are public. Contributors can inspect how files are handled, report problems, suggest improvements, or run the service on their own infrastructure.
              </p>
              <div className="mt-6">
                <Link
                  href="https://github.com/robinkarlberg/transfer.zip-web"
                  className="font-semibold text-primary underline underline-offset-4 hover:text-primary-500"
                >
                  Explore the source code &rarr;
                </Link>
              </div>
            </section>
          </div>

          <section className="mx-auto mt-10 max-w-5xl rounded-2xl bg-white p-6 sm:p-8 shadow-xl ring-1 ring-gray-200">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">How Transfer.zip handles files</h2>
            <div className="mt-6 grid gap-6 md:grid-cols-3">
              <div>
                <h3 className="font-semibold text-gray-900">Browser file tools</h3>
                <p className="mt-2 leading-7 text-gray-600">
                  Tools such as the ZIP creator and archive extractor process files locally in the browser. Those files are not uploaded to Transfer.zip.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Quick Transfers</h3>
                <p className="mt-2 leading-7 text-gray-600">
                  Quick Transfers encrypt file data in the browser and stream it through a relay without storing the files on Transfer.zip servers.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Stored Transfers</h3>
                <p className="mt-2 leading-7 text-gray-600">
                  Stored Transfers send files from the browser to configured storage and remove them after the transfer expires.
                </p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
