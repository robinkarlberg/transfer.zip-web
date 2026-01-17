import ToolLayout from "@/components/ToolLayout";
import MetadataEditorTool from "@/components/tools/MetadataEditorTool";
import RelatedLinks from "@/components/RelatedLinks";

export const metadata = {
  title: "File Metadata Editor | Transfer.zip",
  description: "Edit image EXIF metadata or MP3 ID3 tags privately in your browser without uploading.",
  openGraph: {
    title: "File Metadata Editor | Transfer.zip",
    description: "Edit image EXIF metadata or MP3 ID3 tags privately in your browser without uploading.",
    images: ["https://cdn.transfer.zip/og.png"],
  },
};

export default function Page() {
  return (
    <div>
      <ToolLayout heroTitle={<span><span className="text-primary">Edit file metadata</span> online</span>} heroSubtitle="Change any EXIF tag or MP3 metadata privately in your browser.">
        <MetadataEditorTool />
      </ToolLayout>
      <div className="mx-auto max-w-7xl px-6 lg:px-8 mb-16">
        <div className="mt-16">
          <h2 className="inline-block text-2xl mb-4 font-bold">About this tool</h2>
          <p className="text-lg mb-2">Edit any EXIF field such as camera settings or GPS coordinates, and update the title or artist of your MP3 files.</p>
          <p className="text-lg mb-2"><b>Your files never leave your computer</b> - everything is processed in your browser.</p>
        </div>
        <div className="mt-16">
          <RelatedLinks currentSlug="metadata-editor" />
        </div>
      </div>
    </div>
  );
}
