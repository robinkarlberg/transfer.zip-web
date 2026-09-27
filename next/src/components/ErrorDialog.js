"use client"

import { PILL_BUTTON, StormCloud } from "@/components/quick/TransferParts"
import { Dialog, DialogClose, DialogOverlay, DialogPortal } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import * as DialogPrimitive from "@radix-ui/react-dialog"

/** Dialog take on Quick Transfer's failed card. `message` can be a string or JSX. */
export default function ErrorDialog({ open, onOpenChange, title = "Something went wrong", message }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white p-6 text-center shadow-2xl outline-none data-[state=open]:animate-poof-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 sm:p-8">
          <StormCloud />
          <DialogPrimitive.Title className="mt-2 text-3xl font-bold tracking-tight text-gray-900">{title}</DialogPrimitive.Title>
          {/* div, not p, since some messages pass their own paragraphs */}
          <DialogPrimitive.Description asChild>
            <div className="mx-auto mt-2 max-w-xs break-words text-gray-500">{message}</div>
          </DialogPrimitive.Description>
          <DialogClose asChild>
            <button type="button" className={cn(PILL_BUTTON, "mt-6")}>Got it</button>
          </DialogClose>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  )
}
