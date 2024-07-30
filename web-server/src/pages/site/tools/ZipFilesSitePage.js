import ZipFileOnlineFilePicker from "../../../components/site/tools/ZipFileOnlineFilePicker"
import ToolGenericSitePage from "../../../components/site/tools/ToolGenericSitePage"
import { Link } from "react-router-dom"

export default function ZipFilesSitePage({ }) {

    return (
        <ToolGenericSitePage
            title={"Zip Files Online"}
            display={<span><span className="text-primary">Easily</span> compress your files online.</span>}
            tags={["Zip your files or a whole folder", "Share the zip file afterwards", "Fast and free"]}
            subtitle={<span><span className="fw-bold">Compress your files,</span> <span className="text-primary">save disk space</span> and upload faster</span>}
            description={"Effortlessly compress even the biggest files with our online file and folder zip tool. You can pick a whole folder and multiple files from your computer, and they will be converted into a zip archive, ready to download instantly. You can also choose to share the zip file for free if you need to."}
            question={"How to compress zip file"}
            steps={[
                { step: 1, icon: "bi-file-earmark-plus-fill", text: "Pick your files or select a folder" },
                { step: 2, icon: "bi-hourglass-split", text: "Compress and wait" },
                { step: 3, icon: "bi-cloud-arrow-down-fill", text: <span>Download or <Link to={"/app/quick-share"}>share your zip file</Link></span> },
            ]}
            >
            <div className="bg-body-tertiary shadow-lg rounded-4">
                <ZipFileOnlineFilePicker />
            </div>
        </ToolGenericSitePage>

    )
}