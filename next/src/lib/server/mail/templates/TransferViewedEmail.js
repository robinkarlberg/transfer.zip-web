import { getTranslator } from "@/lib/i18n/translate"
import { Button, Heading, Hr, Preview, Text } from "@react-email/components"
import EmailLayout from "./EmailLayout.jsx"

export default function TransferViewedEmail({ language = "en", name, link, brand, recipientEmail }) {
  const t = getTranslator(language)
  return (
    <EmailLayout language={language} brand={brand}>
      <Preview>{t("{email} viewed {name}", { email: recipientEmail, name })}</Preview>
      <Heading style={{ fontSize: "20px", marginBottom: "12px", fontWeight: "600" }}>{t("Your transfer was viewed")}</Heading>
      <Text style={{ fontSize: "16px", lineHeight: "22px" }}>
        {t("\"{name}\" was viewed using the link sent to {email}.", { name, email: recipientEmail })}
      </Text>
      <Button style={button} href={link}>{t("View Transfer")}</Button>
      <Hr style={{ marginTop: "24px" }} />
      <Text><a style={{ color: "#2563eb", textDecoration: "underline" }} href={link}>{link}</a></Text>
    </EmailLayout>
  )
}

const button = {
  backgroundColor: "#2563eb",
  borderRadius: "5px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center",
  display: "inline-block",
  padding: "10px",
}
