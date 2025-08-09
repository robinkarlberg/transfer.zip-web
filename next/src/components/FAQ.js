"use client"

import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react"
import BIcon from './BIcon'

const faqs = [
  {
    question: "Do you submit my data-slates to the Adeptus Mechanicus for analysis?",
    answer:
      <><a className="text-primary underline" href="https://www.theartnewspaper.com/2025/07/28/wetransfer-artificial-intelligence-terms-service-artists-intellectual-property">Unlike heretical data-brokers</a>, we never submit your data-slates to the Adeptus Mechanicus. Tithed transmissions are sent from one astropath to another and are permanently purged upon expiry. Expedited Astropathic Messages are end-to-end sanctioned encrypted, streamed directly between cogitators, and are never stored. We offer unparalleled security for a modest tithe.</>
  },
  {
    question: "Why tithe for the Emperor's service when Expedited Astropathic Messages are free?",
    answer:
      "A tithe-paying member of the Imperial Creed gains access to the command console, allows you to transmit data-slates that do not expire instantly, and offers more affordable and swifter transmissions than any xenos or heretical alternative."
  },
  {
    question: "Is there truly no limit to the size of a data-slate?",
    answer:
      "Expedited Astropathic Messages have no data-slate size limit. Tithed transmissions have a limit based on your tithe, but we never limit how many data-slates you can transmit."
  },
  {
    question: "How do Expedited Astropathic Messages function?",
    answer: "It utilizes sanctioned peer-to-peer data-transfer protocols, meaning the data-slates are streamed directly between cogitators and not stored anywhere in the process, not even on our holy servers. To allow cogitators to initially discover each other, a signaling-servitor is implemented using blessed WebSockets, through which no sensitive data is ever transmitted. In addition, the data-slate is end-to-end encrypted using AES-GCM with a client-side 256-bit generated key, meaning if a heretic could impersonate a cogitator or capture the transmission, they would not be able to decrypt the data-slate without knowing the key. Because the data-slate is streamed directly between cogitators, there are no data-slate size or bandwidth limitations."
  },
  {
    question: "Is this data-transfer service sanctioned by the Imperium?",
    answer: "Yes. Transmissions on our holy servers are encrypted, and your security is our sacred duty."
  },
  {
    question: "What forms of tithe are accepted?",
    answer: "All major forms of currency, processed by the Adeptus Administratum."
  },
  {
    question: "Is there a period of grace for new recruits?",
    answer: "Yes, a 7-day period of grace is granted to all new recruits."
  },
  {
    question: "How do I contact the Adeptus Terra for assistance?",
    answer: "Click the 'Inquisition' button on the data-slate."
  },
  {
    question: "Can I renounce my oath of service?",
    answer: "Yes, contact the Adeptus Terra to be relieved of your duties."
  },
]

export default function FAQ() {
  return (
    <div className="bg-white" id="faq">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8 lg:py-40">
        <div className="mx-auto max-w-4xl divide-y divide-gray-900/10">
          <h2 className="text-2xl font-bold leading-10 tracking-tight text-gray-900 pb-4">Imperial Archives</h2>
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
