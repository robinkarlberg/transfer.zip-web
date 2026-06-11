"use client"

import { useRef, useState } from "react"
import { toast } from "sonner"
import { CheckIcon, ImageIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import {
  markUserOnboarded,
  newBrandProfile,
  putUserSettings,
} from "@/lib/client/Api"

const NAME_MAX = 80

function StepIndicator({ step, total }) {
  if (total < 2) return null
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {Array.from({ length: total }, (_, idx) => {
        const i = idx + 1
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
            {i < total && <div className={"w-8 h-px " + (done ? "bg-white" : "bg-white/40")} />}
          </div>
        )
      })}
    </div>
  )
}

function StepShell({ step, total, title, subtitle, children }) {
  return (
    <div className="w-full max-w-xl mx-auto fade-in-up-600">
      <StepIndicator step={step} total={total} />
      <div className="text-center text-white mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-2 text-white/80 text-base sm:text-lg">{subtitle}</p>}
      </div>
      <div className="bg-white rounded-xl p-5 sm:p-6 shadow-xl">{children}</div>
    </div>
  )
}

function NameStep({ initialName, total, onNext, onFinishSolo }) {
  const [name, setName] = useState(initialName || "")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const isFinal = total === 1

  const submit = async () => {
    const trimmed = name.trim()
    if (!trimmed) {
      setError("Please enter your name")
      return
    }
    setSaving(true)
    setError("")
    try {
      await putUserSettings({ fullName: trimmed })
      if (isFinal) {
        await onFinishSolo()
      } else {
        onNext(trimmed)
      }
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <StepShell
      step={1}
      total={total}
      title="What should we call you?"
      subtitle="Your name appears on outgoing transfers and emails."
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="full-name">Your name</Label>
          <Input
            id="full-name"
            autoFocus
            value={name}
            maxLength={NAME_MAX}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit()
            }}
            placeholder="Jane Doe"
            className="mt-2"
            disabled={saving}
          />
          {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
        </div>
        <div className="flex justify-end">
          <Button onClick={submit} disabled={saving || !name.trim()}>
            {saving && <Loader2 className="animate-spin" size={14} />}
            {isFinal ? "Finish" : "Next"}
          </Button>
        </div>
      </div>
    </StepShell>
  )
}

function BrandStep({ defaultName, total, onBack, onFinish }) {
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
      // can't double-create. If branding fails, the user lands on the
      // dashboard where they can set it up at their leisure.
      await markUserOnboarded()
    } catch (err) {
      setError(err.message)
      setSaving(false)
      return
    }
    if (withProfile) {
      try {
        await newBrandProfile({ name: name.trim(), iconUrl, backgroundUrl })
      } catch (err) {
        toast.error(`Couldn't save your brand profile: ${err.message}. You can set it up later from Branding.`)
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
      step={2}
      total={total}
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

export default function OnboardingProPage({ user, canBrand }) {
  const total = canBrand ? 2 : 1
  const [step, setStep] = useState(1)
  const [name, setName] = useState(user.fullName || "")

  const goFinish = () => {
    window.location.href = "/app"
  }

  const finishSolo = async () => {
    try {
      await markUserOnboarded()
    } catch (err) {
      toast.error(err.message)
      return
    }
    goFinish()
  }

  return (
    <>
      <div className="w-full h-screen overflow-hidden fixed grain bg-linear-to-b from-primary-700 to-primary-300 -z-10" />
      <div className="flex min-h-screen items-center justify-center px-6 py-12">
        {step === 1 && (
          <NameStep
            initialName={name}
            total={total}
            onNext={(saved) => {
              setName(saved)
              setStep(2)
            }}
            onFinishSolo={finishSolo}
          />
        )}
        {step === 2 && canBrand && (
          <BrandStep
            defaultName={name}
            total={total}
            onBack={() => setStep(1)}
            onFinish={goFinish}
          />
        )}
      </div>
    </>
  )
}
