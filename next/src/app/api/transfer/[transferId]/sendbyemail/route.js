import { NextResponse } from 'next/server';
import { useServerAuth } from '@/lib/server/wrappers/auth';
import Transfer from '@/lib/server/mongoose/models/Transfer';
import { resp } from '@/lib/server/serverUtils';
import { sendTransferShare } from '@/lib/server/mail/mail';

export async function POST(req, { params }) {
  const { transferId } = await params;
  const { emails } = await req.json();

  if (!emails || !Array.isArray(emails) || emails.length === 0) {
    return NextResponse.json(resp('emails must be a non-empty array'), { status: 400 });
  }

  const auth = await useServerAuth();
  const transfer = await Transfer.findOne({ _id: transferId, author: auth.user._id });

  if (!transfer) {
    return NextResponse.json(resp('transfer not found'), { status: 404 });
  }

  if (transfer.transferRequest) {
    return NextResponse.json(resp('cannot send emails for a transfer request'), { status: 400 });
  }

  const existing = new Set(transfer.emailsSharedWith.map(e => e.email));
  const uniqueNew = [...new Set(emails)].filter(email => !existing.has(email));

  for (const email of uniqueNew) {
    transfer.addSharedEmail(email);
  }

  await transfer.save();

  if (transfer.finishedUploading) {
    for (const email of uniqueNew) {
      await sendTransferShare(email, {
        name: transfer.name || 'Untitled Transfer',
        description: transfer.description,
        link: transfer.getDownloadLink(),
      });
    }
  }

  return NextResponse.json(resp({ added: uniqueNew.length }));
}