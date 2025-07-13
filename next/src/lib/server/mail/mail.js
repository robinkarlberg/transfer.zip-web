import { Resend } from 'resend';
import { render } from '@react-email/render';
import TransferDownloadedEmail from './templates/TransferDownloadedEmail.jsx';
import TransferRequestReceivedEmail from './templates/TransferRequestReceivedEmail.jsx';
import TransferShareEmail from './templates/TransferShareEmail.jsx';
import TransferRequestShareEmail from './templates/TransferRequestShareEmail.jsx';
import PasswordResetEmail from './templates/PasswordResetEmail.jsx';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'Transfer.zip';
const DEFAULT_BRAND = {
  name: SITE_NAME,
  iconUrl: `${process.env.SITE_URL}/img/icon-small.png`,
  siteUrl: process.env.SITE_URL,
};

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

export async function sendTransferDownloaded(email, { name, link, brand }) {
  const b = brand || DEFAULT_BRAND;
  await sendMail(TransferDownloadedEmail({ name, link, brand: b }), {
    to: email,
    subject: `Transfer downloaded - ${b.name}`,
  });
}

export async function sendTransferRequestReceived(email, { name, link, brand }) {
  const b = brand || DEFAULT_BRAND;
  await sendMail(TransferRequestReceivedEmail({ name, link, brand: b }), {
    to: email,
    subject: `Files received - ${b.name}`,
  });
}

export async function sendTransferRequestShare(email, { name, description, link, brand }) {
  const b = brand || DEFAULT_BRAND;
  await sendMail(TransferRequestShareEmail({ name, description, link, brand: b }), {
    to: email,
    subject: `Transfer request - ${b.name}`,
  });
}

export async function sendTransferShare(email, { name, description, link, brand }) {
  const b = brand || DEFAULT_BRAND;
  await sendMail(TransferShareEmail({ name, description, link, brand: b }), {
    to: email,
    subject: `Files available - ${b.name}`,
  });
}

export async function sendPasswordReset(email, { link, brand }) {
  const b = brand || DEFAULT_BRAND;
  await sendMail(PasswordResetEmail({ link, brand: b }), {
    to: email,
    subject: `Reset your password - ${b.name}`,
  });
}