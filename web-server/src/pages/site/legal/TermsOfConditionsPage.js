import { Helmet } from "react-helmet";

export default function TermsOfConditionsPage({ }) {
    return (
        <div className="PrivacyPolicyPage px-3 px-md-4">
            <Helmet>
                <title>Terms and Conditions | transfer.zip</title>
            </Helmet>
            <div className="m-auto mt-4" style={{ maxWidth: "1100px" }}>
                <h1 className="display-5 fw-bold">Terms and Conditions</h1>
                <div className="" style={{ maxWidth: "700px" }}>
                    <p><strong>1. Services Provided</strong></p>
                    <p><strong>File Transfers with Accounts:</strong> Transfer.zip provides a file transfer service wherein files are stored on our servers. This service is free to use but with some limits. Users can enhance these limits by subscribing to our paid plans, which offer increased file size limits and longer file expiration times. With this service, files can be as large as the user's subscription plan allows. Unlike Quick Share, file transfers are stored on our servers, allowing us to take action against malicious or copyright-infringing content uploaded and shared through our platform. </p>
                    <p><strong>Quick Share:</strong> transfer.zip offers an open-source tool named Quick Share, which facilitates peer-to-peer file transfers directly within the browser. These files are never stored on our servers and are end-to-end encrypted. This service only operates while the browser window is open. There is no file size limit or bandwidth limitation. As the Quick Share service functions on a client-side basis, transfer.zip cannot control the content shared and is not liable for any malicious content sent through the service, as the encryption and peer-to-peer nature precludes us from accessing the content. If a peer-to-peer connection can&#39;t be established for network topology reasons, the end-to-end encrypted file data could be relayed through one of our services, to facilitate the Quick Share service on unsupported networks. When the file data is relayed through one of our servers, we can introduce limits including but not limited to: individual file size, bandwidth and total data relayed per month. </p>
                    <p><strong>2. User Responsibilities</strong></p>
                    <p>Users are responsible for ensuring that they do not upload content that infringes on copyrights or distribute malware or other harmful content through the file transfer services. Users must comply with all applicable laws and regulations when using transfer.zip. For those using a free account, it is recommended to keep the account and its transfers relevant and active. Free file transfers may be deleted after an extended period without downloads, but users will be notified beforehand.</p>
                    <p><strong>3. Account Terms</strong></p>
                    <p>Users must create an account to access certain features of transfer.zip. There are no specific eligibility criteria or age restrictions unless required by law. Users must provide accurate and complete information during the registration process and are responsible for maintaining the confidentiality of their account credentials.</p>
                    <p><strong>4. Fees and Payment</strong></p>
                    <p>Subscriptions to transfer.zip services are billed monthly. Users who cancel their subscription will retain access to paid features until the end of their current billing cycle. transfer.zip offers different plans, including Pro and Premium plans. The limit for Premium plan is initially set at 1TB, however the user can request to extend that limit by contacting us at support@transfer.zip, we will make a decision on a case-by-case basis, and may include raising the cost of the subscription.</p>
                    <p><strong>5. Intellectual Property</strong></p>
                    <p>transfer.zip does not claim ownership of any content uploaded by users. However, we reserve the right to remove content that infringes on the rights of others or violates our terms. Users retain ownership of their content.</p>
                    <p><strong>6. Prohibited Activities</strong></p>
                    <p>Users are prohibited from uploading copyright-infringing content, distributing malware, or engaging in any activities that harm others. Users must not engage in any activity that violates applicable laws or regulations.</p>
                    <p><strong>7. Termination</strong></p>
                    <p>transfer.zip reserves the right to terminate any account that violates our acceptable use policy, including but not limited to the distribution of malware or copyright-infringing content. We also reserve the right to terminate any account without providing a reason to maintain the security and integrity of our platform. Refunds for terminated accounts are at our discretion and depend on the nature and extent of any damage caused to our site and its reputation.</p>
                    <p><strong>8. Limitation of Liability</strong></p>
                    <p>While transfer.zip is committed to maintaining the functionality and security of our site, we are not liable for any damages or losses resulting from the use of our services. Users acknowledge that the use of transfer.zip is at their own risk.</p>
                    <p><strong>9. Refund Policy</strong></p>
                    <p>At transfer.zip, we strive to provide the best possible experience for our users. If you are not satisfied with our paid services, you may be eligible for a refund under the following conditions:</p>
                    <ul>
                        <li>Refund requests must be made within 14 days of the initial subscription purchase.</li>
                        <li>Refunds will only be considered for users who have not significantly utilized the service during this period. Significant utilization is defined as exceeding 40% of the bandwidth or storage limits allowed under the subscribed plan.</li>
                        <li>By default, refunds account for 100% of the invoiced amount, but decisions could be made on a case-by-case basis, especially if our service was heavily utilized.</li>
                        <li>No refunds will be provided for renewals of ongoing subscriptions. Users must cancel their subscription before the renewal date to avoid charges for the next billing cycle.</li>
                        <li>Refund requests for accounts terminated due to violations of our terms and conditions, including but not limited to the distribution of malicious content or copyright infringement, will not be entertained by default, however decisions can be made on a case-by-case basis.</li>
                    </ul>
                    <p>To request a refund, please contact us at support@transfer.zip with your account details and the reason for your refund request. We will review your request and respond within 7 business days. Approved refunds will be processed within 14 business days of approval.</p>
                    <p><strong>10. Governing Law</strong></p>
                    <p>These terms and conditions are governed by and construed in accordance with the laws of the kingdom of Sweden. Any disputes arising from these terms will be resolved in the courts of the kingdom of Sweden.</p>
                    <p><strong>11. Modifications</strong></p>
                    <p>transfer.zip reserves the right to modify these terms and conditions at any time without prior notice, including the terms regarding individual plans and their limits. Users are encouraged to review these terms periodically to stay informed of any changes. If the terms and limits regarding plans are changed, users will be informed 1 month in advance, and have the right to cancel their subscription before the changes take into effect.</p>
                    <p><strong>12. Contact Information</strong></p>
                    <p>For any questions or concerns regarding these terms and conditions, please contact us at support@transfer.zip.</p>
                    <p>To report DMCA violations, please contact us at dmca@transfer.zip.</p>
                    <p>By using transfer.zip, you agree to these terms and conditions. If you do not agree, please discontinue the use of our services.</p>

                </div>
            </div>
        </div>
    )
}