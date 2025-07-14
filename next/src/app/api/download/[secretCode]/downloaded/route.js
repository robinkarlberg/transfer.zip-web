import { NextResponse } from 'next/server';
import Transfer from '@/lib/server/mongoose/models/Transfer';
import BrandProfile from '@/lib/server/mongoose/models/BrandProfile';
import { resp } from '@/lib/server/serverUtils';
import { sendTransferDownloaded } from '@/lib/server/mail/mail';
import { useServerAuth } from '@/lib/server/wrappers/auth';

const DOWNLOAD_EMAIL_COOLDOWN_MS = 1000 * 60 * 30;

export async function POST(req, { params }) {
  const { secretCode } = await params;

  let auth
  try {
    auth = await useServerAuth()
  }
  catch (err) {

  }

  const transfer = await Transfer.findOne({ secretCode: { $eq: secretCode } }).populate('author').populate('brandProfile');
  if (!transfer) {
    return NextResponse.json(resp('transfer not found'), { status: 404 });
  }

  if (auth && auth.user._id.toString() === transfer.author._id.toString()) {
    return NextResponse.json(resp({}));
  }

  transfer.logDownload();

  const now = new Date();
  const author = transfer.author;
  if (
    author &&
    author.notificationSettings?.transferDownloaded !== false &&
    (!transfer.lastDownloadEmailSentAt || now - transfer.lastDownloadEmailSentAt > DOWNLOAD_EMAIL_COOLDOWN_MS)
  ) {
    const brand = transfer.brandProfile ? transfer.brandProfile.friendlyObj() : undefined;
    await sendTransferDownloaded(author.email, {
      name: transfer.name || 'Untitled Transfer',
      link: `${process.env.SITE_URL}/app/${transfer._id.toString()}`,
      brand,
    });
    transfer.lastDownloadEmailSentAt = now;
  }

  await transfer.save();

  return NextResponse.json(resp({}));
}
