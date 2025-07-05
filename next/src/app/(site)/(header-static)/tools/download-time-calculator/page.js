import ToolLayout from "@/components/ToolLayout";
import DownloadTimeCalculator from "@/components/tools/DownloadTimeCalculator";
import RelatedLinks from "@/components/RelatedLinks";

export const metadata = {
  title: "Download Time Calculator | Transfer.zip",
  description: "Estimate how long a download will take based on file size and internet speed.",
  openGraph: {
    title: "Download Time Calculator | Transfer.zip",
    description: "Estimate how long a download will take based on file size and internet speed.",
    images: ["https://cdn.transfer.zip/og.png"],
  },
};

export default function Page() {
  return (
    <div>
      <ToolLayout heroTitle={<span><span className="text-primary">Calculate</span> download time</span>} heroSubtitle="See how long a file will take to download with your current connection speed.">
        <DownloadTimeCalculator />
      </ToolLayout>
      <div className="mx-auto max-w-7xl px-6 lg:px-8 mb-16">
        <div className="mt-16">
          <h2 className="inline-block text-2xl mb-4 font-bold">About this tool</h2>
          <p className="text-lg mb-2">Enter a file size and your connection speed to get an instant estimate of how long the download will take.</p>
          {/* <p className="text-lg mb-2">No data is sent anywhere - the calculation happens entirely in your browser.</p> */}
        </div>
        <div className="mt-16">
          <RelatedLinks currentSlug="download-time-calculator" />
        </div>
      </div>
    </div>
  );
}
