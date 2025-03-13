import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { newTransfer, sendTransferByEmail, uploadTransferFiles } from "../../../Api";
import GenericPage from "../../../components/dashboard/GenericPage";
import FileUpload from "../../../components/elements/FileUpload";
import { useLocation, useNavigate, useRevalidator, useRouteLoaderData } from "react-router-dom";
import Progress from "../../../components/elements/Progress";
import { DashboardContext } from "../Dashboard";
import { AuthContext } from "../../../providers/AuthProvider";
import BIcon from "../../../components/BIcon";
import { ApplicationContext } from "../../../providers/ApplicationProvider";
import { Radio, RadioGroup } from "@headlessui/react";

function AddedEmailField({ email, onAction }) {
  return (
    <li className="px-2 py-1 text-sm group flex relative">
      <span className="text-gray-600">{email}</span>
      <button type="button" onClick={() => onAction("delete", email)} className="bg-white rounded border px-1 absolute right-2 opacity-0 group-hover:opacity-100"><BIcon name={"x-lg"} /></button>
    </li>
  )
}

export default function NewTransferPage({ }) {
  const revalidator = useRevalidator()
  const { user } = useContext(AuthContext)
  const { displayErrorModal } = useContext(ApplicationContext)
  const { storage, setSelectedTransferId, setShowUpgradeModal, hideSidebar } = useContext(DashboardContext)
  const { settings } = useRouteLoaderData("dashboard")

  const { EXPIRATION_TIMES } = settings

  const navigate = useNavigate()
  const { state } = useLocation()

  const [filesToUpload, setFilesToUpload] = useState(null)
  const [uploadingFiles, setUploadingFiles] = useState(false)
  const [emailRecipients, setEmailRecipients] = useState([])

  const [direction, setDirection] = useState("send")

  const formRef = useRef(null)
  const emailRef = useRef(null)

  useEffect(() => {
    hideSidebar()
  }, [])

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
    if (emailRecipients.length > 0) {
      await sendTransferByEmail(transfer.id, emailRecipients)
    }
    revalidator.revalidate()
    navigate(`/app/transfers`, { replace: true })
    setSelectedTransferId(transfer.id)
  }

  const handleCreateLinkClicked = async e => {
    
  }

  const handleEmailAdd = () => {
    if (user.plan == "starter" && emailRecipients.length >= 25) {
      displayErrorModal("With the Starter plan, you can only send a file transfer to up to 25 email recipients at once. Upgrade to Pro to send up to 200 emails per transfer.")
      return
    }
    if (user.plan == "pro" && emailRecipients.length >= 200) {
      displayErrorModal("With the Pro plan, you can only send a file transfer to up to 200 email recipients at once.")
      return
    }

    const value = emailRef.current.value.trim();

    // Basic email validation regex pattern
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (emailPattern.test(value) && emailRecipients.indexOf(value) == -1) {
      setEmailRecipients([...emailRecipients, value]);
      emailRef.current.value = "";
    } else {
      // alert("Please enter a valid email address.");
    }
  }

  const handleEmailFieldAction = (action, email) => {
    if (action == "delete") {
      setEmailRecipients(emailRecipients.filter(v => v !== email))
    }
  }

  const handleEmailInputKeyDown = e => {
    if (e.key === "Enter") {
      handleEmailAdd()
      e.preventDefault()
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-stretch sm:bg-gray-50">
      <div className="">
        <h1 className="text-3xl sm:text-4xl font-bold text-center mt-4 mb-2 sm:mt-12 sm:mb-8">New Transfer</h1>
        <div className="flex flex-col gap-4">
          {tooLittleStorage && (
            <div className="w-full max-w-96 px-4 sm:px-0">
              <button onClick={() => setShowUpgradeModal(true)} className="w-full shadow-sm text-start rounded-lg text-white bg-red-500 px-4 py-3 group transition-colors hover:bg-red-600">
                <h5 className="font-semibold text-sm"><span className="group-hover:underline">Storage full</span> <span className="group-hover:ms-1 transition-all">&rarr;</span></h5>
                <p className="font-medium text-sm">
                  Upgrade your subscription to send up to 1TB of files.
                </p>
              </button>
            </div>
          )}
          <div className="mx-auto w-full max-w-96 sm:shadow-sm sm:rounded-2xl sm:border bg-white">
            <div className="flex justify-center mt-2 sm:mt-4 mb-4">
              <fieldset aria-label="Transfer direction">
                <RadioGroup
                  value={direction}
                  onChange={setDirection}
                  className="grid grid-cols-2 gap-x-1 rounded-full p-1 text-center text-xs font-semibold leading-5 ring-1 ring-inset ring-gray-200"
                >
                  <Radio
                    key={"send"}
                    value={"send"}
                    className="cursor-pointer rounded-full px-2.5 py-1 text-gray-500 data-[checked]:bg-primary data-[checked]:text-white"
                  >
                    Send
                  </Radio>
                  <Radio
                    key={"receive"}
                    value={"receive"}
                    className="cursor-pointer rounded-full px-2.5 py-1 text-gray-500 data-[checked]:bg-primary data-[checked]:text-white"
                  >
                    Receive
                  </Radio>
                </RadioGroup>
              </fieldset>
            </div>
            <form onSubmit={e => e.preventDefault()} ref={formRef} className="grid grid-cols-3 gap-y-6 gap-x-2 px-6">
              {direction == "receive" && <div className="col-span-full">
                <p className="text-gray-600 text-sm font-medium">
                  Create a link where others can send files to you.
                </p>
              </div>}
              {direction == "send" && <div className="col-span-2">
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
              </div>}
              {direction == "receive" && <div className="col-span-2">
                <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">
                  Recipient<span className="ms-2 text-gray-400 font-normal text-xs">Optional</span>
                </label>
                <div className="relative mt-2 flex items-center">
                  <input
                    id="email"
                    placeholder="user@example.com"
                    name="email"
                    type="email"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>}
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
              {direction == "send" && <div className="col-span-full">
                <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">
                  Recipients<span className="ms-2 text-gray-400 font-normal text-xs">Optional</span>
                </label>
                <div className="relative mt-2 flex items-center">
                  <input
                    ref={emailRef}
                    onKeyDown={handleEmailInputKeyDown}
                    id="email"
                    placeholder="user@example.com"
                    type="email"
                    className="block w-full rounded-md border-0 py-1.5 pr-28 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                  />
                  <div className="absolute inset-y-0 right-0 flex py-1.5 pr-1.5">
                    <button type="button" onClick={handleEmailAdd} className="inline-flex items-center rounded border border-gray-200 px-1 pe-1.5 font-sans text-xs text-primary font-medium bg-white hover:bg-gray-50">
                      <BIcon name={"plus-lg"} className={"mr-1 ms-1"} />Add Email
                    </button>
                  </div>
                </div>
                <ul className="max-h-40 overflow-y-auto overflow-x-hidden">
                  {emailRecipients.map((email, index) => <AddedEmailField key={index} email={email} onAction={handleEmailFieldAction} />)}
                </ul>
              </div>}
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
            <div className={`col-span-full ${direction == "send" ? "block" : "hidden"}`}>
              <FileUpload headless initialFiles={state?.files} onFilesChange={setFilesToUpload} onFiles={handleFiles} progressElement={<Progress max={totalBytes} now={bytesTransferred} showUnits={true} />} showProgress={uploadingFiles} disabled={tooLittleStorage} />
            </div>
            {direction == "receive" && <div className="col-span-full">
              <div className="pb-4 flex px-6 mt-4">
                <button onClick={handleCreateLinkClicked} type="button" className="ms-auto text-white px-2 py-1 rounded-lg shadow bg-primary hover:bg-primary-light disabled:bg-primary-lighter">Create Link &rarr;</button>
              </div>
            </div>}
          </div>
        </div>
      </div>
    </div>
  )
}