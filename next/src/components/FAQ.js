"use client"

import { englishLandingText } from "@/lib/landing/en";

import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react"
import { PlusIcon } from "lucide-react"
import Link from "next/link"
import SectionHeading from "./SectionHeading"

const faqs = [
  {
    question: "Why pay for Transfer.zip when Quick Transfers is free?",
    quick: true,
    answer:
      "A paid subscription unlocks the dashboard, lets you share files that don't expire instantly, and offers cheaper, faster transfers than competitors."
  },
  {
    question: "Is there really no file size limit?",
    quick: true,
    answer:
      "Quick Transfers has no file size limit. Regular transfers have a limit based on your plan, but we never limit how many transfers you can send."
  },
  {
    question: "Is there a free trial available?",
    answer: "Yes, a 7-day free trial is available for most users."
  },
  {
    question: "Do you offer refunds?",
    answer: "Contact support and we'll sort it out. You can also cancel anytime, and your plan stays active until the end of the current billing period."
  },
  {
    question: "Do you train AI models with my data?",
    quick: true,
    answer:
      <><a className="text-primary underline" href="https://www.theartnewspaper.com/2025/07/28/wetransfer-artificial-intelligence-terms-service-artists-intellectual-property">Unlike WeTransfer</a>, we never train AI models with your data. Paid transfers are only sent from A to B and are permanently removed on expiry. Quick Transfers are end-to-end encrypted, streamed in real time, and are never stored. We offer unprecedented privacy for a very low price.</>
  },
  {
    question: "How do Quick Transfers work?",
    quick: true,
    answer: "Files are streamed in real time from the sender's browser to the receiver's browser through our relay servers, and are not stored anywhere in the process, not even on transfer.zip servers. The file data is end-to-end encrypted using AES-GCM with a 256 bit key generated in your browser. The key is part of the link itself (in the URL fragment, which is never sent to any server), so the relay only ever sees encrypted bytes it cannot read. Anyone capturing the traffic would not be able to decrypt the files without the link. Because nothing is stored, there are no file size limits; the transfer simply lasts as long as both browser tabs stay open."
  },
  {
    question: "Is Transfer.zip safe to use?",
    answer: "Yes. Transfers on our servers are encrypted, and your privacy is a priority."
  },
  {
    question: "What happens to my files when they expire?",
    answer: "Expired transfers are permanently deleted by an automated cleanup job. We don't keep backups or soft-deleted copies. Quick Transfers are never stored on our servers to begin with."
  },
  {
    question: "Do recipients need an account to download?",
    quick: true,
    answer: "No. Anyone with the link can download without signing up or entering an email. The same goes for file request links: anyone can upload to you without an account."
  },
  {
    question: "Can I use my own domain?",
    answer: "Yes, on Pro and Teams. Point a subdomain like files.yourcompany.com at us with a single DNS record and your transfer links will use it instead of transfer.zip."
  },
  {
    question: "How does the Teams plan work?",
    answer: "One subscription, multiple users. The team owner pays per seat and invites members, and each user gets their own 1TB of storage. Member management and brand profiles are centralized. Minimum 2 seats, maximum 25."
  },
  {
    question: "Can I self-host Transfer.zip?",
    quick: true,
    answer:
      <>Yes, the entire codebase is open source. See the <a className="text-primary underline" target="_blank" href="https://github.com/robinkarlberg/transfer.zip-web?tab=readme-ov-file#self-hosting">self-hosting instructions on GitHub</a>.</>
  },
  {
    question: "What payment methods are accepted?",
    answer: "All major credit cards via Stripe."
  },
  {
    question: "How do I cancel my subscription or delete my account?",
    answer: "Both are self-service from the dashboard. Cancelling stops auto-renewal but you can keep using your plan until the end of the current billing period. Deleting permanently removes your account, transfers, and any active subscription."
  },
  {
    question: "Are you GDPR compliant?",
    answer: "Yes. We're based in Sweden and fully GDPR compliant. You can delete your account and all associated data at any time from the dashboard, no email required."
  },
]

export default function FAQ({ quickOnly, items = faqs, text = englishLandingText.faq }) {
  const shown = quickOnly ? items.filter(faq => faq.quick) : items

  return (
    <section className="bg-white" id="faq">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <SectionHeading
                align="left"
                eyebrow={text.eyebrow}
                title={text.title}
                description={<>{text.contactBefore} <Link href="/contact" className="font-semibold text-primary hover:underline">{text.contactLink}</Link>{text.contactAfter}</>}
              />
            </div>
          </div>
          <dl className="mt-12 space-y-3 lg:col-span-7 lg:mt-0">
            {shown.map((faq) => (
              <Disclosure
                key={faq.question}
                as="div"
                className="rounded-3xl bg-gray-50 px-5 transition-colors hover:bg-gray-100 data-[open]:bg-white data-[open]:shadow-sm data-[open]:ring-1 data-[open]:ring-gray-200 sm:px-6"
              >
                <dt>
                  <DisclosureButton className="group flex w-full items-center justify-between gap-6 py-4 text-left text-gray-900">
                    <span className="text-base/7 font-semibold">{faq.question}</span>
                    <span className="flex size-8 flex-none items-center justify-center rounded-full bg-white text-gray-500 ring-1 ring-gray-200 transition group-hover:text-primary group-data-[open]:bg-primary-600 group-data-[open]:text-white group-data-[open]:ring-primary-600">
                      <PlusIcon size={16} aria-hidden="true" className="transition-transform group-data-[open]:rotate-45" />
                    </span>
                  </DisclosureButton>
                </dt>
                <DisclosurePanel as="dd" className="pb-5 pr-12">
                  <p className="text-base/7 text-gray-600">{faq.answer}{faq.link && <> <a className="text-primary underline" href={faq.link.href} target="_blank" rel="noopener noreferrer">{faq.link.label}</a></>}</p>
                </DisclosurePanel>
              </Disclosure>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
