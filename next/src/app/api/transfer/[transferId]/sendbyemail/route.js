import { NextResponse } from 'next/server';
import { useServerAuth } from '@/lib/server/wrappers/auth';
import Transfer from '@/lib/server/mongoose/models/Transfer';
import BrandProfile from '@/lib/server/mongoose/models/BrandProfile';
import { resp } from '@/lib/server/serverUtils';
import { sendTransferShare } from '@/lib/server/mail/mail';
import SentEmail from '@/lib/server/mongoose/models/SentEmail';
import { EMAILS_PER_DAY_LIMIT, getMaxRecipientsForPlan } from '@/lib/getMaxRecipientsForPlan';

export async function POST(req, { params }) {
  const { transferId } = await params;
  const { emails } = await req.json();

  if (!emails || !Array.isArray(emails) || emails.length === 0) {
    return NextResponse.json(resp('emails must be a non-empty array'), { status: 400 });
  }

  const auth = await useServerAuth();
  if (!auth) {
    return NextResponse.json(resp('Unauthorized'), { status: 401 });
  }
  const transfer = await Transfer.findOne({ _id: transferId, author: auth.user._id }).populate('brandProfile');

  if (!transfer) {
    return NextResponse.json(resp('transfer not found'), { status: 404 });
  }

  if (transfer.transferRequest) {
    return NextResponse.json(resp('cannot send emails for a transfer request'), { status: 400 });
  }

  const existing = new Set(transfer.emailsSharedWith.map(e => e.email));
  const uniqueNew = [...new Set(emails)].filter(email => !existing.has(email));

  if (uniqueNew.length > getMaxRecipientsForPlan(auth.user.getPlan())) {
    return NextResponse.json(resp("too many recipients"));
  }

  for (const email of uniqueNew) {
    transfer.addSharedEmail(email);
  }

  await transfer.save();

  if (transfer.finishedUploading) {
    const brand = transfer.brandProfile ? transfer.brandProfile.friendlyObj() : undefined;
    for (const email of uniqueNew) {
      const sentEmailsLastDay = await SentEmail.countDocuments({ userEmail: auth.user.email})
      if (sentEmailsLastDay >= EMAILS_PER_DAY_LIMIT) {
        return NextResponse.json(resp("You have sent too many emails today, please contact support."));
      }
      const sentEmail = new SentEmail({
        userEmail: auth.user.email,
        to: [email]
      })
      await sentEmail.save()
      await sendTransferShare(email, {
        name: transfer.name || 'Untitled Transfer',
        description: transfer.description,
        link: transfer.getDownloadLink(),
        brand,
      });
    }
  }

  return NextResponse.json(resp({ added: uniqueNew.length }));
}