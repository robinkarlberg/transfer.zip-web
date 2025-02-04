import { useMemo, useState } from "react";
import { newTransfer, uploadTransferFiles } from "../../../Api";
import GenericPage from "../../../components/dashboard/GenericPage";
import FileUpload from "../../../components/elements/FileUpload";
import { useNavigate } from "react-router-dom";
import Progress from "../../../components/elements/Progress";

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
        <FileUpload onFiles={handleFiles} progressElement={<Progress max={totalBytes} now={bytesTransferred} title={"Uploading..."} />} showProgress={!!filesToUpload} />
      </div>
    </GenericPage>
  )
}