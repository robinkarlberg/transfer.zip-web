'use client'

import { getTransfer } from '@/lib/client/Api'
import { sleep } from '@/lib/utils'
import { useParams } from 'next/navigation'
import { createContext, useEffect, useState } from 'react'

export const SelectedTransferContext = createContext({})

export function SelectedTransferProvider({ children }) {
  const [selectedTransferId, setSelectedTransferId] = useState(null)

  const { transferIdSlug } = useParams()

  useEffect(() => {
    if (transferIdSlug && transferIdSlug.length > 0) {
      setSelectedTransferId(transferIdSlug[0])
    }
    else {
      setSelectedTransferId(null)
    }
  }, [transferIdSlug])

  const refreshTransfer = () => {
    // setTransfer(null)
    getTransfer(selectedTransferId)
      .then(({ transfer }) => setTransfer(transfer))
      .catch(err => setTransfer(null))
  }

  const [transfer, setTransfer] = useState(null)

  useEffect(() => {
    if (selectedTransferId) {
      refreshTransfer()
    }
  }, [selectedTransferId])

  return (
    <SelectedTransferContext.Provider value={{
      transfer,
      selectedTransferId, setSelectedTransferId,
      refreshTransfer
    }}>
      {children}
    </SelectedTransferContext.Provider>
  )
}
