"use client"

import BIcon from "@/components/BIcon"

export default function ({ transfer }) {
  return (
    <div className={`mx-auto w-full shadow-lg bg-white max-w-[22rem] rounded-2xl border`}>
      <div className="px-6 py-4 flex justify-center">
        <h2 className="text-2xl font-semibold tracking-tight">
          {transfer.name}
        </h2>
      </div>
    </div>
  )
}