"use client"

import { useContext, useEffect, useState } from "react"
import TransferSidebar from "./TransferSidebar"
import { Transition } from "@headlessui/react"
import { SelectedTransferContext } from "@/context/SelectedTransferProvider"
import { getTransfer } from "@/lib/client/Api"
import { sleep } from "@/lib/utils"

export default function ({ user, brandProfiles }) {

  const { selectedTransferId, transfer } = useContext(SelectedTransferContext)

  // console.log(cachedTransferId)

  return (
    <Transition show={!!selectedTransferId}>
      <div className="z-20 --overflow-hidden duration-0 data-[closed]:w-0 data-[leave]:overflow-hidden data-[enter]:overflow-hidden fixed top-0 w-[100vw] h-full md:right-0 md:duration-300 md:w-96 xl:w-[512px]">
        <div className="absolute h-full w-full md:w-96 xl:w-[512px]">
          <TransferSidebar user={user} selectedTransfer={transfer} />
        </div>
      </div>
    </Transition>
  )
}