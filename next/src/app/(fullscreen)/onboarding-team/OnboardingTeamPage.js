"use client"

import { useRef, useState } from "react"
import { toast } from "sonner"
import { CheckIcon, ImageIcon, Loader2, PlusIcon, XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Image from "next/image"
import { ROLES } from "@/lib/roles"
import {
  markTeamOnboarded,
  newBrandProfile,
  sendTeamInvite,
  updateTeam,
} from "@/lib/client/Api"

const NAME_MAX = 60
const ROLE_OPTIONS = [
  { id: ROLES.MEMBER, label: "Member" },
  { id: ROLES.ADMIN, label: "Admin" },
]

function StepIndicator({ step }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {[1, 2, 3].map((i) => {
        const done = i < step
        const active = i === step
        return (
          <div key={i} className="flex items-center gap-2">
            <div
              className={
                "flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold " +
                (done
                  ? "bg-white text-primary-700"
                  : active
                    ? "bg-white text-primary-700 ring-2 ring-white/70"
                    : "bg-white/30 text-white")
              }
            >
              {done ? <CheckIcon size={14} /> : i}
            </div>
            {i < 3 && <div className={"w-8 h-px " + (done ? "bg-white" : "bg-white/40")} />}
          </div>
        )
      })}
    </div>
  )
}

function StepShell({ step, title, subtitle, children }) {
  return (
    <div className="w-full max-w-xl mx-auto fade-in-up-600">
      <StepIndicator step={step} />
      <div className="text-center text-white mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-2 text-white/80 text-base sm:text-lg">{subtitle}</p>}
      </div>
      <div className="bg-white rounded-xl p-5 sm:p-6 shadow-xl">{children}</div>
    </div>
  )
}

function NameStep({ initialName, onNext }) {
  const [name, setName] = useState(initialName || "")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const handleNext = async () => {
    const trimmed = name.trim()
    if (!trimmed) {
      setError("Team name is required")
      return
    }
    setSaving(true)
    setError("")
    try {
      await updateTeam({ name: trimmed })
      onNext(trimmed)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <StepShell
      step={1}
      title="What's your team called?"
      subtitle="You can change this later."
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="team-name">Team name</Label>
          <Input
            id="team-name"
            autoFocus
            value={name}
            maxLength={NAME_MAX}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleNext()
            }}
            placeholder="Acme Inc."
            className="mt-2"
            disabled={saving}
          />
          {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
        </div>
        <div className="flex justify-end">
          <Button onClick={handleNext} disabled={saving || !name.trim()}>
            {saving && <Loader2 className="animate-spin" size={14} />}
            Next
          </Button>
        </div>
      </div>
    </StepShell>
  )
}

function InviteStep({ availableSeats, onNext, onBack }) {
  const [rows, setRows] = useState(() => {
    const initial = Math.min(2, availableSeats)
    return Array.from({ length: Math.max(1, initial) }, () => ({ email: "", role: ROLES.MEMBER }))
  })
  const [errors, setErrors] = useState({})
  const [sending, setSending] = useState(false)

  const filledCount = rows.filter((r) => r.email.trim()).length
  const canAddMore = rows.length < availableSeats

  const updateRow = (i, patch) => {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)))
  }

  const removeRow = (i) => {
    setRows((prev) => (prev.length === 1 ? [{ email: "", role: ROLES.MEMBER }] : prev.filter((_, idx) => idx !== i)))
  }

  const addRow = () => {
    if (!canAddMore) return
    setRows((prev) => [...prev, { email: "", role: ROLES.MEMBER }])
  }

  const handleSend = async () => {
    const filled = rows
      .map((r, i) => ({ ...r, i, email: r.email.trim().toLowerCase() }))
      .filter((r) => r.email)

    if (filled.length === 0) {
      onNext()
      return
    }

    const seen = new Set()
    const dupErrors = {}
    for (const r of filled) {
      if (seen.has(r.email)) dupErrors[r.i] = "Duplicate email"
      seen.add(r.email)
    }
    if (Object.keys(dupErrors).length) {
      setErrors(dupErrors)
      return
    }

    setSending(true)
    setErrors({})
    const nextErrors = {}
    const results = await Promise.all(
      filled.map(async (r) => {
        try {
          await sendTeamInvite(r.email, r.role, false)
          return { i: r.i, ok: true }
        } catch (err) {
          return { i: r.i, ok: false, message: err.message }
        }
      })
    )
    for (const res of results) {
      if (!res.ok) nextErrors[res.i] = res.message
    }
    setSending(false)
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      const okCount = results.filter((r) => r.ok).length
      if (okCount > 0) toast.success(`${okCount} invite${okCount === 1 ? "" : "s"} sent`)
      return
    }
    toast.success(`${results.length} invite${results.length === 1 ? "" : "s"} sent`)
    onNext()
  }

  return (
    <StepShell
      step={2}
      title="Invite your teammates"
      subtitle={
        availableSeats > 0
          ? `You have ${availableSeats} seat${availableSeats === 1 ? "" : "s"} available. Skip if you'd rather invite people later.`
          : "No seats left, you can add more later from billing."
      }
    >
      <div className="space-y-3">
        {rows.map((row, i) => (
          <div key={i} className="space-y-1">
            <div className="flex items-center gap-2">
              <Input
                type="email"
                placeholder="name@company.com"
                value={row.email}
                onChange={(e) => updateRow(i, { email: e.target.value })}
                disabled={sending}
                className="flex-1"
              />
              <Select
                value={row.role}
                onValueChange={(v) => updateRow(i, { role: v })}
                disabled={sending}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeRow(i)}
                disabled={sending || (rows.length === 1 && !row.email)}
                aria-label="Remove row"
              >
                <XIcon size={16} />
              </Button>
            </div>
            {errors[i] && <p className="text-xs text-red-500 pl-1">{errors[i]}</p>}
          </div>
        ))}

        <div>
          <Button
            type="button"
            variant="ghost"
            onClick={addRow}
            disabled={!canAddMore || sending}
            className="text-primary"
          >
            <PlusIcon size={14} /> Add another
          </Button>
          {!canAddMore && availableSeats > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              You've reached your seat capacity. Add more from billing later.
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <Button variant="ghost" onClick={onBack} disabled={sending}>
          Back
        </Button>
        {filledCount > 0 ? (
          <Button onClick={handleSend} disabled={sending}>
            {sending && <Loader2 className="animate-spin" size={14} />}
            Send {filledCount} invite{filledCount === 1 ? "" : "s"}
          </Button>
        ) : (
          <Button variant="outline" onClick={onNext} disabled={sending}>
            Skip
          </Button>
        )}
      </div>
    </StepShell>
  )
}

function BrandStep({ defaultName, onBack, onFinish }) {
  const [name, setName] = useState(defaultName || "")
  const [iconUrl, setIconUrl] = useState(null)
  const [backgroundUrl, setBackgroundUrl] = useState(null)
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

  const iconInputRef = useRef(null)
  const bgInputRef = useRef(null)

  const handleImageFile = (setter) => (e) => {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setter(reader.result)
    reader.readAsDataURL(file)
  }

  const finalize = async ({ withProfile }) => {
    setSaving(true)
    setError("")
    try {
      // Mark onboarded first so a transient brand-profile failure on retry
      // can't double-create. If branding fails, the user lands on the admin
      // panel where they can set it up at their leisure.
      await markTeamOnboarded()
    } catch (err) {
      setError(err.message)
      setSaving(false)
      return
    }
    if (withProfile) {
      try {
        await newBrandProfile({ name: name.trim(), iconUrl, backgroundUrl })
      } catch (err) {
        toast.error(`Couldn't save your brand profile: ${err.message}. You can set it up later from Admin → Branding.`)
      }
    }
    onFinish()
  }

  const handleFinish = () => {
    const hasAny = name.trim() || iconUrl || backgroundUrl
    if (hasAny && !name.trim()) {
      setError("Add a brand name or skip this step")
      return
    }
    finalize({ withProfile: !!name.trim() })
  }

  const handleSkip = () => finalize({ withProfile: false })

  return (
    <StepShell
      step={3}
      title="Brand your transfers"
      subtitle="Optional. Show your logo and a background on share pages."
    >
      <form className="hidden">
        <input ref={iconInputRef} type="file" accept="image/*" onChange={handleImageFile(setIconUrl)} />
      </form>
      <form className="hidden">
        <input ref={bgInputRef} type="file" accept="image/*" onChange={handleImageFile(setBackgroundUrl)} />
      </form>

      <div className="space-y-5">
        <div>
          <Label htmlFor="brand-name">Brand name</Label>
          <Input
            id="brand-name"
            value={name}
            maxLength={NAME_MAX}
            onChange={(e) => setName(e.target.value)}
            placeholder="Acme Inc."
            disabled={saving}
            className="mt-2"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <Label>Icon</Label>
            <div className="mt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => iconInputRef.current?.click()}
                disabled={saving}
                className="w-14 h-14 rounded-md border border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:bg-gray-50 overflow-hidden"
              >
                {iconUrl ? (
                  <Image alt="Icon" width={56} height={56} src={iconUrl} className="object-cover" />
                ) : (
                  <ImageIcon size={20} />
                )}
              </button>
              {iconUrl && (
                <Button type="button" variant="ghost" size="sm" onClick={() => setIconUrl(null)} disabled={saving}>
                  Remove
                </Button>
              )}
            </div>
          </div>

          <div>
            <Label>Background</Label>
            <div className="mt-2">
              <button
                type="button"
                onClick={() => bgInputRef.current?.click()}
                disabled={saving}
                className="relative w-full h-24 rounded-md border border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:bg-gray-50 overflow-hidden"
              >
                {backgroundUrl ? (
                  <Image alt="Background" fill src={backgroundUrl} className="object-cover" />
                ) : (
                  <span className="flex items-center gap-2 text-sm">
                    <ImageIcon size={16} /> Pick image
                  </span>
                )}
              </button>
              {backgroundUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setBackgroundUrl(null)}
                  disabled={saving}
                  className="mt-1"
                >
                  Remove
                </Button>
              )}
            </div>
          </div>
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>

      <div className="flex justify-between mt-6">
        <Button variant="ghost" onClick={onBack} disabled={saving}>
          Back
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSkip} disabled={saving}>
            Skip & finish
          </Button>
          <Button onClick={handleFinish} disabled={saving}>
            {saving && <Loader2 className="animate-spin" size={14} />}
            Finish
          </Button>
        </div>
      </div>
    </StepShell>
  )
}

export default function OnboardingTeamPage({ team, availableSeats }) {
  const [step, setStep] = useState(1)
  const [name, setName] = useState(team.name || "")

  const goFinish = () => {
    window.location.href = "/app/admin"
  }

  return (
    <>
      <div className="w-full h-screen overflow-hidden fixed grain bg-linear-to-b from-primary-700 to-primary-300 -z-10" />
      <div className="flex min-h-screen items-center justify-center px-6 py-12">
        {step === 1 && (
          <NameStep
            initialName={name}
            onNext={(saved) => {
              setName(saved)
              setStep(2)
            }}
          />
        )}
        {step === 2 && (
          <InviteStep
            availableSeats={availableSeats}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        )}
        {step === 3 && (
          <BrandStep defaultName={name} onBack={() => setStep(2)} onFinish={goFinish} />
        )}
      </div>
    </>
  )
}
