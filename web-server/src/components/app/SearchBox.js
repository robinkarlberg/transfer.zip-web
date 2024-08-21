import { useRef, useState } from "react"
import { search } from "../../api/Api"
import { humanFileSize } from "../../utils"
import { useNavigate } from "react-router-dom"

export default function SearchBox({ }) {
    const inputRef = useRef(null)

    const navigate = useNavigate()

    const [transferResults, setTransferResults] = useState([])
    const [fileResults, setFileResults] = useState([])
    const [showBody, setShowBody] = useState(false)

    const doSearch = async () => {
        if (!inputRef.current.value) return
        const res = await search(inputRef.current.value)
        const { transfers, files } = res.search
        setTransferResults(transfers)
        setFileResults(files)
        console.log(transfers, files)
    }

    const onInputChange = async e => {
        doSearch()
    }

    const onInputFocus = async e => {
        setShowBody(true)
        doSearch()
    }

    const onInputBlur = async e => {
        setTimeout(() => {
            setShowBody(false)
            setTransferResults([])
            setFileResults([])
        }, 100)
    }

    const Result = ({ result, type }) => {
        const onClick = () => {
            if (type == "transfer") {
                navigate("/app/transfers/" + result._id)
            }
            else if (type == "file") {
                navigate("/app/transfers/" + result.transfer)
            }
        }

        return (
            <div onClick={onClick} className="HoverButtonTertiary mx-2 px-2 py-1 rounded-4 btn text-start d-block m-0">
                <div className="fw-medium">
                    {type == "transfer" ?
                        <span>
                            {result.name || result.id}
                        </span>
                        :
                        <span>
                            {result.info.name}
                        </span>
                    }
                </div>
                <div className="text-body-tertiary">
                    <small>
                        {type == "transfer" ?
                            <span>
                                Transfer<i className="bi bi-dot"></i>{result.files.length} files
                            </span>
                            :
                            <span>
                                File<i className="bi bi-dot"></i>{humanFileSize(result.info.size, true)}
                            </span>
                        }
                    </small>
                </div>

            </div>
        )
    }

    return (
        <div onFocus={onInputFocus} className="position-relative w-100" style={{ maxWidth: "450px" }}>
            <input ref={inputRef}
                onChange={onInputChange} onBlur={onInputBlur}
                className="text-body-secondary focus-ring border-0 bg-body-secondary rounded-2 px-2 py-1 w-100"
                type="text" placeholder="Search Storage" />
            {showBody && (
                <div className="position-absolute top-100 w-100 bg-body rounded-bottom-3 overflow-hidden border border-top-0 z-1 overflow-y-scroll pb-2"
                    style={{ maxHeight: "60vh" }}>
                    {transferResults.length > 0 &&
                        <span className="d-block p-2 fw-bold">Transfers<small className="ms-2 bg-body-secondary text-body-tertiary rounded-2 px-1">{transferResults.length}</small></span>
                    }
                    <div>
                        {transferResults.map(result => <Result key={result.id} result={result} type="transfer" />)}
                    </div>
                    {fileResults.length > 0 &&
                        <span className="d-block p-2 fw-bold">Files<small className="ms-2 bg-body-secondary text-body-tertiary rounded-2 px-1">{fileResults.length}</small></span>
                    }
                    <div>
                        {fileResults.map(result => <Result key={result.id} result={result} type="file" />)}
                    </div>
                </div>
            )}
        </div>
    )
}