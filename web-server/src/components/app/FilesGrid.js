import { Link } from "react-router-dom"
import { humanFileSize } from "../../utils";
import { forwardRef, useContext } from "react";
import { Dropdown } from "react-bootstrap";

import * as Api from "../../api/Api"
import { ApplicationContext } from "../../providers/ApplicationProvider";

export default function FilesList({ files, onFileChange, onAction, allowedActions }) {
    const { refreshApiTransfers } = useContext(ApplicationContext)

    const CustomToggle = forwardRef(({ children, onClick }, ref) => (
        <button className="btn" ref={ref} onClick={(e) => { e.preventDefault(); onClick(e) }}>
            <i className="bi bi-three-dots-vertical"></i>
        </button>
    ))

    const onDeleteFile = async (file) => {
        await Api.deleteTransferFile(file.transferId, file.id)
        await refreshApiTransfers()
        onFileChange()
    }

    // <Dropdown>
    //     <Dropdown.Toggle as={CustomToggle} />

    //     <Dropdown.Menu className="text-small shadow">
    //         {allowedActions?.rename && <Dropdown.Item onClick={() => { onAction("rename", file) }}>Rename</Dropdown.Item>}
    //         {allowedActions?.preview && <Dropdown.Item onClick={() => { onAction("preview", file) }}>Preview</Dropdown.Item>}
    //         {allowedActions?.download && <Dropdown.Item onClick={() => { onAction("download", file) }}>Download</Dropdown.Item>}
    //         <Dropdown.Divider></Dropdown.Divider>
    //         <Dropdown.Item className="text-danger" onClick={() => onDeleteFile(file)}>
    //             Remove
    //         </Dropdown.Item>
    //     </Dropdown.Menu>
    // </Dropdown>

    const FilesGridEntry = ({ file }) => {
        return (
            <div>

            </div>
        )
    }
    // console.log(files)
    return (
        <div className="FilesGrid">
            <div className="d-flex flex-row flex-wrap">
                {files.map(f => {
                    return <FilesGridEntry key={f.id} file={f} />
                })}
            </div>
        </div>
    )
}