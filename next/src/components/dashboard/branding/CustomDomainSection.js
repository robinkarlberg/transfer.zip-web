"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import BIcon from "@/components/BIcon"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { checkCustomDomain, deleteCustomDomain, newCustomDomain } from "@/lib/client/Api"

const POLL_INTERVAL_MS = 5000

export default function CustomDomainSection({ domains: initialDomains, canManage }) {
  const router = useRouter()
  const [domains, setDomains] = useState(initialDomains)
  const [removingId, setRemovingId] = useState(null)

  useEffect(() => {
    setDomains(initialDomains)
  }, [initialDomains])

  // Poll the check endpoint while any displayed row is unverified.
  // Depending on a stable signature of pending IDs (not `domains`) keeps
  // us from rebuilding the interval on every state tick.
  const pendingKey = domains.filter(d => !d.verified).map(d => d.id).join(",")
  useEffect(() => {
    if (!pendingKey) return undefined
    const ids = pendingKey.split(",")
    let cancelled = false

    const tick = async () => {
      const updates = new Map()
      let flipped = false
      for (const id of ids) {
        try {
          const r = await checkCustomDomain(id)
          if (cancelled) return
          if (r.customDomain) {
            updates.set(id, r.customDomain)
            if (r.customDomain.verified) flipped = true
          }
        } catch (_) { /* next tick retries */ }
      }
      if (cancelled) return
      if (updates.size > 0) {
        setDomains(prev => prev.map(d => updates.get(d.id) || d))
      }
      if (flipped) router.refresh()
    }

    const intervalId = setInterval(tick, POLL_INTERVAL_MS)
    return () => { cancelled = true; clearInterval(intervalId) }
  }, [pendingKey, router])

  const handleRemove = async (id) => {
    if (removingId) return
    setRemovingId(id)
    try {
      await deleteCustomDomain(id)
      setDomains(prev => prev.filter(d => d.id !== id))
      toast.success("Domain removed")
      router.refresh()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <div className="p-5 sm:p-6 bg-white rounded-xl">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Custom domain</h2>
          <p className="text-sm text-gray-500 mt-1">
            Serve transfers from your own domain.
          </p>
        </div>
        {canManage && domains.length === 0 && <ConnectDomainDialog />}
      </div>

      {!canManage ? (
        <p className="text-sm text-gray-600 mt-4">
          Only the team Owner or Admin can manage the custom domain.
        </p>
      ) : domains.length > 0 ? (
        <>
          <ul className="mt-4 divide-y border rounded-lg">
            {domains.map(d => (
              <li key={d.id} className="flex items-center justify-between gap-4 px-4 py-3">
                <span className="font-mono text-sm text-gray-900 truncate">{d.domain}</span>
                <div className="flex items-center gap-3 shrink-0">
                  <DomainStatusPill verified={d.verified} />
                  <RemoveDomainAction
                    domain={d}
                    busy={removingId === d.id}
                    onConfirm={() => handleRemove(d.id)}
                  />
                </div>
              </li>
            ))}
          </ul>

          <p className="text-sm text-gray-500 mt-3">
            Point a <span className="font-mono">CNAME</span> record at{" "}
            <span className="font-mono">transfer.zip</span>
          </p>
        </>
      ) : (
        <></>
      )}
    </div>
  )
}

function RemoveDomainAction({ domain, busy, onConfirm }) {
  if (!domain.verified) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="text-gray-600 hover:text-gray-900"
        disabled={busy}
        onClick={onConfirm}
      >
        {busy ? "Removing…" : "Remove"}
      </Button>
    )
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-gray-600 hover:text-gray-900"
          disabled={busy}
        >
          {busy ? "Removing…" : "Remove"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader variant="destructive">
          <DialogTitle>Remove custom domain</DialogTitle>
          <DialogDescription>
            <span className="font-mono">{domain.domain}</span> will stop serving your transfers immediately. Existing links pointing at this domain will break until you reconnect it.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            disabled={busy}
            onClick={onConfirm}
          >
            {busy ? "Removing…" : "Remove"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ConnectDomainDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    try {
      const res = await newCustomDomain(input.trim())
      if (res.customDomain?.verified) {
        toast.success("Domain is live", {
          description: `${res.customDomain.domain} is now active.`,
        })
      } else {
        toast.success("Domain added", {
          description: "We'll activate it once DNS resolves.",
        })
      }
      setInput("")
      setOpen(false)
      router.refresh()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (!o) {
          setInput("")
          setSubmitting(false)
        }
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <BIcon name="plus-lg" />Connect Domain
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect a domain</DialogTitle>
          <DialogDescription>
            We'll activate it automatically once your DNS is pointing at us.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-2 py-4">
            <Label htmlFor="customdomain-input">Domain</Label>
            <Input
              id="customdomain-input"
              placeholder="files.acme.com"
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={submitting}
              autoComplete="off"
              spellCheck={false}
              autoFocus
            />
            <p className="text-xs text-gray-500">
              You'll need to <span className="font-mono">CNAME</span> it to{" "}
              <span className="font-mono">transfer.zip</span> after adding.
            </p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || !input.trim()}>
              {submitting ? "Connecting…" : "Connect"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function DomainStatusPill({ verified }) {
  if (verified) {
    return (
      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary-100 text-primary-700">
        Active
      </span>
    )
  }
  return (
    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
      Pending DNS
    </span>
  )
}
