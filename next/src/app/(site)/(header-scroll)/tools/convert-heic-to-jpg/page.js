import ToolLanding from "@/components/tools/ToolLanding";
import HeicConvertTool from "@/components/tools/HeicConvertTool";
import RelatedLinks from "@/components/RelatedLinks";
import ContentArticle from "@/components/content/ContentArticle";
import { mdxComponents } from "@/mdx-components";

const { h2: H2, h3: H3, p: P, ul: Ul, ol: Ol, li: Li, a: A, Link: MdxLink } = mdxComponents()

export const metadata = {
  title: "HEIC to JPG Converter | Transfer.zip",
  description: "Convert HEIC photos to JPG format without uploading them anywhere.",
  openGraph: {
    title: "HEIC to JPG Converter | Transfer.zip",
    description: "Convert HEIC photos to JPG format without uploading them anywhere.",
    images: ["https://cdn.transfer.zip/og.png"],
  },
};

export default function Page() {
  return (
    <div>
      <ToolLanding
        title="to JPG online."
        highlightedWord="Convert HEIC"
        subtitle="Instantly convert HEIC photos to JPG format with our free online converter. No uploads required - your images stay private and secure on your device."
      >
        <HeicConvertTool />
      </ToolLanding>

      <div className="bg-white pt-10">
        <ContentArticle>
          <H2>What is HEIC and why convert to JPG?</H2>
          <P>
            HEIC (High Efficiency Image Container) is the default photo format used by Apple devices since iOS 11. While HEIC files offer excellent image quality with smaller file sizes, they're not universally supported across all devices and software.
          </P>
          <P>Converting HEIC to JPG (or JPEG) solves compatibility issues, letting you:</P>
          <Ul>
            <Li>Share photos with friends on any device</Li>
            <Li>Upload images to websites that don't support HEIC format</Li>
            <Li>Edit photos in software that only recognizes JPG files</Li>
            <Li>View your Apple photos on Windows, Android, or older devices</Li>
          </Ul>

          <H2>How to convert HEIC to JPG in 3 steps</H2>
          <Ol>
            <Li>Pick your HEIC files, one or many, from your computer or device.</Li>
            <Li>The images convert directly in your browser, so they never leave your device.</Li>
            <Li>Download your JPG files or <MdxLink href="/quick">share them</MdxLink> for free.</Li>
          </Ol>

          <H2>Why use Transfer.zip's HEIC converter?</H2>

          <H3>Complete privacy</H3>
          <P>
            Your photos never leave your device. Unlike other online converter tools that upload your images to their servers, we process everything locally in your browser. You keep full control over your content and data.
          </P>

          <H3>No quality loss</H3>
          <P>
            The converter maintains the original image quality during the conversion from HEIC to JPG. Your photos will look exactly as they should, with the color accuracy and detail intact.
          </P>

          <H3>More formats than JPG</H3>
          <P>
            The tool also converts to other image formats, including PNG, if you need more than HEIC to JPG.
          </P>

          <H3>Free and unlimited</H3>
          <P>
            Convert as many HEIC files as you need. There's no limit on file size or the number of photos you can convert, and no registration or hidden fees.
          </P>

          <H3>Works on any device</H3>
          <P>
            Use the converter on your computer, tablet, or phone. It runs in the browser, so it works on Windows, Mac, Linux, Android, and iOS.
          </P>

          <H2>How does it work?</H2>
          <P>Choose the HEIC files from your computer, and they are converted instantly. You can then share individual photos for free if needed.</P>
          <P><strong>Your files never leave your computer</strong> - everything is processed in your browser only.</P>
          <P>Want to check for yourself? <A href="https://github.com/robinkarlberg/transfer.zip-web">Check the code on GitHub &rarr;</A></P>

          <H2>FAQ</H2>
          <P><strong>Why are my iPhone photos in HEIC format?</strong>{" "}
            Apple adopted HEIC as the default photo format because it produces smaller file sizes while maintaining high image quality. This saves storage space on your device.
          </P>
          <P><strong>Will converting to JPG reduce image quality?</strong>{" "}
            JPG is a compressed format, but the converter preserves as much quality as possible. For most use cases, you won't notice any difference.
          </P>
          <P><strong>Can I convert HEIC to other formats besides JPG?</strong>{" "}
            Yes, the tool converts to both JPG and PNG, depending on what you need.
          </P>
          <P><strong>Is there a file size limit?</strong>{" "}
            No. Since conversion happens on your device rather than our servers, you can convert images of any size that your browser can handle.
          </P>
          <P><strong>What devices support HEIC files?</strong>{" "}
            HEIC is natively supported on Apple devices (iOS 11+, macOS High Sierra+) and Windows 10 (version 1809+). However, many websites, apps, and older software don't support this format, which is why conversion to JPG is often necessary.
          </P>

          <H2>About security and privacy</H2>
          <P>
            The HEIC to JPG converter uses client-side processing, meaning:
          </P>
          <Ul>
            <Li>No images are uploaded to any server</Li>
            <Li>No data is stored or logged</Li>
            <Li>Your photos remain completely private</Li>
            <Li>Everything happens locally in your browser</Li>
          </Ul>
          <P>
            Want to verify? Our code is open source and available on <A href="https://github.com/robinkarlberg/transfer.zip-web">GitHub</A> for anyone to review.
          </P>

          <RelatedLinks currentSlug="convert-heic-to-jpg" />
        </ContentArticle>
      </div>
    </div>
  );
}
