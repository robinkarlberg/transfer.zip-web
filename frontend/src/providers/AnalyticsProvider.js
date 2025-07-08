import { createContext, useCallback, useContext, useEffect, useState } from "react"
import { Outlet } from "react-router-dom";

export const AnalyticsContext = createContext({})

export const AnalyticsProvider = ({ }) => {
  const doAnalytics = process.env["REACT_APP_ANALYTICS"] == "true"

  useEffect(() => {
    if (!doAnalytics) {
      return
    }

    const scriptElement = window.document.createElement("script")
    scriptElement.setAttribute("data-website-id", "cebb948f-071a-45db-b912-aa73876bf398")
    scriptElement.defer = true
    scriptElement.src = "https://umami.w0bb.com/script.js"
    document.body.appendChild(scriptElement)

    return () => {
      document.body.removeChild(scriptElement)
    }
  }, [])

  return (
    <AnalyticsContext.Provider value={{}}>
      <Outlet />
    </AnalyticsContext.Provider>
  );
};
