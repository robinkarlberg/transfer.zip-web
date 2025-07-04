import { Html, Head, Body, Container } from '@react-email/components';

export default function EmailLayout({ children }) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>{children}</Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f6f6f6',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Ubuntu,sans-serif',
  padding: '20px 0',
};

const container = {
  backgroundColor: '#ffffff',
  borderRadius: '6px',
  padding: '24px',
  width: '600px',
  margin: '0 auto',
};
