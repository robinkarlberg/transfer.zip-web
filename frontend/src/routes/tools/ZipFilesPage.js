import Link from 'next/link';
import FileUpload from "../../components/elements/FileUpload";
import GenericToolPage from "../../components/GenericToolPage";
import TestimonialCloud from "../../components/TestimonialCloud";
import FileBrowser from "../../components/elements/FileBrowser";
import { useEffect, useMemo, useState } from "react";
import * as zip from "@zip.js/zip.js";
import { Transition } from "@headlessui/react";
import streamSaver from "../../lib/StreamSaver"
import EmptySpace from "../../components/elements/EmptySpace";
import Progress from "../../components/elements/Progress";
import RelatedLinks from "../../components/RelatedLinks";
import { isSelfHosted, readFileTillEnd } from "../../utils";
import MultiStepAction from "../../components/MultiStepAction";

export default function ZipFilesPage({ }) {
  const [files, setFiles] = useState(null)

  const maxBytes = useMemo(() => files && files.reduce((sum, file) => sum + file.size, 0), [files])

  const [progressBytes, setProgressBytes] = useState(0)
  const [progressZipBytes, setProgressZipBytes] = useState(0)

  const doZip = async () => {
    let currentBytes = 0
    let currentZipBytes = 0
    const zipStream = new zip.ZipWriterStream({ zip64: true, bufferedWrite: true })

    const fileStream = streamSaver.createWriteStream("archive.zip")
    const fileStreamWriter = fileStream.getWriter()

    const trackingStream = new WritableStream({
      write(chunk, controller) {
        currentZipBytes += chunk.byteLength;
        setProgressZipBytes(currentZipBytes)
        // Pass the chunk to the original file stream
        return fileStreamWriter.write(chunk);
      },
      close() {
        return fileStreamWriter.close();
      },
      abort(reason) {
        return fileStreamWriter.abort(reason);
      }
    })

    zipStream.readable.pipeTo(trackingStream)

    for (let file of files) {
      let zipWriter = zipStream.writable(file.webkitRelativePath || file.name).getWriter()
      await readFileTillEnd(file, async data => {
        await zipWriter.write(data)
        currentBytes += data.byteLength
        setProgressBytes(currentBytes)
      })
      zipWriter.close()
    }

    await zipStream.close()
  }

  const handleFiles = async files => {
    if (files.length == 0) return

    setFiles(files)
  }

  useEffect(() => {
    if (files) {
      doZip().then(() => {
        // zip finished
      })
    }
  }, [files])

  return (
    <div>
      <GenericToolPage
        title={"Zip Files Online"}
        display={<span><span className="text-primary">Easily</span> create zip files online.</span>}
        subtitle={"Effortlessly compress even the biggest files with this online file and folder zip tool. You can also choose to share the zip file for free afterwards, if you need to."}
      >
        <div className="mx-auto max-w-sm">
          <FileUpload onFiles={handleFiles} buttonText={"Zip"} showProgress={!!maxBytes} progressElement={<Progress max={maxBytes} now={progressBytes} />} />
        </div>
      </GenericToolPage>
      <div className="mx-auto max-w-7xl px-6 lg:px-8 mb-16">
        {!isSelfHosted() && (
          <>
            <div className="mt-16">
              <h2 className="inline-block text-2xl mb-4 font-bold">How does it work?</h2>
              <p className="text-lg mb-2">
                Simply pick files and folder from your computer, and they will be compressed instantly into one zip file.
              </p>
              <p className="text-lg mb-2">
                You can then choose to download or share the newly created zip file for free if needed.
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
                { step: 1, icon: "hand-index", text: "Pick your files or select a folder" },
                { step: 2, icon: "hourglass-split", text: "Click 'Zip' and wait" },
                { step: 3, icon: "cloud-arrow-down-fill", text: <span>Download or <Link className="text-primary hover:underline" to={"/quick-share"}>share your zip file</Link></span> },
              ]} />
            </div>
          </>
        )}
        <div className="mt-16">
          <RelatedLinks links={[
            { to: "/tools/unzip-files-online", title: "Unzip Files Online" },
            { to: "/tools/heic-convert", title: "Convert HEIC to JPG" }
          ]} />
        </div>
      </div>
    </div >
  )
}