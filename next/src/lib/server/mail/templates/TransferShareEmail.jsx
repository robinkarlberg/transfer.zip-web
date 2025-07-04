import { Heading, Text } from '@react-email/components';
import EmailLayout from './EmailLayout.jsx';

export default function TransferShareEmail({ name, description, link }) {
  return (
    <EmailLayout>
      <Heading style={h1}>Files ready for you</Heading>
      <Text style={text}>
        {name ? `\"${name}\"` : 'A transfer'} is available for download.
      </Text>
      {description && <Text style={text}>{description}</Text>}
      <Text><a href={link}>Download files</a></Text>
    </EmailLayout>
  );
}

const h1 = { fontSize: '20px', marginBottom: '12px' };
const text = { fontSize: '16px', lineHeight: '22px' };
