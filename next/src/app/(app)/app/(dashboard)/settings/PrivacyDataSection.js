"use client"

import { useState } from "react"
import { toast } from "sonner"
import { DownloadIcon, Trash2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { deleteOwnAccount, getUserExportUrl } from "@/lib/client/Api"

export default function PrivacyDataSection({ user }) {
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [emailConfirm, setEmailConfirm] = useState("")
  const [deleting, setDeleting] = useState(false)

  const hasActiveSub = user.plan && user.plan !== "free"
  const canConfirm = emailConfirm.trim().toLowerCase() === user.email.toLowerCase() && !deleting

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteOwnAccount()
      window.location.href = "/"
    } catch (err) {
      toast.error(err.message)
      setDeleting(false)
    }
  }

  const openDeleteModal = () => {
    setEmailConfirm("")
    setShowDeleteModal(true)
  }

  return (
    <div className="p-5 sm:p-6 bg-white rounded-xl">
      <h2 className="text-lg font-semibold text-gray-900">Privacy &amp; data</h2>
      <div className="mt-4 space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="font-medium text-gray-900">Export your data</p>
            <p className="text-sm text-gray-500">Download a JSON copy of your data.</p>
          </div>
          <Button variant="secondary" asChild>
            <a href={getUserExportUrl()} download>
              <DownloadIcon className="w-4 h-4" />
              Export data
            </a>
          </Button>
        </div>

        {!user.hasTeam && (
          <div className="pt-3 border-t">
            <p className="font-medium text-gray-900">Delete account</p>
            <p className="text-sm text-gray-500">
              Permanently deletes your account, transfers, transfer requests, and brand profiles. This cannot be undone.
            </p>
            <div className="mt-3 text-red-500 font-bold">
              <button className="text-sm inline-flex items-center gap-1" onClick={openDeleteModal}>
                <Trash2Icon className="w-4 h-4" />
                Delete account
              </button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={showDeleteModal} onOpenChange={open => { if (!deleting) setShowDeleteModal(open) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader variant="destructive">
            <DialogTitle>Delete your account?</DialogTitle>
            <DialogDescription>
              This will permanently delete your account and all associated transfers, transfer requests, and brand profiles. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {hasActiveSub && (
            <p className="text-sm text-amber-700 bg-amber-100 rounded-md p-3">
              Your active subscription will be cancelled immediately. No refund is issued for unused time.
            </p>
          )}
          <div className="mt-2">
            <Label htmlFor="email-confirm" className="text-sm text-gray-700">
              Type <span className="font-mono text-gray-900">{user.email}</span> to confirm
            </Label>
            <Input
              id="email-confirm"
              autoFocus
              autoComplete="off"
              value={emailConfirm}
              onChange={e => setEmailConfirm(e.target.value)}
              className="mt-2"
              disabled={deleting}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" disabled={!canConfirm} onClick={handleDelete}>
              {deleting ? "Deleting…" : "Delete account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
