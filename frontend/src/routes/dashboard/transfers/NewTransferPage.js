import { useContext, useMemo, useState } from "react";
import { newTransfer, uploadTransferFiles } from "../../../Api";
import GenericPage from "../../../components/dashboard/GenericPage";
import FileUpload from "../../../components/elements/FileUpload";
import { useNavigate, useRevalidator } from "react-router-dom";
import Progress from "../../../components/elements/Progress";
import { DashboardContext } from "../Dashboard";

export default function NewTransferPage({ }) {

  const revalidator = useRevalidator()
  const { setSelectedTransferId } = useContext(DashboardContext)

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
    revalidator.revalidate()
    navigate(`/app/transfers`, { replace: true })
    setSelectedTransferId(transfer.id)
  }

  return (
    <GenericPage title={"New Transfer"}>
      <div className="w-full max-w-96">
        <FileUpload onFiles={handleFiles} progressElement={<Progress max={totalBytes} now={bytesTransferred} unit={"%"} />} showProgress={!!filesToUpload} />
      </div>
    </GenericPage>
  )
}