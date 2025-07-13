"use client"

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

import DashH2 from "./DashH2"
import { usePathname } from "next/navigation"
import { capitalizeFirstLetter } from "@/lib/utils"

export default function GenericPage({ title, children, side }) {
  const pathname = usePathname()

  return (
    <div>
      <Breadcrumb>
        <BreadcrumbList>
          {pathname.split('/').filter(Boolean).map((segment, idx, arr) => {
            const href = '/' + arr.slice(0, idx + 1).join('/')
            const isLast = idx === arr.length - 1
            return (
                <BreadcrumbItem key={segment}>
                  {isLast ? (
                    <BreadcrumbPage>
                      {capitalizeFirstLetter(segment)}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={href}>
                      {capitalizeFirstLetter(segment)}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              //   {!isLast && <BreadcrumbSeparator key={segment + "sep"} />}
              // </>
            )
          })}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="mt-2 flex justify-between items-center">
        <div className="mb-4">
          <DashH2>{title}</DashH2>
        </div>
        <div>
          {side}
        </div>
      </div>
      {children}
    </div>
  )
}