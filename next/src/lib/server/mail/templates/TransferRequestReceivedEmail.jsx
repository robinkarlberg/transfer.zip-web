import { Heading, Text } from '@react-email/components';
import EmailLayout from './EmailLayout.jsx';

export default function TransferRequestReceivedEmail({ name, link }) {
  return (
    <EmailLayout>
      <Heading style={h1}>Files received</Heading>
      <Text style={text}>
        Someone uploaded files to your request "{name}".
      </Text>
      <Text><a href={link}>View transfer</a></Text>
    </EmailLayout>
  );
}

const h1 = { fontSize: '20px', marginBottom: '12px' };
const text = { fontSize: '16px', lineHeight: '22px' };
