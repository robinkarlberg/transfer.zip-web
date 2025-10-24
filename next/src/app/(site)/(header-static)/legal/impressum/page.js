export default function ({ }) {
  return (
    <>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Impressum</h1>
      <p className="mt-6 text-xl leading-8">
        This legal disclosure (Impressum) is provided in accordance with applicable laws. It outlines the identity and contact details of the operator of this website and service.
      </p>

      <div className="mt-10 max-w-2xl space-y-6">
        <p>
          <strong className="font-semibold text-gray-900">Company:</strong><br />
          Robin Karlberg Technologies AB
        </p>
        <p>
          <strong className="font-semibold text-gray-900">Organisation Number:</strong><br />
          559549-4146
        </p>
        <p>
          <strong className="font-semibold text-gray-900">Address:</strong><br />
          Malakitgatan 6<br />
          22488 Lund<br />
          Sweden
        </p>
        <p>
          <strong className="font-semibold text-gray-900">Contact:</strong><br />
          <a href="mailto:contact@transfer.zip" className="text-primary hover:underline">contact@transfer.zip</a>
        </p>
      </div>
    </>
  )
}
