import { Link, useLocation, useNavigate } from "react-router-dom"
import { getFileExtension, getFileIconFromExtension, humanFileSize, removeLastEntry } from "../../utils";
import { forwardRef, useContext, useEffect, useMemo, useState } from "react";
import { Dropdown } from "react-bootstrap";

import * as Api from "../../api/Api"
import { ApplicationContext } from "../../providers/ApplicationProvider";

export default function FilesList({ files, onAction, primaryActions, redActions, maxWidth, ignoreType, useLocationHash }) {
    const navigate = useNavigate()
    const { refreshApiTransfers } = useContext(ApplicationContext)
    const { hash, state } = useLocation()

    const [selectedPath, _setSelectedPath] = useState(useLocationHash ? decodeURIComponent(hash.slice(1)) : "")

    const setSelectedPath = (_selectedPath) => {
        if (useLocationHash) {
            navigate("#" + _selectedPath, { state })
        }
        else {
            _setSelectedPath(_selectedPath)
        }
    }

    useEffect(() => {
        if (useLocationHash) {
            _setSelectedPath(decodeURIComponent(hash.slice(1)))
        }
    }, [hash])

    const CustomToggle = forwardRef(({ children, onClick }, ref) => (
        <button className="btn" ref={ref} onClick={(e) => { e.preventDefault(); onClick(e) }}>
            <i className="bi bi-three-dots-vertical"></i>
        </button>
    ))

    const prettify = (str) => {
        return str[0].toUpperCase() + str.slice(1)
    }

    function buildNestedStructure(files) {
        if (!files) return null

        const root = { directories: [], files: [] };

        files.forEach(file => {
            const parts = (file.info.relativePath || file.info.name).split('/');
            let current = root;

            parts.forEach((part, index) => {
                if (index === parts.length - 1) {
                    // This is a file, add it to the current directory's files array
                    current.files.push(file);
                } else {
                    // This is a directory
                    let dir = current.directories.find(d => d.name === part + "/");
                    if (!dir) {
                        // If the directory does not exist, create it
                        dir = { name: part + "/", directories: [], files: [] };
                        current.directories.push(dir);
                    }
                    current = dir; // Move to the found or created directory
                }
            });
        });

        return root;
    }

    const nestedStructure = useMemo(() => buildNestedStructure(files), [files])

    const GoUpFileListEntry = () => {
        return (
            <tr>
                <td scope="row" style={{ padding: 0 }}>
                    <Link className="list-group-item list-group-item-action p-2" onClick={e => {
                        e.preventDefault()
                        setSelectedPath(removeLastEntry(selectedPath))
                    }}><i className="bi bi-arrow-left-short me-1"></i></Link>
                </td>
                <td>
                </td>
                {!ignoreType && <td>
                </td>}
                <td >
                </td>
                <td>
                </td>
            </tr>
        )
    }

    const FilesListEntry = ({ file }) => {
        return (
            <tr>
                <td scope="row" style={{ padding: 0 }}>
                    <Link className="list-group-item list-group-item-action p-2" onClick={e => {
                        e.preventDefault();
                        if (file.isDirectory) {
                            setSelectedPath(selectedPath + file.info.name)
                        }
                        else onAction("click", file)
                    }}>
                        {file.isDirectory ?
                            <span><i className="bi bi-folder-fill me-1"></i> {file.info.name} <small className="ms-2 text-body-secondary">{file.info.size} files</small></span>
                            :
                            <span><i className={"bi me-1 " + getFileIconFromExtension(getFileExtension(file.info.name))}></i> <span className="text-body">{file.info.name}</span></span>
                        }
                    </Link>
                </td>
                <td>
                    {!file.isDirectory && <small>{humanFileSize(file.info.size, true)}</small>}

                </td>
                {!ignoreType && <td className="d-none d-sm-table-cell" >
                    <small>{file.info.type}</small>
                </td>}
                <td>
                    {/* <small className="text-body-secondary">Uploading...</small> */}
                </td>
                <td className="text-end" style={{ padding: 0 }}>
                    <Dropdown>
                        {(primaryActions?.length || redActions?.length) && !file.isDirectory && <Dropdown.Toggle as={CustomToggle} />}

                        <Dropdown.Menu className="text-small shadow">
                            {primaryActions?.map(action => (
                                <Dropdown.Item key={action} onClick={() => { onAction(action, file) }}>{prettify(action)}</Dropdown.Item>
                            ))}

                            {primaryActions?.length && redActions?.length && (
                                <Dropdown.Divider></Dropdown.Divider>
                            )}

                            {redActions?.length && (
                                <>
                                    {redActions.map(action => (
                                        <Dropdown.Item key={action} className="text-danger" onClick={() => { onAction(action, file) }}>
                                            {prettify(action)}
                                        </Dropdown.Item>
                                    ))}
                                </>
                            )}

                        </Dropdown.Menu>
                    </Dropdown>
                </td>
            </tr>
        )
    }

    const mapEntriesFromPath = (path) => {
        const findDirectory = (current, pathParts) => {
            if (pathParts.length === 0) {
                return current
            }
            const [nextDir, ...remainingParts] = pathParts
            const foundDir = current.directories.find(dir => dir.name === nextDir + "/")

            if (foundDir) {
                return findDirectory(foundDir, remainingParts)
            }
            return null
        };
        const pathParts = path.split('/').filter(part => part)
        const targetDirectory = findDirectory(nestedStructure, pathParts)

        const returns = []
        if (path != "" && path != "/") {
            returns.push(<GoUpFileListEntry />)
        }
        if (targetDirectory) {
            returns.push(...targetDirectory.directories.map(dir => <FilesListEntry key={dir.name} file={{ info: { name: dir.name, size: dir.files?.length + dir.directories?.length }, isDirectory: true }} />))
            returns.push(...targetDirectory.files.map(file => <FilesListEntry key={file.info.name} file={file} />))
        }
        return returns
    }

    return (
        <div className="FilesList" style={{ maxWidth: maxWidth || "unset" }}>

            <table className="table table-hover table-responsive border">
                <thead>
                    <tr>
                        <th scope="col">File Name</th>
                        <th scope="col">Size</th>
                        {!ignoreType && <th className="d-none d-sm-table-cell" scope="col">Type</th>}
                        <th scope="col"></th>
                        <th scope="col"></th>
                    </tr>
                </thead>
                <tbody>
                    {files.length == 0 && (
                        <tr>
                            <td scope="row" className="bg-dark-subtle">
                                <small>No files</small>
                            </td>
                            <td className="bg-dark-subtle">
                            </td>
                            <td className="bg-dark-subtle">
                            </td>
                            <td className="bg-dark-subtle">
                            </td>
                            <td className="bg-dark-subtle">
                            </td>
                        </tr>
                    )}
                    {mapEntriesFromPath(selectedPath)}
                </tbody>
            </table>
        </div>
    )
}