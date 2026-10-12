/** @param {import("pino").Logger} logger */
export async function runEmailQueue(nextUrl, logger) {
  try {
    const response = await fetch(`${nextUrl}/api/internal/mail/process`, {
      method: "POST",
      signal: AbortSignal.timeout(60_000),
    })
    if (!response.ok) throw new Error(`Email queue returned HTTP ${response.status}`)
    const result = await response.json()
    if (result.queued || result.sent || result.retried || result.failed || result.cancelled) {
      logger.info(result, "Email queue processed")
    }
  } catch (err) {
    logger.error({ err }, "Email queue processing failed")
  }
}
