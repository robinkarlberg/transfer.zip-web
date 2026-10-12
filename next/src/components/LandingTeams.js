import { englishLandingText } from "@/lib/landing/en"
import { ActivityIcon, EyeIcon, MailIcon, PaintbrushIcon, SendIcon, ShieldIcon, UserCheckIcon, UsersIcon } from "lucide-react"
import Link from "next/link"
import { IslandReveal } from "./IslandReveal"

export default function LandingTeams({ text = englishLandingText.teams, pricingHref = "/pricing" }) {
  const features = [
    { name: text.membersTitle, description: text.membersDescription, icon: UsersIcon },
    { name: text.oversightTitle, description: text.oversightDescription, icon: EyeIcon },
    { name: text.activityTitle, description: text.activityDescription, icon: ActivityIcon },
    { name: text.sharedTitle, description: text.sharedDescription, icon: PaintbrushIcon },
  ]

  const stats = [
    { label: text.members, value: "6/8" },
    { label: text.transfersThisMonth, value: "42" },
    { label: text.totalDownloads, value: "318" },
  ]

  const events = [
    { icon: MailIcon, ...text.invited },
    { icon: SendIcon, ...text.created },
    { icon: ShieldIcon, ...text.roleChanged },
    { icon: UserCheckIcon, ...text.joined },
  ]

  return (
    <section className="bg-white py-24 sm:py-32" id="teams">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-sans text-base/7 font-semibold text-primary">{text.eyebrow}</h2>
          <p className="mt-2 font-heading text-pretty text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-balance">
            {text.title}
          </p>
          <p className="mt-6 text-lg/8 text-gray-600">
            {text.description}
          </p>
        </div>
      </div>

      <div className="mx-auto mt-16 grid max-w-6xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <div>
          <dl className="space-y-10">
            {features.map((feature) => (
              <div key={feature.name} className="relative pl-16">
                <dt className="text-lg font-bold text-gray-900">
                  <div className="absolute left-0 top-0 flex size-10 items-center justify-center rounded-lg bg-primary text-white">
                    <feature.icon size={16} />
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-2 text-base/7 text-gray-600">{feature.description}</dd>
              </div>
            ))}
          </dl>
          <Link
            href={pricingHref}
            className="mt-10 ml-16 inline-flex rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-primary-700 shadow-sm ring-1 ring-inset ring-primary-200 hover:ring-primary-300"
          >
            {text.button} &rarr;
          </Link>
        </div>

        <div aria-hidden="true" className="space-y-3 rounded-2xl bg-gray-50 p-6 sm:p-8">
          <IslandReveal>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.label} className="flex flex-row-reverse items-baseline justify-between gap-3 rounded-xl bg-white p-3.5 sm:flex-col sm:items-stretch sm:justify-start sm:gap-1">
                  <p className="text-2xl font-bold tabular-nums text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500 sm:text-xs">{stat.label}</p>
                </div>
              ))}
            </div>
          </IslandReveal>

          <IslandReveal delay={300}>
            <div className="rounded-xl bg-white p-3.5">
              <p className="text-sm font-semibold text-gray-900">{text.recentActivity}</p>
              <ul className="mt-2 divide-y divide-gray-100">
                {events.map((event) => (
                  <li key={event.action} className="flex items-start gap-2.5 py-2.5 last:pb-0">
                    <event.icon size={16} className="mt-0.5 shrink-0 text-gray-400" />
                    <div className="min-w-0">
                      <p className="text-sm text-gray-800">
                        <span className="font-semibold text-gray-900">{event.actor}</span> {event.action}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500">{event.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </IslandReveal>
        </div>
      </div>
    </section>
  )
}
