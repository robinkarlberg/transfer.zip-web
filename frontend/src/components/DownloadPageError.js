export default function DownloadPageError({ }) {
  return (
    <div className="text-center">
      <p className="text-base font-semibold text-primary">Not Found</p>
      <h1 className="mt-4 text-balance text-5xl font-semibold tracking-tight text-gray-900 sm:text-7xl">Invalid Link</h1>
      <p className="mt-6 text-pretty text-lg font-medium text-gray-500 sm:text-xl/8">This transfer does not exist or has expired.</p>
      <div className="mt-10 flex items-center justify-center gap-x-6">
        <a href="/" className="rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">Go back home &rarr;</a>
        {/* <a href="#" className="text-sm font-semibold text-gray-900">Contact support <span aria-hidden="true">&rarr;</span></a> */}
      </div>
    </div>
  )
}