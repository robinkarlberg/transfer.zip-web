export const getComputedNewLocation = (transferDirection) => {
  return transferDirection == "R" ? "/quick-share/progress" : "/quick-share"
}

export const tryParseQuickShareHash = (hash) => {
  console.log("PARSE HASH:", hash)
  if (hash === "#R") {
    return {
      transferDirection: "R",
      // computedNewLocation: getComputedNewLocation(transferDirection)
    }
  }
  else if (hash === "#S") {
    return {
      transferDirection: "S",
      // computedNewLocation: getComputedNewLocation(transferDirection)
    }
  }
  else {
    const hashList = hash.slice(1).split(",")
    if (hash && hashList.length === 3) {
      const [k, remoteSessionId, transferDirection] = hashList

      if (remoteSessionId.length !== 36 && (transferDirection !== "R" && transferDirection !== "S")) {
        throw new Error("The URL parameters are malformed. Did you copy the URL correctly?")
      }

      return {
        k,
        remoteSessionId,
        transferDirection,
        // computedNewLocation: getComputedNewLocation(transferDirection)
      }
      // return <Navigate href={newLocation} state={state} replace={true} />
    }
    else return {
      // Setting it to null instead of undefined marks that we checked 
      // it and we can route back in QuickShareProgress if nothing is set
      transferDirection: null
    }
  }
}