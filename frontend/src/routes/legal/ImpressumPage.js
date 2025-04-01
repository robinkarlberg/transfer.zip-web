import BIcon from "../../components/BIcon";

export default function ImpressumPage({ }) {
  return (
    <div className="bg-white px-6 py-32 lg:px-8">
      <div className="mx-auto max-w-3xl text-base leading-7 text-gray-700">
        <p className="text-base font-semibold leading-7 text-primary">Legal</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Impressum</h1>
        <p className="mt-6 text-xl leading-8">
          This legal disclosure (Impressum) is provided in accordance with applicable laws. It outlines the identity and contact details of the operator of this website and service.
        </p>

        <div className="mt-10 max-w-2xl space-y-6">
          <p>
            <strong className="font-semibold text-gray-900">Business Name:</strong><br />
            Transfer.zip
          </p>
          <p>
            <strong className="font-semibold text-gray-900">Operator:</strong><br />
            Robin Karlberg
          </p>
          <p>
            <strong className="font-semibold text-gray-900">Address:</strong><br />
            Malakitgatan 6<br />
            22488 Lund<br />
            Sweden
          </p>
          <p>
            <strong className="font-semibold text-gray-900">Contact Email:</strong><br />
            <a href="mailto:contact@transfer.zip" className="text-primary hover:underline">contact@transfer.zip</a>
          </p>
          <p>
            <strong className="font-semibold text-gray-900">Business Type:</strong><br />
            Sole proprietorship (individual)
          </p>
        </div>
      </div>
    </div>
  )
}
