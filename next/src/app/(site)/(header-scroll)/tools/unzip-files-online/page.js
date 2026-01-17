import RelatedLinks from "@/components/RelatedLinks";
import MultiStepAction from "@/components/MultiStepAction";
import Link from 'next/link';
import UnzipToolClient from "./UnzipToolClient";

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
      <div className="bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16">
          <div className="mt-8">
            <h2 className="inline-block text-2xl mb-4 font-bold">How does it work?</h2>
            <p className="text-lg mb-2">Simply upload a zip file from your computer, and it will be unpacked instantly, allowing you to view its contents.</p>
            <p className="text-lg mb-2">You can then choose to download or share individual files for free if needed.</p>
            <p className="text-lg mb-2"><b>Your files never leave your computer</b> - everything is processed in your browser only.</p>
            <p className="text-lg mb-2">Want to check for yourself? <a className="text-primary hover:underline" href="https://github.com/robinkarlberg/transfer.zip-web">Check the code on GitHub &rarr;</a></p>
          </div>
          <div className="mt-16">
            <h2 className="inline-block text-2xl mb-4 font-bold">How do I use the tool?</h2>
            <span className="ms-2 text-gray-500">3 steps</span>
            <MultiStepAction steps={[
              { step: 1, icon: "hand-index", text: "Pick your zip file" },
              { step: 2, icon: "hourglass-split", text: "Wait for the file to unzip" },
              { step: 3, icon: "cloud-arrow-down-fill", text: <span>Preview, download or <Link className="text-primary hover:underline" href="/quick">share files</Link></span> },
            ]} />
          </div>
          <div className="mt-16">
            <RelatedLinks currentSlug="unzip-files-online" />
          </div>
        </div>
      </div>
    </UnzipToolClient>
  );
}
