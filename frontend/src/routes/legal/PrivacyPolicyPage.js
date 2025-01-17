import BIcon from "../../components/BIcon";

export default function PrivacyPolicyPage({ }) {
  return (
    <div className="bg-white px-6 py-32 lg:px-8">
      <div className="mx-auto max-w-3xl text-base leading-7 text-gray-700">
        <p className="text-base font-semibold leading-7 text-primary">Legal</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Privacy Policy</h1>
        <p className="mt-6 text-xl leading-8">
          At {process.env.REACT_APP_SITE_NAME}, we prioritize ethical privacy practices, respecting your personal data without extensive tracking like Google Adsense. Our sponsor platform respects user privacy and digital rights, even <b>eliminating the need for cookies entirely.</b>
        </p>
        <div className="mt-10 max-w-2xl">
          <p>
            &rarr; TLDR; We value your trust and ensure a privacy-conscious experience.
          </p>
          <ul role="list" className="mt-8 max-w-xl space-y-8 text-gray-600">
            <li className="flex gap-x-3">
              <BIcon name={"check-circle"} aria-hidden="true" className="mt-1 h-5 w-5 flex-none text-primary" />
              <span>
                <strong className="font-semibold text-gray-900">Payment Information.</strong> We collect only the necessary payment
                information to process transactions securely and efficiently. This is shared with our parter Stripe to perform payments.
              </span>
            </li>
            <li className="flex gap-x-3">
              <BIcon name={"check-circle"} aria-hidden="true" className="mt-1 h-5 w-5 flex-none text-primary" />
              <span>
                <strong className="font-semibold text-gray-900">Email.</strong> Your email address is used solely for communication
                purposes and will not be shared with third parties.
              </span>
            </li>
            <li className="flex gap-x-3">
              <BIcon name={"check-circle"} aria-hidden="true" className="mt-1 h-5 w-5 flex-none text-primary" />
              <span>
                <strong className="font-semibold text-gray-900">Limited Data Collection.</strong> We prioritize your privacy and do not collect any further personal information beyond what is necessary.
              </span>
            </li>
          </ul>
          <p className="mt-8">
            For questions regarding this policy, <a href={`mailto:${process.env.REACT_APP_CONTACT_EMAIL}`} className="text-primary hover:text-primary-light hover:underline">contact us</a>.
          </p>
        </div>
      </div>
    </div>
  )
}