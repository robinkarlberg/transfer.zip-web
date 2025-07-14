import icon from "@/img/icon.png"
import Image from "next/image"

export default function ({ brandProfile }) {
  return (
    <header className="backdrop-blur bg-gray-50/70 fixed top-0 left-0 w-full z-10 border-b data-[closed]:opacity-0 opacity-100 transition-all">
      <div className="flex items-center gap-x-1 justify-center p-4">
        <Image alt="Brand Profile Icon" width={32} height={32} src={brandProfile.iconUrl || icon} />
        <span className='ms-0.5 font-bold'>{brandProfile.name || "Transfer.zip"}</span>
      </div>
    </header>
  )
}