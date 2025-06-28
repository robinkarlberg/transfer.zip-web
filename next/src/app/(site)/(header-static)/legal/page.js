import Link from "next/link";

export default function () {
  return (
    <>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Legal Information</h1>
      <p className="mt-6 text-xl leading-8">

      </p>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
        <Link
          href="/legal/privacy-policy"
          className="rounded-lg border border-gray-200 bg-gray-50 p-6 transition hover:shadow-md hover:bg-white"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Privacy Policy</h2>
          <p className="text-sm text-gray-600">Understand how we handle and protect your information.</p>
        </Link>
        <Link
          href="/legal/terms-and-conditions"
          className="rounded-lg border border-gray-200 bg-gray-50 p-6 transition hover:shadow-md hover:bg-white"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Terms & Conditions</h2>
          <p className="text-sm text-gray-600">The rules and guidelines you agree to when using our services.</p>
        </Link>
        <Link
          href="/legal/impressum"
          className="rounded-lg border border-gray-200 bg-gray-50 p-6 transition hover:shadow-md hover:bg-white"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Impressum</h2>
          <p className="text-sm text-gray-600">Legal information and company details as required by law.</p>
        </Link>
      </div>
    </>
  )
}