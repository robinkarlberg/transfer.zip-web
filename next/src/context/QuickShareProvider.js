'use client'

import { createContext, useState } from 'react'

export const QuickShareContext = createContext({})

export function QuickShareProvider({ children }) {

  const { k, remoteSessionId, transferDirection } = {}

  /**
   * `true` if the user has been sent a link, either to receive or send a file
   */
  const hasBeenSentLink = !!(k && remoteSessionId && transferDirection)

  return (
    <QuickShareContext.Provider value={{
      hasBeenSentLink, k, remoteSessionId, transferDirection
    }}>
      {children}
    </QuickShareContext.Provider>
  )
}
