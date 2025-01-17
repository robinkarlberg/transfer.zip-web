import BIcon from "../../components/BIcon";

export default function TermsAndConditionsPage({ }) {
  return (
    <div className="bg-white px-6 py-32 lg:px-8">
      <div className="mx-auto max-w-3xl text-base leading-7 text-gray-700">
        <p className="text-base font-semibold leading-7 text-primary">Legal</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Terms and Conditions</h1>
        <p className="mt-6 text-xl leading-8">
          Welcome to {process.env.REACT_APP_SITE_NAME}. By accessing or using our website and services, you agree to be bound by these Terms and Conditions. Please carefully review the following terms.
        </p>
        <div className="mt-10 max-w-2xl">
          <p>
            We provide a platform to facilitate seamless sponsorships for your content. By using our services, you ensure that all information provided is accurate and complies with applicable laws. Our platform is currently in an invite-only phase, you can join our waitlist to get access as soon as possible.
          </p>
          <ul role="list" className="mt-8 max-w-xl space-y-8 text-gray-600">
            <li className="flex gap-x-3">
              <BIcon name={"shield-slash"} aria-hidden="true" className="mt-1 h-5 w-5 flex-none text-primary" />
              <span>
                <strong className="font-semibold text-gray-900">Prohibited Content.</strong> Our platform strictly prohibits any adult, malicious, or illegal content. Violations may result in immediate termination of service.
              </span>
            </li>
            <li className="flex gap-x-3">
              <BIcon name={"file-earmark-text"} aria-hidden="true" className="mt-1 h-5 w-5 flex-none text-primary" />
              <span>
                <strong className="font-semibold text-gray-900">Acceptance of Terms.</strong> By using our services, you agree to comply with all applicable laws and these Terms and Conditions in full. You agree to adhere to the guidelines specified in the <a href="https://stripe.com/legal/ssa" target="_blank" rel="noopener noreferrer" className="text-primary underline">Stripe Services Agreement</a> and the <a href="https://stripe.com/legal/restricted-businesses" target="_blank" rel="noopener noreferrer" className="text-primary underline">Stripe Restricted Businesses guidelines</a>.
              </span>
            </li>
            <li className="flex gap-x-3">
              <BIcon name={"lock"} aria-hidden="true" className="mt-1 h-5 w-5 flex-none text-primary" />
              <span>
                <strong className="font-semibold text-gray-900">Privacy and Account Termination.</strong> We are committed to protecting your privacy and ensuring secure transactions within our platform. Additionally, we reserve the right to close accounts at our discretion if we determine they do not comply with these Terms and Conditions.
              </span>
            </li>
          </ul>

          <p className="mt-8">
            <strong className="font-semibold text-gray-900">User Responsibilities.</strong> As an end-user, the onus of adherence to our platform's stipulations rests upon you. It is incumbent upon you to ensure that your conduct within the platform's ambit is not in contravention of any statutory obligations, causing detriment to any fellow user or the platform itself, either through commission or omission.
          </p>
          <p className="mt-8">
            <strong className="font-semibold text-gray-900">Disclaimer of Warranties.</strong> The services rendered herein are proffered on an "as is" and "as available" basis, devoid of any warranties, guarantees, or conditions of any kind, whether express, implied, statutory, or otherwise. This includes, without limitation, any implied warranties or conditions of merchantability, fitness for a particular purpose, title, or non-infringement, each of which is hereby disclaimed to the fullest extent permissible under law.
          </p>
          <p className="mt-8">
            <strong className="font-semibold text-gray-900">Limitation of Liability.</strong> Under no circumstances shall our platform, its affiliates, licensors, or service providers, be liable for any indirect, incidental, special, consequential, exemplary, or punitive damages, including, without limitation, lost revenues, lost profits, loss of business opportunity, goodwill, data, or other intangible losses, resulting from or relating to your use of or inability to use the services, irrespective of the nature of the asserted liability and including, without limitation, any breach of contract or loss which is purportedly unpredictable or unknown at the time of entering this agreement.
          </p>
        </div>
      </div>
    </div>
  )
}