import ToolLanding from "@/components/tools/ToolLanding";
import DownloadTimeCalculator from "@/components/tools/DownloadTimeCalculator";
import RelatedLinks from "@/components/RelatedLinks";
import ContentArticle from "@/components/content/ContentArticle";
import { mdxComponents } from "@/mdx-components";
import { ZapIcon } from "lucide-react";

const { h2: H2, p: P } = mdxComponents()

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

      <div className="bg-white pt-10">
        <ContentArticle>
          <H2>About this tool</H2>
          <P>Enter a file size and your connection speed to get an instant estimate of how long the download will take.</P>

          <RelatedLinks currentSlug="download-time-calculator" />
        </ContentArticle>
      </div>
    </div>
  );
}
