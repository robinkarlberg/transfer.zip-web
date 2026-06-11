import { parseQuickCodeInput } from "./quickcode"

export const getComputedNewLocation = (transferDirection) => {
  return transferDirection == "R" ? "/quick/progress" : "/quick"
}

// Hash shapes: "#R"/"#S" (local role), "#c=712394" (connect by code),
// "#k,sessionId,direction" (link opener). transferDirection: null marks
// "parsed, nothing valid" so callers can route back to /quick.
export const tryParseQuickShareHash = (hash) => {
  if (hash === "#R") {
    return { transferDirection: "R" }
  }
  if (hash === "#S") {
    return { transferDirection: "S" }
  }
  if (hash.startsWith("#c=")) {
    const code = parseQuickCodeInput(hash.slice(3))
    return code ? { code } : { transferDirection: null }
  }
  const hashList = hash.slice(1).split(",")
  if (hash && hashList.length === 3) {
    const [k, remoteSessionId, transferDirection] = hashList

    if (remoteSessionId.length !== 8 && (transferDirection !== "R" && transferDirection !== "S")) {
      throw new Error("The URL parameters are malformed. Did you copy the URL correctly?")
    }

    return { k, remoteSessionId, transferDirection }
  }
  return { transferDirection: null }
}
