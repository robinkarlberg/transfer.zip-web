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

  const [cachedTransferId, setCachedTransferId] = useState(selectedTransferId)

  useEffect(() => {
    if (selectedTransferId) {
      setCachedTransferId(selectedTransferId)
    }
    else {
      sleep(300).then(setCachedTransferId(null))
    }
  }, [selectedTransferId])

  const [transfer, setTransfer] = useState(null)

  useEffect(() => {
    if (cachedTransferId) {
      getTransfer(cachedTransferId).then(({ transfer }) => setTransfer(transfer))
    }
  }, [cachedTransferId])

  return (
    <SelectedTransferContext.Provider value={{
      transfer,
      cachedTransferId,
      selectedTransferId, setSelectedTransferId
    }}>
      {children}
    </SelectedTransferContext.Provider>
  )
}
