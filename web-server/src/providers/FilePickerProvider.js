// https://stackoverflow.com/questions/75652431/how-should-the-createbrowserrouter-and-routerprovider-be-use-with-application-co

import { createContext, useCallback, useEffect, useRef, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

export const FilePickerContext = createContext({})

export const FilePickerProvider = () => {

    let onFileInputChangeFn = undefined
    let onFileInputChange = (e) => {
        onFileInputChangeFn && onFileInputChangeFn(e)
    }
    const fileInputRef = useRef()
    const folderInputRef = useRef()
    const setOnFileInputChange = (fn) => {
        onFileInputChangeFn = fn
    }

    return (
        <FilePickerContext.Provider value={{
            setOnFileInputChange,
            fileInputRef,
            folderInputRef,
        }}>
            <Outlet />
            <form style={{ display: "none" }}>
                <input ref={fileInputRef} onChange={onFileInputChange} type="file" aria-hidden="true" multiple></input>
                <input ref={folderInputRef} onChange={onFileInputChange} type="file" aria-hidden="true" webkitdirectory="true"></input>
            </form>
        </FilePickerContext.Provider>
    )
}