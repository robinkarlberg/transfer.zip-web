"use client"

import { useId } from "react"
import { UserIcon } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export default function RequestIdentificationSetting({ checked, onCheckedChange, disabled }) {
  const id = useId()
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-1">
        <Label htmlFor={id}><UserIcon size={16} /> Require name and email</Label>
        <p id={`${id}-description`} className="text-sm text-gray-500">When off, uploaders can leave both blank.</p>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} aria-describedby={`${id}-description`} />
    </div>
  )
}
