import { Outlet } from "react-router-dom"

export default function MaxWidthContainer({ children, maxWidth, className, id }) {
    const _maxWidth = maxWidth ? maxWidth : "1337px"
    
    return (
        <div className={"d-flex justify-content-center " + className} id={id}>
            <div className="flex-grow-1" style={{ maxWidth: _maxWidth }}>
                { children }
            </div>
        </div>
    )
}