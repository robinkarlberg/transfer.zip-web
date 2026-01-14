import { useServerAuth } from "@/lib/server/wrappers/auth";
import { NextResponse } from "next/server";
import * as jose from "jose"

export async function GET() {
  const auth = await useServerAuth()
  if (!auth) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 })
  }

  const payload = {
    userDetail: {
      email: auth.user.email,

      plan: auth.user.getPlan(),
      planValidUntil: auth.user.planValidUntil,
      planCancelling: auth.user.planCancelling,
    },
    integrations: {
      stripe: {
        customerId: auth.user.stripe_customer_id
      }
    }
  }

  const identity = await new jose.EncryptJWT(payload)
    .setProtectedHeader({ alg: "dir", enc: "A128GCM" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .encrypt(Buffer.from(process.env.MEGADESK_IDENTITY_SECRET, "hex"))

  return NextResponse.json({ identity });
}