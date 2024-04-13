

export default function StatCard({ title, stat, subtitle, children }) {
    return (
        <div className="bg-body rounded p-3 pb-3 border flex-grow-1 flex-md-grow-0" style={{ minWidth: "180px" }}>
            <h5>{title}</h5>
            <div className="p-2 pe-3">
                <h1>{stat}</h1>
                <h6 className="text-body-secondary">{subtitle}</h6>
            </div>
            <div className="ps-2">
                {children}
            </div>
        </div>
    )
}