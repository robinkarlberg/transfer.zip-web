import { getTranslator } from "@/lib/i18n/translate"
import { Heading, Hr, Text } from '@react-email/components';
import EmailLayout from './EmailLayout.jsx';

export default function TeamMemberRemovedEmail({ language = "en", teamName }) {
  const t = getTranslator(language)
  return (
    <EmailLayout language={language}>
      <Heading style={h1}>{t("You've been removed from")} {teamName}</Heading>
      <Text style={text}>{t("You no longer have access to \"")}{teamName}{t("\". Your account is still active, but you've been signed out of all sessions.")}</Text>
      <Text style={text}>{t("If you believe this was a mistake, please contact the team owner directly.")}</Text>
      <Hr style={{ marginTop: '24px' }} />
    </EmailLayout>
  );
}

const h1 = { fontSize: '20px', marginBottom: '12px', fontWeight: '600' };
const text = { fontSize: '16px', lineHeight: '22px' };
