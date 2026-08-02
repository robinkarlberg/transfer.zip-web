"use client";

import ToolLanding from "@/components/tools/ToolLanding";
import { UnzipProvider } from "@/components/tools/UnzipContext";
import UnzipFilePicker from "@/components/tools/UnzipFilePicker";
import UnzipFileBrowser from "@/components/tools/UnzipFileBrowser";

export default function UnzipToolClient({ children }) {
  return (
    <UnzipProvider>
      <div>
        <ToolLanding
          title="open ZIP and TAR archives online."
          highlightedWord="Privately"
          subtitle="Extract, browse and preview ZIP or uncompressed TAR archives in your browser. Protected ZIP files open with a local password check, so your files and password stay on your device."
        >
          <UnzipFilePicker />
        </ToolLanding>

        <div className="relative bg-gray-50">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16">
            <UnzipFileBrowser />
          </div>
        </div>

        {children}
      </div>
    </UnzipProvider>
  );
}
