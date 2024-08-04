import { Helmet } from "react-helmet";

export default function PrivacyPolicyPage({ }) {
    return (
        <div className="PrivacyPolicyPage px-3 px-md-4">
            <Helmet>
                <title>Privacy Policy | transfer.zip</title>
            </Helmet>
            <div className="m-auto mt-4" style={{ maxWidth: "1100px" }}>
                <h1 className="display-5 fw-bold">Privacy Policy</h1>
                <div className="" style={{ maxWidth: "700px" }}>
                    <p><strong>Introduction</strong></p>
                    <p>Welcome to Transfer.zip (transfer.zip). Your privacy is our top priority, and we are committed to collecting as little data as absolutely needed to keep the service running. We handle your personal information with the utmost care and respect, ensuring that it is never ever sold for profit. This privacy policy details our minimal data collection practices and our dedication to protecting your personal information when you use our services.</p>
                    <p><strong>Company Information</strong></p>
                    <p>transfer.zip is dedicated to ensuring your privacy. If you have any questions or concerns, please contact us at support@transfer.zip. For privacy-related inquiries, reach out to privacy@transfer.zip.</p>
                    <p><strong>Types of Data Collected</strong></p>
                    <p>If using an account, we collect your email, to help recover accounts, prevent spam, and send special offers. We do not collect any usage data. When using Quick Share, no file data at all is shared with transfer.zip, everything is end-to-end encrypted, and such it is impossible for us to track file information. When using normal transfers with a transfer.zip account, we store information on the file name, file size, and file type, to facilitate easier and more user-friendly file transfers. Data is never stored to track you or sell your data. File data is always encrypted using AES 256-bit encryption to ensure your privacy and security.</p>
                    <p><strong>Purpose of Data Collection</strong></p>
                    <p>If using an account, your email is used for account recovery, to prevent spam, and to inform you about special offers and updates. If using an account, data related to files is used solely to facilitate secure file transfers between users.</p>
                    <p><strong>Data Sharing</strong></p>
                    <p>We do not share any of your personal information with third-party providers, this is against our core values. We keep the site running using Google Adsense and subscriptions, not your data. If you do not have a transfer.zip account, we are unable to store any of your data.</p>
                    <p><strong>Data Retention</strong></p>
                    <p>If using an account, we store your data until you request its removal. You can request data deletion by sending an email to privacy@transfer.zip or by deleting your account via the account page.</p>
                    <p><strong>Data Security</strong></p>
                    <p>We prioritize the security of your data. The &quot;Quick Share&quot; feature ensures that files are never stored on our servers but are streamed directly between devices using WebRTC peer-to-peer technology with end-to-end encryption using an AES-GCM 256-bit key. For normal file transfers, files are stored encrypted at rest using AES256 bit encryption.</p>
                    <p><strong>User Rights</strong></p>
                    <p>You have the right to access, modify, or delete your data. To exercise these rights, you can delete your account via the account page or send a request to privacy@transfer.zip for data deletion and related inquiries.</p>
                    <p><strong>Cookies and Tracking</strong></p>
                    <p>We use only a functional session cookie to enable login functionality. This cookie is essential for the operation of our services. Additionally, we use Google Analytics to understand how users interact with our site, helping us improve the user experience. Google Analytics uses cookies to collect information about your use of our website. For more information on how Google Analytics uses your data, please refer to the Google Privacy Policy. For displaying ads, Google AdSense may also use cookies if you previously have not purchased a plan.</p>
                    <p><strong>Advertising</strong></p>
                    <p>For users that previously have not purchased plan, we use Google AdSense to display advertisements, both in a limited form in the app, as well as on the download pages for your transfers. Google AdSense may use cookies and other tracking technologies to serve ads based on your prior visits to our website or other websites. For more information on how Google AdSense uses your data, please refer to the Google Privacy Policy.</p>
                    <p><strong>Policy Updates</strong></p>
                    <p>We reserve the right to update this privacy policy at any time without prior notice. Changes to the privacy policy will be posted on this page.</p>
                    <p><strong>Compliance</strong></p>
                    <p>We comply with the General Data Protection Regulation (GDPR). You have rights under the GDPR, including the right to access, correct, or delete your personal data.</p>
                    <p><strong>Contact Information</strong></p>
                    <p>For any questions or concerns about this privacy policy or our data practices, please contact us at privacy@transfer.zip.</p>
                    <p><strong>Consent</strong></p>
                    <p>By using our services, you consent to the collection and use of your information as described in this privacy policy. This privacy policy outlines how transfer.zip handles your personal data to ensure your privacy is protected. For any concerns or more information, feel free to contact us at the provided email addresses.</p>
                </div>
            </div>
        </div>
    )
}