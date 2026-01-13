"use client"

import { cn } from "@/lib/utils"
import { Transition } from "@headlessui/react"
import Link from "next/link"

export default function ({ expand, quickLinkHref, quickLinkContent, showQuickLink, startOverlay, showStartOverlay, endOverlay, showEndOverlay, leftSectionContent, leftSectionLowerBar, rightSection }) {

  return (
    <div className="relative mx-auto">
      <Transition show={showQuickLink}>
        <div className="absolute -top-7 flex w-full justify-center">
          <Link className="inline-block border-t border-x rounded-lg rounded-b-none hover:scale-102 bg-white h-full w-60 text-center py-0.5 transition-all text-gray-600 hover:text-primary-light hover:font-medium" href={quickLinkHref}>
            <p>
              {quickLinkContent}
            </p>
          </Link>
        </div>
      </Transition>
      <div className={cn(
        `w-full bg-white border shadow-xs relative overflow-clip rounded-xl ${!expand ? "max-w-xs" : "max-w-2xl"} transition-all duration-700 relative`,
        expand ? "h-128" : "h-96", 
        "md:h-96"
      )}>
        <Transition show={showEndOverlay}>
          <div className="z-20 bg-white absolute left-0 top-0 w-full h-full flex flex-col items-center justify-center group transition data-[closed]:opacity-0">
            {endOverlay}
          </div>
        </Transition>
        <Transition show={showStartOverlay}>
          {startOverlay}
        </Transition>
        <div className="grid grid-cols-1 md:grid-cols-5 h-full">
          {(leftSectionContent || leftSectionLowerBar) && (
            <div className={cn(
              rightSection ? "order-2 md:order-1 border-t md:border-0 col-span-2" : "col-span-5",
              "flex flex-col overflow-hidden relative max-h-72 md:max-h-fit"
            )}>
              <div className="flex-1 py-2 px-1 overflow-y-auto">
                {leftSectionContent}
              </div>
              <div className="flex-none p-2 flex items-center gap-2 --border-t">
                {leftSectionLowerBar}
              </div>
            </div>
          )}
          {rightSection && (
            <div className={cn(
              (leftSectionContent || leftSectionLowerBar) ? "order-1 md:order-2 col-span-3" : "col-span-5",
              "grid overflow-hidden min-w-80"
            )}>
              {rightSection}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}