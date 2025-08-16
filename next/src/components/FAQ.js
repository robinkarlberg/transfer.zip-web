"use client"

import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react"
import BIcon from './BIcon'

const faqs = [
  {
    question: "Do you train AI models with my data?",
    answer:
      <><a className="text-primary underline" href="https://www.theartnewspaper.com/2025/07/28/wetransfer-artificial-intelligence-terms-service-artists-intellectual-property">Unlike WeTransfer</a>, we never train AI models with your data. Paid transfers are only sent from A to B and are permanently removed on expiry. Quick Transfers are end-to-end encrypted, streamed directly between peers, and are never stored. We offer unprecedented privacy for a very low price.</>
  },
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
    question: "How do Quick Transfers work?",
    answer: "It uses WebRTC for peer-to-peer data transfer, meaning the files are streamed directly between peers and not stored anywhere in the process, not even on transfer.zip servers. To let peers initially discover each other, a signaling server is implemented in NodeJS using WebSockets, which importantly no sensitive data is sent through. In addition, the file data is end-to-end encrypted using AES-GCM with a client-side 256 bit generated key, meaning if someone could impersonate a peer or capture the traffic, they would not be able to decrypt the file without knowing the key. Because the file is streamed directly between peers, there are no file size or bandwidth limitations."
  },
  {
    question: "Is Transfer.zip safe to use?",
    answer: "Yes. Transfers on our servers are encrypted, and your privacy is a priority."
  },
  {
    question: "What payment methods are accepted?",
    answer: "All major credit cards via Stripe."
  },
  {
    question: "Is there a free trial available?",
    answer: "Yes, a 7-day free trial is available for most users."
  },
  {
    question: "How do I contact support if I encounter an issue?",
    answer: "Click the 'Support' button on the site."
  },
  {
    question: "Can I cancel my account?",
    answer: "Yes, contact support to cancel your account."
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
