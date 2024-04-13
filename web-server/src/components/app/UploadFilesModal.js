import { Modal } from "react-bootstrap";
import UploadOrReceiveArea from "../UploadOrReceiveArea";
import { useEffect, useState } from "react";


export default function UploadFilesModal({ show, onDone, onCancel }) {
    const [files, setFiles] = useState([])

    const onFilesSelected = (newFiles) => {
        console.log(newFiles)
        setFiles([...files, ...newFiles])
    }

    const removeFile = (file) => {
        setFiles(files.filter(f => f != file))
    }

    useEffect(() => {
        if(show) {
            setFiles([])
        }
    }, [show])

    const FileScrollerEntry = ({ file }) => {
        return (
            <div className="d-flex flex-row bg-dark-subtle flex-shrink-0">
                <div className="border-start border-top border-bottom rounded-start p-2 pe-1">
                    {file.name}
                </div>
                <div className="border-end  border-top border-bottom rounded-end p-2 ps-1">
                    <a className="link-danger" href="#" onClick={() => removeFile(file)}><i className="bi bi-x-lg m-auto"></i></a>
                </div>
            </div>
        )
    }

    return (
        <>
            <Modal show={show} backdrop="static" centered onHide={onCancel}>
                <Modal.Header closeButton>
                    <Modal.Title>Add files</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="d-flex flex-row gap-1 overflow-x-scroll">
                        { files.map(f => {
                            return <FileScrollerEntry key={f.name + f.lastmodified + f.size + f.type} file={f}/>
                        }) }
                    </div>
                    <div className="d-flex" style={{ minHeight: "200px" }}>
                        <UploadOrReceiveArea title={"Pick files"} subtitle={"Or drag files here"}
                            allowReceive={false} onFilesSelected={onFilesSelected}
                        />
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <button onClick={() => onDone(files)} className="btn btn-primary">Done</button>
                </Modal.Footer>
            </Modal>
        </>
    )
}