import Link from "next/link"

// Data for the /how-to/transfer-files-from-X-to-Y guide pages. Each pair page
// is a literal route (no dynamic segment, those would shadow the MDX
// [...slug] catch-all). Copy is written per pair on purpose: identical
// templated pages with swapped nouns is exactly what search engines demote.

export const DEVICES = {
  iphone: { key: "iphone", name: "iPhone" },
  android: { key: "android", name: "Android phone", short: "Android" },
  pc: { key: "pc", name: "PC" },
  mac: { key: "mac", name: "Mac" },
}

export const TRANSFER_PAIRS = [
  {
    slug: "transfer-files-from-iphone-to-pc",
    image: "/img/content/seo/iphone-to-pc.png",
    from: "iphone",
    to: "pc",
    title: "How to Transfer Files from iPhone to PC (Free, No App or Cable)",
    description: "Send photos, videos and documents from your iPhone to any Windows PC in seconds. Type a 6-digit code in the browser and the transfer starts, no iTunes or cable needed.",
    heading: "How to Transfer Files from iPhone to PC",
    headline: { highlightedWord: "Instantly", title: "send files from iPhone to PC." },
    subtitle: "Move photos, videos and documents from your iPhone to any computer without iTunes or a cable. Pick your files, then type a 6-digit code on the PC.",
    howItWorks: [
      "Getting files off an iPhone usually means a Lightning cable and iTunes, emailing yourself attachments, or waiting for iCloud to sync. This works differently: your iPhone and your PC connect directly through the browser, and the files stream between them in real time.",
      <>It's the same <Link className="font-medium text-primary underline underline-offset-4 hover:text-primary-500" href="/quick">Quick Transfer</Link> feature you can use from the homepage: your files never touch a cloud drive or a server, and there is no file size limit. A 4&nbsp;GB holiday video works just as well as a single photo.</>,
      "Because the transfer runs in the browser, it works with Safari on the iPhone and any browser on the PC, whether that's Windows 10, Windows 11 or Linux. Both devices just need to be online at the same time.",
    ],
    steps: [
      { text: "Open this page on your iPhone, tap the button above and pick the photos, videos or documents you want to send." },
      { text: "On your PC, open transfer.zip/quick in any browser and type the 6-digit code shown on your iPhone." },
      { text: "The download starts immediately. Keep both devices online until it finishes." },
    ],
    tips: [
      {
        heading: "iPhone photos arrive as HEIC",
        body: [
          "iPhones save photos in HEIC format by default. Windows can open HEIC since Windows 11 (and Windows 10 with the free HEIF extension), but some older programs still expect JPG.",
          <>If you need JPGs, convert after transferring with our free <Link className="font-medium text-primary underline underline-offset-4 hover:text-primary-500" href="/tools/convert-heic-to-jpg">HEIC to JPG converter</Link> (it also runs in the browser), or set your iPhone camera to shoot JPG under Settings → Camera → Formats → Most Compatible.</>,
        ],
      },
      {
        heading: "No quality loss, no size limit",
        body: [
          "Emailing or messaging yourself a video compresses it to a fraction of the original quality. This transfer sends the original file, bit for bit. A 10-minute 4K recording arrives exactly as it was shot.",
          "There is no file size cap. Large transfers simply take as long as your internet connection needs; the progress bar on both screens shows the live speed.",
        ],
      },
      {
        heading: "Why not iCloud, AirDrop or a cable?",
        body: [
          "AirDrop only works between Apple devices, so a Windows PC is out. iCloud for Windows works but syncs your whole library and needs setup plus storage space. A cable requires iTunes or Apple Devices drivers that famously refuse to recognize the phone at the worst moment.",
          "A browser transfer skips all of that. There is nothing to install or sign in to, and it works the same on a work laptop where you can't install software.",
        ],
      },
    ],
    faq: [
      { q: "Do I need to install an app on my iPhone or PC?", a: "No. The transfer runs entirely in the browser, Safari on the iPhone and any browser on the PC. There is nothing to install on either device." },
      { q: "Will my photos and videos lose quality?", a: "No. Files are transferred exactly as they are stored on your iPhone, with no compression. A 500 MB video arrives as the same 500 MB file." },
      { q: "Do both devices need to be on the same Wi-Fi network?", a: "No. The transfer works over the internet, so your iPhone can be on mobile data and the PC on office ethernet. They just need to be online at the same time." },
      { q: "Is there a file size limit?", a: "No fixed limit. The transfer streams directly between your devices, so even files of many gigabytes work. They just take longer depending on your connection speed." },
      { q: "Where do the files end up on my PC?", a: "In your browser's normal download location, usually the Downloads folder. If you send several files at once they arrive bundled as one zip file." },
      { q: "Is it private?", a: "Yes. Files are encrypted and relayed directly between your two devices, never stored on a server, and the transfer ends the moment you close the page." },
    ],
  },
  {
    slug: "transfer-files-from-pc-to-iphone",
    image: "/img/content/seo/pc-to-iphone.png",
    from: "pc",
    to: "iphone",
    title: "How to Transfer Files from PC to iPhone Without iTunes",
    description: "Send files from a Windows PC to your iPhone wirelessly, without iTunes or a cable. Scan a QR code or type a short code and the download starts.",
    heading: "How to Transfer Files from PC to iPhone",
    headline: { highlightedWord: "Wirelessly", title: "send files from PC to iPhone." },
    subtitle: "Get documents, music, videos or any other file from your computer onto your iPhone without iTunes, iCloud or a Lightning cable. Scan a QR code and the download starts.",
    howItWorks: [
      "Apple makes it easy to move files between Apple devices, and surprisingly hard to get a file from a Windows PC onto an iPhone. iTunes file sharing only works app by app, and iCloud means uploading to Apple's servers first and waiting for a sync.",
      <>With <Link className="font-medium text-primary underline underline-offset-4 hover:text-primary-500" href="/quick">Quick Transfer</Link>, your PC and iPhone talk to each other directly through the browser. You pick the files on the PC, and your iPhone either scans a QR code with the camera or types a 6-digit code, whichever is faster.</>,
      "The files land in the iPhone's Files app, ready to open, share or save to your photo library. Nothing is uploaded to any cloud and there is no size limit.",
    ],
    steps: [
      { text: "Open this page on your PC, click the button above and choose the files you want to send to the iPhone." },
      { text: "Point your iPhone camera at the QR code that appears, or open transfer.zip/quick in Safari and type the 6-digit code." },
      { text: "Safari downloads the files straight to the Files app. Keep both devices online until the transfer completes." },
    ],
    tips: [
      {
        heading: "Where files go on the iPhone",
        body: [
          "Safari saves incoming files to the Files app, under Downloads. Tap the blue arrow next to the address bar, then Downloads, to see them right away.",
          "If you sent pictures and want them in your photo library: open the image in Files, tap the share icon, then \"Save Image\". For several photos at once, long-press the zip to uncompress it first. The Files app unzips natively, so you don't need anything extra.",
        ],
      },
      {
        heading: "Any file type works",
        body: [
          "Unlike iTunes sync, which only accepts media it understands, a browser transfer is format-agnostic: PDFs, EPUBs, ZIPs, project files, fonts. If it's a file, it transfers.",
          "iOS decides which app opens each type, but everything is at least saved in Files where you can preview, share or forward it.",
        ],
      },
      {
        heading: "Skip the cloud detour",
        body: [
          "The classic workarounds all have a catch: iTunes needs to be installed and trusted, iCloud and Google Drive upload your file to a data center just to download it again three meters away, and email caps attachments at 25 MB.",
          "A direct transfer has none of those steps. The file streams from your PC to the iPhone and exists nowhere in between.",
        ],
      },
    ],
    faq: [
      { q: "Do I need iTunes or iCloud for this?", a: "No. The transfer runs in the browser on both devices. Your iPhone only needs Safari, which it already has." },
      { q: "Where do the files appear on my iPhone?", a: "In the Files app under Downloads. Images can be saved to your photo library from there, and zip files can be uncompressed with a long-press, which iOS handles natively." },
      { q: "Can I send large videos or many files at once?", a: "Yes. There is no size limit, and multiple files arrive bundled as a single zip that the Files app can unpack. Big transfers just need both devices to stay online until done." },
      { q: "Does the iPhone need to be on the same Wi-Fi as the PC?", a: "No. The connection works across networks: Wi-Fi at home, mobile data on the go. Both devices simply need internet access at the same time." },
      { q: "Is anything stored on a server?", a: "No. Files are encrypted and stream directly between your PC and iPhone. Close the page and the link or code stops working, and there is nothing left behind to delete." },
    ],
  },
  {
    slug: "transfer-files-from-pc-to-pc",
    image: "/img/content/seo/pc-to-pc.png",
    from: "pc",
    to: "pc",
    title: "How to Transfer Files from PC to PC (No USB Drive Needed)",
    description: "Move files between two computers with your browser. Type a 6-digit code on the other PC and the files transfer directly, no USB stick or cloud upload involved.",
    heading: "How to Transfer Files from PC to PC",
    headline: { highlightedWord: "Easily", title: "transfer files from PC to PC." },
    subtitle: "Moving to a new computer or sending a folder to a colleague? Transfer directly between two browsers instead of digging out a USB stick or uploading to a cloud drive.",
    howItWorks: [
      "The usual options for PC-to-PC transfers all have friction: USB drives are slow and never have enough space, network shares need both machines configured just right, and cloud drives mean uploading everything first and downloading it again.",
      <>A <Link className="font-medium text-primary underline underline-offset-4 hover:text-primary-500" href="/quick">Quick Transfer</Link> connects the two browsers directly. One PC picks the files and shows a 6-digit code; the other types the code at transfer.zip/quick. The data streams between them immediately, encrypted from end to end and never stored anywhere.</>,
      "The two computers don't need to be on the same network, in the same building, or even in the same country. Old laptop to new desktop, office machine to home machine: if both are online, it works.",
    ],
    steps: [
      { text: "On the source PC, open this page and pick the files (or a whole folder) to send." },
      { text: "On the destination PC, open transfer.zip/quick and enter the 6-digit code (or open the link / scan the QR if it's nearby)." },
      { text: "The transfer starts at once and shows live progress on both screens. Done when the bar fills up." },
    ],
    tips: [
      {
        heading: "Sending whole folders",
        body: [
          "On a desktop browser you can select an entire folder, not just individual files. Use the \"select a folder\" option in the picker, and the folder structure arrives on the other PC intact, as a single zip.",
          <>If you'd rather prepare the archive yourself first, our <Link className="font-medium text-primary underline underline-offset-4 hover:text-primary-500" href="/tools/zip-files-online">zip files online tool</Link> compresses files in your browser before sending.</>,
        ],
      },
      {
        heading: "Setting up a new computer",
        body: [
          "For a new-PC migration, transfer your user files in batches: Documents, Pictures, project folders. Programs need to be reinstalled either way, so what you actually need to move is almost always just files, and a direct browser transfer handles any amount of them.",
          "Tip: start with the big folders first and keep both machines plugged in. The transfer streams continuously, and you can watch the speed and progress the whole way.",
        ],
      },
      {
        heading: "How fast is it?",
        body: [
          "The transfer runs as fast as the slower of the two internet connections allows. Two machines on good broadband typically move gigabytes in minutes.",
          <>Want a rough estimate before you start? Check our <Link className="font-medium text-primary underline underline-offset-4 hover:text-primary-500" href="/tools/download-time-calculator">download time calculator</Link> with your connection speed and total size.</>,
        ],
      },
    ],
    faq: [
      { q: "Do the two PCs need to be on the same network?", a: "No. Unlike Windows Nearby Sharing or network drives, this works over the internet. The PCs can be anywhere, on completely different networks." },
      { q: "Can I transfer between Windows, Mac and Linux?", a: "Yes. It's browser-based, so any combination works: Windows to Windows, Windows to Mac, Linux to Windows. Anything with a modern browser can send or receive." },
      { q: "Is there a size limit for the transfer?", a: "No. Files stream directly between the two computers without ever being stored on a server, so there is no upload quota. Transfers of many gigabytes are fine." },
      { q: "Can I send a whole folder?", a: "Yes. Choose the folder option in the file picker on the sending PC. The receiving PC gets a single zip with the folder structure intact." },
      { q: "What happens if one PC goes offline mid-transfer?", a: "The transfer stops. Both sides need to stay online for the duration, since the data flows directly between them. Just start again, nothing partial is left on any server." },
      { q: "Is it safe to use for work documents?", a: "Yes. The data is encrypted in transit, relayed directly between the two browsers, and never written to a server. When you close the tab, the code and link are gone for good." },
    ],
  },
  {
    slug: "transfer-files-from-android-to-pc",
    image: "/img/content/seo/android-to-pc.png",
    from: "android",
    to: "pc",
    title: "How to Transfer Files from Android to PC Without a USB Cable",
    description: "Send photos, videos and files from any Android phone to your computer wirelessly. All it takes is a code typed into the browser, no cable or drivers involved.",
    heading: "How to Transfer Files from Android to PC",
    headline: { highlightedWord: "Instantly", title: "send files from Android to PC." },
    subtitle: "Skip the USB cable and the missing-driver dance. Pick files on your Android phone, type a 6-digit code on the PC, and the transfer starts immediately.",
    howItWorks: [
      "Plugging an Android phone into a PC is a coin flip: sometimes the file transfer mode appears, sometimes Windows pretends the phone doesn't exist. Google's Quick Share for Windows works, but only after installing an app and signing in on both ends.",
      <>The browser route needs none of that. Open <Link className="font-medium text-primary underline underline-offset-4 hover:text-primary-500" href="/quick">Quick Transfer</Link> on the phone, pick your files in Chrome (or any browser), and type the code on the PC. The two devices connect directly and stream the files between them.</>,
      "Nothing is uploaded to a cloud drive, there is no size limit, and it works whether the phone is on Wi-Fi or mobile data.",
    ],
    steps: [
      { text: "Open this page on your Android phone, tap the button above and select your photos, videos or documents." },
      { text: "On the PC, open transfer.zip/quick in any browser and type the 6-digit code from the phone screen." },
      { text: "The files download straight to the PC. Keep the phone's screen on until the transfer finishes." },
    ],
    tips: [
      {
        heading: "Keep the screen awake during big transfers",
        body: [
          "Android browsers pause background tabs aggressively to save battery. For a multi-gigabyte video transfer, keep the phone plugged in and the browser tab in the foreground until the progress bar completes.",
          "If the connection does drop, nothing is half-written to a server. Just reconnect and start the transfer again.",
        ],
      },
      {
        heading: "Original quality, including 4K video",
        body: [
          "Messaging apps recompress everything: WhatsApp turns a crisp 4K clip into a blurry fraction of itself. A direct transfer moves the original file untouched, so what you shot is what arrives on the PC.",
          "That also makes this the practical way to back up camera footage to a computer before clearing space on the phone.",
        ],
      },
      {
        heading: "Compared to Quick Share, Bluetooth and cables",
        body: [
          "Google's Quick Share needs the Windows app installed and both devices signed in. Bluetooth file transfer still exists but crawls at a few megabytes per minute. USB is fast when the MTP drivers cooperate, which is never certain on a work machine you can't install drivers on.",
          "The browser transfer needs no setup on either device.",
        ],
      },
    ],
    faq: [
      { q: "Does this work on any Android phone?", a: "Yes: Samsung, Pixel, Xiaomi, OnePlus, anything with a modern browser like Chrome. There is no app to install and no account to create." },
      { q: "Do I need USB debugging or developer mode?", a: "No. This is a normal browser page, not a cable or ADB connection. Nothing on the phone needs to be enabled or configured." },
      { q: "Where do my files land on the PC?", a: "In the browser's download folder, usually Downloads. Several files sent together arrive as one zip archive." },
      { q: "Does the phone need to be on Wi-Fi?", a: "No. Mobile data works too. The phone and PC don't need to share a network, they each just need an internet connection." },
      { q: "Is there a limit on file size or number of files?", a: "No fixed limits. The files stream directly from phone to PC without a server in the middle, so even very large videos transfer fine." },
    ],
  },
  {
    slug: "transfer-files-from-pc-to-android",
    image: "/img/content/seo/pc-to-android.png",
    from: "pc",
    to: "android",
    title: "How to Send Files from PC to Android Wirelessly (No Cable)",
    description: "Transfer files from your computer to any Android phone over the internet, no cable or app needed. Scan a QR code or type a short code and the download starts.",
    heading: "How to Transfer Files from PC to Android",
    headline: { highlightedWord: "Wirelessly", title: "send files from PC to Android." },
    subtitle: "Move documents, videos, music or any other files from your computer to an Android phone without a cable or yet another app. Beats emailing yourself attachments.",
    howItWorks: [
      "Getting files onto an Android phone usually means digging out a USB cable or uploading to Google Drive just to download them again on the phone. Both work; both are slower than they should be.",
      <>With <Link className="font-medium text-primary underline underline-offset-4 hover:text-primary-500" href="/quick">Quick Transfer</Link>, you pick the files on the PC and the phone connects to them directly: scan the QR code with the camera, or type the 6-digit code into the browser. The download starts on the spot.</>,
      "Because the files stream device-to-device, nothing sits in a cloud account afterwards. There is no storage quota to eat into and no forgotten link floating around later.",
    ],
    steps: [
      { text: "Open this page on your PC and pick the files you want on the phone." },
      { text: "Scan the QR code with the Android camera, or open transfer.zip/quick on the phone and type the 6-digit code." },
      { text: "The files download to the phone's Downloads folder. Done in seconds for documents, minutes for big videos." },
    ],
    tips: [
      {
        heading: "Opening what you receive",
        body: [
          "Single files land in the Downloads folder and open with a tap. If you send several files at once they arrive as one zip archive.",
          <>Files by Google (preinstalled on most phones) extracts zips natively: tap the archive and choose Extract. You won't need a separate unzip app, though our <Link className="font-medium text-primary underline underline-offset-4 hover:text-primary-500" href="/tools/unzip-files-online">browser unzip tool</Link> works on the phone too.</>,
        ],
      },
      {
        heading: "Music, videos and offline media",
        body: [
          "This is a clean way to load a phone with media for a trip: drop a season of downloaded lectures or a music folder onto the phone the evening before, without syncing software or streaming-app limitations.",
          "Android's media apps pick up files in Downloads automatically, or you can move them into Music/Movies folders with any file manager.",
        ],
      },
      {
        heading: "Sending APKs and unusual file types",
        body: [
          "A browser transfer doesn't care about file types. Installers, fonts, GPX routes, save-game files all go through unchanged. Android may warn you before opening certain types (like APKs from outside the Play Store); that's the phone's normal safety prompt, not a transfer restriction.",
        ],
      },
    ],
    faq: [
      { q: "Do I need to install anything on the phone?", a: "No. The phone only needs its browser (Chrome works great) or just the camera app to scan the QR code. Nothing is installed on either device." },
      { q: "Where do files end up on Android?", a: "In the Downloads folder, visible in Files by Google or any file manager. Multiple files arrive as a single zip that the phone can extract natively." },
      { q: "Does this use my Google Drive storage?", a: "No. The files go directly from the PC to the phone. No cloud upload happens, so no storage quota is touched on either side." },
      { q: "Can the phone be somewhere else entirely?", a: "Yes. The transfer works over the internet, so you can send files to a phone in another city. Whoever holds the phone just enters the code." },
      { q: "How big can the files be?", a: "There is no size cap. Multi-gigabyte videos work; they simply take as long as the slower of the two connections needs. Both devices must stay online during the transfer." },
    ],
  },
  {
    slug: "transfer-files-from-iphone-to-android",
    image: "/img/content/seo/iphone-to-android.png",
    from: "iphone",
    to: "android",
    title: "How to Transfer Files from iPhone to Android (No App Needed)",
    description: "AirDrop doesn't work with Android, but this does. Send photos, videos and files from iPhone to any Android phone through the browser, free and without an app.",
    heading: "How to Transfer Files from iPhone to Android",
    headline: { highlightedWord: "Easily", title: "send files from iPhone to Android." },
    subtitle: "AirDrop stops at the Apple garden fence. Send photos, videos and any other files from an iPhone to an Android phone directly in the browser, with no app on either side.",
    howItWorks: [
      "Moving files between an iPhone and an Android phone is the classic cross-platform headache: AirDrop is Apple-only, Quick Share is Android-only, and messaging apps crush photo and video quality on the way through.",
      <>A <Link className="font-medium text-primary underline underline-offset-4 hover:text-primary-500" href="/quick">Quick Transfer</Link> sidesteps the platform war because it runs in the browser both phones already have. One phone picks the files and shows a code, and the other phone types it in. That's the whole process.</>,
      "The files move at full original quality, with nothing to install or pair. The phones don't even need to be on the same Wi-Fi network.",
    ],
    steps: [
      { text: "Open this page on the iPhone, tap the button above and pick the photos, videos or files to send." },
      { text: "On the Android phone, open transfer.zip/quick in the browser and type the 6-digit code from the iPhone." },
      { text: "The files download to the Android phone immediately. Keep both phones unlocked until it finishes." },
    ],
    tips: [
      {
        heading: "HEIC photos on Android",
        body: [
          "iPhones shoot photos in HEIC by default. Recent Android versions open HEIC fine, but older phones or apps may not.",
          <>For maximum compatibility, convert to JPG with our free <Link className="font-medium text-primary underline underline-offset-4 hover:text-primary-500" href="/tools/convert-heic-to-jpg">HEIC to JPG converter</Link>, or set the iPhone camera to "Most Compatible" in Settings → Camera → Formats before shooting.</>,
        ],
      },
      {
        heading: "Full quality, unlike WhatsApp",
        body: [
          "Sending photos through WhatsApp or other messengers recompresses them hard. Fine for a meme, painful for the only copy of a group photo. A direct transfer moves the original files exactly as they are.",
          "Videos benefit most: a minute of 4K iPhone footage is hundreds of megabytes, and it arrives on the Android phone untouched.",
        ],
      },
      {
        heading: "Switching from iPhone to Android?",
        body: [
          "For a full phone switch, transfer your camera roll in batches: select a few hundred photos at a time in the picker and send each batch. Both phones can be on different networks, even iPhone on Wi-Fi and Android on mobile data.",
          "Contacts and calendars are better moved through your Google account; for the photos, videos and documents themselves, a direct transfer is the fastest cable-free route.",
        ],
      },
    ],
    faq: [
      { q: "Why can't I just AirDrop to Android?", a: "AirDrop only works between Apple devices: iPhones, iPads and Macs. For iPhone-to-Android you need a cross-platform route, and the browser is the one thing both phones share." },
      { q: "Do I need to install an app on either phone?", a: "No. Safari on the iPhone and Chrome (or any browser) on Android are enough. There is no account and nothing to install." },
      { q: "Will my photos and videos keep their quality?", a: "Yes. Files transfer in their original quality with no recompression, unlike messaging apps, which heavily compress photos and especially videos." },
      { q: "Do both phones need to be on the same Wi-Fi?", a: "No. The phones connect over the internet, so any mix of Wi-Fi and mobile data works. They just both need to be online at the same time." },
      { q: "What about Live Photos?", a: "The picker sends what iOS hands over. For Live Photos that is the still image (and the video part where iOS includes it). For guaranteed motion, record a short video instead." },
    ],
  },
  {
    slug: "transfer-files-from-android-to-iphone",
    image: "/img/content/seo/android-to-iphone.png",
    from: "android",
    to: "iphone",
    title: "How to Transfer Files from Android to iPhone Without Move to iOS",
    description: "Quick Share can't reach an iPhone, and Move to iOS only runs during setup. Send photos, videos and files from any Android phone to an iPhone through the browser instead.",
    heading: "How to Transfer Files from Android to iPhone",
    headline: { highlightedWord: "Directly", title: "send files from Android to iPhone." },
    subtitle: "Quick Share won't talk to iPhones, and messaging apps wreck your video quality. Pick the files on the Android phone, type a 6-digit code on the iPhone, and they stream straight across.",
    howItWorks: [
      "Android and iPhone each have a perfectly good sharing feature that refuses to talk to the other side: Quick Share stays on Android, AirDrop stays on Apple. The browser is the neutral ground both phones already have, so that's where this transfer runs.",
      <>Open <Link className="font-medium text-primary underline underline-offset-4 hover:text-primary-500" href="/quick">Quick Transfer</Link> on the Android phone and pick your files; a 6-digit code appears. Type that code into transfer.zip/quick in Safari on the iPhone and the files stream across encrypted, directly from phone to phone.</>,
      "Nothing is installed on either device and nothing is uploaded to a cloud account. The phones don't even need to share a Wi-Fi network, one on mobile data works fine.",
    ],
    steps: [
      { text: "Open this page on the Android phone, tap the button above and pick the photos, videos or files you want to send." },
      { text: "On the iPhone, open transfer.zip/quick in Safari and type the 6-digit code shown on the Android phone." },
      { text: "Safari downloads the files to the iPhone's Files app. Keep both phones online and unlocked until the transfer finishes." },
    ],
    tips: [
      {
        heading: "Getting photos into the Photos app",
        body: [
          "Safari saves what it receives to the Files app, under Downloads, and iOS doesn't add pictures to the photo library on its own. Open the image in Files, tap the share icon and choose \"Save Image\".",
          "Several photos sent together arrive as one zip. Long-press it in Files and pick Uncompress, then select all the images and save them to Photos from the share sheet in one go.",
        ],
      },
      {
        heading: "Switching phones? Move to iOS has a catch",
        body: [
          "Apple's Move to iOS app only works while the iPhone is still in initial setup. Once you've started using the iPhone, the app is no help, and a factory reset just to copy files over is a steep price.",
          "A browser transfer works at any point. Send the camera roll in batches from the Android phone whenever you get around to it, weeks after the switch included. Contacts and calendars are still easiest to bring over through your Google account.",
        ],
      },
      {
        heading: "Will the iPhone open Android files?",
        body: [
          "Photos from Android phones are regular JPGs, and Android video is H.264 or HEVC, all of which the iPhone plays natively. The common stuff just works.",
          "Everything else still transfers, because the browser doesn't filter by type. A file iOS can't preview simply sits in the Files app, where you can forward it or hand it to a compatible app.",
        ],
      },
    ],
    faq: [
      { q: "Can I use Quick Share to send to an iPhone?", a: "No. Quick Share (formerly Nearby Share) only works between Android devices and Windows PCs. An iPhone can't receive from it, which is why the browser is the practical cross-platform route." },
      { q: "Do I need to install anything on either phone?", a: "No. Chrome (or any browser) on the Android phone and Safari on the iPhone are enough. There is no app and no account on either side." },
      { q: "Where do the files end up on the iPhone?", a: "In the Files app under Downloads. Images can be saved to the photo library from the share sheet, and zip archives unpack with a long-press. iOS handles that natively." },
      { q: "Will photo and video quality survive the transfer?", a: "Yes. Files move bit for bit with no recompression, unlike messaging apps. A 4K clip from the Android phone arrives on the iPhone at its exact original size and quality." },
      { q: "Do both phones need to be on the same Wi-Fi?", a: "No. The transfer runs over the internet, so Android on mobile data and iPhone on home Wi-Fi works. Both phones just need to stay online until it finishes." },
      { q: "Is there a file size limit?", a: "No. The files stream directly between the phones without being stored on a server, so multi-gigabyte videos are fine. Bigger transfers simply take longer." },
    ],
  },
  {
    slug: "transfer-files-from-android-to-mac",
    image: "/img/content/seo/android-to-mac.png",
    from: "android",
    to: "mac",
    title: "How to Transfer Files from Android to Mac (Android File Transfer Is Gone)",
    description: "Google discontinued the Android File Transfer app for Mac. Send photos, videos and files from any Android phone to a Mac through the browser instead, without a cable or an app, at any size.",
    heading: "How to Transfer Files from Android to Mac",
    headline: { highlightedWord: "Instantly", title: "send files from Android to Mac." },
    subtitle: "Android File Transfer is discontinued and AirDrop won't talk to Android. Pick your files on the phone, type a 6-digit code on the Mac, and the transfer starts.",
    howItWorks: [
      "Android and Mac is the pairing both companies forgot. AirDrop is Apple-only, Google's Quick Share app exists for Windows but not macOS, and the one official tool for the job, the Android File Transfer app, was quietly discontinued in early 2024. Its old download page now points to a Windows-only app.",
      <>The browser fills the gap. Open <Link className="font-medium text-primary underline underline-offset-4 hover:text-primary-500" href="/quick">Quick Transfer</Link> on the Android phone, pick your files, and type the 6-digit code on the Mac. The two devices connect directly and the files stream between them, end-to-end encrypted, with nothing stored on any server.</>,
      "There's no cable, no MTP driver roulette, and nothing to install on either side. Chrome on the phone and Safari on the Mac are enough, and the two devices don't even need to be on the same network.",
    ],
    steps: [
      { text: "Open this page on your Android phone, tap the button above and pick the photos, videos or files you want on the Mac." },
      { text: "On the Mac, open transfer.zip/quick in Safari (or any browser) and type the 6-digit code shown on the phone." },
      { text: "The files download straight to the Mac's Downloads folder. Keep both devices online until the transfer finishes." },
    ],
    tips: [
      {
        heading: "What happened to Android File Transfer?",
        body: [
          "Google removed the Mac app's download in February 2024 and never shipped a replacement; its file-transfer support page now only covers Windows PCs and Chromebooks. The abandoned app still floats around, but it was fragile even in its prime, famous for \"No Android device found\" with the phone plugged in.",
          "If you specifically want a cable workflow, the open-source OpenMTP app is the community's replacement. For everything else, a browser transfer skips the cable, the drivers, and the mounting problems in one move.",
        ],
      },
      {
        heading: "Full quality, straight from the phone",
        body: [
          "Files arrive exactly as they are on the phone: a 4K video lands frame for frame, RAW photos stay RAW. Nothing is recompressed on the way, which is what happens when you route media through a messaging app instead.",
          "Sending many files at once? They arrive bundled as a single zip, and macOS unpacks it with a double-click. Keep the phone's screen on for big batches, since Android pauses background browser tabs to save battery.",
        ],
      },
      {
        heading: "Why not Quick Share, Bluetooth or a cable?",
        body: [
          "Quick Share has no macOS app, so that door is closed from the start. Bluetooth file exchange technically works on both platforms but moves at megabytes per minute, and the cable route depends on MTP software that no longer officially exists for the Mac.",
          "The browser route has none of those dependencies, and it works the same whether the Mac is next to the phone or in another country.",
        ],
      },
    ],
    faq: [
      { q: "Does this work with Samsung, Pixel and other Android phones?", a: "Yes. Anything with a modern browser like Chrome works: Samsung, Pixel, Xiaomi, OnePlus and the rest. There is no app to install and no account to create." },
      { q: "What replaced Android File Transfer on Mac?", a: "Officially, nothing: Google discontinued the app in 2024 without a macOS successor. A browser transfer covers the wireless case, and the open-source OpenMTP app covers cable transfers if you prefer USB." },
      { q: "Where do the files end up on my Mac?", a: "In the Downloads folder, like any browser download. Multiple files arrive as one zip, which macOS extracts with a double-click." },
      { q: "Do the phone and Mac need to be on the same Wi-Fi?", a: "No. The transfer works over the internet, so the phone can be on mobile data and the Mac on home Wi-Fi. They just need to be online at the same time." },
      { q: "Is there a file size limit?", a: "No. Files stream directly from the phone to the Mac without being stored on a server, so multi-gigabyte videos are fine. Larger transfers simply take longer." },
      { q: "Do I need USB debugging or developer mode?", a: "No. This is a normal browser page, not a cable or ADB connection. Nothing on the phone needs to be enabled or configured." },
    ],
  },
  {
    slug: "transfer-files-from-mac-to-pc",
    image: "/img/content/seo/mac-to-pc.png",
    from: "mac",
    to: "pc",
    title: "How to Transfer Files from Mac to PC (No Cable or Setup)",
    description: "There is no official tool for moving files from a Mac to a Windows PC. Stream them directly between the two browsers instead, without formatting a drive or configuring a network share, at any size.",
    heading: "How to Transfer Files from Mac to PC",
    headline: { highlightedWord: "Directly", title: "send files from Mac to PC." },
    subtitle: "Switching from Mac to Windows, or just handing files across the desk? Skip the exFAT drives and SMB shares: pick the files on the Mac, type a 6-digit code on the PC.",
    howItWorks: [
      "Mac-to-PC is the direction nobody built a tool for. Apple's Migration Assistant only moves files into a Mac, and Microsoft's transfer tooling is Windows-to-Windows. What's left is the folklore: externally formatted drives, network shares, or uploading everything to a cloud drive just to download it again.",
      <>A <Link className="font-medium text-primary underline underline-offset-4 hover:text-primary-500" href="/quick">Quick Transfer</Link> replaces all of it. Pick the files (or whole folders) on the Mac, and on the PC type the 6-digit code at transfer.zip/quick. The data streams directly between the two browsers, end-to-end encrypted, and never touches a server.</>,
      "The machines don't need to share a network, a workgroup, or a room. If both are online, the transfer runs, at the speed of the slower connection.",
    ],
    steps: [
      { text: "On the Mac, open this page, click the button above and pick the files or folders to send." },
      { text: "On the Windows PC, open transfer.zip/quick in any browser and enter the 6-digit code (or scan the QR if it's next to you)." },
      { text: "The download starts immediately and shows progress on both screens. Keep both machines awake until it completes." },
    ],
    tips: [
      {
        heading: "Switching from Mac to Windows?",
        body: [
          "Move your user files in batches: Desktop, Documents, Pictures, then project folders. Applications need reinstalling on Windows either way, so the actual moving job is files, and a direct transfer handles any volume of them.",
          "Mind the Apple-format stragglers: Pages, Numbers and Keynote documents should be exported to Word, Excel and PowerPoint on the Mac first. Photos, videos, PDFs and Office files cross over untouched.",
        ],
      },
      {
        heading: "Why external drives keep biting",
        body: [
          "The classic USB-drive route has a format trap: Windows drives usually come as NTFS, which a Mac reads but can't reliably write. Getting a drive both sides fully understand means reformatting to exFAT first, which wipes it.",
          "A browser transfer has no format at all: files go from disk to disk with nothing in between, and folder structures arrive intact inside a single zip.",
        ],
      },
      {
        heading: "What about file sharing over the network?",
        body: [
          "macOS can share folders to Windows over SMB, and it works, once File Sharing is on, the SMB option is ticked, the accounts are authorized, and both machines are on the same network with discovery behaving. It's a fine setup for permanent home use.",
          "For a one-off handoff, that's a lot of System Settings for one folder. The code-in-a-browser route needs none of it, and works across different networks too.",
        ],
      },
    ],
    faq: [
      { q: "Do I need to install anything on the PC or the Mac?", a: "No. Both sides run entirely in the browser: Safari or Chrome on the Mac, any browser on Windows. There is nothing to install or configure." },
      { q: "Will my Mac files open on Windows?", a: "The common formats all do: photos, videos, music, PDFs and Office documents work identically. Export Pages, Numbers or Keynote files to their Office equivalents before sending." },
      { q: "Can I send whole folders?", a: "Yes. Use the folder option in the file picker on the Mac, and the folder arrives on the PC as a single zip with its structure intact." },
      { q: "Is there a size limit for the transfer?", a: "No. Files stream directly between the two machines without server storage, so hundred-gigabyte moves are possible. They just take as long as your connections need." },
      { q: "Do both computers need to be on the same network?", a: "No. Unlike SMB shares or drive swaps, this works over the internet. Old Mac at the office, new PC at home works fine." },
      { q: "Is it safe for personal files?", a: "Yes. The transfer is end-to-end encrypted, streams directly between the two browsers, and nothing is stored anywhere. Close the tabs and the code is gone." },
    ],
  },
  {
    slug: "transfer-files-from-pc-to-mac",
    image: "/img/content/seo/pc-to-mac.png",
    from: "pc",
    to: "mac",
    title: "How to Transfer Files from PC to Mac Without Migration Assistant",
    description: "Apple's Migration Assistant is an all-or-nothing move. To get just the files you want from a Windows PC onto a Mac, stream them through the browser with nothing to install and no size limit.",
    heading: "How to Transfer Files from PC to Mac",
    headline: { highlightedWord: "Easily", title: "send files from PC to Mac." },
    subtitle: "Get documents, photos, videos or entire folders from a Windows PC onto a Mac without Migration Assistant's full-move ceremony. Pick files on the PC, type a code on the Mac.",
    howItWorks: [
      "Apple does ship a tool for this direction: Windows Migration Assistant. It's built for one scenario, the day you unbox a new Mac, and it moves accounts, mail, bookmarks and files wholesale, with both machines side by side and a pairing code between them. For \"I just need these three folders,\" it's a sledgehammer.",
      <>With <Link className="font-medium text-primary underline underline-offset-4 hover:text-primary-500" href="/quick">Quick Transfer</Link>, you pick exactly what to send on the PC, and the Mac pulls it straight through the browser: type the 6-digit code at transfer.zip/quick and the download starts. Files stream directly between the machines, end-to-end encrypted, with no server in the middle.</>,
      "It works on any Windows version with a modern browser and any Mac, across different networks, with no size limit. Send one PDF or a hundred gigabytes of photo archive the same way.",
    ],
    steps: [
      { text: "Open this page on the Windows PC, click the button above and select the files or folders for the Mac." },
      { text: "On the Mac, open transfer.zip/quick in Safari (or any browser) and type the 6-digit code from the PC's screen." },
      { text: "The files land in the Mac's Downloads folder. Keep both machines online until the progress bar completes." },
    ],
    tips: [
      {
        heading: "When Migration Assistant is the better tool",
        body: [
          "Fair is fair: on a brand-new Mac, if you want your mail accounts, contacts, calendars and browser bookmarks carried over along with the files, Apple's Windows Migration Assistant is built exactly for that one-time move. Install it on the PC, keep both machines close, and follow the pairing code.",
          "For everything after that day, selective transfers are the job, and that's where the browser route wins: no install, no pairing, just the files you actually want.",
        ],
      },
      {
        heading: "Where files land, and unzipping",
        body: [
          "Downloads arrive in the Mac's Downloads folder. If you sent several files or a folder, they come as one zip: double-click and macOS unpacks it next to the archive, folder structure preserved.",
          "From there, drag photos into the Photos app, music into Music, and documents wherever they live. Nothing needs converting first.",
        ],
      },
      {
        heading: "Windows files on a Mac: what works",
        body: [
          "Nearly everything you'd actually move: JPG and PNG photos, MP4 videos, MP3s, PDFs and Microsoft Office documents all open natively on macOS, with Office files also opening in Pages, Numbers and Keynote.",
          "The exception is Windows software: .exe installers don't run on a Mac, so skip the Program Files folder and bring the documents instead.",
        ],
      },
    ],
    faq: [
      { q: "Do I need an Apple ID or iCloud for this?", a: "No. The transfer runs in the browser on both machines. No Apple ID, Microsoft account or any other sign-in is involved." },
      { q: "How is this different from Migration Assistant?", a: "Migration Assistant is a one-time, everything-at-once move for setting up a new Mac, and needs its app installed on the PC. A browser transfer is selective: any files, any time, nothing installed." },
      { q: "Can I move my whole photo library?", a: "Yes. Select the folder on the PC and it streams across with structure intact, whatever the size. Afterwards, import the pictures into the Photos app on the Mac if you want them managed there." },
      { q: "Do the PC and Mac need to be near each other?", a: "No. The connection works over the internet, so the machines can be on different networks entirely, or different continents." },
      { q: "Is there a file size limit?", a: "No. The files stream directly between the two computers with nothing stored on a server, so there is no cap. Big moves just take longer, with live progress on both screens." },
      { q: "Will Windows files open on the Mac?", a: "The everyday formats all do: photos, videos, music, PDFs and Office documents. Windows programs themselves (.exe) don't run on macOS, so move documents rather than installed software." },
    ],
  },
]

export function getTransferPair(slug) {
  return TRANSFER_PAIRS.find(p => p.slug === slug)
}

/** Related pairs for the Related Guides cards, devices in common first. */
export function getRelatedPairs(slug, max = 4) {
  const current = getTransferPair(slug)
  const score = (p) => (p.from === current.from || p.to === current.to ? 0 : p.from === current.to || p.to === current.from ? 1 : 2)
  return TRANSFER_PAIRS
    .filter(p => p.slug !== slug)
    .sort((a, b) => score(a) - score(b))
    .slice(0, max)
}
