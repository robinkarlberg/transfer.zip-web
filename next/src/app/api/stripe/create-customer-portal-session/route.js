import { resp } from "@/lib/server/serverUtils";
import { getStripe } from "@/lib/server/stripe";
import { useServerAuth } from "@/lib/server/wrappers/auth";
import { NextResponse } from "next/server";

export async function POST() {
  const auth = await useServerAuth()
  if (!auth) {
    return NextResponse.json(resp("Unauthorized"), { status: 401 })
  }
  const { user } = auth

  const stripe_customer_id = user.hasTeam ? user.team.stripe_customer_id : user.stripe_customer_id

  if (!stripe_customer_id) {
    return NextResponse.redirect(`${process.env.SITE_URL}/`)
  }

  try {
    const session = await getStripe().billingPortal.sessions.create({
      customer: stripe_customer_id,
      return_url: `${process.env.SITE_URL}/app/settings`
    })

    return NextResponse.redirect(session.url, { status: 303 })
  }
  catch (err) {
    console.error(err)
    return NextResponse.json(resp("Error, sorry :/"), { status: 500 })
  }
}