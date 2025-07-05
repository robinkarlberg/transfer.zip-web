import { Html, Head, Body, Container, Img, Text } from '@react-email/components';

export default function EmailLayout({ children }) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Img
            src={`${process.env.SITE_URL}/img/icon-small.png`}
            width="64"
            height="64"
            alt="Transfer.zip"
          />
          {children}
        </Container>
        <Text style={{ textAlign: "center", color: "gray" }}>
          Shared securely with <a style={{ textDecoration: "underline" }} href='https://transfer.zip'>Transfer.zip</a>
          <span style={{ margin: "0 4px" }}>&bull;</span>
          <a style={{ textDecoration: "underline" }} href='https://transfer.zip/legal/privacy-policy'>Privacy</a>
          <span style={{ margin: "0 4px" }}>&bull;</span>
          <a style={{ textDecoration: "underline" }} href='https://transfer.zip/legal/terms-and-conditions'>Terms</a>
        </Text>
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
