"use client";

import { useState } from "react";
import { toast } from "sonner";
import FileUpload from "../elements/FileUpload";
import Progress from "../elements/Progress";
import { downloadBlob } from "@/lib/utils";
import streamSaver from "@/lib/client/StreamSaver";
import * as zip from "@zip.js/zip.js";
import { heicTo, isHeic } from "heic-to";

const HEIC_EXT = /\.(heic|heif)$/i;

export default function HeicConvertTool() {
  const [now, setNow] = useState(0);
  const [max, setMax] = useState(0);

  const doConvert = async (file) => {
    if (!await isHeic(file)) {
      throw new Error(`${file.name} is not a real HEIC image - it may have been renamed from another format.`);
    }
    try {
      return await heicTo({ blob: file, type: "image/jpeg", quality: 0.9 });
    } catch (err) {
      // heic-to rejects with strings from its worker, not Error objects
      throw new Error(`Could not convert ${file.name}: ${String(err).replace(/^Error: /, "")}`);
    }
  };

  const zipAndDownload = async (files) => {
    const zipStream = new zip.ZipWriterStream({ zip64: true, bufferedWrite: true });
    const fileStream = streamSaver.createWriteStream("Converted JPGs.zip");
    const aborter = new AbortController();
    const pipePromise = zipStream.readable.pipeTo(fileStream, { signal: aborter.signal });
    try {
      for (let index = 0; index < files.length; index++) {
        const file = files[index];
        const jpg = await doConvert(file);
        await jpg.stream().pipeTo(zipStream.writable(file.name.replace(HEIC_EXT, ".jpg")));
        setNow(index + 1);
      }
      await zipStream.close();
      await pipePromise;
    } catch (err) {
      aborter.abort();
      await pipePromise.catch(() => {});
      throw err;
    }
  };

  const handleFiles = async (_files) => {
    const files = Array.from(_files).filter((f) => HEIC_EXT.test(f.name));
    if (files.length === 0) {
      toast.error("None of the selected files are HEIC images (.heic/.heif).");
      return;
    }
    setNow(0);
    setMax(files.length);

    try {
      if (files.length === 1) {
        downloadBlob(await doConvert(files[0]), files[0].name.replace(HEIC_EXT, ".jpg"));
        setNow(1);
      } else {
        await zipAndDownload(files);
      }
    } catch (err) {
      setMax(0);
      toast.error(err.message);
    }
  };

  return (
    <div className="mx-auto max-w-sm">
      <FileUpload onFiles={handleFiles} buttonText="Convert" showProgress={max !== 0} accept=".heic,.heif" progressElement={<Progress autoFinish now={now} max={max} />} />
    </div>
  );
}
