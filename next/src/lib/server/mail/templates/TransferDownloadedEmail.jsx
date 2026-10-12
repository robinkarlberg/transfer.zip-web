import { getTranslator } from "@/lib/i18n/translate"
import { Button, Heading, Hr, Preview, Text } from '@react-email/components';
import EmailLayout from './EmailLayout.jsx';

export default function TransferDownloadedEmail({ language = "en", name, link, brand, recipientEmail }) {
  const t = getTranslator(language)
  return (
    <EmailLayout language={language} brand={brand}>
      <Preview>{recipientEmail ? t("{email} downloaded {name}", { email: recipientEmail, name }) : t("Your transfer was downloaded")}</Preview>
      <Heading style={h1}>{t("Your transfer was downloaded")}</Heading>
      <Text style={text}>{recipientEmail
        ? t("A download of \"{name}\" was started using the link sent to {email}.", { name, email: recipientEmail })
        : <>{t("The transfer \"")}{name || t("Untitled Transfer")}{t("\" has been downloaded. You can view it here:")}</>}</Text>
      <Button style={button} href={link}>{t("View Transfer")}</Button>
      <Hr style={{ marginTop: "24px" }}/>
      <Text style={{ color: "#2563eb", textDecoration: "underline" }}><a href={link}>{link}</a></Text>
    </EmailLayout>
  );
}

const h1 = { fontSize: '20px', marginBottom: '12px', fontWeight: "600" };
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
