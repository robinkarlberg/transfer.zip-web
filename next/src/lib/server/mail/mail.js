import { Resend } from 'resend';
import { render } from '@react-email/render';
import TransferDownloadedEmail from './templates/TransferDownloadedEmail.jsx';
import TransferRequestReceivedEmail from './templates/TransferRequestReceivedEmail.jsx';
import TransferShareEmail from './templates/TransferShareEmail.jsx';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'Transfer.zip';

async function sendMail(reactElement, { from, to, subject }) {
  if (resend) {
    await resend.emails.send({
      from: from || 'noreply@transfer.zip',
      to,
      subject,
      react: reactElement,
    });
  } else {
    console.log('[MOCK] Sending email to', to, 'from', from, 'subject', subject);
    console.log(await render(reactElement));
  }
}

export async function sendTransferDownloaded(email, { name, link }) {
  await sendMail(TransferDownloadedEmail({ name, link }), {
    to: email,
    subject: `Transfer downloaded - ${SITE_NAME}`,
  });
}

export async function sendTransferRequestReceived(email, { name, link }) {
  await sendMail(TransferRequestReceivedEmail({ name, link }), {
    to: email,
    subject: `Files received - ${SITE_NAME}`,
  });
}

export async function sendTransferShare(email, { name, description, link }) {
  await sendMail(TransferShareEmail({ name, description, link }), {
    to: email,
    subject: `Files available - ${SITE_NAME}`,
  });
}
