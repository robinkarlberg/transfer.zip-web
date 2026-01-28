'use client'

import { createContext } from 'react'

export const DashboardContext = createContext({})

export default function DashboardProvider({ children }) {
  return (
    <DashboardContext.Provider value={{}}>
      {children}
    </DashboardContext.Provider>
  )
}
