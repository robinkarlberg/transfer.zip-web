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
        <div className="grid grid-cols-3 space-y-6">
          <div className="col-span-2">
            <label htmlFor="title" className="block text-sm/6 font-medium text-gray-900">
              Title
            </label>
            <div className="mt-2">
              <input
                id="title"
                placeholder="Untitled Transfer"
                name="title"
                type="text"
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm/6"
              />
            </div>
          </div>
          <div className="col-span-full">
            <label htmlFor="description" className="block text-sm/6 font-medium text-gray-900">
              Description
            </label>
            <div className="mt-2">
              <textarea
                id="description"
                placeholder=""
                name="description"
                type="text"
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm/6"
              />
            </div>
          </div>
          <div className="col-span-1">
            <label htmlFor="expires" className="block text-sm/6 font-medium text-gray-900">
              Expires
            </label>
            <div className="mt-2">
              <select
                id="expires"
                placeholder="Untitled Transfer"
                name="expires"
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm/6"
              >
                <option>7 days</option>
                <option>14 days</option>
                <option>30 days</option>
              </select>
            </div>
          </div>
          <div className="col-span-full">
            <FileUpload onFiles={handleFiles} progressElement={<Progress max={totalBytes} now={bytesTransferred} unit={"%"} />} showProgress={!!filesToUpload} />
          </div>
        </div>
      </div>
    </GenericPage>
  )
}