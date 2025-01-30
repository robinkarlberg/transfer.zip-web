import { useLocation, useNavigate } from "react-router-dom";
import FileUpload from "../../components/elements/FileUpload";
import { useContext } from "react";
import { QuickShareContext } from "../QuickSharePage";

export default function QuickShareNew({ }) {
  const { hasBeenSentLink, k, remoteSessionId, transferDirection } = useContext(QuickShareContext)
  
  const navigate = useNavigate()

  const handleFiles = (files) => {

    if (hasBeenSentLink) {
      navigate("progress", {
        state: {
          files,
          // These fields are prepopulated from link
          k, remoteSessionId, transferDirection
        }
      })
    }
    else {
      navigate("progress", {
        state: {
          files,
          transferDirection: "S"
        }
      })
    }
  }

  const onReceiveClicked = e => {
    navigate("progress", {
      state: {
        transferDirection: "R"
      }
    })
  }

  return (
    <div className="w-96">
      <FileUpload onFiles={handleFiles} />
    </div>
  )
}