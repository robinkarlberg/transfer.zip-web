import icon from "@/img/icon.png"
import Image from "next/image"

export default function ({ brandProfile }) {
  return (
    <header className="fixed inset-x-0 top-4 z-30 flex justify-center px-3 sm:top-6">
      <div className="flex h-14 min-w-0 items-center gap-2.5 rounded-full bg-white pr-5 pl-2.5 shadow-[0_18px_50px_rgba(17,24,39,0.12)] ring-1 ring-gray-200">
        <Image alt="" width={36} height={36} src={brandProfile.iconUrl || icon} className="size-9 shrink-0 rounded-full object-cover" />
        <span className="truncate text-lg font-bold tracking-tight text-gray-900">{brandProfile.name || "Transfer.zip"}</span>
      </div>
    </header>
  )
}
