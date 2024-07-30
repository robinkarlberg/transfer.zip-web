import ZipFileOnlineFilePicker from "../../../components/site/tools/ZipFileOnlineFilePicker"
import ToolGenericSitePage from "../../../components/site/tools/ToolGenericSitePage"
import { Link } from "react-router-dom"
import UnzipFileOnlineFilePicker from "../../../components/site/tools/UnzipFileOnlineFilePicker"

export default function UnzipFilesSitePage({ }) {

    return (
        <ToolGenericSitePage
            title={"Unzip Files Online"}
            display={<span><span className="text-primary">Easily</span> open your zip files online.</span>}
            tags={["Pick archive and view in browser", "Share the files afterwards", "Fast and free"]}
            subtitle={<span><span className="fw-bold">Decompress your zip file,</span> <span className="text-primary">save disk space</span> without downloading</span>}
            description={"Effortlessly compress even the biggest files with our online file and folder zip tool. You can pick a whole folder and multiple files from your computer, and they will be converted into a zip archive, ready to download instantly. You can also choose to share the zip file for free if you need to."}
            question={"How to unzip zip file"}
            steps={[
                { step: 1, icon: "bi-file-earmark-plus-fill", text: "Pick your zip file" },
                { step: 2, icon: "bi-hourglass-split", text: "Unzip and wait" },
                { step: 3, icon: "bi-cloud-arrow-down-fill", text: <span>View, download or <Link to={"/"}>share files</Link></span> },
            ]}
            >
            <div className="bg-body-tertiary shadow-lg rounded-4">
                <UnzipFileOnlineFilePicker />
            </div>
        </ToolGenericSitePage>

    )
}