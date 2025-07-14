"use client"

import BIcon from "@/components/BIcon";
import FileUpload from "@/components/elements/FileUpload"
import Progress from "@/components/elements/Progress";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { newTransfer } from "@/lib/client/Api";
import { prepareTransferFiles, uploadFiles } from "@/lib/client/uploader";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";

export default function () {

  const [error, setError] = useState(false)

  const { secretCode } = useParams()

  const [finished, setFinished] = useState(false)

  const [uploadProgressMap, setUploadProgressMap] = useState(null)
  const [uploadingFiles, setUploadingFiles] = useState(false)
  const [filesToUpload, setFilesToUpload] = useState(null)

  const totalBytes = useMemo(() => {
    if (filesToUpload) {
      return filesToUpload.reduce((total, file) => total + file.size, 0);
    }
    return 0;
  }, [filesToUpload]);

  const bytesTransferred = useMemo(() => {
    if (!uploadProgressMap) return 0
    return uploadProgressMap.reduce((sum, item) => sum + item[1], 0)
  }, [uploadProgressMap])

  const handleFiles = async files => {
    setFilesToUpload(files) // Just to be safe
    setUploadingFiles(true)

    const transferFiles = prepareTransferFiles(files)

    // response: { idMap: [{ tmpId, id }, ...] } - what your API returned
    const { transfer, idMap } = await newTransfer({ expiresInDays: 30, files: transferFiles, transferRequestSecretCode: secretCode })

    const { results, failedPromises } = await uploadFiles(files, idMap, transfer, progress => setUploadProgressMap(progress))

    if (failedPromises.length > 0) {
      setError(true)
    }
    else {
      setFinished(true)
    }

    // router.replace(`/app/${transfer.id}`)
  }

  return (
    <div>
      <Dialog open={error} onOpenChange={setError}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>There was an error <BIcon name={"emoji-frown"} /></DialogTitle>
          </DialogHeader>
          <div className="text-gray-600">
            <p>Unfortunately, one or more files could not be uploaded properly. Press "Reload" to refresh the page and try again.</p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button onClick={() => window.location.reload()}>Reload</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <FileUpload headless onFilesChange={setFilesToUpload} onFiles={handleFiles} progressElement={<Progress max={totalBytes} now={bytesTransferred} finished={finished} showUnits={true} finishedText={"Files sent! You can now close this window."} />} showProgress={uploadingFiles} />
    </div>
  )
}