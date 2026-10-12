export const englishAboutText = {
  meta: {
    title: "About us",
    socialTitle: "About Transfer.zip",
    description: "How Transfer.zip went from a single web page in 2023 to an open source file transfer service that thousands of people use every month.",
  },
  breadcrumbs: { home: "Home", page: "About us" },
  hero: {
    title: "About Transfer.zip",
    description: "Transfer.zip is an independent, open source file transfer service from Sweden. This is how it grew from a single web page into what it is today.",
  },
  stats: [
    { value: "{years} years", label: "in the file transfer business" },
    { value: "Thousands", label: "of users every month" },
    { value: "Open source", label: ":)" },
  ],
  timeline: {
    title: "The milestones so far",
    years: [
      {
        year: "2023",
        entries: [
          {
            id: "first-file",
            date: "May 2023",
            title: "The first file",
            body: "The project starts on 15 May, open source from day one. Transfer.zip is a single page with a file picker and a Send button, and files are encrypted in the browser before they leave it.",
            imageAlt: "The Transfer.zip start page in June 2023: a file picker and a Send button on a dark background.",
          },
          {
            id: "no-size-limit",
            date: "June 2023",
            title: "No size limit",
            body: "Downloads start streaming straight to disk instead of being held in memory, so a file can be as large as you like. A QR code makes it easy to open a transfer on your phone, and the first contributions from other developers are merged.",
          },
        ],
      },
      {
        year: "2024",
        entries: [
          {
            id: "stored-transfers",
            date: "April 2024",
            title: "Transfers that can wait",
            body: "Until now, both people had to be online at the same time. A rewrite adds accounts and stored transfers: upload once, share the link, and the recipient downloads when it suits them.",
            imageAlt: "The Transfer.zip dashboard in 2024, showing the files in a stored transfer.",
          },
          {
            id: "quick-share",
            date: "June 2024",
            title: "Quick Share",
            body: "Quick Share, the real-time mode, gets a makeover. It can now send several files in one go, and when a firewall blocks the direct connection, the encrypted data is passed through a relay instead.",
            imageAlt: "Quick Share in 2024: a QR code next to four steps for sending files between two devices.",
          },
          {
            id: "self-hosting",
            date: "July 2024",
            title: "Run it yourself",
            body: "Transfer.zip becomes self-hostable, so anyone can run the whole service on their own server. The first free browser tools follow, for creating and unpacking zip files without uploading them anywhere.",
          },
        ],
      },
      {
        year: "2025",
        entries: [
          {
            id: "redesign",
            date: "February 2025",
            title: "A new look and paid plans",
            body: "A full redesign ships together with subscription plans. Subscriptions pay for servers and storage, which is what lets the service stay independent.",
            imageAlt: "The redesigned Transfer.zip dashboard in 2025, with an overview of recent transfers.",
          },
          {
            id: "email-requests",
            date: "March 2025",
            title: "Email and file requests",
            body: "Send a transfer to several email addresses at once, or create a request link that lets anyone upload files to you without an account.",
          },
          {
            id: "branding",
            date: "July 2025",
            title: "Your brand on every transfer",
            body: "The whole app is rebuilt on Next.js. Brand profiles arrive with it, putting your own logo and background on download pages and emails.",
          },
          {
            id: "uploads",
            date: "October 2025",
            title: "Uploads that survive bad wifi",
            body: "Files are now uploaded in parts, straight from the browser to storage. If the network drops, the upload picks up where it left off.",
          },
        ],
      },
      {
        year: "2026",
        entries: [
          {
            id: "teams",
            date: "May 2026",
            title: "Teams and custom domains",
            body: "Teams gives a company one plan, with members and brand profiles managed in one place. Pro and Teams can also put transfer links on their own domain.",
          },
          {
            id: "quick-transfers",
            date: "June 2026",
            title: "Quick Transfers, rebuilt",
            body: "Quick Share, by now called Quick Transfers, gets a new engine. Every transfer runs through an end-to-end encrypted relay, so it works on any network, and two devices can pair with a six-digit code instead of a link.",
          },
          {
            id: "swedish",
            date: "October 2026",
            title: "Now in Swedish",
            body: "Transfer.zip launches in Swedish, with prices in kronor.",
          },
        ],
      },
    ],
  },
  today: {
    title: "Still independent, still open source",
    body: "Thousands of people use Transfer.zip every month to send and receive large files. Robin leads development.",
    goal: "The goal has not changed since 2023: file transfers that are fast, reliable and simple, and files that stay yours.",
    imageAlt: "Transfer.zip in 2026: an upload in progress above the dashboard menu.",
  },
  handling: {
    title: "How Transfer.zip handles files",
    items: [
      {
        title: "Browser file tools",
        body: "Tools such as the ZIP creator and archive extractor process files locally in the browser. Those files are not uploaded to Transfer.zip.",
      },
      {
        title: "Quick Transfers",
        body: "Quick Transfers encrypt file data in the browser and stream it through a relay without storing the files on Transfer.zip servers.",
      },
      {
        title: "Stored Transfers",
        body: "Stored Transfers send files from the browser to configured storage and remove them after the transfer expires.",
      },
    ],
  },
}
