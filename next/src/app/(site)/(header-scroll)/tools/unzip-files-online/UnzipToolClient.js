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
          title="open your zip file online."
          highlightedWord="Easily"
          subtitle="Decompress and view even the largest zip files with this online tool. We can not read your files, as everything is handled locally in your browser."
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
