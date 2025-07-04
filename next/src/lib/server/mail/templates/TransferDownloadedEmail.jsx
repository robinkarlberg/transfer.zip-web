import { Heading, Text } from '@react-email/components';
import EmailLayout from './EmailLayout.jsx';

export default function TransferDownloadedEmail({ name, link }) {
  return (
    <EmailLayout>
      <Heading style={h1}>Your transfer was downloaded</Heading>
      <Text style={text}>
        The transfer "{name}" has been downloaded. You can view it here:
      </Text>
      <Text><a href={link}>{link}</a></Text>
    </EmailLayout>
  );
}

const h1 = { fontSize: '20px', marginBottom: '12px' };
const text = { fontSize: '16px', lineHeight: '22px' };
