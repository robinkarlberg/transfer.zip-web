import logoSmall from "../../img/transfer-zip-logo-transparent.png"

export default function Header({ className }) {
    return (
        <div className={"bg-body-tertiary border-bottom d-flex flex-row " + className} style={{ minHeight: "69px" }}>
            <img className="ms-2" src={logoSmall} width={"70px"}></img>
            <div className="p-2">

            </div>
        </div>
    )
}