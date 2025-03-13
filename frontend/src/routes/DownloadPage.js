import { useLoaderData } from "react-router-dom"
import { getDownload, getTransferAttachmentLink, getTransferDownloadLink, getSettings } from "../Api"
import TestimonialCloud from "../components/TestimonialCloud";
import BIcon from "../components/BIcon";
import { humanTimeUntil, parseTransferExpiryDate } from "../utils";
import { useMemo } from "react";
import { humanFileSize } from "../transferUtils";
import Features1 from "../components/Features1";
import Features2 from "../components/Features2";
import Features3 from "../components/Features3";
import FAQ from "../components/FAQ";
import FileUpload from "../components/elements/FileUpload";

export async function loader({ params }) {
  const [downloadResponse, settingsResponse] = await Promise.all([
    getDownload(params.secretCode),
    getSettings()
  ]);

  const { download } = downloadResponse;

  return { download, settings: settingsResponse };
}

export function HydrateFallback() {
  return <div>Loading...</div>
}

export default function DownloadPage({ }) {
  const { download } = useLoaderData()

  const expiryDate = useMemo(() => !download ? false : parseTransferExpiryDate(download.expiresAt), [download])

  const handleDownloadClicked = async e => {
    window.open(getTransferAttachmentLink(download) + "/zip", "_blank")
  }

  return (
    <div>
      <main className="grid min-h-[100vh] place-items-center px-6 py-24 sm:py-32 lg:px-8 relative">
        <svg
          aria-hidden="true"
          className="absolute inset-0 -z-10 h-full w-full stroke-gray-200 [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]"
        >
          <defs>
            <pattern
              x="50%"
              y={-1}
              id="83fd4e5a-9d52-42fc-97b6-718e5d7ee527"
              width={200}
              height={200}
              patternUnits="userSpaceOnUse"
            >
              <path d="M100 200V.5M.5 .5H200" fill="none" />
            </pattern>
          </defs>
          <svg x="50%" y={-1} className="overflow-visible fill-gray-50">
            <path
              d="M-100.5 0h201v201h-201Z M699.5 0h201v201h-201Z M499.5 400h201v201h-201Z M-300.5 600h201v201h-201Z"
              strokeWidth={0}
            />
          </svg>
          <rect fill="url(#83fd4e5a-9d52-42fc-97b6-718e5d7ee527)" width="100%" height="100%" strokeWidth={0} />
        </svg>
        {
          download.direction == "send" ?
            <div className="bg-white backdrop-blur-sm rounded-2xl border p-6 shadow-xl w-full max-w-80 min-h-96 flex flex-col justify-between">
              <div>
                {/* <h1 className="text-3xl font-semibold tracking-tight text-gray-900 text-start mb-4">You got files!</h1> */}
                <h2 className="font-bold text-xl/8 text-gray-800">{download.name}</h2>
                <p className="text-gray-600">{download.description || "No description"}</p>
                <hr className="my-2" />
                {download.files.length > 0 &&
                  <span><i className="bi bi-file-earmark me-1"></i>{download.files.length} File{download.files.length > 1 ? "s" : ""}</span>
                }
                <p className="text-gray-600">{humanFileSize(download.size, true)}</p>
              </div>
              <div>
                <div className="mt-auto text-center">
                  {expiryDate && <p className="text-gray-600 mb-1 text-sm">Expires in {humanTimeUntil(expiryDate)}</p>}
                </div>
                <div className="flex gap-2">
                  <button disabled className="text-gray-400 bg-white border shadow rounded-lg px-3 py-1 grow-0"><BIcon name={"search"} /> Preview</button>
                  <button onClick={handleDownloadClicked} className="text-white bg-primary shadow rounded-lg px-3 py-1 grow hover:bg-primary-light">Download</button>
                </div>
              </div>
            </div>
            :
            <div className="bg-white backdrop-blur-sm rounded-2xl border shadow-xl w-full max-w-96 flex flex-col">
              <div className="p-6">
                {/* <h1 className="text-3xl font-semibold tracking-tight text-gray-900 text-start mb-4">You got files!</h1> */}
                <h2 className="font-bold text-xl/8 text-gray-800">{download.name}</h2>
                <p className="text-gray-600">{download.description || "No description"}</p>
              </div>
              <hr className="my-2 mx-6" />
              <div>
                <FileUpload headless />
              </div>
            </div>
        }

      </main>
      <Features1 />
      <TestimonialCloud />
      <FAQ />
    </div>
  )
}