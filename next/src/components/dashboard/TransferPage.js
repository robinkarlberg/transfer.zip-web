"use client"
import { useLanguage } from "@/context/LanguageContext"

import { toast } from "sonner"
import { deleteTransfer, putTransfer, sendTransferByEmail } from "@/lib/client/Api"
import { getLimit, LIMIT } from "@/lib/pricing"
import { humanFileSize } from "@/lib/transferUtils"
import { cn, humanTimeUntil, parseTransferExpiryDate, tryCopyToClipboard } from "@/lib/utils"
import { CheckIcon, ChevronDownIcon, ChevronRightIcon, CopyIcon, DotIcon, FileIcon, FilmIcon, HexagonIcon, ImageIcon, MailIcon, MusicIcon, PencilIcon, Trash2Icon } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useRef, useState } from "react"
import QRCode from "react-qr-code"
import { Button } from "../ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Textarea } from "../ui/textarea"
import DashH2 from "./DashH2"
import GenericPage from "./GenericPage"
import { YesNo } from "./YesNo"
import TransferRecipientsDialog from "./TransferRecipientsDialog"

import logo from "@/img/icon.png"

const FILES_SHOWN = 4
const LABEL = "text-xs font-medium tracking-wide text-gray-500 uppercase"

const iconFor = type => {
  if (!type) return FileIcon
  if (type.startsWith("image/")) return ImageIcon
  if (type.startsWith("video/")) return FilmIcon
  if (type.startsWith("audio/")) return MusicIcon
  return FileIcon
}

const formatDate = (date, locale) => date.toLocaleDateString(locale, {
  month: "short",
  day: "numeric",
  year: date.getFullYear() === new Date().getFullYear() ? undefined : "numeric",
})

const toDateInputValue = date => date.toISOString().split("T")[0]

function Field({ label, sub, className, children }) {
  return (
    <div className={cn("min-w-0 border-dashed border-gray-200", className)}>
      <p className={LABEL}>{label}</p>
      <div className="mt-1 truncate font-heading text-2xl font-bold text-gray-900 md:text-3xl">{children}</div>
      {sub && <p className="mt-0.5 text-sm text-gray-500">{sub}</p>}
    </div>
  )
}

function BrandMark({ profile, size }) {
  if (profile && !profile.iconUrl) return <HexagonIcon size={size} className="shrink-0 text-gray-400" />
  return <Image alt="" className="shrink-0 rounded-full" width={size} height={size} src={profile ? profile.iconUrl : logo} />
}

function ValueButton({ Icon, children, ...props }) {
  return (
    <button type="button" className="group inline-flex max-w-full items-center gap-2 hover:text-primary" {...props}>
      <span className="truncate">{children}</span>
      <Icon size={18} className="shrink-0 text-gray-400 group-hover:text-primary" />
    </button>
  )
}

export default function ({ user, transfer, brandProfiles }) {
  const { t, language, locale } = useLanguage()
  const router = useRouter()

  const transferLink = transfer.downloadUrl
  const shared = transfer.emailsSharedWith
  const { brandProfile } = transfer

  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (await tryCopyToClipboard(transferLink)) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const expiryDate = parseTransferExpiryDate(transfer.expiresAt)

  const maxPlanExpirationDays = getLimit(user.plan, LIMIT.MAX_EXPIRY_DAYS) ?? 0
  const maxExpiryDate = new Date(transfer.createdAt)
  maxExpiryDate.setDate(maxExpiryDate.getDate() + maxPlanExpirationDays)
  // Expiring today would take the link down immediately
  const minExpiryDate = new Date()
  minExpiryDate.setDate(minExpiryDate.getDate() + 1)

  const [editingExpiry, setEditingExpiry] = useState(false)

  const handleExpirySubmit = async e => {
    e.preventDefault()
    const expiresAt = new Date(new FormData(e.target).get("expiresAt"))
    try {
      await putTransfer(transfer.id, { expiresAt })
    }
    catch (err) {
      return toast.error(err.message)
    }
    setEditingExpiry(false)
    toast.success(t("Expiration Changed"), { description: t("The expiration date was successfully changed to {0}", { "0": expiresAt.toLocaleDateString(locale) }) })
    router.refresh()
  }

  const titleRef = useRef(null)
  const [editingTitle, setEditingTitle] = useState(false)

  const [editingMessage, setEditingMessage] = useState(false)
  const [showAllFiles, setShowAllFiles] = useState(false)

  const [showEmailList, setShowEmailList] = useState(false)
  const [showForwardTransfer, setShowForwardTransfer] = useState(false)
  const [sending, setSending] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleForwardTransfer = () => {
    setShowEmailList(false)
    setShowForwardTransfer(true)
  }

  const handleSaveTitle = async e => {
    setEditingTitle(false)
    await putTransfer(transfer.id, { name: titleRef.current.value })
    router.refresh()
  }

  const handleBrandChange = async brandProfileId => {
    try {
      await putTransfer(transfer.id, { brandProfileId })
    }
    catch (err) {
      return toast.error(err.message)
    }
    router.refresh()
  }

  const handleSaveMessage = async e => {
    e.preventDefault()
    const description = new FormData(e.target).get("description")
    setEditingMessage(false)
    await putTransfer(transfer.id, { description })
    router.refresh()
  }

  const handleSendByEmailFormSubmit = async e => {
    e.preventDefault()

    if (user.plan == "starter" && shared.length >= 25) {
      toast.error(t("Limit reached"), { description: t("With the Starter plan, a transfer can have up to 25 email recipients in total. Upgrade to Pro for up to 200 per transfer.") })
      return
    }
    if (user.plan == "pro" && shared.length >= 200) {
      toast.error(t("Limit reached"), { description: t("With the Pro plan, a transfer can have up to 200 email recipients in total.") })
      return
    }

    const email = new FormData(e.target).get("email")

    setSending(true)
    try {
      await sendTransferByEmail(transfer.id, [email])
    }
    catch (err) {
      return toast.error(err.message)
    }
    finally {
      setSending(false)
    }

    toast.success(t("Email sent"), { description: t("The Transfer link was successfully sent to {0}!", { "0": email }) })
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
      <span>{transfer.files.length} {t(transfer.files.length === 1 ? "file" : "files")}</span>
      <DotIcon name={"dot"} />
      <span>{humanFileSize(transfer.size, true)}</span>
      <DotIcon name={"dot"} />
      <span>{t("Created")} {new Date(transfer.createdAt).toLocaleDateString(locale)}</span>
    </div>

  const title = (
    editingTitle ?
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <input className="rounded-xl border-0 ring-0" ref={titleRef} defaultValue={transfer.hasName ? transfer.name : ""}></input>
          <YesNo dark onYes={handleSaveTitle} onNo={() => setEditingTitle(false)} />
        </div>
      </div >
      :
      <DashH2>
        {transfer.hasName ? transfer.name : t("Untitled Transfer")} <button onClick={() => setEditingTitle(true)} className="ms-1 text-2xl hover:text-gray-200"><PencilIcon /></button>
      </DashH2>
  )

  const downloads = transfer.statistics.downloads.length
  const views = transfer.statistics.views.length
  const visibleFiles = showAllFiles ? transfer.files : transfer.files.slice(0, FILES_SHOWN)

  const brandRow = (
    <span className="flex min-w-0 items-center gap-3">
      <BrandMark profile={brandProfile} size={32} />
      <span className="truncate text-lg font-bold text-gray-900">{brandProfile ? brandProfile.name : "Transfer.zip"}</span>
    </span>
  )

  return (
    <>
      <GenericPage category={"Sent"} title={transfer.hasName ? transfer.name : t("Untitled Transfer")} titleComponent={title} side={metadata}>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row">
            <div className="ticket-cut-b sm:ticket-cut-r flex min-w-0 flex-1 flex-col rounded-t-xl bg-white p-5 sm:rounded-tr-none sm:rounded-bl-xl sm:p-6">
              {brandProfiles.length > 0 ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button type="button" className="group -m-1.5 flex max-w-full items-center gap-2 self-start rounded-lg p-1.5 hover:bg-gray-50">
                      {brandRow}
                      <ChevronDownIcon size={16} className="shrink-0 text-gray-400 group-hover:text-gray-600" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuRadioGroup value={transfer.brandProfileId || "none"} onValueChange={handleBrandChange}>
                      {brandProfiles.map(profile => (
                        <DropdownMenuRadioItem key={profile.id} value={profile.id}>
                          <BrandMark profile={profile} size={20} />
                          {profile.name}
                        </DropdownMenuRadioItem>
                      ))}
                      <DropdownMenuSeparator />
                      <DropdownMenuRadioItem value="none">{t("No brand profile")}</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : brandRow}

              <div className="mt-8 grid grid-cols-2">
                <Field
                  label={t("Expires")}
                  sub={expiryDate && (expiryDate > new Date() ? t("in {0}", { "0": humanTimeUntil(expiryDate, language) }) : t("Expired"))}
                  className="border-r border-b pr-5 pb-6"
                >
                  <Popover open={editingExpiry} onOpenChange={setEditingExpiry}>
                    <PopoverTrigger asChild>
                      <ValueButton Icon={PencilIcon}>{expiryDate ? formatDate(expiryDate, locale) : t("Never")}</ValueButton>
                    </PopoverTrigger>
                    <PopoverContent align="start">
                      <form onSubmit={handleExpirySubmit}>
                        <Label htmlFor="expiresAt">{t("Expiry date")}</Label>
                        <div className="mt-2 flex gap-2">
                          <Input
                            id="expiresAt"
                            name="expiresAt"
                            type="date"
                            required
                            defaultValue={expiryDate ? toDateInputValue(expiryDate) : ""}
                            min={toDateInputValue(minExpiryDate)}
                            max={toDateInputValue(maxExpiryDate)}
                          />
                          <Button type="submit">{t("Save")}</Button>
                        </div>
                      </form>
                    </PopoverContent>
                  </Popover>
                </Field>
                <Field label={t("Downloads")} className="border-b pb-6 pl-5">
                  {downloads}
                </Field>
                <Field label={shared.length > 0 ? t("Sent to") : t("Shared via")} className="border-r pt-6 pr-5">
                  {shared.length > 0
                    ? <ValueButton Icon={ChevronRightIcon} onClick={() => setShowEmailList(true)}>{shared.length == 1 ? shared[0].email : t("{count} people", { count: shared.length })}</ValueButton>
                    : t("Link")}
                </Field>
                <Field label={t("Views")} className="pt-6 pl-5">
                  {views}
                </Field>
              </div>
            </div>

            <div className="ticket-cut-t sm:ticket-cut-l relative rounded-b-xl bg-white sm:w-52 sm:shrink-0 sm:rounded-tr-xl sm:rounded-bl-none">
              <div aria-hidden="true" className="absolute inset-x-4 top-0 border-t-2 border-dashed border-gray-300 sm:inset-x-auto sm:inset-y-4 sm:left-0 sm:border-t-0 sm:border-l-2" />
              {/* Out of flow on desktop so the ticket's height comes from the details, and the QR fills what's left */}
              <div className="flex flex-col gap-4 p-5 sm:absolute sm:inset-0 sm:p-6">
                <div className="hidden min-h-0 flex-1 sm:block">
                  <QRCode value={transferLink} size={256} fgColor="#111827" style={{ width: "100%", height: "100%" }} />
                </div>
                <div className="grid gap-2">
                  <Button onClick={handleCopy}>
                    {copied ? <CheckIcon /> : <CopyIcon />}
                    {copied ? t("Copied") : t("Copy link")}
                  </Button>
                  <Button variant="outline" onClick={handleForwardTransfer}>
                    <MailIcon />{t("Send by email")}</Button>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-gray-900">{t("Message")}</h2>
              {!editingMessage && (
                <button type="button" onClick={() => setEditingMessage(true)} className="text-sm font-medium text-primary hover:text-primary-light">{t("Edit")}</button>
              )}
            </div>
            {editingMessage ? (
              <form onSubmit={handleSaveMessage} className="mt-3">
                <Textarea autoFocus name="description" rows={3} defaultValue={transfer.description} placeholder={t("Add a message for the recipients")} />
                <div className="mt-2 flex justify-end gap-2">
                  <Button type="button" size="sm" variant="ghost" onClick={() => setEditingMessage(false)}>{t("Cancel")}</Button>
                  <Button size="sm">{t("Save")}</Button>
                </div>
              </form>
            ) : (
              <p className={`mt-2 text-sm break-words whitespace-pre-line ${transfer.description ? "text-gray-700" : "text-gray-400"}`}>
                {transfer.description || t("No message")}
              </p>
            )}
          </div>

          {transfer.files.length > 0 && (
            <div className="rounded-xl bg-white p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900">{t("Files")}</h2>
              <ul className="mt-3 divide-y divide-gray-100">
                {visibleFiles.map(file => {
                  const Icon = iconFor(file.type)
                  return (
                    <li key={file.id} className="flex items-center gap-3 py-2.5 text-sm">
                      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary-50 text-primary-600">
                        <Icon size={16} />
                      </span>
                      <span className="min-w-0 flex-1 truncate font-medium text-gray-900">{file.name}</span>
                      <span className="shrink-0 text-gray-500 tabular-nums">{humanFileSize(file.size, true)}</span>
                    </li>
                  )
                })}
              </ul>
              {transfer.files.length > FILES_SHOWN && (
                <button type="button" onClick={() => setShowAllFiles(!showAllFiles)} className="mt-2 text-sm font-medium text-primary hover:text-primary-light">
                  {showAllFiles ? t("Show less") : `+ ${transfer.files.length - FILES_SHOWN} more`}
                </button>
              )}
            </div>
          )}

          <div className="flex justify-end">
            <button type="button" onClick={() => setShowDeleteConfirm(true)} className="inline-flex items-center gap-1.5 text-sm font-medium text-white hover:underline">
              <Trash2Icon size={14} />{t("Delete transfer")}</button>
          </div>
        </div>
      </GenericPage>

      <TransferRecipientsDialog open={showEmailList} onOpenChange={setShowEmailList} onForward={handleForwardTransfer} recipients={shared} />

      <Dialog open={showForwardTransfer} onOpenChange={setShowForwardTransfer}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("Send by email")}</DialogTitle>
            <DialogDescription>{t("They'll get the download link along with the title and message.")}</DialogDescription>
          </DialogHeader>
          <form id="sendByEmailForm" onSubmit={handleSendByEmailFormSubmit}>
            <Input autoFocus name="email" type="email" required autoComplete="off" placeholder="name@example.com" className="h-11 rounded-full" />
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForwardTransfer(false)}>{t("Cancel")}</Button>
            <Button type="submit" form="sendByEmailForm" disabled={sending}>{t("Send")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader variant="destructive">
            <DialogTitle>{t("Delete Transfer")}</DialogTitle>
            <DialogDescription>{t("Are you sure you want to delete this transfer? This action cannot be undone.")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>{t("Cancel")}</Button>
            <Button variant="destructive" onClick={handleDelete}>{t("Delete")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
