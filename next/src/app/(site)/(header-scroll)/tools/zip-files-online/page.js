import ToolLanding from "@/components/tools/ToolLanding";
import ZipFilesTool from "@/components/tools/ZipFilesTool";
import RelatedLinks from "@/components/RelatedLinks";
import ContentArticle from "@/components/content/ContentArticle";
import { mdxComponents } from "@/mdx-components";

const { h2: H2, p: P, ol: Ol, li: Li, a: A, Link: MdxLink } = mdxComponents()

export const metadata = {
  title: "Zip Files Online | Transfer.zip",
  description: "Create zip files directly in your browser without uploading them anywhere.",
  openGraph: {
    title: "Zip Files Online | Transfer.zip",
    description: "Create zip files directly in your browser without uploading them anywhere.",
    images: ["https://cdn.transfer.zip/og.png"],
  },
};

export default function Page() {
  return (
    <div>
      <ToolLanding
        title="create zip files online."
        highlightedWord="Easily"
        subtitle="Compress even the biggest files with this online file and folder zip tool. You can also choose to share the zip file for free afterwards, if you need to."
      >
        <ZipFilesTool />
      </ToolLanding>

      <div className="bg-white pt-10">
        <ContentArticle>
          <H2>How does it work?</H2>
          <P>Pick files and folders from your computer, and they are compressed instantly into one zip file.</P>
          <P>You can then choose to download or share the newly created zip file for free if needed.</P>
          <P><strong>Your files never leave your computer</strong> - everything is processed in your browser only.</P>
          <P>Want to check for yourself? <A href="https://github.com/robinkarlberg/transfer.zip-web">Check the code on GitHub &rarr;</A></P>

          <H2>How do I use the tool?</H2>
          <Ol>
            <Li>Pick your files, or select a whole folder.</Li>
            <Li>Click "Zip" and wait.</Li>
            <Li>Download or <MdxLink href="/quick">share your zip file</MdxLink>.</Li>
          </Ol>

          <RelatedLinks currentSlug="zip-files-online" />
        </ContentArticle>
      </div>
    </div>
  );
}
