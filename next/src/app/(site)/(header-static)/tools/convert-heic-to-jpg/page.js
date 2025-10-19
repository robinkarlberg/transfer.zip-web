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
      <ToolLayout heroTitle={<span><span className="text-primary">Convert HEIC</span> to JPG online</span>} heroSubtitle={<><b>Instantly convert HEIC photos to JPG format</b> with our free online converter. No uploads required - your images stay private and secure on your device.</>}>
        <HeicConvertTool />
      </ToolLayout>
      <div className="mx-auto max-w-7xl px-6 lg:px-8 mb-16">

        {/* What is HEIC Section */}
        <div className="mt-16">
          <h2 className="text-2xl mb-4 font-bold">What is HEIC and Why Convert to JPG?</h2>
          <p className="text-lg mb-4">
            HEIC (High Efficiency Image Container) is the default photo format used by Apple devices since iOS 11. While HEIC files offer excellent image quality with smaller file sizes, they're not universally supported across all devices and software.
          </p>
          <p className="text-lg mb-4">Converting HEIC to JPG (or JPEG) solves compatibility issues, letting you:</p>
          <ul className="list-disc list-inside text-lg mb-4 space-y-2 ml-4">
            <li>Share photos with friends on any device</li>
            <li>Upload images to websites that don't support HEIC format</li>
            <li>Edit photos in software that only recognizes JPG files</li>
            <li>View your Apple photos on Windows, Android, or older devices</li>
          </ul>
        </div>

        {/* How to Convert Section */}
        <div className="mt-16">
          <h2 className="text-2xl mb-4 font-bold">How to Convert HEIC to JPG in 3 Steps</h2>
          <MultiStepAction steps={[
            { step: 1, icon: "hand-index", text: "Pick your HEIC files - Select one or multiple HEIC images from your computer or device" },
            { step: 2, icon: "hourglass-split", text: "Convert your images - The conversion happens directly in your browser for complete privacy" },
            { step: 3, icon: "cloud-arrow-down-fill", text: <span>Download your JPG files or <Link className="text-primary hover:underline" href="/quick">share them</Link> for free</span> },
          ]} />
        </div>

        {/* Why Use This Converter */}
        <div className="mt-16">
          <h2 className="text-2xl mb-4 font-bold">Why Use Transfer.zip's HEIC Converter?</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Complete Privacy Protection</h3>
              <p className="text-lg">
                Your photos never leave your device. Unlike other online converter tools that upload your images to their servers, we process everything locally in your browser. You maintain full control over your content and data.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">No Quality Loss</h3>
              <p className="text-lg">
                Our converter maintains the original image quality during the conversion process from HEIC to JPG format. Your photos will look exactly as they should, with proper color accuracy and detail preservation.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">Multiple Format Support</h3>
              <p className="text-lg">
                While we specialize in HEIC to JPG conversion, our tool also supports other image formats including PNG, making it a versatile solution for all your photo conversion needs.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">Free and Unlimited</h3>
              <p className="text-lg">
                Convert as many HEIC files as you need - there's no limit on file size or the number of photos you can convert. No registration, no hidden fees.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">Works on Any Device</h3>
              <p className="text-lg">
                Use our converter on your computer, tablet, or phone. Whether you're using Windows, Mac, Linux, Android, or iOS, our browser-based tool works everywhere.
              </p>
            </div>
          </div>
        </div>

        {/* How does it work - keeping original */}
        <div className="mt-16">
          <h2 className="text-2xl mb-4 font-bold">How does it work?</h2>
          <p className="text-lg mb-2">Simply choose the HEIC files from your computer, and they will be converted instantly.</p>
          <p className="text-lg mb-2">You can then choose to share individual photos for free if needed.</p>
          <p className="text-lg mb-2"><b>Your files never leave your computer</b> - everything is processed in your browser only.</p>
          <p className="text-lg mb-2">Want to check for yourself? <a className="text-primary hover:underline" href="https://github.com/robinkarlberg/transfer.zip-web">Check the code on GitHub &rarr;</a></p>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-2xl mb-4 font-bold">Common HEIC Conversion Questions</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Why are my iPhone photos in HEIC format?</h3>
              <p className="text-lg">
                Apple adopted HEIC as the default photo format because it produces smaller file sizes while maintaining high image quality. This saves storage space on your device.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Will converting to JPG reduce image quality?</h3>
              <p className="text-lg">
                JPG is a compressed format, but our converter optimizes the conversion to preserve maximum quality. For most use cases, you won't notice any difference.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Can I convert HEIC to other formats besides JPG?</h3>
              <p className="text-lg">
                Yes! Our tool supports conversion to both JPG and PNG formats, giving you flexibility based on your needs.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Is there a file size limit?</h3>
              <p className="text-lg">
                No. Since conversion happens on your device rather than our servers, you can convert images of any size that your browser can handle.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">What devices support HEIC files?</h3>
              <p className="text-lg">
                HEIC is natively supported on Apple devices (iOS 11+, macOS High Sierra+) and Windows 10 (version 1809+). However, many websites, apps, and older software don't support this format, which is why conversion to JPG is often necessary.
              </p>
            </div>
          </div>
        </div>

        {/* Security and Privacy Section */}
        <div className="mt-16">
          <h2 className="text-2xl mb-4 font-bold">About Security and Privacy</h2>
          <p className="text-lg mb-4">
            We take your privacy seriously. Our HEIC to JPG converter uses client-side processing, meaning:
          </p>
          <ul className="list-disc list-inside text-lg mb-4 space-y-2 ml-4">
            <li>No images are uploaded to any server</li>
            <li>No data is stored or logged</li>
            <li>Your photos remain completely private</li>
            <li>Everything happens locally in your browser</li>
          </ul>
          <p className="text-lg">
            Want to verify? Our code is open source and available on <a className="text-primary hover:underline" href="https://github.com/robinkarlberg/transfer.zip-web">GitHub</a> for anyone to review.
          </p>
        </div>

        {/* Related Links */}
        <div className="mt-16">
          <h2 className="text-2xl mb-4 font-bold">Additional Tools for File Management</h2>
          <p className="text-lg mb-4">Need more than just image conversion? Check out our other free online tools:</p>
          <RelatedLinks currentSlug="convert-heic-to-jpg" />
        </div>
      </div>
    </div>
  );
}