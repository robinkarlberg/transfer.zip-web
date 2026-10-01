"use client"

import { CheckIcon, InfoIcon, TriangleAlertIcon } from "lucide-react"
import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import BIcon from "../BIcon"
import Spinner from "./Spinner"

const MODAL_ICONS = { danger: TriangleAlertIcon, warning: TriangleAlertIcon, info: InfoIcon, success: CheckIcon }

export default function Modal({ show, onClose, title, buttons, style = "info", icon, loading, children, size }) {

  const Icon = MODAL_ICONS[style]
  const returnFocusRef = useRef(null)

  return (
    <Dialog open={show} onOpenChange={open => { if (!open && onClose) onClose() }}>
      <DialogContent
        className={size}
        aria-describedby={undefined}
        showCloseButton={!!onClose}
        onOpenAutoFocus={() => { returnFocusRef.current = document.activeElement }}
        onCloseAutoFocus={event => {
          event.preventDefault()
          returnFocusRef.current.focus()
        }}
      >
        {style === "none" ? (
          <DialogTitle className="sr-only">{title}</DialogTitle>
        ) : (
          <DialogHeader variant={style === "danger" ? "destructive" : "default"} icon={icon ? <BIcon name={icon} /> : <Icon />}>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
        )}
        <div>{children}</div>
        {style !== "none" && buttons && (
          <DialogFooter>
            {buttons.map((button, index) => (
              <Button
                key={index}
                type={button.form ? "submit" : "button"}
                form={button.form}
                disabled={loading}
                onClick={button.onClick}
                variant={index === 0 ? (style === "danger" ? "destructive" : "default") : "outline"}
              >
                {button.title}{index === 0 && loading && <Spinner />}
              </Button>
            )).reverse()}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
