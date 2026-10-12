import { NextResponse } from 'next/server';
import { useServerAuth } from '@/lib/server/wrappers/auth';
import Transfer from '@/lib/server/mongoose/models/Transfer';
import { resp } from '@/lib/server/serverUtils';
import { getMaxRecipientsForPlan } from '@/lib/getMaxRecipientsForPlan';
import { z } from "zod";

const schema = z.object({
  emails: z.array(z.string().trim().toLowerCase().email()).min(1),
});

/** @param {import("next/server").NextRequest} req */
export async function POST(req, { params }) {
  const { transferId } = await params;
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(resp(parsed.error.issues[0].message), { status: 400 });
  }
  const { emails } = parsed.data;

  const auth = await useServerAuth();
  if (!auth) {
    return NextResponse.json(resp('Unauthorized'), { status: 401 });
  }
  const transfer = await Transfer.findOne({ _id: transferId, author: auth.user._id });

  if (!transfer) {
    return NextResponse.json(resp('transfer not found'), { status: 404 });
  }

  if (transfer.transferRequest) {
    return NextResponse.json(resp('cannot send emails for a transfer request'), { status: 400 });
  }

  const existing = new Set(transfer.emailsSharedWith.map(e => e.email.toLowerCase()));
  const uniqueNew = [...new Set(emails)].filter(email => !existing.has(email));

  if (uniqueNew.length > getMaxRecipientsForPlan(auth.user.getPlan())) {
    return NextResponse.json(resp("too many recipients"));
  }

  for (const email of uniqueNew) {
    transfer.addSharedEmail(email);
  }

  await transfer.save();

  return NextResponse.json(resp({ added: uniqueNew.length }));
}
