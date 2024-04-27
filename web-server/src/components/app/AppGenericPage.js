export default function AppGenericPage({ className, title, titleElement, children }) {
    return (
        <div className={"text-body px-4 w-100  " + className}>
            <div className="mx-0 m-4" style={{ height: "29.5px" }}>
                { titleElement || <h4 >{title}</h4> }
            </div>
            <hr></hr>
            {children}
        </div>
    )
}