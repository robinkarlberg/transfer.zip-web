import Link from "next/link";

export default function ({ children }) {
  return (
    <div className="bg-white px-6 py-32 lg:px-8">
      <div className="mx-auto max-w-3xl text-base leading-7 text-gray-700">
        <p className="text-base font-semibold leading-7 text-primary"><Link href="/howto">How To</Link></p>
        {children}
      </div>
    </div>
  )
}