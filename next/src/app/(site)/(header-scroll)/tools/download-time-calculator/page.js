import ToolLanding from "@/components/tools/ToolLanding";
import DownloadTimeCalculator from "@/components/tools/DownloadTimeCalculator";
import RelatedLinks from "@/components/RelatedLinks";
import { ZapIcon } from "lucide-react";

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
      <ToolLanding
        title="download time."
        highlightedWord="Calculate"
        subtitle="See how long a file will take to download with your current connection speed."
        features={[
          { icon: <ZapIcon size={16} />, text: "Instant calculation", mobile: false },
          { icon: <ZapIcon size={16} />, text: "No data sent anywhere", mobile: false },
          { icon: <ZapIcon size={16} />, text: "Works offline", mobile: false },
          { icon: <ZapIcon size={16} />, text: "Instant calculation, works offline", mobile: true },
        ]}
      >
        <DownloadTimeCalculator />
      </ToolLanding>

      <div className="bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16">
          <div className="mt-8">
            <h2 className="inline-block text-2xl mb-4 font-bold">About this tool</h2>
            <p className="text-lg mb-2">Enter a file size and your connection speed to get an instant estimate of how long the download will take.</p>
          </div>
          <div className="mt-16">
            <RelatedLinks currentSlug="download-time-calculator" />
          </div>
        </div>
      </div>
    </div>
  );
}
