import RelatedLinks from "@/components/RelatedLinks";
import ContentArticle from "@/components/content/ContentArticle";
import { mdxComponents } from "@/mdx-components";
import UnzipToolClient from "./UnzipToolClient";

const { h2: H2, p: P, ol: Ol, li: Li, a: A, Link: MdxLink } = mdxComponents()

export const metadata = {
  title: "Unzip Files Online | Transfer.zip",
  description: "Decompress and view large zip files directly in your browser.",
  openGraph: {
    title: "Unzip Files Online | Transfer.zip",
    description: "Decompress and view large zip files directly in your browser.",
    images: ["https://cdn.transfer.zip/og.png"],
  },
};

export default function Page() {
  return (
    <UnzipToolClient>
      <div className="bg-white pt-10">
        <ContentArticle>
          <H2>How does it work?</H2>
          <P>Pick a zip file from your computer, and it is unpacked instantly so you can view its contents.</P>
          <P>You can then choose to download or share individual files for free if needed.</P>
          <P><strong>Your files never leave your computer</strong> - everything is processed in your browser only.</P>
          <P>Want to check for yourself? <A href="https://github.com/robinkarlberg/transfer.zip-web">Check the code on GitHub &rarr;</A></P>

          <H2>How do I use the tool?</H2>
          <Ol>
            <Li>Pick your zip file.</Li>
            <Li>Wait for the file to unzip.</Li>
            <Li>Preview, download or <MdxLink href="/quick">share files</MdxLink>.</Li>
          </Ol>

          <RelatedLinks currentSlug="unzip-files-online" />
        </ContentArticle>
      </div>
    </UnzipToolClient>
  );
}
