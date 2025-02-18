import { Link } from "react-router-dom";
import FileUpload from "../../components/elements/FileUpload";
import GenericToolPage from "../../components/GenericToolPage";

export default function UnzipFilesPage({ }) {

  const handleFiles = async files => {

  }

  return (
    <GenericToolPage
      title={"Unzip Files Online"}
      display={<span><span className="text-primary">Easily</span> open your zip files online.</span>}
      subtitle={"Decompress and view even the largest zip files with this online tool. We can not read your files, as everything is handled locally in your browser."}
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
      ]}>

      <div className="mx-auto max-w-sm">
        <FileUpload onFiles={handleFiles} buttonText={"Unzip"} singleFile={true} />
      </div>
    </GenericToolPage>
  )
}