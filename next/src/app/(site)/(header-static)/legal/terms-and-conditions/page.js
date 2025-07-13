import BIcon from "@/components/BIcon";

export default function TermsAndConditionsPage({ }) {
  return (
    <>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Terms and Conditions</h1>
      <p className="mt-6 text-xl leading-8">
        Welcome to {process.env.NEXT_PUBLIC_SITE_NAME}. By accessing or using our website and services, you agree to be bound by these Terms and Conditions. Please read them carefully.
      </p>
      <div className="mt-10 max-w-2xl">
        <p>
          We provide a platform to facilitate seamless transfers for your files. By using our services, you warrant that all information provided is accurate and complies with applicable laws.
        </p>
        <ul role="list" className="mt-8 max-w-xl space-y-8 text-gray-600">
          <li className="flex gap-x-3">
            <BIcon name={"file-earmark-text"} aria-hidden="true" className="mt-1 h-5 w-5 flex-none text-primary" />
            <span>
              <strong className="font-semibold text-gray-900">Services Provided.</strong> Subscribing to a paid plan grants a pool of <em>simultaneous</em> storage capacity. The current plans are&nbsp;
              <nobr><em>Starter</em> – 200&nbsp;GB</nobr> total active storage and&nbsp;
              <nobr><em>Pro</em> – 1&nbsp;TB</nobr> total active storage. The <i>Quick Transfer</i> feature (also referred to as “Quick Transfers” or “Quick Share”) has no file‑size limit and is provided free of charge while both parties keep their browser tab open.
            </span>
          </li>
          <li className="flex gap-x-3">
            <BIcon name={"shield-slash"} aria-hidden="true" className="mt-1 h-5 w-5 flex-none text-primary" />
            <span>
              <strong className="font-semibold text-gray-900">Prohibited Content.</strong> You may not upload or share any malicious, unlawful, or infringing content. Violations may result in immediate account termination and, where required, referral to law‑enforcement authorities.
            </span>
          </li>
          <li className="flex gap-x-3">
            <BIcon name={"clock-history"} aria-hidden="true" className="mt-1 h-5 w-5 flex-none text-primary" />
            <span>
              <strong className="font-semibold text-gray-900">Free Trial & Billing.</strong> New subscribers receive a 7‑day free trial. You can cancel at any time during the trial and will not be charged. Unless cancelled, your subscription converts to the paid plan you selected at the end of the 7‑day period and renews monthly until cancelled.
            </span>
          </li>
        </ul>

        <p className="mt-8">
          <strong className="font-semibold text-gray-900">User Responsibilities.</strong> You must comply with all platform rules and applicable laws, including copyright and malware regulations. You are responsible for any content you transmit.
        </p>

        <p className="mt-8">
          <strong className="font-semibold text-gray-900">Account Terms.</strong> You must create an account to access paid features. You agree to provide accurate information and to keep your credentials secure. You must be at least 16 years old or the minimum age required by the laws of your jurisdiction.
        </p>

        <p className="mt-8">
          <strong className="font-semibold text-gray-900">Fees and Payment.</strong> Subscription fees are billed monthly after any applicable free‑trial period. If you cancel during the free trial, no payment will be taken. If you cancel after billing has occurred, you will retain access to paid features until the end of your current billing cycle and no further charges will be made. Plan storage limits represent the <em>aggregate size of all stored transfers</em> at any one time. Prices and limits may change with 30 days’ notice.
        </p>

        <p className="mt-8">
          <strong className="font-semibold text-gray-900">Data Retention & Deletion.</strong> Paid transfers are stored only while (a) your subscription is active and (b) the total size of stored transfers remains within your plan’s limit. If your subscription lapses or is cancelled and not renewed within seven (7) days of the last paid day, all stored files may be permanently deleted. Quick Transfers are ephemeral and are deleted automatically when either party closes the transfer window.
        </p>

        <p className="mt-8">
          <strong className="font-semibold text-gray-900">Intellectual Property.</strong> Transfer.zip claims no ownership over user‑uploaded content but reserves the right to remove content that infringes third‑party rights or violates these Terms.
        </p>

        <p className="mt-8">
          <strong className="font-semibold text-gray-900">Prohibited Activities.</strong> You may not distribute copyright‑infringing material, malware, or engage in any illegal activity via the service.
        </p>

        <p className="mt-8">
          <strong className="font-semibold text-gray-900">Termination.</strong> We may suspend or terminate accounts that violate these Terms or pose a security or legal risk. If we terminate during a paid billing cycle for reasons not related to your breach, we may, at our sole discretion, provide a prorated refund.
        </p>

        <p className="mt-8">
          <strong className="font-semibold text-gray-900">Limitation of Liability.</strong> Transfer.zip is provided “as‑is.” To the maximum extent permitted by law, we will not be liable for indirect or consequential damages arising out of your use of the service.
        </p>

        <div className="mt-8" id="free-trial-policy">
          <p><strong className="font-semibold text-gray-900">Free Trial Policy.</strong> The 7‑day free trial is intended to let you evaluate our paid features risk‑free.</p>
          <ul className="list-disc pl-6">
            <li>You must provide valid payment details at sign‑up; no charge is made until the trial ends.</li>
            <li>You may cancel at any time during the 7‑day period through your dashboard or by contacting us at {process.env.NEXT_PUBLIC_SUPPORT_EMAIL}.</li>
            <li>If you do not cancel, the first monthly fee will be charged on day 8, and the subscription will renew monthly thereafter.</li>
            <li>Once your subscription has converted to paid, fees are non‑refundable except where required by mandatory consumer‑protection law.</li>
          </ul>
          <p className="mt-4">Statutory right of withdrawal: Consumers in the EU/EEA retain any non‑waivable rights under applicable distance‑selling regulations.</p>
        </div>

        <p className="mt-8">
          <strong className="font-semibold text-gray-900">Governing Law.</strong> These Terms are governed by the laws of Sweden. Disputes will be resolved in the courts of Sweden.
        </p>

        <p className="mt-8">
          <strong className="font-semibold text-gray-900">Modifications.</strong> We may modify these Terms at any time. We will notify registered users at least 30 days before changes affecting fees, plan limits, or material user rights take effect.
        </p>

        <p className="mt-8">
          <strong className="font-semibold text-gray-900">Contact Information.</strong> Questions or DMCA notices: {process.env.NEXT_PUBLIC_SUPPORT_EMAIL}.
        </p>

        <p className="mt-8"><strong>By using Transfer.zip you agree to these Terms. If you do not agree, please discontinue use of the service.</strong></p>
      </div>
    </>
  )
}