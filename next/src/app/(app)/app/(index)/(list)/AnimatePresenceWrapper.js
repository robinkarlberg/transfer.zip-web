"use client"

import { AnimatePresence } from "framer-motion"

export default function AnimatePresenceWrapper({ children }) {
  return <AnimatePresence mode="wait">{children}</AnimatePresence>
}
