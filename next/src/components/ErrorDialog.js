"use client"
import { useLanguage } from "@/context/LanguageContext"

import { StormCloud } from "@/components/quick/TransferParts"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog"

/** Dialog take on Quick Transfer's failed card. `message` can be a string or JSX. */
export default function ErrorDialog({ open, onOpenChange, title = "Something went wrong", message, closeText = "Got it" }) {
  const { t } = useLanguage()
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <div className="text-center">
          <StormCloud />
          <div className="mt-2">
            <DialogTitle>{t(title)}</DialogTitle>
          </div>
          <div className="mx-auto mt-2 max-w-xs">
            <DialogDescription asChild>
              <div>{message}</div>
            </DialogDescription>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button>{t(closeText)}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
