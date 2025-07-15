"use client"

import { sleep } from "@/lib/utils"
import NewTransferFileUpload from "@/components/dashboard/NewTransferFileUpload"
import Link from "next/link"
import BIcon from "@/components/BIcon"

export default function ({ user, storage, brandProfiles }) {
  return (
    <div className="lg:-mt-60 relative">
      <NewTransferFileUpload user={user} storage={storage} brandProfiles={brandProfiles} />
      <div className="hidden lg:flex w-full justify-center absolute -top-7 h-13 hover:-top-13 transition-all group">
        <Link className="inline-block border-t border-x rounded-lg rounded-b-none bg-white h-full w-60 group-hover:w-80 text-center pt-0.5 transition-all" href={"/quick"}>
          <p className="text-gray-700 font-medium">Quick Transfer <span className="relative left-0 group-hover:left-1 transition-all">&rarr;</span></p>
          <p className="text-sm text-gray-600 whitespace-nowrap">
            <BIcon name={"lock-fill"}/> End-to-end encrypted, files not stored.
          </p>
        </Link>
      </div>
      <Link href={"/quick"} className="w-full flex justify-center mt-4 lg:hidden">
        <div className="w-full max-w-[22rem] p-4 px-6 text-center border transition-all rounded-xl backdrop-blur-lg hover:backdrop-blur-xl hover:bg-primary-200/10 group">
          <p className="text-primary text-lg font-medium">Use Quick Transfer instead <span className="relative left-0 group-hover:left-1 transition-all">&rarr;</span></p>
          <p className="text-sm mt-1 text-gray-500 group-hover:text-gray-700">
            Temporary link - recipient must be online.
          </p>
          <p className="text-sm text-gray-500 group-hover:text-gray-700 font-medium">
            End-to-end encryption & no size limit.
          </p>
        </div>
      </Link>
    </div>
  )
}