import ToolGenericSitePage from "../../../components/site/tools/ToolGenericSitePage"
import UnzipFilesOnlineFilePicker from "../../../components/site/tools/UnzipFilesOnlineFilePicker"
import { Link } from "react-router-dom"

export default function UnzipFilesSitePage({ }) {

    return (
        <ToolGenericSitePage
            title={"Unzip Files Online"}
            display={<span><span className="text-primary">Easily</span> open your zip files online.</span>}
            tags={["Pick archive and view it online", "Share your files afterwards", "Fast, free and secure"]}
            subtitle={<span><span className="fw-bold">Unzip your files,</span> <span className="text-primary">save disk space</span> without downloading</span>}
            description={"Effortlessly decompress and view even the largest zip files with our online tool. Simply upload a zip file from your computer, and it will be unpacked instantly, allowing you to view its contents. You can also choose to download or share individual files for free if needed."}
            question={"How to unzip zip file"}
            steps={[
                { step: 1, icon: "bi-file-earmark-plus-fill", text: "Pick your zip file" },
                { step: 2, icon: "bi-hourglass-split", text: "Unzip and wait" },
                { step: 3, icon: "bi-cloud-arrow-down-fill", text: <span>View, download or <Link to={"/"}>share files</Link></span> },
            ]}
            related={[
                { to: "/tools/zip-files-online", title: "Zip Files Online" },
                // { to: "/tools/send-zip-file", title: "Send Zip File" }
            ]}
            >
            <div className="bg-body-tertiary shadow-lg rounded-4">
                <UnzipFilesOnlineFilePicker />
            </div>
        </ToolGenericSitePage>

    )
}