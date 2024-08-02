import ToolGenericSitePage from "../../../components/site/tools/ToolGenericSitePage"
import ZipFilesOnlineFilePicker from "../../../components/site/tools/ZipFilesOnlineFilePicker"
import { Link } from "react-router-dom"

export default function ZipFilesSitePage({ }) {

    return (
        <ToolGenericSitePage
            title={"Zip Files Online"}
            display={<span><span className="text-primary">Easily</span> create your zip files online.</span>}
            tags={["Zip your files or a whole folder", "Share the zip file afterwards", "Fast, free and secure"]}
            subtitle={<span><span className="fw-bold">Compress your files,</span> <span className="text-primary">save disk space</span> and upload faster</span>}
            description={"Effortlessly compress even the biggest files with our online file and folder zip tool. You can pick a whole folder and multiple files from your computer, and they will be converted into a zip archive, ready to download instantly. You can also choose to share the zip file for free if you need to."}
            question={"How to create zip file"}
            steps={[
                { step: 1, icon: "bi-file-earmark-plus-fill", text: "Pick your files or select a folder" },
                { step: 2, icon: "bi-hourglass-split", text: "Compress and wait" },
                { step: 3, icon: "bi-cloud-arrow-down-fill", text: <span>Download or <Link to={"/"}>share your zip file</Link></span> },
            ]}
            related={[
                { to: "/tools/unzip-files-online", title: "Unzip Files Online" }
            ]}
            >
            <div className="bg-body-tertiary shadow-lg rounded-4">
                <ZipFilesOnlineFilePicker />
            </div>
        </ToolGenericSitePage>

    )
}