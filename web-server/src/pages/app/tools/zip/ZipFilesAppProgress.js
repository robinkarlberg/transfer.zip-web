import { useEffect, useMemo, useState } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import * as zip from "@zip.js/zip.js";

import streamSaver from "../../../../lib/StreamSaver"
import { ProgressBar } from "react-bootstrap";
import { humanFileSize, readFileTillEnd } from "../../../../utils";
streamSaver.mitm = "/mitm.html"

export default function ZipFilesAppProgress({ }) {
    const navigate = useNavigate()
    const location = useLocation()
    const { state } = location

    const stateFiles = state?.files

    const [progressBytes, setProgressBytes] = useState(0)
    const [progressZipBytes, setProgressZipBytes] = useState(0)
    const maxBytes = useMemo(() => stateFiles && stateFiles.reduce((sum, file) => sum + file.size, 0), [stateFiles])

    const start = async () => {
        const files = stateFiles.map(x => { return x })
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

        let _fileIndex = 0

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

        navigate("/app/zip-files/finished", { replace: true, state: { currentBytes, currentZipBytes } });
    }

    useEffect(() => {
        if (state) start()
    }, [])

    if (!state) {
        return <Navigate to={"/app/zip-files"} />
    }

    const spinner = (
        <div class="spinner-border spinner-border-sm me-2 fs-6" role="status">
            <span class="visually-hidden">Realtime...</span>
        </div>
    )

    const progressHumanBytes = humanFileSize(progressBytes, true)
    const progressHumanZipBytes = humanFileSize(progressZipBytes, true)

    return (
        <div style={{ minWidth: "300px" }}>
            <h2>{spinner} Zipping {stateFiles.length} {stateFiles.length == 1 ? "file" : "files"}...</h2>

            <div className="p-2 bg-secondary-subtle border rounded-4 mb-5" style={{ maxWidth: "" }}>
                <div className="pb-2 d-flex justify-content-between">
                    <div><i className="bi bi-file-earmark-zip-fill me-1 fs-5"></i><span className="fs-6">Archive.zip</span></div>
                    <div className="text-secondary"><small>{progressHumanBytes} <i className="bi bi-arrow-right-short"></i> {progressHumanZipBytes}</small></div>
                </div>
                <ProgressBar style={{ height: "10px" }} now={(progressBytes / maxBytes) * 100} animated={true} />
            </div>
        </div>
    )
}