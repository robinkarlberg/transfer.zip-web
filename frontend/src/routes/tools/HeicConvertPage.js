import { useState } from "react"
import { downloadBlob, isSelfHosted } from "../../utils"
import GenericToolPage from "../../components/GenericToolPage"
import FileBrowser from "../../components/elements/FileBrowser"
import FileUpload from "../../components/elements/FileUpload"
import RelatedLinks from "../../components/RelatedLinks"
import MultiStepAction from "../../components/MultiStepAction"
import Link from 'next/link'
import * as zip from "@zip.js/zip.js";
import streamSaver from "../../lib/StreamSaver"

// import * as convert from "heic-convert/browser"
import Progress from "../../components/elements/Progress"

export default function HeicConvertPage({ }) {

  const [now, setNow] = useState(0)
  const [max, setMax] = useState(0)

  const doConvert = async file => {
    const buffer = await file.bytes()

    const outputBuffer = await (async () => {
      const { default: convert } = await import("heic-convert/browser");
      return convert({
        buffer,
        format: "JPEG",
        quality: 0.9
      });
    })();

    return outputBuffer
  }

  const handleFiles = async _files => {
    if (_files.length == 0) return

    const files = Array.from(_files).filter(file => /\.heic$/i.test(file.name));
    if (files.length === 0) {
      return;
    }
    setMax(files.length);

    if (files.length == 1) {
      const newFileName = files[0].name.replace(/\.heic$/i, ".jpg");
      downloadBlob(new Blob([await doConvert(files[0])]), newFileName);
      setNow(1);
    }
    else {
      // Zip the files
      const zipStream = new zip.ZipWriterStream({ zip64: true, bufferedWrite: true })
      const fileStream = streamSaver.createWriteStream("Converted JPGs.zip")

      zipStream.readable.pipeTo(fileStream)

      for (let index = 0; index < files.length; index++) {
        let file = files[index];
        const outputBuffer = await doConvert(file)

        let zipWriter = zipStream.writable(file.name.replace(/\.heic$/i, ".jpg")).getWriter()
        zipWriter.write(outputBuffer)
        zipWriter.close()
        setNow(index + 1);
      }

      await zipStream.close()
    }
  }

  return (
    <div>
      <GenericToolPage
        title={"HEIC to JPG/PNG Converter"}
        display={<span><span className="text-primary">Convert HEIC</span> to JPG online</span>}
        subtitle={"Easily convert your HEIC files to JPG format with our online tool. Your photos remain completely private - even from us."}
      >

        <div className="mx-auto max-w-sm">
          <FileUpload onFiles={handleFiles} buttonText={"Convert"} showProgress={max != 0} accept={".heic"} progressElement={<Progress now={now} max={max} />} />
        </div>
      </GenericToolPage>
      <div className="mx-auto max-w-7xl px-6 lg:px-8 mb-16">
        {/* <Transition show={!!richFiles}>
          <div>
            <h3 className="text-2xl font-bold mb-4">{zipFile?.name}</h3>
          </div>
        </Transition> */}
        {/* <EmptySpace title={`Select a ZIP file to get started`} subtitle={`Your files will be displayed here, allowing you to browse the archive.`} /> */}

        {!isSelfHosted() && (
          <>
            <div className="mt-16">
              <h2 className="inline-block text-2xl mb-4 font-bold">How does it work?</h2>
              <p className="text-lg mb-2">
                Simply choose the HEIC files from your computer, and they will be converted instantly.
              </p>
              <p className="text-lg mb-2">
                You can then choose to share individual photos for free if needed.
              </p>
              <p className="text-lg mb-2">
                <b>Your files never leave your computer</b> - everything is processed in your browser only.
              </p>
              <p className="text-lg mb-2">
                Want to check for yourself? <a className="text-primary hover:underline" href="https://github.com/robinkarlberg/transfer.zip-web">Check the code on GitHub &rarr;</a>
              </p>
            </div>
            <div className="mt-16">
              <h2 className="inline-block text-2xl mb-4 font-bold">How do I use the tool?</h2>
              <span className="ms-2 text-gray-500">3 steps</span>

              <MultiStepAction steps={[
                { step: 1, icon: "hand-index", text: "Pick your HEIC files" },
                { step: 2, icon: "hourglass-split", text: "Click 'Convert' and wait" },
                { step: 3, icon: "cloud-arrow-down-fill", text: <span>Download or <Link className="text-primary hover:underline" to={"/quick-share"}>share files</Link></span> },
              ]} />
            </div>
          </>
        )}
        <div className="mt-16">
          <RelatedLinks links={[
            { to: "/tools/zip-files-online", title: "Zip Files Online" },
            { to: "/tools/unzip-files-online", title: "Unzip Files Online" }
          ]} />
        </div>
      </div>
    </div >
  )
}