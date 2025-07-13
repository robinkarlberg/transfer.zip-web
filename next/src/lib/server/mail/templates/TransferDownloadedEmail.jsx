import { Button, Heading, Hr, Text } from '@react-email/components';
import EmailLayout from './EmailLayout.jsx';

export default function TransferDownloadedEmail({ name, link, brand }) {
  return (
    <EmailLayout brand={brand}>
      <Heading style={h1}>Your transfer was downloaded</Heading>
      <Text style={text}>
        The transfer "{name}" has been downloaded. You can view it here:
      </Text>
      <Button style={button} href={link}>View Transfer</Button>
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