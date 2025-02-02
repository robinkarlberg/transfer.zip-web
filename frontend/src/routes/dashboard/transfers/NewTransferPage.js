import GenericPage from "../../../components/dashboard/GenericPage";
import FileUpload from "../../../components/elements/FileUpload";

export default function NewTransferPage({ }) {

  const handleFiles = files => {

  }

  return (
    <GenericPage title={"New Transfer"}>
      <div className="w-full max-w-96">
        <FileUpload onFiles={handleFiles} />
      </div>
    </GenericPage>
  )
}