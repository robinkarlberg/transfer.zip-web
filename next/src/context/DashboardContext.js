'use client'

import Notification from '@/components/elements/Notification'
import { createContext, useEffect, useState } from 'react'

export const DashboardContext = createContext({})

export default function DashboardProvider({ blogs, children }) {
  const [notificationProps, setNotificationProps] = useState({ show: false, title: "", description: "" })
  const [notificationTimeoutId, setNotificationTimeoutId] = useState(null)

  const clearNotification = () => {
    setNotificationProps({ ...notificationProps, show: false })
    setNotificationTimeoutId(null)
  }

  const displayNotification = (type, title, description) => {
    if (notificationTimeoutId) clearTimeout(notificationTimeoutId)
    setNotificationProps({ show: true, type, title, description })
    setNotificationTimeoutId(setTimeout(clearNotification, 4000))
  }

  // const blog = blogs.find(_blog => _blog.id === selectedBlogId)

  // console.log(blogs, selectedBlogId)

  return (
    <DashboardContext.Provider value={{ displayNotification }}>
      <Notification onHide={clearNotification} {...notificationProps} />
      {children}
    </DashboardContext.Provider>
  )
}
