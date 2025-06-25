"use client"

import FileUpload from "@/components/elements/FileUpload"
import Progress from "@/components/elements/Progress";
import { useMemo, useState } from "react";

export default function () {
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
    // const { transfer } = await newTransfer({ expiresInDays: 30, transferRequestSecretCode: upload.secretCode })

    // setFilesToUpload(files) // just to be safe
    // setUploadingFiles(true)

    // await uploadTransferFiles(transfer.secretCode, files, progress => {
    //   setBytesTransferred(progress.bytesTransferred)
    // })
  }

  return (
    <div>
      <FileUpload headless onFilesChange={setFilesToUpload} onFiles={handleFiles} progressElement={<Progress max={totalBytes} now={bytesTransferred} showUnits={true} finishedText={"Files sent! You can now close this window."} />} showProgress={uploadingFiles} />
    </div>
  )
}