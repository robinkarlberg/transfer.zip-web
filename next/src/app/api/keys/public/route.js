"use server"

import { getPublicKey } from "@/lib/server/keyManager"

export async function GET() {
  // TODO: add nosniff
  return new Response(await getPublicKey(), { headers: { "Content-Type": "text/plain" } })
}