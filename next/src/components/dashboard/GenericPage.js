"use client"

import DashH2 from "./DashH2"

export default function GenericPage({ title, children, side }) {
    return (
        <div>
            <div className="flex justify-between items-center">
                <DashH2>{title}</DashH2>
                <div>
                    {side}
                </div>
            </div>
            {children}
        </div>
    )
}