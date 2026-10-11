import { getTranslator } from "@/lib/i18n/translate"
import { localizedLink } from "@/lib/i18n/language"
import { Resend } from 'resend';
import { render } from '@react-email/render';
import TransferDownloadedEmail from './templates/TransferDownloadedEmail.jsx';
import TransferRequestReceivedEmail from './templates/TransferRequestReceivedEmail.jsx';
import TransferShareEmail from './templates/TransferShareEmail.jsx';
import TransferRequestShareEmail from './templates/TransferRequestShareEmail.jsx';
import PasswordResetEmail from './templates/PasswordResetEmail.jsx';
import MagicLinkEmail from './templates/MagicLinkEmail.jsx';
import TeamInviteEmail from './templates/TeamInviteEmail.jsx';
import TeamInviteAcceptedEmail from './templates/TeamInviteAcceptedEmail.jsx';
import TeamMemberRemovedEmail from './templates/TeamMemberRemovedEmail.jsx';
import TeamRoleChangedEmail from './templates/TeamRoleChangedEmail.jsx';
import TeamSeatCapacityReachedEmail from './templates/TeamSeatCapacityReachedEmail.jsx';
import TeamOverCapacityEmail from './templates/TeamOverCapacityEmail.jsx';
import CustomDomainConnectedEmail from './templates/CustomDomainConnectedEmail.jsx';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

async function sendMail(reactElement, { from, to, subject }) {
  const finalSubject = process.env.NODE_ENV !== "production" ? `[RKT-DEV] ${subject}` : subject;
  if (resend) {
    await resend.emails.send({
      from: from || `noreply@${process.env.RESEND_DOMAIN || `transfer.zip`}`,
      to,
      subject: finalSubject,
      react: reactElement,
    });
  } else {
    console.log('[MOCK] Sending email to', to, 'from', from, 'subject', finalSubject);
    console.log(await render(reactElement));
  }
}

export async function sendTransferDownloaded(email, { name, link, brand, language = "en" }) {
  const t = getTranslator(language)
  link = localizedLink(link, language)
  await sendMail(TransferDownloadedEmail({ language, name, link, brand }), {
    to: email,
    subject: `${t("Transfer downloaded")} - ${brand?.name || process.env.NEXT_PUBLIC_SITE_NAME} | ${new Date().toISOString().replace('T', ' ').slice(0, 19)}`,
  });
}

export async function sendTransferRequestReceived(email, { name, link, brand, language = "en" }) {
  const t = getTranslator(language)
  link = localizedLink(link, language)
  await sendMail(TransferRequestReceivedEmail({ language, name, link, brand }), {
    to: email,
    subject: `${t("Files received")} - ${brand?.name || process.env.NEXT_PUBLIC_SITE_NAME} | ${new Date().toISOString().replace('T', ' ').slice(0, 19)}`,
  });
}

export async function sendTransferRequestShare(email, { name, description, link, brand, language = "en" }) {
  const t = getTranslator(language)
  link = localizedLink(link, language)
  await sendMail(TransferRequestShareEmail({ language, name, description, link, brand }), {
    to: email,
    subject: `${t("Transfer request")} - ${brand?.name || process.env.NEXT_PUBLIC_SITE_NAME}`,
  });
}

export async function sendTransferShare(email, { name, description, link, brand, language = "en" }) {
  const t = getTranslator(language)
  link = localizedLink(link, language)
  await sendMail(TransferShareEmail({ language, name, description, link, brand }), {
    to: email,
    subject: `${t("Files available")} - ${brand?.name || process.env.NEXT_PUBLIC_SITE_NAME}`,
  });
}

export async function sendPasswordReset(email, { link, language = "en" }) {
  const t = getTranslator(language)
  link = localizedLink(link, language)
  await sendMail(PasswordResetEmail({ language, link }), {
    to: email,
    subject: `${t("Reset your password")} - ${process.env.NEXT_PUBLIC_SITE_NAME} | ${new Date().toISOString().replace('T', ' ').slice(0, 19)}`,
  });
}

export async function sendMagicLink(email, { link, language = "en" }) {
  const t = getTranslator(language)
  link = localizedLink(link, language)
  await sendMail(MagicLinkEmail({ language, link }), {
    to: email,
    subject: `${t("Log In")} - ${process.env.NEXT_PUBLIC_SITE_NAME} | ${new Date().toISOString().replace('T', ' ').slice(0, 19)}`,
  });
}

export async function sendTeamInvite(email, { teamName, inviterName, link, language = "en" }) {
  const t = getTranslator(language)
  link = localizedLink(link, language)
  await sendMail(TeamInviteEmail({ language, teamName, inviterName, link }), {
    to: email,
    subject: `${t("You've been invited to join {teamName}", { teamName })} - ${process.env.NEXT_PUBLIC_SITE_NAME} | ${new Date().toISOString().replace('T', ' ').slice(0, 19)}`,
  });
}

export async function sendTeamInviteAccepted(email, { teamName, memberEmail, link, language = "en" }) {
  const t = getTranslator(language)
  link = localizedLink(link, language)
  await sendMail(TeamInviteAcceptedEmail({ language, teamName, memberEmail, link }), {
    to: email,
    subject: `${t("{memberEmail} joined {teamName}", { memberEmail, teamName })} - ${process.env.NEXT_PUBLIC_SITE_NAME}`,
  });
}

export async function sendTeamMemberRemoved(email, { teamName, language = "en" }) {
  const t = getTranslator(language)
  await sendMail(TeamMemberRemovedEmail({ language, teamName }), {
    to: email,
    subject: `${t("You've been removed from {teamName}", { teamName })} - ${process.env.NEXT_PUBLIC_SITE_NAME}`,
  });
}

export async function sendTeamRoleChanged(email, { teamName, role, link, language = "en" }) {
  const t = getTranslator(language)
  link = localizedLink(link, language)
  await sendMail(TeamRoleChangedEmail({ language, teamName, role, link }), {
    to: email,
    subject: `${t("Your role in {teamName} has changed", { teamName })} - ${process.env.NEXT_PUBLIC_SITE_NAME}`,
  });
}

export async function sendTeamSeatCapacityReached(email, { teamName, seats, link, language = "en" }) {
  const t = getTranslator(language)
  link = localizedLink(link, language)
  await sendMail(TeamSeatCapacityReachedEmail({ language, teamName, seats, link }), {
    to: email,
    subject: `${t("{teamName} has reached its seat limit", { teamName })} - ${process.env.NEXT_PUBLIC_SITE_NAME}`,
  });
}

export async function sendTeamOverCapacity(email, { teamName, memberCount, seats, link, language = "en" }) {
  const t = getTranslator(language)
  link = localizedLink(link, language)
  await sendMail(TeamOverCapacityEmail({ language, teamName, memberCount, seats, link }), {
    to: email,
    subject: `${t("{teamName} is over its seat limit", { teamName })} - ${process.env.NEXT_PUBLIC_SITE_NAME}`,
  });
}

export async function sendCustomDomainConnected(email, { domain, link, language = "en" }) {
  const t = getTranslator(language)
  link = localizedLink(link, language)
  await sendMail(CustomDomainConnectedEmail({ language, domain, link }), {
    to: email,
    subject: `${t("Custom domain {domain} is live", { domain })} - ${process.env.NEXT_PUBLIC_SITE_NAME}`,
  });
}