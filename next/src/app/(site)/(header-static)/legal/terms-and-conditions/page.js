import BIcon from "@/components/BIcon";

export default function TermsAndConditionsPage({ }) {
  return (
    <>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Terms and Conditions</h1>
      <p className="mt-6 text-xl leading-8">
        Welcome to {process.env.NEXT_PUBLIC_SITE_NAME}. By accessing or using our website and services, you agree to be bound by these Terms and Conditions. Please carefully review the following terms.
      </p>
      <div className="mt-10 max-w-2xl">
        <p>
          We provide a platform to facilitate seamless transfers for your files. By using our services, you ensure that all information provided is accurate and complies with applicable laws.
        </p>
        <ul role="list" className="mt-8 max-w-xl space-y-8 text-gray-600">
          <li className="flex gap-x-3">
            <BIcon name={"file-earmark-text"} aria-hidden="true" className="mt-1 h-5 w-5 flex-none text-primary" />
            <span>
              <strong className="font-semibold text-gray-900">Services Provided.</strong> Users can access the file transfer service by subscribing to our paid plans, which offer increased file size limits and longer file expiration times than competitors solutions. Files can be as large as the user's subscription plan allows. The service <nobr><i>Quick Transfer</i></nobr> has no file size limit and is provided free of charge for everyone.
            </span>
          </li>
          <li className="flex gap-x-3">
            <BIcon name={"shield-slash"} aria-hidden="true" className="mt-1 h-5 w-5 flex-none text-primary" />
            <span>
              <strong className="font-semibold text-gray-900">Prohibited Content.</strong> Our platform strictly prohibits any malicious or illegal content. Violations may result in immediate termination of service.
            </span>
          </li>
          <li className="flex gap-x-3">
            <BIcon name={"emoji-frown"} aria-hidden="true" className="mt-1 h-5 w-5 flex-none text-primary" />
            <span>
              <strong className="font-semibold text-gray-900">Refund Policy.</strong> We strive to provide the best possible experience for our users. If you are not satisfied with our paid services, you may be eligible for a refund under the "Refund Policy." section further down in this terms agreement.
            </span>
          </li>
        </ul>

        <p className="mt-8">
          <strong className="font-semibold text-gray-900">User Responsibilities.</strong> You are responsible for following all platform rules and guidelines, ensuring that your actions do not violate any laws or harm others in any way. This includes but is not limited to, avoiding the upload of any content that infringes on copyrights, distributes malware, or engages in any form of illegal activity. We are dedicated to maintaining a secure and reliable environment, and compliance with all applicable laws and regulations is crucial to ensuring the continued safety and integrity of users.
        </p>

        <p className="mt-8">
          <strong className="font-semibold text-gray-900">Account Terms.</strong> Users must create an account to access certain features of transfer.zip. There are no specific eligibility criteria or age restrictions unless required by law. Users must provide accurate and complete information during the registration process and are responsible for maintaining the confidentiality of their account credentials.
        </p>

        <p className="mt-8">
          <strong className="font-semibold text-gray-900">Fees and Payment.</strong> Subscriptions to transfer.zip services are billed monthly. Users who cancel their subscription will retain access to paid features until the end of their current billing cycle. Transfer.zip offers different plans, including Starter and Pro plans. The limit for Pro plan is initially set at 1TB, however the user can request to extend that limit by contacting us at {process.env.NEXT_PUBLIC_SUPPORT_EMAIL}, we will make a decision on a case-by-case basis, and may include raising the cost of the subscription.
        </p>

        <p className="mt-8">
          <strong className="font-semibold text-gray-900">Intellectual Property.</strong> Transfer.zip does not claim ownership of any content uploaded by users. However, we reserve the right to remove content that infringes on the rights of others or violates our terms. Users retain ownership of their content.
        </p>

        <p className="mt-8">
          <strong className="font-semibold text-gray-900">Prohibited Activities.</strong> Users are prohibited from uploading copyright-infringing content, distributing malware, or engaging in any activities that harm others. Users must not engage in any activity that violates applicable laws or regulations.
        </p>

        <p className="mt-8">
          <strong className="font-semibold text-gray-900">Termination.</strong> Transfer.zip reserves the right to terminate any account that violates our acceptable use policy, including but not limited to the distribution of malware or copyright-infringing content. We also reserve the right to terminate any account without providing a reason to maintain the security and integrity of our platform. Refunds for terminated accounts are at our discretion and depend on the nature and extent of any damage caused to our site and its reputation.
        </p>

        <p className="mt-8">
          <strong className="font-semibold text-gray-900">Limitation of Liability.</strong> While transfer.zip is committed to maintaining the functionality and security of our site, we are not liable for any damages or losses resulting from the use of our services. Users acknowledge that the use of Transfer.zip is at their own risk.
        </p>

        <div className="mt-8" id="refund-policy">
          <p><strong className="font-semibold text-gray-900">Refund Policy.</strong> At transfer.zip, we strive to provide the best possible experience for our users. If you are not satisfied with our paid services, you may be eligible for a refund under the following conditions:</p>
          <ul className="list-disc pl-6">
            <li>
              Refund requests must be made within 7 days of the initial subscription purchase.
            </li>
            <li>
              Refunds will only be considered for users who have not significantly utilized the service during this period. Significant utilization is defined as exceeding 10% of the storage limits allowed under the subscribed plan, or receiving 2 or more downloads.
            </li>
            <li>
              By default, refunds account for 100% of the invoiced amount, but decisions could be made on a case-by-case basis, especially if our service was heavily utilized.
            </li>
            <li>
              No refunds will be provided for renewals of ongoing subscriptions. Users must cancel their subscription before the renewal date to avoid charges for the next billing cycle.
            </li>
            <li>
              Refund requests for accounts terminated due to violations of our terms and conditions, including but not limited to the distribution of malicious content or copyright infringement, will not be entertained by default, however decisions can be made on a case-by-case basis.
            </li>
          </ul>

          <p>To request a refund, please contact us at {process.env.NEXT_PUBLIC_SUPPORT_EMAIL} with your account details and the reason for your refund request. We will review your request and respond within 7 business days. Approved refunds will be processed within 14 business days of approval.</p>
        </div>

        <p className="mt-8">
          <strong className="font-semibold text-gray-900">Governing Law.</strong> These terms and conditions are governed by and construed in accordance with the laws of the kingdom of Sweden. Any disputes arising from these terms will be resolved in the courts of the kingdom of Sweden.
        </p>

        <p className="mt-8">
          <strong className="font-semibold text-gray-900">Modifications.</strong> Transfer.zip reserves the right to modify these terms and conditions at any time without prior notice, including the terms regarding individual plans and their limits. Users are encouraged to review these terms periodically to stay informed of any changes. If the terms and limits regarding plans are changed, users will be informed 1 month in advance, and have the right to cancel their subscription before the changes take into effect.
        </p>

        <p className="mt-8">
          <strong className="font-semibold text-gray-900">Contact Information.</strong> For any questions or concerns regarding these terms and conditions, please contact us at {process.env.NEXT_PUBLIC_SUPPORT_EMAIL}.

          To report DMCA violations, please contact us at {process.env.NEXT_PUBLIC_CONTACT_EMAIL}.
        </p>

        <p className="mt-8"><strong>By using Transfer.zip, you agree to these terms and conditions. If you do not agree, please discontinue the use of our services.</strong></p>
      </div>
    </>
  )
}