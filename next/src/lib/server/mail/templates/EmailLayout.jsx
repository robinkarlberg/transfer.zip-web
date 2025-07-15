import { Html, Head, Body, Container, Img, Text } from '@react-email/components';

export default function EmailLayout({ children, brand }) {
  const iconUrl = brand?.iconUrl || `${process.env.SITE_URL}/img/icon.png`
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Img
            src={iconUrl}
            width="64"
            height="64"
            alt={"Icon url"}
          />
          {children}
        </Container>
        <Text style={{ textAlign: "center", color: "gray" }}>
          {
            brand ?
              <>Shared securely for {brand.name} with <a style={{ textDecoration: "underline" }} href={`${process.env.SITE_URL}`}>{process.env.NEXT_PUBLIC_SITE_NAME}</a></>
              :
              <>Shared securely with <a style={{ textDecoration: "underline" }} href={`${process.env.SITE_URL}`}>{process.env.NEXT_PUBLIC_SITE_NAME}</a></>
          }
          <span style={{ margin: "0 4px" }}>&bull;</span>
          <a style={{ textDecoration: "underline" }} href={`${process.env.SITE_URL}/legal/privacy-policy`}>Privacy</a>
          <span style={{ margin: "0 4px" }}>&bull;</span>
          <a style={{ textDecoration: "underline" }} href={`${process.env.SITE_URL}/legal/terms-and-conditions`}>Terms</a>
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
