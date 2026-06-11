"use client"

import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react"
import BIcon from './BIcon'

const faqs = [
  {
    question: "Why pay for Transfer.zip when Quick Transfers is free?",
    answer:
      "A paid subscription unlocks the dashboard, lets you share files that don't expire instantly, and offers cheaper, faster transfers than competitors."
  },
  {
    question: "Is there really no file size limit?",
    answer:
      "Quick Transfers has no file size limit. Regular transfers have a limit based on your plan, but we never limit how many transfers you can send."
  },
  {
    question: "Is there a free trial available?",
    answer: "Yes, a 7-day free trial is available for most users."
  },
  {
    question: "Do you offer refunds?",
    answer: "Contact support and we'll sort it out. You can also cancel anytime — your plan stays active until the end of the current billing period."
  },
  {
    question: "Do you train AI models with my data?",
    answer:
      <><a className="text-primary underline" href="https://www.theartnewspaper.com/2025/07/28/wetransfer-artificial-intelligence-terms-service-artists-intellectual-property">Unlike WeTransfer</a>, we never train AI models with your data. Paid transfers are only sent from A to B and are permanently removed on expiry. Quick Transfers are end-to-end encrypted, streamed in real time, and are never stored. We offer unprecedented privacy for a very low price.</>
  },
  {
    question: "How do Quick Transfers work?",
    answer: "Files are streamed in real time from the sender's browser to the receiver's browser through our relay servers, and are not stored anywhere in the process, not even on transfer.zip servers. The file data is end-to-end encrypted using AES-GCM with a 256 bit key generated in your browser. The key is part of the link itself (in the URL fragment, which is never sent to any server), so the relay only ever sees encrypted bytes it cannot read — anyone capturing the traffic would not be able to decrypt the files without the link. Because nothing is stored, there are no file size limits; the transfer simply lasts as long as both browser tabs stay open."
  },
  {
    question: "Is Transfer.zip safe to use?",
    answer: "Yes. Transfers on our servers are encrypted, and your privacy is a priority."
  },
  {
    question: "What happens to my files when they expire?",
    answer: "Expired transfers are permanently deleted by an automated cleanup job — we don't keep backups or soft-deleted copies. Quick Transfers are never stored on our servers to begin with."
  },
  {
    question: "Do recipients need an account to download?",
    answer: "No. Anyone with the link can download — no signup, no email gate. The same goes for file request links: anyone can upload to you without an account."
  },
  {
    question: "Can I use my own domain?",
    answer: "Yes, on Pro and Teams. Point a subdomain like files.yourcompany.com at us with a single DNS record and your transfer links will use it instead of transfer.zip."
  },
  {
    question: "How does the Teams plan work?",
    answer: "One subscription, multiple users. The team owner is billed per seat ($15/user/month, or $10/user/month billed yearly), invites members, and each user gets their own 1TB of storage. Member management and brand profiles are centralized. Minimum 2 seats, maximum 25."
  },
  {
    question: "Can I self-host Transfer.zip?",
    answer:
      <>Yes — the entire codebase is open source. See the <a className="text-primary underline" target="_blank" href="https://github.com/robinkarlberg/transfer.zip-web?tab=readme-ov-file#self-hosting">self-hosting instructions on GitHub</a>.</>
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
    answer: "Yes. We're based in Sweden and fully GDPR compliant — you can delete your account and all associated data at any time from the dashboard, no email required."
  },
]

export default function FAQ() {
  return (
    <div className="bg-white" id="faq">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8 lg:py-40">
        <div className="mx-auto max-w-4xl divide-y divide-gray-900/10">
          <h2 className="text-2xl font-bold leading-10 tracking-tight text-gray-900 pb-4">Frequently asked questions</h2>
          <dl className="mt-10 space-y-6 divide-y divide-gray-900/10">
            {faqs.map((faq) => (
              <Disclosure key={faq.question} as="div" className="pt-2">
                <dt>
                  <DisclosureButton className="group flex w-full items-start justify-between text-left text-gray-900 pb-3">
                    <span className="text-base font-semibold leading-7">{faq.question}</span>
                    <span className="ml-6 flex h-7 items-center">
                      <BIcon name={"plus-lg"} aria-hidden="true" className="h-6 w-6 group-data-[open]:hidden" />
                      <BIcon name={"dash-lg"} aria-hidden="true" className="h-6 w-6 [.group:not([data-open])_&]:hidden" />
                    </span>
                  </DisclosureButton>
                </dt>
                <DisclosurePanel as="dd" className="mt-2 pr-12 pb-4">
                  <p className="text-base leading-7 text-gray-600">{faq.answer}</p>
                </DisclosurePanel>
              </Disclosure>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}
