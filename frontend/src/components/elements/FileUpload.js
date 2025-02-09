import { useMemo, useRef, useState } from "react"
import BIcon from "../BIcon"
import { Link } from "react-router-dom"
import { Transition } from "@headlessui/react"
import { humanFileSize, humanFileType } from "../../transferUtils"
import { humanFileName } from "../../utils"
import Progress from "./Progress"

export default function FileUpload({ onFiles, onReceiveClicked, progressElement, showProgress }) {

  const [files, setFiles] = useState([])

  const fileInputRef = useRef()
  const folderInputRef = useRef()

  const handleFileInputChange = (e) => {
    console.log(e)
    setFiles([...files, ...e.target.files])
  }

  const handlePickFiles = e => {
    e.preventDefault()
    e.stopPropagation()
    fileInputRef.current.click()
  }

  const handleSelectFolder = e => {
    e.preventDefault()
    e.stopPropagation()
    folderInputRef.current.click()
  }

  const totalFileSize = useMemo(() => {
    return files.reduce((total, file) => total + file.size, 0);
  }, [files]);

  const removeFile = file => {
    setFiles(files.filter(otherFile => otherFile !== file))
  }

  const handleTransferClicked = e => {
    onFiles(files)
  }

  return (
    <>
      <form style={{ display: "none" }}>
        <input ref={fileInputRef} onChange={handleFileInputChange} type="file" aria-hidden="true" multiple></input>
        <input ref={folderInputRef} onChange={handleFileInputChange} type="file" aria-hidden="true" webkitdirectory="true"></input>
      </form>
      <div className={`overflow-clip text-start relative w-full rounded-2xl bg-white border shadow-lg flex flex-col min-h-56 ${onReceiveClicked ? "mt-8" : ""}`}>
        {onReceiveClicked && (
          <div className="absolute w-full flex">
            <button onClick={onReceiveClicked} className="text-sm font-medium text-gray-500 relative mx-auto bg-white border py-1 px-10 rounded-t-lg transition-all h-7 -top-7 hover:h-8 hover:-top-8 hover:text-primary">
              <BIcon name={"file-earmark-arrow-down"} /> Receive files
            </button>
          </div>
        )}
        <Transition show={files.length == 0}>
          <button onClick={handlePickFiles} className="absolute left-0 top-0 w-full h-full flex flex-col justify-center items-center group transition data-[closed]:opacity-0">
            <div className="text-white rounded-full bg-primary w-12 h-12 flex group-hover:bg-primary-light">
              <BIcon name={"plus"} center className={"flex-grow text-3xl"} />
            </div>
            <span className="font-medium mt-2 text-lg">Pick files</span>
            <Link onClick={handleSelectFolder} className="text-gray-500 text-sm font-medium mt-2 underline hover:text-primary">
              or select a folder
            </Link>
          </button>
        </Transition>
        <Transition show={files.length > 0}>
          <div className="grow flex flex-col p-4 transition data-[closed]:opacity-0 gap-4">
            <div className="grow max-h-56 overflow-auto">
              {files.map((file) => {
                return (
                  <div className="relative px-2 py-1 overflow-hidden text-md group" key={file.name + file.size + file.lastModified}>
                    <div className="absolute right-0 hidden group-hover:block pe-2">
                      <button onClick={() => removeFile(file)} className="bg-white border p-1 rounded-lg"><BIcon name={"x"} center /></button>
                    </div>
                    <p className="text-nowrap">{humanFileName(file.name)}</p>
                    <span className="text-sm text-gray-500">{humanFileSize(file.size, true)}<BIcon name={"dot"} />{humanFileType(file.type)}</span>
                  </div>
                )
              })}
            </div>
            <div className="w-full flex justify-between">
              <div className="flex gap-2">
                <button className="text-sm pe-3 px-2 rounded-lg border shadow hover:bg-gray-100" onClick={handlePickFiles}><BIcon name={"plus"} /> Files</button>
                <button className="text-sm px-2 rounded-lg border shadow hover:bg-gray-100" onClick={handleSelectFolder}><BIcon name={"folder-plus"} /> Folder</button>
              </div>
              <div>
                <span className="text-gray-500 text-sm me-2 hidden sm:inline">{humanFileSize(totalFileSize, true)}</span>
                <button onClick={handleTransferClicked} className="text-white px-2 py-1 rounded-lg shadow bg-primary hover:bg-primary-light">Transfer &rarr;</button>
              </div>
            </div>
          </div>
        </Transition>
        <Transition show={showProgress || false}>
          <div className="bg-white absolute left-0 top-0 w-full h-full p-8 flex flex-row justify-center items-center group transition data-[closed]:opacity-0">
            <div className="relative w-full h-full max-w-52 max-h-52">
              {progressElement}
            </div>
          </div>
        </Transition>
      </div>
    </>
  )
}