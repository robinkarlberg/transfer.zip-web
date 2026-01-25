import { Button, Heading, Hr, Text } from '@react-email/components';
import EmailLayout from './EmailLayout.jsx';

export default function TeamInviteEmail({ teamName, inviterEmail, link }) {
  return (
    <EmailLayout>
      <Heading style={h1}>You've been invited to join a team on Transfer.zip</Heading>
      <Text style={text}>
        {inviterEmail} has invited you to join "{teamName}".
      </Text>
      <Text style={text}>
        Click the button below to accept the invitation and join the team.
      </Text>
      <Button style={button} href={link}>Join Team</Button>
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
