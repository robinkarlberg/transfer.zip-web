'use client'

import { createContext, useState } from 'react'

export const FileContext = createContext({})

export function FileProvider({ children }) {
  const [files, setFiles] = useState([])

  const addFile = file => {
    setFiles(prev => [...prev, file])
  }

  const addFiles = newFiles => {
    setFiles(prev => [...prev, ...newFiles])
  }

  const clear = () => {
    setFiles([])
  }

  return (
    <FileContext.Provider value={{ files, setFiles, addFile, addFiles, clear }}>
      {children}
    </FileContext.Provider>
  )
}
