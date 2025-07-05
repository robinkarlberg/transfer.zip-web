import ToolLayout from "@/components/ToolLayout";
import ZipFilesTool from "@/components/tools/ZipFilesTool";
import RelatedLinks from "@/components/RelatedLinks";
import MultiStepAction from "@/components/MultiStepAction";
import Link from 'next/link';

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
      <ToolLayout heroTitle={<span><span className="text-primary">Easily</span> create zip files online.</span>} heroSubtitle="Effortlessly compress even the biggest files with this online file and folder zip tool. You can also choose to share the zip file for free afterwards, if you need to.">
        <ZipFilesTool />
      </ToolLayout>
      <div className="mx-auto max-w-7xl px-6 lg:px-8 mb-16">
        <div className="mt-16">
          <h2 className="inline-block text-2xl mb-4 font-bold">How does it work?</h2>
          <p className="text-lg mb-2">Simply pick files and folders from your computer, and they will be compressed instantly into one zip file.</p>
          <p className="text-lg mb-2">You can then choose to download or share the newly created zip file for free if needed.</p>
          <p className="text-lg mb-2"><b>Your files never leave your computer</b> - everything is processed in your browser only.</p>
          <p className="text-lg mb-2">Want to check for yourself? <a className="text-primary hover:underline" href="https://github.com/robinkarlberg/transfer.zip-web">Check the code on GitHub &rarr;</a></p>
        </div>
        <div className="mt-16">
          <h2 className="inline-block text-2xl mb-4 font-bold">How do I use the tool?</h2>
          <span className="ms-2 text-gray-500">3 steps</span>
          <MultiStepAction steps={[
            { step: 1, icon: "hand-index", text: "Pick your files or select a folder" },
            { step: 2, icon: "hourglass-split", text: "Click 'Zip' and wait" },
            { step: 3, icon: "cloud-arrow-down-fill", text: <span>Download or <Link className="text-primary hover:underline" href="/quick">share your zip file</Link></span> },
          ]} />
        </div>
        <div className="mt-16">
          <RelatedLinks currentSlug="zip-files-online" />
        </div>
      </div>
    </div>
  );
}
