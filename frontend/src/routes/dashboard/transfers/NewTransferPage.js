import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { newTransfer, uploadTransferFiles } from "../../../Api";
import GenericPage from "../../../components/dashboard/GenericPage";
import FileUpload from "../../../components/elements/FileUpload";
import { useLocation, useNavigate, useRevalidator, useRouteLoaderData } from "react-router-dom";
import Progress from "../../../components/elements/Progress";
import { DashboardContext } from "../Dashboard";
import { AuthContext } from "../../../providers/AuthProvider";
import BIcon from "../../../components/BIcon";

export default function NewTransferPage({ }) {
  const revalidator = useRevalidator()
  const { user } = useContext(AuthContext)
  const { storage, setSelectedTransferId, setShowUpgradeModal } = useContext(DashboardContext)
  const { settings } = useRouteLoaderData("dashboard")

  const { EXPIRATION_TIMES } = settings

  const navigate = useNavigate()
  const { state } = useLocation()

  const [filesToUpload, setFilesToUpload] = useState(null)
  const [uploadingFiles, setUploadingFiles] = useState(false)

  const formRef = useRef(null)

  const totalBytes = useMemo(() => {
    if (filesToUpload) {
      return filesToUpload.reduce((total, file) => total + file.size, 0);
    }
    return 0;
  }, [filesToUpload]);
  const [bytesTransferred, setBytesTransferred] = useState(0)

  const tooLittleStorage = useMemo(() => storage ? totalBytes > storage.maxBytes - storage.usedBytes : false, [totalBytes, storage])

  const handleFiles = async files => {
    const formData = new FormData(formRef.current)

    const form = formRef.current;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    setFilesToUpload(files) // Just to be safe
    setUploadingFiles(true)

    const name = formData.get("name")
    const description = formData.get("description")
    const expiresInDays = formData.get("expiresInDays")

    const { transfer } = await newTransfer({ name, description, expiresInDays })

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
      <div className="flex flex-col-reverse lg:flex-row gap-4">
        <div className="w-full max-w-96">
          <form ref={formRef} className="grid grid-cols-3 gap-y-6 gap-x-2">
            <div className="col-span-2">
              <label htmlFor="name" className="block text-sm/6 font-medium text-gray-900">
                Name
              </label>
              <div className="mt-2">
                <input
                  id="name"
                  placeholder="Untitled Transfer"
                  name="name"
                  type="text"
                  required={true}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm/6"
                />
              </div>
            </div>
            <div className="col-span-1">
              <label htmlFor="expiresInDays" className="block text-sm/6 font-medium text-gray-900">
                Expires
              </label>
              <div className="mt-2">
                <select
                  id="expiresInDays"
                  name="expiresInDays"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm/6"
                >
                  {/* <option value={7}>7 days</option>
                <option value={14}>14 days</option>
                <option value={30} disabled>30 days</option>
                <option value={180} disabled>6 months</option>
                <option value={365} disabled>1 year</option> */}
                  {EXPIRATION_TIMES.map(item => <option key={item.days} value={item.days} disabled={!item[user.plan]}>{item.period}</option>)}
                </select>
              </div>
            </div>
            <div className="col-span-2">
              <label htmlFor="name" className="block text-sm/6 font-medium text-gray-900">
                Receipient Email<span className="ms-2 text-gray-400 font-normal text-xs">Optional</span>
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  placeholder="user@example.com"
                  name="email"
                  type="email"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm/6"
                />
              </div>
            </div>
            <div className="col-span-full">
              <label htmlFor="description" className="block text-sm/6 font-medium text-gray-900">
                Message<span className="ms-2 text-gray-400 font-normal text-xs">Optional</span>
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
          </form>
          <hr className="col-span-full my-6 mx-2" />
          <div className="col-span-full">
            <FileUpload initialFiles={state?.files} onFilesChange={setFilesToUpload} onFiles={handleFiles} progressElement={<Progress max={totalBytes} now={bytesTransferred} />} showProgress={uploadingFiles} disabled={tooLittleStorage} />
          </div>
        </div>
        {tooLittleStorage && (
          <div className="w-full max-w-96">
            <button onClick={() => setShowUpgradeModal(true)} className="w-full shadow-sm text-start rounded-lg text-white bg-red-500 px-4 py-3 group transition-colors hover:bg-red-600">
              <h5 className="font-semibold text-sm"><span className="group-hover:underline">Storage full</span> <span className="group-hover:ms-1 transition-all">&rarr;</span></h5>
              <p className="font-medium text-sm">
                Upgrade your subscription to send up to 1TB of files.
              </p>
            </button>
          </div>
        )}
      </div>
    </GenericPage>
  )
}