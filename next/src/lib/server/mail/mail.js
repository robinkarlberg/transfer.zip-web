import { Resend } from 'resend';
import { render } from '@react-email/render';
import TransferDownloadedEmail from './templates/TransferDownloadedEmail.jsx';
import TransferRequestReceivedEmail from './templates/TransferRequestReceivedEmail.jsx';
import TransferShareEmail from './templates/TransferShareEmail.jsx';
import TransferRequestShareEmail from './templates/TransferRequestShareEmail.jsx';
import PasswordResetEmail from './templates/PasswordResetEmail.jsx';
import MagicLinkEmail from './templates/MagicLinkEmail.jsx';
import TeamInviteEmail from './templates/TeamInviteEmail.jsx';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

async function sendMail(reactElement, { from, to, subject }) {
  if (resend) {
    await resend.emails.send({
      from: from || `noreply@${process.env.RESEND_DOMAIN || `transfer.zip`}`,
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
  await sendMail(TransferDownloadedEmail({ name, link, brand }), {
    to: email,
    subject: `Transfer downloaded - ${brand?.name || process.env.NEXT_PUBLIC_SITE_NAME}`,
  });
}

export async function sendTransferRequestReceived(email, { name, link, brand }) {
  await sendMail(TransferRequestReceivedEmail({ name, link, brand }), {
    to: email,
    subject: `Files received - ${brand?.name || process.env.NEXT_PUBLIC_SITE_NAME}`,
  });
}

export async function sendTransferRequestShare(email, { name, description, link, brand }) {
  await sendMail(TransferRequestShareEmail({ name, description, link, brand }), {
    to: email,
    subject: `Transfer request - ${brand?.name || process.env.NEXT_PUBLIC_SITE_NAME}`,
  });
}

export async function sendTransferShare(email, { name, description, link, brand }) {
  await sendMail(TransferShareEmail({ name, description, link, brand }), {
    to: email,
    subject: `Files available - ${brand?.name || process.env.NEXT_PUBLIC_SITE_NAME}`,
  });
}

export async function sendPasswordReset(email, { link }) {
  await sendMail(PasswordResetEmail({ link }), {
    to: email,
    subject: `Reset your password - ${process.env.NEXT_PUBLIC_SITE_NAME}`,
  });
}

export async function sendMagicLink(email, { link }) {
  await sendMail(MagicLinkEmail({ link }), {
    to: email,
    subject: `Log In - ${process.env.NEXT_PUBLIC_SITE_NAME}`,
  });
}

export async function sendTeamInvite(email, { teamName, inviterEmail, link }) {
  await sendMail(TeamInviteEmail({ teamName, inviterEmail, link }), {
    to: email,
    subject: `You've been invited to join ${teamName} - ${process.env.NEXT_PUBLIC_SITE_NAME}`,
  });
}