import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import CustomDomain from "@/lib/server/mongoose/models/CustomDomain"
import dbConnect from "@/lib/server/mongoose/db"
import { resp } from "@/lib/server/serverUtils"
import { useServerAuth } from "@/lib/server/wrappers/auth"
import {
  canManageCustomDomains,
  customDomainOwnershipFor,
  customDomainScopeQuery,
  isReservedDomain,
} from "@/lib/server/mongoose/helpers/customDomains"
import { FEATURE } from "@/lib/pricing"
import { runVerification } from "@/lib/server/customDomainVerify"

// FQDN: 1-253 chars total, each label 1-63 chars alphanumeric+hyphens
// without leading/trailing hyphens, at least one dot. Punycode TLDs
// (xn--*) work because we allow alphanumeric in every label.
const DOMAIN_REGEX = /^(?=.{4,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/

const bodySchema = z.object({
  domain: z.string().trim().toLowerCase().regex(DOMAIN_REGEX, "Enter a valid domain (e.g. files.acme.com)"),
})

/** @param {NextRequest} req */
export async function POST(req) {
  const auth = await useServerAuth()
  if (!auth) return NextResponse.json(resp("Unauthorized"), { status: 401 })
  const { user } = auth

  if (!user.hasFeature(FEATURE.CUSTOM_BRANDING)) {
    return NextResponse.json(resp("Upgrade to Pro to connect a custom domain."), { status: 409 })
  }
  if (!canManageCustomDomains(user)) {
    return NextResponse.json(resp("Only the team Owner or Admin can manage custom domains."), { status: 403 })
  }

  const parsed = bodySchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json(resp(parsed.error.issues[0].message), { status: 400 })
  }
  const { domain } = parsed.data

  if (isReservedDomain(domain)) {
    return NextResponse.json(resp("That domain is reserved."), { status: 400 })
  }

  await dbConnect()

  const existing = await CustomDomain.findOne(customDomainScopeQuery(user)).select("_id").lean()
  if (existing) {
    return NextResponse.json(resp("You can only connect one custom domain."), { status: 409 })
  }

  try {
    const created = await CustomDomain.create({
      ...customDomainOwnershipFor(user),
      domain,
    })
    // Resolve-on-submit: if DNS is already pointing at us, the user gets
    // an "Active" badge the moment they hit Connect, no polling round-trip.
    await runVerification(created)
    return NextResponse.json(resp({ customDomain: created.toJsonAsClient() }))
  } catch (e) {
    // unique index on `domain` - another account already claimed it.
    // Don't echo back who; that's an enumeration leak.
    if (e?.code === 11000) {
      return NextResponse.json(
        resp("That domain is already linked to another account. If it's yours, contact support."),
        { status: 409 }
      )
    }
    throw e
  }
}
