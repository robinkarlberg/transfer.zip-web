"use client"

import DashH2 from "./DashH2"

export default function GenericPage({ title, children, side }) {
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <div className="fade-in-up-fast">
                    <DashH2>{title}</DashH2>
                </div>
                <div className="fade-in-up-slow">
                    {side}
                </div>
            </div>
            <div className="fade-in-up">
                {children}
            </div>
        </div>
    )
}