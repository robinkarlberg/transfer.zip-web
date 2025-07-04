import { NextResponse } from 'next/server';
import dbConnect from '@/lib/server/mongoose/db';
import Transfer from '@/lib/server/mongoose/models/Transfer';
import { resp } from '@/lib/server/serverUtils';
import { sendTransferDownloaded } from '@/lib/server/mail/mail';

const DOWNLOAD_EMAIL_COOLDOWN_MS = 1000 * 60 * 30;

export async function POST(req, { params }) {
  const { secretCode } = await params;
  await dbConnect();

  const transfer = await Transfer.findOne({ secretCode: { $eq: secretCode } }).populate('author');
  if (!transfer) {
    return NextResponse.json(resp('transfer not found'), { status: 404 });
  }

  transfer.logDownload();

  const now = new Date();
  const author = transfer.author;
  if (
    author &&
    author.notificationSettings?.transferDownloaded !== false &&
    (!transfer.lastDownloadEmailSentAt || now - transfer.lastDownloadEmailSentAt > DOWNLOAD_EMAIL_COOLDOWN_MS)
  ) {
    await sendTransferDownloaded(author.email, {
      name: transfer.name || 'Untitled Transfer',
      link: transfer.getDownloadLink(),
    });
    transfer.lastDownloadEmailSentAt = now;
  }

  await transfer.save();

  return NextResponse.json(resp({}));
}
