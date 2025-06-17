import BIcon from "@/components/BIcon";

export default function ({ }) {
  return (
    <>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Privacy Policy</h1>
      <p className="mt-6 text-xl leading-8">
        We are committed to collecting as little data as absolutely needed to keep the service running. We handle your personal information with the utmost care and respect, ensuring that it is never ever sold for profit. This privacy policy details our minimal data collection practices and our dedication to protecting your personal information when you use our services.
      </p>
      <p className="mt-6 text-xl leading-8">
        This policy applies to our paid services, where your files are stored on our servers. If you are using <nobr><i>Quick Share</i></nobr>, this policy does not apply, as we can not collect any information from you at all.
      </p>
      <div className="mt-10 max-w-2xl">
        <p>
          &rarr; We collect the following information about you:
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
              <strong className="font-semibold text-gray-900">Email.</strong> If you create an account, your email address is used for communication
              purposes, occasionally for promotional purposes (reminder to finish signup), and will not be shared with third parties.
            </span>
          </li>
          <li className="flex gap-x-3">
            <BIcon name={"check-circle"} aria-hidden="true" className="mt-1 h-5 w-5 flex-none text-primary" />
            <span>
              <strong className="font-semibold text-gray-900">File Metadata.</strong> When using our paid services, we save metadata such file name, file size and file type, to provide our service. When a transfer is deleted, all metadata is instantly deleted as well, without a trace. <nobr><i>Quick Share</i></nobr> works completely seperately, and can not collect any of this data.
            </span>
          </li>
        </ul>
        <p className="mt-8">
          <strong className="font-semibold text-gray-900">Purpose of Data Collection.</strong> If using an account, your email is used for account recovery, to prevent spam, and to inform you about special offers and updates. If using an account, data related to files is used solely to facilitate secure file transfers between users.
        </p>
        <p className="mt-8">
          <strong className="font-semibold text-gray-900">Data Sharing.</strong> We do not share any of your personal information with third-party providers, this is against our core values. We keep the site running using Google Adsense and subscriptions, not your data. If you do not have a transfer.zip account, we are unable to store any of your data.
        </p>
        <p className="mt-8">
          <strong className="font-semibold text-gray-900">Data Retention.</strong> If using an account, we store your data until your transfer is deleted, or your account deleted. You can request data deletion by sending an email to {process.env.NEXT_PUBLIC_SUPPORT_EMAIL}.
        </p>
        <p className="mt-8">
          <strong className="font-semibold text-gray-900">Data Security.</strong> We prioritize the security of your data. The "Quick Share" feature ensures that files are never stored on our servers but are streamed directly between devices using WebRTC peer-to-peer technology with end-to-end encryption using an AES-GCM 256-bit key. For normal file transfers, files are stored encrypted at rest using AES256 bit encryption.
        </p>
        <p className="mt-8">
          <strong className="font-semibold text-gray-900">User Rights.</strong> You have the right to access, modify, or delete your data. To exercise these rights, you can delete your account via the account page or send a request to {process.env.NEXT_PUBLIC_SUPPORT_EMAIL} for data deletion and related inquiries.
        </p>
        <p className="mt-8">
          <strong className="font-semibold text-gray-900">Cookies.</strong> We use only a functional session cookie named <code>token</code> to enable login functionality. This cookie is essential for the operation of our services. We use no tracking cookies, or track you in any other way.
        </p>
        <p className="mt-8">
          <strong className="font-semibold text-gray-900">Policy Updates.</strong> We reserve the right to update this privacy policy at any time without prior notice. Changes to the privacy policy will be posted on this page.
        </p>
        <p className="mt-8">
          <strong className="font-semibold text-gray-900">Compliance.</strong> We comply with the General Data Protection Regulation (GDPR). You have rights under the GDPR, including the right to access, correct, or delete your personal data.
        </p>
        <p className="mt-8">
          <strong className="font-semibold text-gray-900">Consent.</strong> By creating an account, you consent to the collection and use of your information as described in this privacy policy.
        </p>
        <p className="mt-8">
          For questions regarding this policy, <a href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL}`} className="text-primary hover:text-primary-light hover:underline">contact us</a>.
        </p>
      </div>
    </>
  )
}