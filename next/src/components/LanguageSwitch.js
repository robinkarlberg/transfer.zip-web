"use client"

import { CheckIcon, GlobeIcon } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { LANDING_PATHS } from "@/lib/landing/routes"
import { cn } from "@/lib/utils"

const LANGUAGES = [
  { id: "en", name: "English" },
  { id: "sv", name: "Svenska" },
]

export default function LanguageSwitch({ language, light = false }) {
  const [open, setOpen] = useState(false)
  const label = language === "sv" ? "Välj språk" : "Choose language"
  const title = language === "sv" ? "Språk" : "Language"
  const closeLabel = language === "sv" ? "Stäng" : "Close"

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label={label}
          title={label}
          className={cn("bg-transparent hover:bg-transparent dark:hover:bg-transparent", light ? "text-white hover:text-gray-200" : "text-gray-600 hover:text-gray-700")}
        >
          <GlobeIcon className="size-5" aria-hidden="true" />
          <span className="uppercase">{language}</span>
        </Button>
      </DialogTrigger>
      <DialogContent aria-describedby={undefined} closeLabel={closeLabel}>
        <DialogHeader icon={<GlobeIcon />}>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <nav aria-label={title} className="grid gap-3">
          {LANGUAGES.map(item => (
            <a
              key={item.id}
              href={LANDING_PATHS[item.id]}
              hrefLang={item.id}
              lang={item.id}
              aria-current={item.id === language ? "page" : undefined}
              className={cn(
                "flex items-center justify-between rounded-full px-5 py-3.5 font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                item.id === language ? "bg-primary text-white hover:bg-primary-light" : "bg-gray-100 text-gray-900 hover:bg-gray-200"
              )}
              onClick={e => {
                if (item.id === language) {
                  e.preventDefault()
                  setOpen(false)
                }
              }}
            >
              {item.name}
              {item.id === language && <CheckIcon className="size-5" aria-hidden="true" />}
            </a>
          ))}
        </nav>
      </DialogContent>
    </Dialog>
  )
}
