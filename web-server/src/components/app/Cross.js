import "./AnimatedSvg.css"

export default function Cross({ className }) {
    return (
        <svg className={"checkmark " + className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
            <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none" />
            <path className="checkmark__check" fill="none" d="M16 16 L36 36 M36 16 L16 36" />
        </svg>
    )
}