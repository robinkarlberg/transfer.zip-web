import { getTranslator } from "@/lib/i18n/translate"
import { Button, Heading, Hr, Text } from '@react-email/components';
import EmailLayout from './EmailLayout.jsx';

export default function TeamInviteAcceptedEmail({ language = "en", teamName, memberEmail, link }) {
  const t = getTranslator(language)
  return (
    <EmailLayout language={language}>
      <Heading style={h1}>{memberEmail} {t("joined your team")}</Heading>
      <Text style={text}>
        {memberEmail} {t("accepted your invitation and is now a member of \"")}{teamName}".
      </Text>
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
