"use client"

import { DashboardContext } from "@/context/DashboardContext"
import { deleteTransfer, getTransferDownloadLink, putTransfer, sendTransferByEmail } from "@/lib/client/Api"
import { EXPIRATION_TIMES } from "@/lib/constants"
import { humanFileSize } from "@/lib/transferUtils"
import { parseTransferExpiryDate, tryCopyToClipboard } from "@/lib/utils"
import { DotIcon, LinkIcon, PencilIcon } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useContext, useMemo, useRef, useState } from "react"
import QRCode from "react-qr-code"
import Modal from "../elements/Modal"
import { Button } from "../ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"
import DashH2 from "./DashH2"
import GenericPage from "./GenericPage"
import { YesNo } from "./YesNo"

import logo from "@/img/icon.png"
import BIcon from "../BIcon"

export default function ({ user, transfer }) {

  const { displayNotification, displayErrorModal } = useContext(DashboardContext)

  const router = useRouter()

  const transferLink = getTransferDownloadLink(transfer)

  const handleCopy = async e => {
    if (await tryCopyToClipboard(transferLink)) {
      displayNotification("success", "Copied Link", "The Transfer link was successfully copied to the clipboard!")
    }
  }

  const handleLinkKeyDown = async e => {
    if (e.key === "Enter") {
      handleCopy()
      e.preventDefault()
    }
  }

  const expiryDate = parseTransferExpiryDate(transfer?.expiresAt)
  const formattedExpiryDate = expiryDate ? expiryDate.toISOString().split('T')[0] : ''

  const maxPlanExpirationDays = useMemo(() =>
    EXPIRATION_TIMES.filter(t => (user.plan == "pro" ? t.pro : t.starter)).reduce((max, current) =>
      current.days > max.days ? current : max, { days: -1 }).days, [EXPIRATION_TIMES])

  const maxExpiryDate = new Date(transfer?.createdAt || 0);
  maxExpiryDate.setDate(maxExpiryDate.getDate() + maxPlanExpirationDays);
  const formattedMaxExpiryDate = maxExpiryDate ? maxExpiryDate.toISOString().split('T')[0] : ''
  const formattedMinExpiryDate = new Date().toISOString().split('T')[0]

  const handleDateInputChange = async e => {
    const elem = e.target
    const value = elem.value

    const expiresAt = new Date(value)

    if (expiresAt <= new Date(formattedMinExpiryDate) || expiresAt > maxExpiryDate) {
      // elem.value = formattedExpiryDate
      return;
    }

    await putTransfer(transfer.id, { expiresAt })

    displayNotification("success", "Expiration Changed", `The expiration date was successfully changed to ${expiresAt.toLocaleDateString()}`)
    router.refresh()
  }

  const titleRef = useRef(null)
  const [editingTitle, setEditingTitle] = useState(false)

  const messageRef = useRef(null)
  const [editingMessage, setEditingMessage] = useState(false)

  const [showEmailList, setShowEmailList] = useState(false)
  const [showForwardTransfer, setShowForwardTransfer] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleSaveTitle = async e => {
    setEditingTitle(false)
    await putTransfer(transfer.id, { name: titleRef.current.value })
    router.refresh()
  }

  const handleSaveMessage = async e => {
    setEditingMessage(false)
    await putTransfer(transfer.id, { description: messageRef.current.value })
    router.refresh()
  }

  const handleShowEmailList = e => {
    setShowEmailList(true)
  }

  const handleSendByEmailFormSubmit = async e => {
    e.preventDefault()

    if (user.plan == "starter" && transfer.emailsSharedWith.length >= 25) {
      displayErrorModal("With the Starter plan, you can only send a file transfer to up to 25 email recipients at once. Upgrade to Pro to send up to 200 emails per transfer.")
      return
    }
    if (user.plan == "pro" && transfer.emailsSharedWith.length >= 200) {
      displayErrorModal("With the Pro plan, you can only send a file transfer to up to 200 email recipients at once.")
      return
    }

    const form = e.target

    // if (!form.checkValidity()) {
    //   form.reportValidity();
    //   return;
    // }

    const formData = new FormData(form)
    const email = formData.get("email")

    await sendTransferByEmail(transfer.id, [email])

    displayNotification("success", "Email sent", `The Transfer link was successfully sent to ${email}!`)
    setShowForwardTransfer(false)
    router.refresh()
  }

  const handleDelete = async () => {
    await deleteTransfer(transfer.id)
    setShowDeleteConfirm(false)
    router.replace(".")
  }

  const metadata = transfer.files.length > 0 &&
    <div className="flex items-end">
      <span>{transfer.files.length} File{transfer.files.length > 1 ? "s" : ""}</span>
      <DotIcon name={"dot"} />
      <span>{humanFileSize(transfer.size, true)}</span>
      <DotIcon name={"dot"} />
      <span>Created {new Date(transfer.createdAt).toLocaleDateString()}</span>
    </div>

  const title = (
    editingTitle ?
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <input className="rounded-xl border-0 ring-0" ref={titleRef} defaultValue={transfer.name}></input>
          <YesNo dark onYes={handleSaveTitle} onNo={() => setEditingTitle(false)} />
        </div>
      </div >
      :
      <DashH2>
        {transfer.name} <button onClick={() => setEditingTitle(true)} className="ms-1 text-2xl hover:text-gray-200"><PencilIcon /></button>
      </DashH2>
  )

  const dateInput = useMemo(() => {
    return (
      <input
        onChange={handleDateInputChange}
        defaultValue={formattedExpiryDate}
        id="expirationDate"
        name="expirationDate"
        type="date"
        min={formattedMinExpiryDate}
        max={formattedMaxExpiryDate}
        className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm/6"
      />
    )
  }, [transfer])

  return (
    <>
      <Modal title={`Shared with ${transfer?.emailsSharedWith?.length} emails`} icon={"envelope"} buttons={[
        { title: "Ok", onClick: () => setShowEmailList(false) }
      ]} show={showEmailList} onClose={() => setShowEmailList(false)}>
        {/* <p className="text-sm font-medium mb-1"></p> */}
        <ul className="text-start text-sm text-gray-600 list-inside list-disc min-w-60">
          {transfer?.emailsSharedWith?.map((entry, index) => <li key={index}>{entry.email}</li>)}
        </ul>
      </Modal>
      <Modal title={`Forward Transfer`} icon={"envelope-plus"} buttons={[
        { title: "Forward", form: "sendByEmailForm" },
        { title: "Cancel", onClick: () => setShowForwardTransfer(false) }
      ]} show={showForwardTransfer} onClose={() => setShowForwardTransfer(false)}>
        {/* <p className="text-sm font-medium mb-1"></p> */}
        <p className="text-sm text-gray-500">
          You can forward this transfer by entering an email address below. The email will include the title and message set for this transfer.
        </p>
        <form id="sendByEmailForm" onSubmit={handleSendByEmailFormSubmit}>
          <div className="mt-2">
            <input
              id="forwardEmail"
              placeholder="Email address"
              name="email"
              type="email"
              autoComplete="email"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm/6"
            />
          </div>
        </form>
      </Modal>
      <GenericPage category={"Sent"} title={transfer.name} titleComponent={title} side={metadata}>
        <div className="grid grid-cols-1 sm:grid-cols-3">
          <div className="order-2 sm:order-1 sm:col-span-2 p-4 pt-0 sm:p-6 bg-white rounded-b-xl rounded-t-none sm:rounded-xl flex flex-col sm:border-r sm:border-dashed">
            <div className="flex flex-row justify-between items-center gap-2 flex-wrap mb-4">
              <div className="relative flex items-center -top-1">
                <Image alt="Brand Profile Icon" className="rounded-full" width={32} height={32} src={transfer?.brandProfile?.iconUrl || logo} />
                <span className="ms-3 text-xl font-bold text-gray-700">{transfer?.brandProfile?.name || "Transfer.zip"}</span>
              </div>
              <div className="relative flex items-center text-sm -top-1 text-gray-600 select-none">
                {transfer.statistics.downloads.length > 1 ?
                  <span>{transfer.statistics.downloads.length} downloads<i className="bi bi-arrow-down-circle-fill ms-1"></i></span>
                  :
                  transfer.statistics.downloads.length == 1 ?
                    <span>Downloaded<i className="bi bi-arrow-down-circle ms-1"></i></span>
                    :
                    transfer.statistics.views.length >= 1 ?
                      <span>Viewed<i className="bi bi-eye ms-1"></i></span>
                      :
                      <span></span>
                }
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="col-span-full h-28">
                <div className="flex items-start gap-1">
                  <label htmlFor="description" className="text-sm font-bold text-gray-700 uppercase">
                    Message
                  </label>
                  <div className="h-0">
                    {
                      !editingMessage ?
                        <button onClick={() => setEditingMessage(true)} className="ms-1 text-gray-500 hover:text-gray-600"><PencilIcon size={16} /></button>
                        :
                        <YesNo onYes={handleSaveMessage} onNo={() => setEditingMessage(false)} />
                    }
                  </div>
                </div>
                <div>
                  {
                    editingMessage ?
                      <div className="mt-2">
                        <textarea
                          ref={messageRef}
                          id="description"
                          name="description"
                          rows={3}
                          className="block w-full rounded-md border-0 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm"
                          defaultValue={transfer?.description}
                        />
                      </div>
                      :
                      <div className="mt-2 flex">
                        <p className="text-gray-600 sm:text-sm max-h-20 overflow-hidden">
                          {transfer.description || "No message"}
                        </p>
                      </div>
                  }
                </div>
              </div>
              <div className="col-span-1">
                <div className="flex items-start justify-between">
                  <label className="text-sm font-bold text-gray-700 uppercase">
                    {transfer.emailsSharedWith && transfer.emailsSharedWith.length > 0 ? "Shared with" : "Share by email"}
                  </label>
                </div>
                <div className="mt-2">
                  {transfer.emailsSharedWith && transfer.emailsSharedWith.length > 0 && (
                    <div className="mt-2 sm:text-sm text-gray-600">
                      <p>Last shared with {transfer.emailsSharedWith[transfer.emailsSharedWith.length - 1].email}{" "}</p>
                      {transfer.emailsSharedWith.length > 1 && <a href="#" className="underline hover:text-primary" onClick={handleShowEmailList}>and {transfer.emailsSharedWith.length - 1} more</a>}
                    </div>
                  )}
                  <button onClick={() => setShowForwardTransfer(true)} className="mt-auto sm:text-sm text-primary hover:text-primary-light hover:underline">Forward &rarr;</button>
                </div>
              </div>
              <div className="col-span-1">
                <div className="flex items-start justify-between">
                  <label className="text-sm font-bold text-gray-700 uppercase">
                    Expires
                  </label>
                </div>
                <div className="mt-2 max-w-52 min-w-40 w-fit">
                  {dateInput}
                </div>
              </div>
            </div>
          </div>
          <div className="order-1 sm:order-2 sm:col-span-1 p-4 sm:p-6 bg-white rounded-t-xl rounded-b-none sm:rounded-xl sm:border-l sm:border-dashed">
            <div className="sm:max-w-none">
              <div className="max-w-56 hidden sm:block w-full mb-4 p-4 ring-1 ring-inset ring-gray-300 rounded-lg">
                <QRCode
                  style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                  size={256}
                  fgColor="#212529"
                  value={transferLink}
                />
              </div>
              <div className="relative flex items-center w-full">
                <input
                  onKeyDown={handleLinkKeyDown}
                  type="url"
                  className="block w-full rounded-lg border-0 py-2.5 ps-4 pr-19 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                  value={transferLink}
                  readOnly
                />
                <div className="absolute inset-y-0 right-0 flex py-1.5 pr-1.5">
                  <button type="button" onClick={handleCopy} className="inline-flex items-center rounded border border-gray-200 px-1 pe-1.5 font-sans text-xs text-primary font-medium bg-white hover:bg-gray-50">
                    <LinkIcon size={12} className={"mr-1 ms-1"} />Copy
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-row-reverse">
          <Button className={"text-white text-shadow-xs"} onClick={() => setShowDeleteConfirm(true)} variant={"link"}>Delete</Button>
        </div>
      </GenericPage>
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Transfer</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this transfer? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}