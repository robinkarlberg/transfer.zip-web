import RelatedLinks from "@/components/RelatedLinks";
import ContentArticle from "@/components/content/ContentArticle";
import { mdxComponents } from "@/mdx-components";
import UnzipToolClient from "./UnzipToolClient";

const {
  h2: H2,
  h3: H3,
  p: P,
  ul: Ul,
  ol: Ol,
  li: Li,
  a: A,
  Link: MdxLink,
} = mdxComponents();

const organizationProfiles = [
  "https://github.com/robinkarlberg/transfer.zip-web",
  process.env.NEXT_PUBLIC_FACEBOOK_URL,
  process.env.NEXT_PUBLIC_INSTAGRAM_URL,
  process.env.NEXT_PUBLIC_BLUESKY_URL,
  process.env.NEXT_PUBLIC_TWITTER_URL,
  process.env.NEXT_PUBLIC_GITHUB_URL,
].filter(Boolean);

export const metadata = {
  title: "Unzip Online Free: Private ZIP Extractor",
  description: "Open ZIP and TAR archives in your browser. Extract files locally, preview contents, and unlock password-protected ZIP files privately.",
  openGraph: {
    title: "Unzip Online Free: Private ZIP Extractor | Transfer.zip",
    description: "Open ZIP and TAR archives in your browser. Extract files locally, preview contents, and unlock password-protected ZIP files privately.",
    url: "https://transfer.zip/tools/unzip-files-online",
    images: ["https://cdn.transfer.zip/og.png"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://transfer.zip/#organization",
      name: "Transfer.zip",
      url: "https://transfer.zip/",
      sameAs: organizationProfiles,
    },
    {
      "@type": "Person",
      "@id": "https://transfer.zip/about-us#robin-karlberg",
      name: "Robin Karlberg",
      url: "https://transfer.zip/about-us",
      sameAs: ["https://github.com/robinkarlberg"],
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://transfer.zip/tools/unzip-files-online#tool",
      name: "Transfer.zip Online Archive Extractor",
      url: "https://transfer.zip/tools/unzip-files-online",
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Any operating system with a modern web browser",
      description: "A browser-based tool for opening ZIP, password-protected ZIP, and uncompressed TAR archives locally on the user's device.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      author: { "@id": "https://transfer.zip/about-us#robin-karlberg" },
      publisher: { "@id": "https://transfer.zip/#organization" },
    },
    {
      "@type": "WebPage",
      "@id": "https://transfer.zip/tools/unzip-files-online#page",
      url: "https://transfer.zip/tools/unzip-files-online",
      name: "Unzip Online Free: Private ZIP Extractor",
      author: { "@id": "https://transfer.zip/about-us#robin-karlberg" },
      publisher: { "@id": "https://transfer.zip/#organization" },
      mainEntity: { "@id": "https://transfer.zip/tools/unzip-files-online#tool" },
    },
  ],
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <UnzipToolClient>
        <div className="bg-white pt-10">
          <ContentArticle>
            <H2>How do I unzip files online?</H2>
            <P>
              Choose a ZIP file or an uncompressed TAR archive. Transfer.zip reads the archive directly in your browser and lists its files without uploading the archive to a server. You can preview supported images and text files, then download any extracted file you need.
            </P>
            <Ol>
              <Li>Pick a ZIP or TAR archive from your device.</Li>
              <Li>If the ZIP file is protected, enter its password in the local prompt.</Li>
              <Li>Browse the archive, preview supported files, or click a file to extract and download it.</Li>
            </Ol>
            <P>
              <strong>Your files and passwords never leave your device.</strong> The archive, its contents, and any password are processed only in the current browser tab. The <A href="https://github.com/robinkarlberg/transfer.zip-web">source code is available on GitHub</A> for inspection.
            </P>

            <H2>Format and compatibility FAQ</H2>

            <H3>What are ZIP, RAR, 7-Zip and TAR formats?</H3>
            <P>
              ZIP is a common compressed archive format with broad device support. RAR and the 7-Zip 7z format use different compression systems and require their own decoders. TAR stores a group of files and folders in one archive and is often used on Unix-based systems; TAR compression such as .tar.gz is a separate step.
            </P>
            <P>
              Transfer.zip currently opens regular ZIP archives, password-protected ZIP archives, and uncompressed .tar archives. RAR, 7z, .tar.gz, and .tgz formats are not supported by this tool yet.
            </P>

            <H3>How do I open a password-protected ZIP file?</H3>
            <P>
              Pick the protected ZIP file and enter its password when prompted. The browser checks the password locally before showing the archive contents. Transfer.zip supports the ZipCrypto and AES password protection handled by its ZIP reader. The password is kept in this tab for extraction and is never sent over the network.
            </P>

            <H3>What happens when an archive format is unsupported?</H3>
            <P>
              The picker shows a clear compatibility error and does not upload the archive. For a RAR or 7-Zip archive, create a ZIP or uncompressed TAR version with software that supports the original format, then open that new archive here.
            </P>

            <H2>How do I create and open ZIP files?</H2>
            <P>
              Use the <MdxLink href="/tools/zip-files-online">Zip Files Online tool</MdxLink> to select files or a folder and create a ZIP archive in your browser. Download the new ZIP file, then return to this extractor whenever you want to open it, check its contents, or download individual files.
            </P>

            <H2>Who maintains this archive tool?</H2>
            <P>
              Robin Karlberg and open-source contributors maintain Transfer.zip and its browser-based file tools. Read <MdxLink href="/about-us">about the people and project</MdxLink>, view <A href="https://github.com/robinkarlberg">Robin&apos;s GitHub profile</A>, or review and contribute to the public source repository.
            </P>

            <RelatedLinks currentSlug="unzip-files-online" />
          </ContentArticle>
        </div>
      </UnzipToolClient>
    </>
  );
}
