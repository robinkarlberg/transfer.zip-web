"use client"

import { useEffect, useMemo, useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { ArrowDownIcon, CheckIcon, ChevronDownIcon, EyeIcon, FileIcon, FilmIcon, ImageIcon, LinkIcon, Link2OffIcon, Loader2, MusicIcon, RotateCcwIcon, UserIcon } from "lucide-react"
import { toast } from "sonner"
import GenericPage from "./GenericPage"
import { Button } from "@/components/ui/button"
import RequestIdentificationSetting from "@/components/newtransfer/RequestIdentificationSetting"
import BrandingToggle from "@/components/newtransfer/BrandingToggle"
import { FlightScene, ShareLink, Status, Tabs } from "@/components/quick/TransferParts"
import { activateTransferRequest, deactivateTransferRequest, getDownloadToken, getRequestSubmissions, putTransferRequest, registerTransferDownloaded, reviewRequestSubmission } from "@/lib/client/Api"
import { cn, humanTimeUntil, parseTransferExpiryDate } from "@/lib/utils"
import { formatCount, humanFileSize } from "@/lib/transferUtils"

// Same trick as DialogContent: every Button inside becomes a pill
const PILLS = "[&_[data-slot=button]]:rounded-full [&_[data-slot=button]]:font-semibold"

const dateTime = value => new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })

const iconFor = type => {
  if (!type) return FileIcon
  if (type.startsWith("image/")) return ImageIcon
  if (type.startsWith("video/")) return FilmIcon
  if (type.startsWith("audio/")) return MusicIcon
  return FileIcon
}

function Submission({ requestId, transfer, selected, initiallyOpen, onReviewed }) {
  const [expanded, setExpanded] = useState(initiallyOpen || selected)
  const [fileLimit, setFileLimit] = useState(100)
  const [reviewing, setReviewing] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [download, setDownload] = useState(null)
  const formRef = useRef(null)
  const cardRef = useRef(null)
  const expiryDate = parseTransferExpiryDate(transfer.expiresAt)
  const expired = expiryDate && expiryDate <= new Date()
  const fileListId = `files-${transfer.id}`

  useEffect(() => {
    if (selected) {
      setExpanded(true)
      cardRef.current.scrollIntoView({ block: "center" })
    }
  }, [selected])

  useEffect(() => {
    if (download) formRef.current.submit()
  }, [download])

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const { nodeUrl, token } = await getDownloadToken(transfer.secretCode)
      await registerTransferDownloaded(transfer.secretCode)
      setDownload({ url: `${nodeUrl}/download`, token })
    } catch (err) {
      toast.error(err.message)
    } finally {
      setDownloading(false)
    }
  }

  const handleReview = async () => {
    setReviewing(true)
    try {
      const { submission } = await reviewRequestSubmission(requestId, transfer.id, !transfer.reviewedAt)
      onReviewed(submission)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setReviewing(false)
    }
  }

  return (
    <article ref={cardRef} id={`submission-${transfer.id}`} className={cn("scroll-mt-6 rounded-2xl p-3 sm:p-4", selected && "bg-primary-50")}>
      {download && <form ref={formRef} method="POST" action={download.url} hidden>
        <input type="hidden" name="token" value={download.token} readOnly />
      </form>}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-gray-900">{formatCount(transfer.files.length, "file")} <span className="font-normal text-gray-500">· {humanFileSize(transfer.size, true)}</span></p>
            <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", transfer.reviewedAt ? "bg-gray-100 text-gray-600" : "bg-primary-100 text-primary-700")}>
              {transfer.reviewedAt ? "Reviewed" : "New"}
            </span>
          </div>
          <p className="mt-0.5 text-sm text-balance text-gray-500">
            Uploaded {dateTime(transfer.receivedAt)}{expiryDate && (expired ? " · Expired" : ` · Expires in ${humanTimeUntil(expiryDate)}`)}
          </p>
        </div>
        {/* Own row on phones, led by the filled button so the row starts flush with the text above */}
        <div className="order-last flex w-full flex-wrap items-center gap-1.5 sm:order-none sm:w-auto sm:flex-row-reverse">
          <Button onClick={handleDownload} disabled={downloading || !!expired}>
            {downloading ? <Loader2 className="animate-spin" /> : <ArrowDownIcon />} Download
          </Button>
          <Button variant="ghost" onClick={handleReview} disabled={reviewing} aria-pressed={!!transfer.reviewedAt}>
            {transfer.reviewedAt ? <RotateCcwIcon /> : <CheckIcon />}
            {transfer.reviewedAt ? "Mark unreviewed" : "Mark reviewed"}
          </Button>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setExpanded(value => !value)} aria-expanded={expanded} aria-controls={fileListId} aria-label={expanded ? "Hide files and message" : "Show files and message"}>
          <ChevronDownIcon className={cn("transition-transform", expanded && "rotate-180")} />
        </Button>
      </div>
      {expanded && <div id={fileListId} className="mt-3">
        {transfer.submission.message && (
          <p className={cn("mb-2 rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap break-words text-gray-700", selected ? "bg-white" : "bg-gray-100")}>{transfer.submission.message}</p>
        )}
        <ul>
          {transfer.files.slice(0, fileLimit).map(file => {
            const Icon = iconFor(file.type)
            return (
              <li key={file.id} className="flex items-center gap-3 py-2">
                <div className={cn("grid size-10 shrink-0 place-items-center rounded-lg text-primary-600", selected ? "bg-white" : "bg-primary-50")}>
                  <Icon size={18} />
                </div>
                <div className="min-w-0 grow">
                  <p className="break-all text-sm font-medium text-gray-900">{file.relativePath || file.name}</p>
                  <p className="text-xs text-gray-500">{humanFileSize(file.size, true)}</p>
                </div>
              </li>
            )
          })}
        </ul>
        {transfer.files.length > fileLimit && <Button variant="ghost" size="sm" onClick={() => setFileLimit(limit => limit + 100)}>Show more files</Button>}
      </div>}
    </article>
  )
}

function Empty({ scene, title, children }) {
  return (
    <div className="px-4 py-10 text-center">
      {scene && <div className="mx-auto mb-6 max-w-sm">{scene}</div>}
      <p className="text-lg font-semibold text-gray-900">{title}</p>
      {children && <p className="mt-1 text-sm text-gray-500">{children}</p>}
    </div>
  )
}

export default function TransferRequestPage({ transferRequest, brandProfiles, initialData, selectedId, missingSubmission }) {
  const router = useRouter()
  const [request, setRequest] = useState(transferRequest)
  const [submissions, setSubmissions] = useState(initialData.submissions)
  const [nextCursor, setNextCursor] = useState(initialData.nextCursor)
  const [unreviewed, setUnreviewed] = useState(initialData.unreviewed)
  const [onlyUnreviewed, setOnlyUnreviewed] = useState(false)
  const [saving, setSaving] = useState(false)
  const [changingStatus, setChangingStatus] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [refreshing, startRefresh] = useTransition()

  useEffect(() => {
    setRequest(transferRequest)
    setSubmissions(initialData.submissions)
    setNextCursor(initialData.nextCursor)
    setUnreviewed(initialData.unreviewed)
  }, [transferRequest, initialData])

  const groups = useMemo(() => {
    const people = new Map()
    for (const transfer of submissions) {
      if (onlyUnreviewed && transfer.reviewedAt) continue
      const { name, email } = transfer.submission
      const key = email ? `email:${email.toLowerCase()}` : name ? `name:${name.toLowerCase()}` : transfer.id
      if (!people.has(key)) people.set(key, { key, name, email, transfers: [] })
      people.get(key).transfers.push(transfer)
    }
    return [...people.values()]
  }, [submissions, onlyUnreviewed])

  const handleIdentification = async requireIdentification => {
    setSaving(true)
    try {
      const { transferRequest: updated } = await putTransferRequest(request.id, { requireIdentification })
      setRequest(updated)
      toast.success("Upload requirements updated")
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleStatus = async () => {
    setChangingStatus(true)
    try {
      if (request.active) await deactivateTransferRequest(request.id)
      else await activateTransferRequest(request.id)
      setRequest(current => ({ ...current, active: !current.active }))
    } catch (err) {
      toast.error(err.message)
    } finally {
      setChangingStatus(false)
    }
  }

  const handleBrandChange = async brandProfileId => {
    setSaving(true)
    try {
      const { transferRequest: updated } = await putTransferRequest(request.id, { brandProfileId })
      setRequest(updated)
      toast.success("Brand profile updated")
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleReviewed = updated => {
    const previous = submissions.find(submission => submission.id === updated.id)
    if (Boolean(previous.reviewedAt) !== Boolean(updated.reviewedAt)) {
      setUnreviewed(count => count + (updated.reviewedAt ? -1 : 1))
    }
    setSubmissions(current => current.map(submission => submission.id === updated.id ? updated : submission))
  }

  const handleLoadMore = async () => {
    setLoadingMore(true)
    try {
      const page = await getRequestSubmissions(request.id, nextCursor)
      setSubmissions(current => {
        const ids = new Set(current.map(submission => submission.id))
        return [...current, ...page.submissions.filter(submission => !ids.has(submission.id))]
      })
      setNextCursor(page.nextCursor)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoadingMore(false)
    }
  }

  const count = value => <span className="font-normal text-gray-500 tabular-nums">{value}</span>
  const tabs = [
    { id: "all", label: <>All {count(initialData.total)}</> },
    { id: "unreviewed", label: <>Unreviewed {count(unreviewed)}</> },
  ]

  return (
    <GenericPage category="Requests" title={request.name}>
      <div className={cn("space-y-4", PILLS)}>
        <div className="rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {request.active ? <Status>Open</Status> : (
              <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-600">
                <Link2OffIcon size={14} /> Closed
              </div>
            )}
            <div className="flex items-center gap-2 sm:flex-row-reverse">
              <Button variant="outline" onClick={handleStatus} disabled={changingStatus || saving}>
                {request.active ? <Link2OffIcon /> : <LinkIcon />}{request.active ? "Close request" : "Reopen request"}
              </Button>
              <Button asChild variant="ghost"><a href={request.uploadUrl} target="_blank" rel="noreferrer"><EyeIcon /> Preview</a></Button>
            </div>
          </div>
          {request.description && <p className="mt-5 whitespace-pre-wrap break-words text-gray-500">{request.description}</p>}
          <div className="mt-5">
            <ShareLink link={request.uploadUrl} />
          </div>
          <div className="mt-6 space-y-5 border-t border-gray-100 pt-5">
            <BrandingToggle brandProfiles={brandProfiles} brandProfileId={request.brandProfileId} setBrandProfileId={handleBrandChange} disabled={saving || changingStatus} />
            <RequestIdentificationSetting checked={request.requireIdentification} onCheckedChange={handleIdentification} disabled={saving || changingStatus} />
          </div>
        </div>

        <div className="rounded-3xl bg-white p-2 shadow-2xl sm:p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1 sm:max-w-xs">
              <Tabs tabs={tabs} value={onlyUnreviewed ? "unreviewed" : "all"} onChange={id => setOnlyUnreviewed(id === "unreviewed")} />
            </div>
            <div className="pr-1.5">
              <Button variant="ghost" size="icon" onClick={() => startRefresh(() => router.refresh())} disabled={refreshing} aria-label="Refresh submissions"><RotateCcwIcon /></Button>
            </div>
          </div>
          {missingSubmission && <p role="status" className="mt-2 rounded-2xl bg-gray-100 px-4 py-3 text-sm text-gray-600">That submission is no longer available.</p>}
          <div className="divide-y divide-gray-100">
            {groups.map(group => (
              <section key={group.key} className="py-3">
                <div className="flex items-center gap-3 px-3 pt-2 sm:px-4">
                  <div className="grid size-10 shrink-0 place-items-center rounded-full bg-primary-50 font-semibold text-primary-600">
                    {group.name || group.email ? (group.name || group.email)[0].toUpperCase() : <UserIcon size={18} />}
                  </div>
                  <div className="min-w-0">
                    <h2 className="break-words text-lg font-bold tracking-tight text-gray-900">{group.name || group.email || "Anonymous uploader"}</h2>
                    {group.name && group.email && <p className="break-all text-sm text-gray-500">{group.email}</p>}
                  </div>
                </div>
                <div className="mt-1">
                  {group.transfers.map(transfer => <Submission
                    key={transfer.id}
                    requestId={request.id}
                    transfer={transfer}
                    selected={transfer.id === selectedId}
                    initiallyOpen={!selectedId && transfer.id === submissions[0].id}
                    onReviewed={handleReviewed}
                  />)}
                </div>
              </section>
            ))}
          </div>
          {groups.length === 0 && (
            initialData.total === 0 ? <Empty scene={<FlightScene progress={0} hovering />} title="No submissions yet">Share the request link to receive files.</Empty>
              : nextCursor ? <Empty title="No unreviewed submissions on this page">Load more to continue.</Empty>
                : <Empty scene={<FlightScene progress={1} landed />} title="All submissions have been reviewed" />
          )}
          {nextCursor && (
            <div className="flex justify-center p-3">
              <Button variant="outline" onClick={handleLoadMore} disabled={loadingMore}>{loadingMore ? "Loading..." : "Load more submissions"}</Button>
            </div>
          )}
        </div>
      </div>
    </GenericPage>
  )
}
