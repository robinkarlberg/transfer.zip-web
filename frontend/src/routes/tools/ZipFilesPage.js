import { Link } from "react-router-dom";
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

const readFileTillEnd = async (file, cbData) => {
  return new Promise((resolve, reject) => {
    let offset = 0

    const readSlice = async o => {
      const fileSliceBuffer = await file.slice(offset, o + 16384 * 10).arrayBuffer()

      cbData(new Uint8Array(fileSliceBuffer))
      offset += fileSliceBuffer.byteLength;

      if (offset < file.size) {
        readSlice(offset);
      }
      else {
        resolve()
      }
    };
    readSlice(0)
  })
}

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
        subtitle={"Effortlessly compress even the biggest files with our online file and folder zip tool. You can also choose to share the zip file for free afterwards, if you need to."}
        description={"Effortlessly decompress and view even the largest zip files with our online tool. Simply upload a zip file from your computer, and it will be unpacked instantly, allowing you to view its contents. You can also choose to download or share individual files for free if needed."}
        question={"How to unzip zip file"}
        steps={[
          { step: 1, icon: "bi-file-earmark-plus-fill", text: "Pick your zip file" },
          { step: 2, icon: "bi-hourglass-split", text: "Unzip and wait" },
          { step: 3, icon: "bi-cloud-arrow-down-fill", text: <span>View, download or <Link to={"/"}>share files</Link></span> },
        ]}
      >

        <div className="mx-auto max-w-sm">
          <FileUpload onFiles={handleFiles} buttonText={"Zip"} showProgress={!!maxBytes} progressElement={<Progress max={maxBytes} now={progressBytes} />} />
        </div>
      </GenericToolPage>
      <div className="mx-auto max-w-7xl px-6 lg:px-8 mb-16">
        <div>
          <RelatedLinks links={[
            { to: "/tools/unzip-files-online", title: "Unzip Files Online" },
            // { to: "/tools/send-zip-file", title: "Send Zip File" }
          ]} />
        </div>
      </div>
    </div >
  )
}