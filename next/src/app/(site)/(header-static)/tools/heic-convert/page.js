import ToolLayout from "@/components/ToolLayout";
import HeicConvertTool from "@/components/tools/HeicConvertTool";
import RelatedLinks from "@/components/RelatedLinks";
import MultiStepAction from "@/components/MultiStepAction";
import Link from 'next/link';

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
      <ToolLayout heroTitle={<span><span className="text-primary">Convert HEIC</span> to JPG online</span>} heroSubtitle="Easily convert your HEIC files to JPG format with our online tool. Your photos remain completely private - even from us.">
        <HeicConvertTool />
      </ToolLayout>
      <div className="mx-auto max-w-7xl px-6 lg:px-8 mb-16">
        <div className="mt-16">
          <h2 className="inline-block text-2xl mb-4 font-bold">How does it work?</h2>
          <p className="text-lg mb-2">Simply choose the HEIC files from your computer, and they will be converted instantly.</p>
          <p className="text-lg mb-2">You can then choose to share individual photos for free if needed.</p>
          <p className="text-lg mb-2"><b>Your files never leave your computer</b> - everything is processed in your browser only.</p>
          <p className="text-lg mb-2">Want to check for yourself? <a className="text-primary hover:underline" href="https://github.com/robinkarlberg/transfer.zip-web">Check the code on GitHub &rarr;</a></p>
        </div>
        <div className="mt-16">
          <h2 className="inline-block text-2xl mb-4 font-bold">How do I use the tool?</h2>
          <span className="ms-2 text-gray-500">3 steps</span>
          <MultiStepAction steps={[
            { step: 1, icon: "hand-index", text: "Pick your HEIC files" },
            { step: 2, icon: "hourglass-split", text: "Click 'Convert' and wait" },
            { step: 3, icon: "cloud-arrow-down-fill", text: <span>Download or <Link className="text-primary hover:underline" href="/quick">share files</Link></span> },
          ]} />
        </div>
        <div className="mt-16">
          <RelatedLinks currentSlug="heic-convert" />
        </div>
      </div>
    </div>
  );
}
