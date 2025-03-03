import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react"
import BIcon from './BIcon'

const faqs = [
  {
    question: "Why pay for Transfer.zip when Quick Share is free?",
    answer:
      "Using Transfer.zip for free is already great for most people. However, if you are a professional or just want your files to be more accessible, you can pay for a subscription. This gives you access to the dashboard, and lets you share files that don't expire when you close the browser tab. The paid plan is also cheaper and faster than other sites like WeTransfer or Dropbox."
  },
  {
    question: "Is there really no file size limit?",
    answer:
      "There is no file size limit when using Quick Share, because the file is never stored on our servers. For transfers there are limits determined by your plan, because they will be stored on our servers."
  },
  {
    question: "How does Quick-Share work?",
    answer: "It uses WebRTC for peer-to-peer data transfer, meaning the files are streamed directly between peers and not stored anywhere in the process, not even on transfer.zip servers. To let peers initially discover each other, a signaling server is implemented in NodeJS using WebSockets, which importantly no sensitive data is sent through. In addition, the file data is end-to-end encrypted using AES-GCM with a client-side 256 bit generated key, meaning if someone could impersonate a peer or capture the traffic, they would not be able to decrypt the file without knowing the key. Because the file is streamed directly between peers, there are no file size or bandwidth limitations."
  },
  {
    question: "Is Transfer.zip safe to use?",
    answer: "Privacy and security is our top priority. The site was founded by an IT-security consultant, with many years of experience. Furthermore, your transfers are stored encrypted on our servers, meaning if an attacker could gain access to our servers hosting the files, they would not be able to steal your data."
  },
  {
    question: "What payment methods are accepted?",
    answer:
      "We accept all major credit cards using our payment processor Stripe.",
  },
  {
    question: "Do you accept PayPal?",
    answer:
      "Not at the moment. It will definitely be supported in the future.",
  },
  {
    question: "Is there a free trial available?",
    answer:
      "Not at the moment, it will be added in the future based on feedback."
  },
  {
    question: "How do I contact support if I encounter an issue?",
    answer:
      "You can contact our support team via the 'Support' button further down on the site.",
  },
  {
    question: "Can I cancel my account?",
    answer:
      "Yes, you can cancel your account by contacting support.",
  },
]

export default function FAQ() {
  return (
    <div className="bg-white" id="faq">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8 lg:py-40">
        <div className="mx-auto max-w-4xl divide-y divide-gray-900/10">
          <h2 className="text-2xl font-bold leading-10 tracking-tight text-gray-900">Frequently asked questions</h2>
          <dl className="mt-10 space-y-6 divide-y divide-gray-900/10">
            {faqs.map((faq) => (
              <Disclosure key={faq.question} as="div" className="pt-6">
                <dt>
                  <DisclosureButton className="group flex w-full items-start justify-between text-left text-gray-900">
                    <span className="text-base font-semibold leading-7">{faq.question}</span>
                    <span className="ml-6 flex h-7 items-center">
                      <BIcon name={"plus-lg"} aria-hidden="true" className="h-6 w-6 group-data-[open]:hidden" />
                      <BIcon name={"dash-lg"} aria-hidden="true" className="h-6 w-6 [.group:not([data-open])_&]:hidden" />
                    </span>
                  </DisclosureButton>
                </dt>
                <DisclosurePanel as="dd" className="mt-2 pr-12">
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
