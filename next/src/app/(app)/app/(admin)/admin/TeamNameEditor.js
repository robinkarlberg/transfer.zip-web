"use client"
import { useLanguage } from "@/context/LanguageContext"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { PencilIcon } from "lucide-react"
import DashH2 from "@/components/dashboard/DashH2"
import { YesNo } from "@/components/dashboard/YesNo"
import { updateTeam } from "@/lib/client/Api"

export default function TeamNameEditor({ teamName, canEdit }) {
  const { t } = useLanguage()
  const router = useRouter()
  const nameRef = useRef(null)
  const [editing, setEditing] = useState(false)

  if (!canEdit) {
    return <DashH2>{teamName}</DashH2>
  }

  const handleSave = async () => {
    const trimmed = nameRef.current.value.trim()
    if (!trimmed) {
      toast.error(t("Team name cannot be empty"))
      return
    }
    setEditing(false)
    if (trimmed === teamName) return
    await updateTeam({ name: trimmed })
    router.refresh()
  }

  return editing ? (
    <div className="flex items-center justify-between">
      <div className="flex gap-2">
        <input className="rounded-xl border-0 ring-0" ref={nameRef} defaultValue={teamName} />
        <YesNo dark onYes={handleSave} onNo={() => setEditing(false)} />
      </div>
    </div>
  ) : (
    <DashH2>
      {teamName} <button onClick={() => setEditing(true)} className="ms-1 text-2xl hover:text-gray-200"><PencilIcon /></button>
    </DashH2>
  )
}
