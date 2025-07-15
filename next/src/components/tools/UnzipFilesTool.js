"use client";

import { useState } from "react";
import FileUpload from "../elements/FileUpload";
import FileBrowser from "../elements/FileBrowser";
import EmptySpace from "../elements/EmptySpace";
import streamSaver from "@/lib/client/StreamSaver";
import * as zip from "@zip.js/zip.js";

let zipFileReader;
let zipReader;

const unzip = async (zipFile) => {
  const _files = [];
  zipFileReader = new zip.BlobReader(zipFile);
  zipReader = new zip.ZipReader(zipFileReader);
  const entries = await zipReader.getEntries();
  for (const entry of entries) {
    const split = entry.filename.split("/");
    if (!entry.directory) _files.push({ info: { name: split[split.length - 1], size: entry.uncompressedSize, relativePath: entry.filename, type: "application/octet-stream" }, entry });
  }
  return _files;
};

export default function UnzipFilesTool() {
  const [richFiles, setRichFiles] = useState(null);
  const [zipFile, setZipFile] = useState(null);

  const handleFiles = async (files) => {
    if (!files.length) return;
    const file = files[0];
    setZipFile(file);
    setRichFiles(await unzip(file));
  };

  const handleAction = async (action, richFile) => {
    if (action === "click") {
      const fileStream = streamSaver.createWriteStream(richFile.info.name);
      await richFile.entry.getData(fileStream);
    }
  };

  return (
    <div>
      <div className="mx-auto max-w-sm">
        <FileUpload onFiles={handleFiles} buttonText="Unzip" singleFile accept=".zip" />
      </div>
      <div className="mt-4">
        {richFiles ? (
          <div>
            <h3 className="text-2xl font-bold mb-4">{zipFile?.name}</h3>
            <FileBrowser richFiles={richFiles} onAction={handleAction} />
          </div>
        ) : (
          <EmptySpace title={`Select a ZIP file to get started`} subtitle={`Your files will be displayed here, allowing you to browse the archive.`} />
        )}
      </div>
    </div>
  );
}
