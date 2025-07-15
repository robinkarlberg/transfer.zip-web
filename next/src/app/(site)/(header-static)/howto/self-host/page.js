import BIcon from "@/components/BIcon";

export default function ({ }) {
  return (
    <>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Host Your Own File Sharing Server with Transfer.zip</h1>
      <p className="mt-6 text-xl leading-8">

      </p>
      <div className="mt-10 max-w-2xl">
        <p>
          &rarr; In this guide, we will show you how to:
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
              <strong className="font-semibold text-gray-900">File Metadata.</strong> When using our paid services, we save metadata such file name, file size and file type, to provide our service. When a transfer is deleted, all metadata is instantly deleted as well, without a trace. <nobr><i>Quick Transfer</i></nobr> works completely seperately, and can not collect any of this data.
            </span>
          </li>
        </ul>
      </div>
    </>
  )
}