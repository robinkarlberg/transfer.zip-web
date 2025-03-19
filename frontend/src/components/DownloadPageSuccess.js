import { Outlet, useLoaderData } from "react-router-dom"
import { getDownload, getTransferAttachmentLink, getTransferDownloadLink, getSettings, uploadTransferFiles, newTransfer } from "../Api"
import TestimonialCloud from "../components/TestimonialCloud";
import BIcon from "../components/BIcon";
import { humanTimeUntil, parseTransferExpiryDate } from "../utils";
import { useMemo, useState } from "react";
import { humanFileSize } from "../transferUtils";

export async function loader({ params }) {
  const [downloadResponse, settingsResponse] = await Promise.all([
    getDownload(params.secretCode),
    getSettings()
  ]);

  const { download } = downloadResponse;

  return { download, settings: settingsResponse };
}

export default function DownloadPageSuccess({ }) {
  const { download } = useLoaderData()

  const expiryDate = useMemo(() => !download ? false : parseTransferExpiryDate(download.expiresAt), [download])

  const handleDownloadClicked = async e => {
    window.open(getTransferAttachmentLink(download) + "/zip", "_blank")
  }

  return (
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

  )
}