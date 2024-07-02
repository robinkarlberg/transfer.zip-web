

export default function GraphCard({ title, children }) {
    return (
        <div className="bg-body p-3 pb-3 border rounded-4 flex-grow-1 flex-md-grow-0" style={{ maxWidth: "800px", width: "100%" }}>
            <h5>{title}</h5>
            {/* <div className="p-2 pe-3">
                <h1>{stat}</h1>
                <h6 className="text-body-secondary">{subtitle}</h6>
            </div> */}
            <div className="ps-2">
                {children}
            </div>
        </div>
    )
}