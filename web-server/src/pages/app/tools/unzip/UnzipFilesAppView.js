import { useEffect, useMemo, useState } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import * as zip from "@zip.js/zip.js";

import streamSaver from "../../../../lib/StreamSaver"
import { ProgressBar } from "react-bootstrap";
import { humanFileSize, readFileTillEnd } from "../../../../utils";
import FilesList from "../../../../components/app/FilesList";
import StatCard from "../../../../components/app/StatCard";
streamSaver.mitm = "/mitm.html"

export default function UnzipFilesAppView({ }) {
    const navigate = useNavigate()
    const location = useLocation()
    const { state } = location

    const zipFiles = state?.files

    const [files, setFiles] = useState(null)

    const start = async () => {
        const _files = []

        const onEntry = (entry) => {
            const split = entry.filename.split("/")

            if (!entry.directory) _files.push({ info: { name: split[split.length - 1], size: entry.uncompressedSize, relativePath: entry.filename, type: "application/octet-stream" }, entry })
            
        }

        if (window.streamSaverUseFallback) {
            const entries = await (new zip.ZipReader(new zip.BlobReader(zipFiles[0]))).getEntries()
            for (const entry of entries) {
                onEntry(entry)
            }
        }
        else {
            const fileStream = zipFiles[0].stream()
            for await (const entry of (fileStream.pipeThrough(new zip.ZipReaderStream()))) {
                onEntry(entry)
            }
        }

        setFiles(_files)
    }

    const onFilesListAction = async (action, file) => {
        if (action == "download" || action == "click") {
            const fileStream = streamSaver.createWriteStream(file.info.name, {
                size: file.info.size
            })
            const tee = file.entry.readable.tee()
            file.entry.readable = tee[0]
            tee[1].pipeTo(fileStream)
        }
    }

    useEffect(() => {
        if (state) start()
    }, [])

    if (!state) {
        return <Navigate to={"/app/zip-files"} />
    }

    if (!files) {
        return (
            <div>
                <div className="spinner-border spinner-border-sm me-2 fs-6" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        )
    }

    return (
        <div>
            <h2 className="mb-3">{zipFiles[0].name}</h2>
            <div className="d-flex flex-row flex-wrap gap-3 mb-3">
                <StatCard title={"Compressed Size"} stat={humanFileSize(zipFiles[0].size, true)} ignoreUser={true} />
                <StatCard title={"Files"} stat={files.length} ignoreUser={true} />
            </div>
            <FilesList files={files} onAction={onFilesListAction} primaryActions={["download"]} ignoreType={true} maxWidth={1100} useLocationHash={true} />
        </div>
    )
}