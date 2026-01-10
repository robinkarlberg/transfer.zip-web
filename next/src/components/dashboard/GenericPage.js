"use client"

import Link from "next/link"
import DashH2 from "./DashH2"
import { ChevronRightIcon } from "lucide-react"

export default function GenericPage({ title, titleComponent, children, category, side }) {
    return (
        <div className="flex-1 w-full">
            {category && (
                <div className="flex items-center text-gray-200 gap-1 font-medium">
                    <Link href={"."} className="hover:underline">{category}</Link>
                    <ChevronRightIcon size={16} />
                    <p className="">{title}</p>
                </div>
            )}
            <div className="flex justify-between items-center mb-4 flex-wrap gap-x-4">
                <div className="fade-in-up-fast">
                    {titleComponent || <DashH2>{title}</DashH2>}
                </div>
                <div className="fade-in-up-slow text-white">
                    {side}
                </div>
            </div>
            {/* idk om man ska ha bakgrund eller inteee */}
            {/* <div className="fade-in-up-subtle flex-1 bg-white p-4 mx-auto max-w-4xl rounded-3xl w-full"> */}
            <div className="fade-in-up-subtle flex-1 mx-auto rounded-3xl w-full">
                {children}
            </div>
        </div>
    )
}