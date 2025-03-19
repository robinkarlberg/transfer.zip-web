import { useMemo, useState } from "react";
import { getSettings, getUpload, newTransfer, uploadTransferFiles } from "../Api";
import FileUpload from "../components/elements/FileUpload";
import Progress from "./elements/Progress";
import { useLoaderData } from "react-router-dom";

export async function loader({ params }) {
  const [uploadResponse, settingsResponse] = await Promise.all([
    getUpload(params.secretCode),
    getSettings()
  ]);

  const { upload } = uploadResponse;

  return { upload, settings: settingsResponse };
}

export default function DownloadPageUpload({ }) {
  const { upload } = useLoaderData()

  const [uploadingFiles, setUploadingFiles] = useState(false)
  const [filesToUpload, setFilesToUpload] = useState(null)

  const totalBytes = useMemo(() => {
    if (filesToUpload) {
      return filesToUpload.reduce((total, file) => total + file.size, 0);
    }
    return 0;
  }, [filesToUpload]);
  const [bytesTransferred, setBytesTransferred] = useState(0)

  const handleFiles = async files => {
    const { transfer } = await newTransfer({ expiresInDays: 30, transferRequestSecretCode: upload.secretCode })

    setFilesToUpload(files) // just to be safe
    setUploadingFiles(true)

    await uploadTransferFiles(transfer.secretCode, files, progress => {
      setBytesTransferred(progress.bytesTransferred)
    })
  }

  return (
    <div className={`bg-white backdrop-blur-sm rounded-2xl border shadow-xl w-full flex flex-col max-w-96`}>
      <div className="p-6">
        {/* <h1 className="text-3xl font-semibold tracking-tight text-gray-900 text-start mb-4">You got files!</h1> */}
        <h2 className="font-bold text-xl/8 text-gray-800">{upload.name}</h2>
        <p className="text-gray-600">{upload.description || "No description"}</p>
      </div>
      <hr className="my-2 mx-6" />
      <div>
        <FileUpload headless onFilesChange={setFilesToUpload} onFiles={handleFiles} progressElement={<Progress max={totalBytes} now={bytesTransferred} showUnits={true} finishedText={"Files sent! You can now close this window."} />} showProgress={uploadingFiles} />
      </div>
    </div>
  )
}