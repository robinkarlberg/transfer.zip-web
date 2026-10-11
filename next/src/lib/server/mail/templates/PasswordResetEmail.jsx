import { getTranslator } from "@/lib/i18n/translate"
import { Button, Heading, Hr, Text } from '@react-email/components';
import EmailLayout from './EmailLayout.jsx';

export default function PasswordResetEmail({ language = "en", link }) {
  const t = getTranslator(language)
  return (
    <EmailLayout language={language}>
      <Heading style={h1}>{t("Password reset request")}</Heading>
      <Text style={text}>{t("Click the button below to reset your password.")}</Text>
      <Button style={button} href={link}>{t("Reset Password")}</Button>
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