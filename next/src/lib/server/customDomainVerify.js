import "server-only"
import { Resolver, resolve4, resolveNs } from "node:dns/promises"

import { ROLES } from "@/lib/roles"
import User from "./mongoose/models/User"
import { sendCustomDomainConnected } from "./mail/mail"

// The CNAME value the user's domain must point at to count as ours.
// CNAME-only on purpose
const TARGET_CNAME = process.env.CUSTOM_DOMAIN_TARGET_CNAME || "transfer.zip"

const normalize = (host) => host.toLowerCase().replace(/\.$/, "")

// Walk parent zones until we find authoritative NS records. For a
// subdomain like "files.acme.com" we start at "acme.com" and skip the
// host itself: when the host has a CNAME, resolveNs follows the CNAME
// (RFC 1034 §3.6.2) and returns NS records for the *target's* zone,
// which then can't answer authoritatively for the host. For an apex
// ("acme.com"), the host is the start.
const findAuthoritativeNs = async (host) => {
  const labels = host.split(".")
  const startIdx = labels.length > 2 ? 1 : 0
  for (let i = startIdx; i < labels.length - 1; i++) {
    const zone = labels.slice(i).join(".")
    try {
      const ns = await resolveNs(zone)
      if (ns.length > 0) return ns
    } catch { /* try parent */ }
  }
  return []
}

const ipOfNs = async (nsHost) => {
  try {
    const ips = await resolve4(nsHost)
    return ips[0] || null
  } catch {
    return null
  }
}

// Ask the zone's authoritative NS directly so a user who just added a
// CNAME doesn't have to wait out a recursive resolver's negative-cache
// TTL (often 5-15 min) before verification succeeds. Falls back to
// returning [] when the authoritative path fails entirely; the periodic
// re-check will retry.
const cnamesOf = async (host) => {
  const nsHosts = await findAuthoritativeNs(host)
  for (const nsHost of nsHosts) {
    const nsIp = await ipOfNs(nsHost)
    if (!nsIp) continue
    const resolver = new Resolver()
    resolver.setServers([nsIp])
    try {
      return await resolver.resolveCname(host)
    } catch (err) {
      // ENODATA/ENOTFOUND from an authoritative server is the final answer.
      // Other errors (timeout, refused) - try the next NS.
      if (err.code === "ENODATA" || err.code === "ENOTFOUND") return []
    }
  }
  return []
}

/**
 * @param {string} domain
 * @returns {Promise<{verified: boolean, reason?: string}>}
 */
export async function verifyDomainResolves(domain) {
  const cnames = await cnamesOf(domain)
  if (cnames.length === 0) {
    return { verified: false, reason: "no-cname" }
  }
  if (cnames.some(c => normalize(c) === TARGET_CNAME)) {
    return { verified: true }
  }
  return { verified: false, reason: "wrong-target" }
}

/**
 * Runs a DNS check against the doc's domain, persists the result, and
 * sends the "domain connected" email on the false → true transition only.
 * The flip only ever happens here, so the email can't fire twice.
 */
export async function runVerification(doc) {
  const wasVerified = doc.verified
  const result = await verifyDomainResolves(doc.domain)
  const now = new Date()
  doc.lastCheckedAt = now
  if (result.verified && !wasVerified) {
    doc.verified = true
    doc.verifiedAt = now
  }
  await doc.save()

  if (result.verified && !wasVerified) {
    try {
      await notifyDomainConnected(doc)
    } catch (err) {
      // Email failure must not roll back verification.
      console.error("sendCustomDomainConnected failed", err)
    }
  }
  return doc
}

async function notifyDomainConnected(doc) {
  let recipientEmail = null
  if (doc.team) {
    const owner = await User.findOne({ team: doc.team, role: ROLES.OWNER }).select("email").lean()
    recipientEmail = owner?.email
  } else if (doc.user) {
    const u = await User.findById(doc.user).select("email").lean()
    recipientEmail = u?.email
  }
  if (!recipientEmail) return
  await sendCustomDomainConnected(recipientEmail, {
    domain: doc.domain,
    link: `${process.env.SITE_URL || ""}/app/branding`,
  })
}
