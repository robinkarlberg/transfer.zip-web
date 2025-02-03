import { useMemo, useState } from "react";
import { newTransfer, uploadTransferFiles } from "../../../Api";
import GenericPage from "../../../components/dashboard/GenericPage";
import FileUpload from "../../../components/elements/FileUpload";
import { useNavigate } from "react-router-dom";

export default function NewTransferPage({ }) {

  const navigate = useNavigate()

  const [filesToUpload, setFilesToUpload] = useState(null)

  const totalBytes = useMemo(() => {
    if (filesToUpload) {
      return filesToUpload.reduce((total, file) => total + file.size, 0);
    }
    return 0;
  }, [filesToUpload]);

  const [bytesTransferred, setBytesTransferred] = useState(0)
  const percentTransferred = useMemo(() => Math.floor(totalBytes / bytesTransferred * 100))

  const handleFiles = async files => {
    const { transfer } = await newTransfer()
    setFilesToUpload(files)
    await uploadTransferFiles(transfer.id, files, progress => {
      console.log(progress)
      setBytesTransferred(progress.bytesTransferred)
    })
    navigate(`/app/transfers/${transfer.id}`, { replace: true })
  }

  return (
    <GenericPage title={"New Transfer"}>
      <div className="w-full max-w-96">
        <FileUpload onFiles={handleFiles} showOverlay={!!filesToUpload}>
          <div className="w-full">
            <div style={{ width: `${percentTransferred}%` }} className="h-2 rounded bg-primary inline-block"></div>
          </div>
        </FileUpload>
      </div>
    </GenericPage>
  )
}