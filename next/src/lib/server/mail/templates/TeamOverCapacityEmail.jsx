import { getTranslator } from "@/lib/i18n/translate"
import { Button, Heading, Hr, Text } from '@react-email/components';
import EmailLayout from './EmailLayout.jsx';

export default function TeamOverCapacityEmail({ language = "en", teamName, memberCount, seats, link }) {
  const t = getTranslator(language)
  const surplus = Math.max(memberCount - seats, 0);
  return (
    <EmailLayout language={language}>
      <Heading style={h1}>{teamName} {t("is over its seat limit")}</Heading>
      <Text style={text}>{t("Your team now has")} <strong>{memberCount} {t("members")}</strong> {t("but only")} <strong>{seats} {t("paid")} {seats === 1 ? t("seat") : t("seats")}</strong>{t(". You're")} {surplus} {surplus === 1 ? t("seat") : t("seats")} {t("over capacity.")}</Text>
      <Text style={text}>{t("To stay within your subscription, either add more seats or remove team members. Members keep access until you take action.")}</Text>
      <Button style={button} href={link}>{t("Manage Team")}</Button>
      <Hr style={{ marginTop: '24px' }} />
      <Text style={{ color: '#2563eb', textDecoration: 'underline' }}>
        <a href={link}>{link}</a>
      </Text>
    </EmailLayout>
  );
}

const h1 = { fontSize: '20px', marginBottom: '12px', fontWeight: '600' };
const text = { fontSize: '16px', lineHeight: '22px' };
const button = {
  backgroundColor: '#2563eb',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center',
  display: 'inline-block',
  padding: '10px',
};
