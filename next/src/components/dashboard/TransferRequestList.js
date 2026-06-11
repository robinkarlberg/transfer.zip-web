"use client"

import { useParams, useRouter } from "next/navigation"
import { useCallback, useMemo, useState } from "react"
import EmptySpace from "../elements/EmptySpace"
import { toast } from "sonner"
import { cn, tryCopyToClipboard } from "@/lib/utils"
import {
  activateTransferRequest,
  deactivateTransferRequest,
  deleteTransferRequest,
  getTransferRequestList,
} from "@/lib/client/Api"
import BIcon from "../BIcon"
import { Link2OffIcon, LinkIcon } from "lucide-react"
import { Button } from "../ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"

const INACTIVE_PAGE_SIZE = 10

const Entry = ({ transferRequest, onLocalUpdate }) => {
  const { transferId: displayedTransferId } = useParams()

  const uploadLink = transferRequest.uploadUrl
  const { active, id, name } = transferRequest
  const receivedTransfers = transferRequest.receivedTransfers || []

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [busy, setBusy] = useState(false)

  const isSelected = id === displayedTransferId

  const handleCopy = async () => {
    if (await tryCopyToClipboard(uploadLink)) {
      toast.success("Copied Link", { description: "The request link was successfully copied to the clipboard!" })
    }
  }

  const handleCopyLinkClicked = async e => {
    e.stopPropagation()
    handleCopy()
  }

  const handleActivate = async e => {
    e.stopPropagation()
    if (busy) return
    setBusy(true)
    try {
      await activateTransferRequest(id)
      onLocalUpdate(id, { active: true })
    }
    catch (err) {
      toast.error(err.message)
    }
    finally {
      setBusy(false)
    }
  }

  const handleDeactivate = async e => {
    e.stopPropagation()
    if (busy) return
    setBusy(true)
    try {
      await deactivateTransferRequest(id)
      onLocalUpdate(id, { active: false })
    }
    catch (err) {
      toast.error(err.message)
    }
    finally {
      setBusy(false)
    }
  }

  const handleDeleteClicked = e => {
    e.stopPropagation()
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = async () => {
    setDeleting(true)
    try {
      await deleteTransferRequest(id)
      toast.success("Request deleted", {
        description: receivedTransfers.length > 0
          ? `Deleted the request and ${receivedTransfers.length} received transfer${receivedTransfers.length === 1 ? "" : "s"}.`
          : "The request link was deleted.",
      })
      setShowDeleteConfirm(false)
      onLocalUpdate(id, null)
    }
    catch (err) {
      toast.error(err.message)
    }
    finally {
      setDeleting(false)
    }
  }

  const previewTransfers = receivedTransfers.slice(0, 8)
  const extraTransfers = receivedTransfers.length - previewTransfers.length

  return (
    <div className={`hover:cursor-default group text-start shadow-xs rounded-xl border border-gray-200 ${isSelected ? "bg-gray-50" : "bg-white"} px-5 py-4 group`}>
      <div className="flex gap-4">
        <div className={cn(
          "w-12 aspect-square flex items-center justify-center text-center text-white rounded-lg",
          active ? "bg-primary-500" : "bg-gray-300"
        )}>
          {active ? <LinkIcon /> : <Link2OffIcon />}
        </div>
        <div>
          <h3 className={`text-lg font-bold mb-0.5 me-1 text-nowrap ${isSelected ? "text-black" : "text-gray-800"}`}>{name}</h3>
          <div className="text-sm text-gray-600 font-medium group-hover:hidden">
            <span className="">
              {
                active ?
                  (
                    transferRequest.receivedTransfersCount == 0 ?
                      <>Request link is active</>
                      :
                      <><BIcon name={"arrow-down"} /> {transferRequest.receivedTransfersCount} transfer{transferRequest.receivedTransfersCount != 1 && "s"} received</>
                  )
                  :
                  <><BIcon name={"stop-fill"} /> Inactive</>
              }
            </span>
          </div>
          <div className="text-sm text-gray-600 font-medium hidden group-hover:block">
            {
              active && (
                <>
                  <button onClick={handleCopyLinkClicked} className="underline hover:text-primary">Copy Link</button>
                  <BIcon name="dot" />
                </>
              )
            }
            <button
              onClick={active ? handleDeactivate : handleActivate}
              disabled={busy}
              className={`underline ${active ? "hover:text-red-600" : "hover:text-primary"} disabled:opacity-60`}
            >
              {active ? "Deactivate" : "Reactivate"} Link
            </button>
            <BIcon name="dot" />
            <button
              onClick={handleDeleteClicked}
              className="underline hover:text-red-600"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
      <Dialog open={showDeleteConfirm} onOpenChange={open => !deleting && setShowDeleteConfirm(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete request{name ? ` "${name}"` : ""}?</DialogTitle>
            <DialogDescription>
              {receivedTransfers.length === 0
                ? "This request link will be permanently deleted. This action cannot be undone."
                : `This will permanently delete the request link and the ${receivedTransfers.length} received transfer${receivedTransfers.length === 1 ? "" : "s"} listed below. This action cannot be undone.`}
            </DialogDescription>
          </DialogHeader>
          {receivedTransfers.length > 0 && (
            <div className="mt-2 rounded-lg border border-gray-200 bg-gray-50 max-h-56 overflow-y-auto">
              <ul className="divide-y divide-gray-200">
                {previewTransfers.map(t => (
                  <li key={t.id} className="px-3 py-2 flex items-center justify-between gap-3 text-sm">
                    <span className="text-gray-900 truncate">{t.name}</span>
                    <span className="text-gray-500 shrink-0">{t.fileCount} file{t.fileCount === 1 ? "" : "s"}</span>
                  </li>
                ))}
                {extraTransfers > 0 && (
                  <li className="px-3 py-2 text-sm text-gray-500">
                    and {extraTransfers} more
                  </li>
                )}
              </ul>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} disabled={deleting}>Cancel</Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function TransferRequestList({ activeRequests, initialInactiveRequests, hasMoreInactive }) {
  const router = useRouter()

  // Single source of truth seeded from server props on mount, then
  // mutated locally by every action. No router.refresh() races with our
  // optimistic state, so there's no flicker / no position jump.
  const [requests, setRequests] = useState(() => [...activeRequests, ...initialInactiveRequests])
  const [hasMore, setHasMore] = useState(hasMoreInactive)
  const [loadingMore, setLoadingMore] = useState(false)

  // patch === null deletes the row; otherwise shallow-merges into it.
  const handleLocalUpdate = useCallback((id, patch) => {
    setRequests(prev => {
      if (patch === null) return prev.filter(r => r.id !== id)
      return prev.map(r => r.id === id ? { ...r, ...patch } : r)
    })
  }, [])

  const { visibleActive, visibleInactive } = useMemo(() => {
    const active = []
    const inactive = []
    for (const r of requests) {
      if (r.active) active.push(r)
      else inactive.push(r)
    }
    const byCreatedAtDesc = (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    active.sort(byCreatedAtDesc)
    inactive.sort(byCreatedAtDesc)
    return { visibleActive: active, visibleInactive: inactive }
  }, [requests])

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    try {
      // Skip past every inactive we already have. Boundary can drift if an
      // active was deactivated since the last fetch - dedupe on append.
      const skip = requests.filter(r => !r.active).length
      const { requests: more, hasMore: nextHasMore } = await getTransferRequestList({
        active: false,
        skip,
        limit: INACTIVE_PAGE_SIZE,
      })
      setRequests(prev => {
        const known = new Set(prev.map(r => r.id))
        return [...prev, ...more.filter(r => !known.has(r.id))]
      })
      setHasMore(nextHasMore)
    }
    catch (err) {
      toast.error(err.message)
    }
    finally {
      setLoadingMore(false)
    }
  }, [loadingMore, hasMore, requests])

  const isEmpty = visibleActive.length === 0 && visibleInactive.length === 0 && !hasMore

  return (
    <div className="">
      {isEmpty && (
        <EmptySpace onClick={() => router.push("/app/receive")} buttonText={"Create Request Link"} title={"Your request links will appear here"} subtitle={"You can view or revoke individual links."} />
      )}
      <div className={`grid grid-cols-1 gap-3 mb-2`}>
        {visibleActive.map(transferRequest => (
          <Entry key={transferRequest.id} transferRequest={transferRequest} onLocalUpdate={handleLocalUpdate} />
        ))}
      </div>
      {visibleInactive.length > 0 && <h3 className="font-semibold mb-1 text-white">Inactive Links</h3>}
      <div className={`grid grid-cols-1 gap-3`}>
        {visibleInactive.map(transferRequest => (
          <Entry key={transferRequest.id} transferRequest={transferRequest} onLocalUpdate={handleLocalUpdate} />
        ))}
      </div>
      {hasMore && (
        <div className="flex justify-center py-6">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="text-sm font-medium text-white underline disabled:opacity-60 hover:opacity-80"
          >
            {loadingMore ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </div>
  )
}
