import "server-only"
import Transfer from "./mongoose/models/Transfer"

export const IS_DEV = process.env.NODE_ENV == "development"

export const resp = (json) => {
  if (typeof (json) === "string") {
    return { success: false, message: json }
  }
  else {
    return { success: true, ...json }
  }
}

export const createCookieParams = () => {
  return (
    {
      domain: process.env.COOKIE_DOMAIN,
      httpOnly: true,
      secure: !IS_DEV,
      // Use lax to ensure the token cookie is included when returning
      // from external providers such as Stripe.
      sameSite: "lax",
      expires: new Date(Date.now() + 100 * 24 * 60 * 60 * 1000),
    }
  )
}

export const listTransfersForUser = async (user) => {
  const transfers = await Transfer.find({
    $or: [
      { author: user._id },
      { transferRequest: { $exists: true } } // Only consider transfers with a transferRequest
    ]
  })
    .populate({
      path: 'transferRequest', // Populate the transferRequest field
      populate: {
        path: 'author', // Populate the author within transferRequest
      },
    })
    .sort({ createdAt: -1 })

  const filteredTransfers = transfers.filter(transfer => !transfer.transferRequest || (transfer.transferRequest && transfer.transferRequest.author._id.toString() === user._id.toString()))

  return filteredTransfers
}