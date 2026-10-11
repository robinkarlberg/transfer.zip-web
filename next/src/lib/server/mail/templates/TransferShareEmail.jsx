import { getTranslator } from "@/lib/i18n/translate"
import { Button, Container, Heading, Hr, Text } from '@react-email/components';
import EmailLayout from './EmailLayout.jsx';

export default function TransferShareEmail({ language = "en", name, description, link, brand }) {
  const t = getTranslator(language)
  return (
    <EmailLayout language={language} brand={brand}>
      <Heading style={h1}>{t("Files have been shared with you")}</Heading>
      <Text style={text}>
        {name ? `\"${name}\"` : t("A transfer")} {t("has been sent to you, download it using the button below.")}</Text>
      {description && (
        <Container style={container}>
          <Text style={text}>{description}</Text>
        </Container>
      )}
      <Button style={button} href={link}>{t("Download Files")}</Button>
      <Hr style={{ marginTop: "24px" }}/>
      <Text style={{ color: "#2563eb", textDecoration: "underline" }}><a href={link}>{link}</a></Text>
    </EmailLayout>
  );
}

const h1 = { fontSize: '20px', marginBottom: '12px', fontWeight: "600" };
const text = { fontSize: '16px', lineHeight: '22px' };
const container = {
  backgroundColor: '#ffffff',
  borderRadius: '6px',
  border: '1px solid lightgray',
  padding: '0 16px',
  display: 'block',
  margin: '0 auto',
  marginBottom: "16px",
  whiteSpace: "pre"
};
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