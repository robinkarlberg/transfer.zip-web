'use client'

import { useState } from 'react'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import BIcon from '../BIcon'
import Spinner from '../Spinner'

const primaryTextColor = { "danger": "text-red-600", "warning": "text-orange-600", "info": "text-primary", "success": "text-green-500" }
const primaryBgColor = { "danger": "bg-red-600", "warning": "bg-orange-600", "info": "bg-primary", "success": "bg-green-500", "none": "bg-primary" }
const primaryBgLightColor = { "danger": "bg-red-500", "warning": "bg-orange-500", "info": "bg-primary-light", "success": "bg-green-400", "none": "bg-primary-light" }
const primaryBgSubtleColor = { "danger": "bg-red-100", "warning": "bg-orange-100", "info": "bg-primary-subtle", "success": "bg-green-100" }

const iconName = { "danger": "exclamation-triangle", "warning": "exclamation-triangle", "info": "info-lg", "success": "check-lg" }

export default function Modal({ show, onClose, title, buttons, style = "info", icon, loading, children, size }) {

  const _size = size ?? "sm:max-w-lg"

  return (
    <Dialog open={show} onClose={onClose || (() => { })} className="relative z-20">
      <DialogBackdrop
        transition
        className="backdrop-blur-sm fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className={`relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95 ${_size}`}
          >
            <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                {style != "none" && (
                  <div className={`mx-auto flex size-12 shrink-0 items-center justify-center rounded-full ${primaryBgSubtleColor[style]} sm:mx-0 sm:size-10 sm:mr-4`}>
                    <BIcon name={icon || iconName[style]} aria-hidden="true" className={`size-6 ${primaryTextColor[style]}`} />
                  </div>
                )}
                <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  <DialogTitle as="h3" className="text-base font-semibold text-gray-900">
                    {title}
                  </DialogTitle>
                  <div className="mt-2">
                    {children}
                  </div>
                </div>
              </div>
            </div>
            {style != "none" && (
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                {
                  buttons?.map((button, index) => {
                    const buttonClass = index == 0 ? `inline-flex w-full justify-center rounded-md ${primaryBgColor[style]} px-3 py-2 text-sm font-semibold text-white shadow-sm hover:${primaryBgLightColor[style]} sm:ml-3 sm:w-auto`
                      : "mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"

                    return (
                      <button
                        key={index}
                        type={button.form ? "submit" : "button"}
                        form={button.form}
                        disabled={loading}
                        onClick={button.onClick}
                        className={buttonClass}
                      >
                        {button.title}{index == 0 && loading ? <Spinner className={"ms-1"} /> : ""}
                      </button>
                    )
                  })
                }
              </div>
            )}
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  )
}
