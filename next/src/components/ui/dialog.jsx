"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { MessageCircleIcon, Trash2Icon, XIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

function Dialog({
  ...props
}) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({
  ...props
}) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({
  ...props
}) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({
  ...props
}) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({
  className,
  ...props
}) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-150 motion-reduce:animate-none fixed inset-0 z-50 bg-black/50",
        className
      )}
      {...props} />
  );
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  closeLabel = "Close",
  ...props
}) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "fixed top-1/2 left-1/2 z-50 grid w-[calc(100%-2rem)] max-w-md max-h-[calc(100dvh-2rem)] -translate-x-1/2 -translate-y-1/2 gap-6 overflow-y-auto rounded-3xl bg-white p-6 text-gray-900 shadow-2xl outline-none data-[state=open]:animate-dialog-in data-[state=closed]:animate-dialog-out motion-reduce:animate-none sm:p-8 [&_:is([data-slot=button],[data-slot=dialog-close])]:rounded-full [&_:is([data-slot=button],[data-slot=dialog-close])]:font-semibold",
          className
        )}
        {...props}>
        {children}
        {showCloseButton && (
          <div className="absolute top-4 right-4">
            <DialogClose asChild>
              <Button variant="ghost" size="icon" aria-label={closeLabel} className="text-gray-400 hover:bg-gray-100 hover:text-gray-900">
                <XIcon className="size-5" aria-hidden="true" />
              </Button>
            </DialogClose>
          </div>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

function DialogHeader({
  className,
  children,
  variant = "default",
  icon = variant === "destructive" ? <Trash2Icon /> : <MessageCircleIcon />,
  ...props
}) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex min-w-0 flex-col gap-3 text-center", className)}
      {...props}>
      {icon && (
        <div aria-hidden="true" className={cn(
          "mx-auto mb-1 grid size-16 shrink-0 place-items-center rounded-full [&_svg]:size-8",
          variant === "destructive" ? "bg-red-50 text-destructive" : "bg-primary-50 text-primary-600"
        )}>
          {icon}
        </div>
      )}
      {children}
    </div>
  );
}

function DialogFooter({
  className,
  ...props
}) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn("flex flex-col-reverse gap-3 sm:flex-row sm:flex-wrap [&_:is([data-slot=button],[data-slot=dialog-close])]:h-11 [&_:is([data-slot=button],[data-slot=dialog-close])]:px-6 sm:[&_:is([data-slot=button],[data-slot=dialog-close])]:flex-1", className)}
      {...props} />
  );
}

function DialogTitle({
  className,
  ...props
}) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-3xl leading-tight font-bold tracking-tight text-gray-900 break-words", className)}
      {...props} />
  );
}

function DialogDescription({
  className,
  ...props
}) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-gray-500 leading-relaxed break-words", className)}
      {...props} />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
