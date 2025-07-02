import { Resend } from "resend"

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME

const sendMail = async (react, { from, to, subject, vars }) => {
    if (resend) {
        resend.emails.send({
            from: from || process.env.SMTP_USERNAME,
            to,
            subject,
            react
        })
    }
    else {
        console.log("[MOCK] Sending email to", to, "from", from, `with subject ${subject}`)
        console.log(html)
    }
}

const sendVerificationLink = async (email, verificationLink) => {
    await sendMail("user-verification.ejs", {
        to: email,
        subject: `Verify your account | ${SITE_NAME}`,
        vars: {
            verificationLink,
            SITE_NAME
        }
    })
}

const sendPasswordReset = async (email, resetLink) => {
    await sendMail("password-reset.ejs", {
        to: email,
        subject: `Password Reset | ${SITE_NAME}`,
        vars: {
            resetLink,
            SITE_NAME
        }
    })
}

const sendWaitlistJoin = async (email) => {
    const unsubscribeLink = `${process.env.API_URL}/waitlist/leave?email=${encodeURIComponent(email)}`
    await sendMail("waitlist-join.ejs", {
        to: email,
        subject: `Waitlist | ${SITE_NAME}`,
        vars: {
            unsubscribeLink,
            SITE_NAME
        }
    })
}

const sendPaymentFailed = async (email) => {
    await sendMail("payment-failed.ejs", {
        to: email,
        subject: `Payment failed | ${SITE_NAME}`,
        vars: {
            SITE_NAME
        }
    })
}

/**
 * Sends a call-to-action email to a specified recipient.
 * 
 * @param {string} email - The email address of the recipient.
 * @param {Object} options - The options for the email content.
 * @param {string} options.title - The title for the email subject and h1 tag.
 * @param {string} options.message - The main message/body of the email.
 * @param {string} options.callToAction - The text for the call-to-action button/link.
 * @param {string} options.actionLink - The URL or link for the call-to-action.
 */
const sendCallToAction = async (email, { from, title, message, callToAction, actionLink }) => {
    await sendMail("call-to-action.ejs", {
        from,
        to: email,
        subject: `${title} - ${SITE_NAME}`,
        vars: {
            SITE_NAME,
            TITLE: title,
            MESSAGE: message,
            CALL_TO_ACTION: callToAction,
            ACTION_LINK: actionLink
        }
    })
}

const sendTransferEmail = async (email, { name, message, downloadLink }) => {
    await sendMail("file-sent.ejs", {
        from: "noreply@transfer.zip",
        to: email,
        subject: `Files have been shared with you - ${SITE_NAME}`,
        vars: {
            SITE_NAME,
            NAME: name,
            MESSAGE: message,
            ACTION_LINK: downloadLink
        }
    })
}

const sendRequestedTransferEmail = async (email, { name, downloadLink }) => {
    await sendMail("requested-file-sent.ejs", {
        from: "noreply@transfer.zip",
        to: email,
        subject: `Files have been shared with you - ${SITE_NAME}`,
        vars: {
            SITE_NAME,
            NAME: name,
            MESSAGE: undefined,
        }
    })
}

const sendTransferRequestEmail = async (email, { name, message, uploadLink }) => {
    await sendMail("transfer-request.ejs", {
        from: "noreply@transfer.zip",
        to: email,
        subject: `Request to send files - ${SITE_NAME}`,
        vars: {
            SITE_NAME,
            NAME: name,
            MESSAGE: message,
            ACTION_LINK: uploadLink
        }
    })
}

module.exports = { sendVerificationLink, sendPasswordReset, sendWaitlistJoin, sendPaymentFailed, sendCallToAction, sendTransferEmail, sendRequestedTransferEmail, sendTransferRequestEmail }