"use client";

import { useState } from "react";
import FileUpload from "../elements/FileUpload";
import Progress from "../elements/Progress";
import { downloadBlob } from "@/lib/utils";
import streamSaver from "@/lib/client/StreamSaver";
import * as zip from "@zip.js/zip.js";

const heic2any = typeof window !== "undefined" ? require("heic2any") : null

export default function HeicConvertTool() {
  const [now, setNow] = useState(0);
  const [max, setMax] = useState(0);

  const doConvert = async (file) => {
    console.log(heic2any)
    const outputBuffer = await heic2any({ blob: file, format: "JPEG", quality: 0.9 });
    console.log(outputBuffer)
    return outputBuffer;
  };

  const handleFiles = async (_files) => {
    if (_files.length === 0) return;
    const files = Array.from(_files).filter((f) => /\.heic$/i.test(f.name));
    if (files.length === 0) return;
    setMax(files.length);

    if (files.length === 1) {
      const newFileName = files[0].name.replace(/\.heic$/i, ".jpg");
      downloadBlob(new Blob([await doConvert(files[0])]), newFileName);
      setNow(1);
    } else {
      const zipStream = new zip.ZipWriterStream({ zip64: true, bufferedWrite: true });
      const fileStream = streamSaver.createWriteStream("Converted JPGs.zip");
      zipStream.readable.pipeTo(fileStream);
      for (let index = 0; index < files.length; index++) {
        const file = files[index];
        const outputBuffer = await doConvert(file);
        let writer = zipStream.writable(file.name.replace(/\.heic$/i, ".jpg")).getWriter();
        writer.write(outputBuffer);
        writer.close();
        setNow(index + 1);
      }
      await zipStream.close();
    }
  };

  return (
    <div className="mx-auto max-w-sm">
      <FileUpload onFiles={handleFiles} buttonText="Convert" showProgress={max !== 0} accept=".heic" progressElement={<Progress now={now} max={max} />} />
    </div>
  );
}
