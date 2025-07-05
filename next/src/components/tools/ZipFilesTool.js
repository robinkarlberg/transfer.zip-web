"use client";

import { useEffect, useMemo, useState } from "react";
import FileUpload from "../elements/FileUpload";
import Progress from "../elements/Progress";
import streamSaver from "@/lib/client/StreamSaver";
import * as zip from "@zip.js/zip.js";
import { readFileTillEnd } from "@/lib/utils";

export default function ZipFilesTool() {
  const [files, setFiles] = useState(null);
  const maxBytes = useMemo(() => files && files.reduce((sum, f) => sum + f.size, 0), [files]);
  const [progressBytes, setProgressBytes] = useState(0);

  const doZip = async () => {
    let currentBytes = 0;
    const zipStream = new zip.ZipWriterStream({ zip64: true, bufferedWrite: true });
    const fileStream = streamSaver.createWriteStream("archive.zip");
    const fileWriter = fileStream.getWriter();
    const trackingStream = new WritableStream({
      write(chunk) {
        currentBytes += chunk.byteLength;
        setProgressBytes(currentBytes);
        return fileWriter.write(chunk);
      },
      close() { return fileWriter.close(); },
      abort(r) { return fileWriter.abort(r); }
    });

    zipStream.readable.pipeTo(trackingStream);
    for (let file of files) {
      let writer = zipStream.writable(file.webkitRelativePath || file.name).getWriter();
      await readFileTillEnd(file, data => writer.write(data));
      writer.close();
    }
    await zipStream.close();
    setProgressBytes(maxBytes)
  };

  const handleFiles = (fs) => { if (fs.length) setFiles(fs); };

  useEffect(() => { if (files) doZip(); }, [files]);

  return (
    <div className="mx-auto max-w-sm">
      <FileUpload onFiles={handleFiles} buttonText="Zip" showProgress={!!maxBytes} progressElement={<Progress max={maxBytes} now={progressBytes} />} />
    </div>
  );
}
