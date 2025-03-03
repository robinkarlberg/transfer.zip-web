import { useLocation, useNavigate } from "react-router-dom";
import FileUpload from "../../components/elements/FileUpload";
import { useContext, useEffect, useState } from "react";
import { QuickShareContext } from "../QuickSharePage";
import BIcon from "../../components/BIcon";

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

  const [stars, setStars] = useState(null)

  useEffect(() => {
    fetch("https://api.github.com/repos/robinkarlberg/transfer.zip-web", {
      "credentials": "omit",
      "method": "GET"
    }).then(res => res.json()).then(json => {
      setStars(json.stargazers_count)
    }).catch(err => {
      console.log("GitHub stars fetch error :(")
    })
  }, [])

  return (
    <div className="w-full max-w-96 text-center">
      <div className={hasBeenSentLink ? "mb-2" : "mb-28"}>
        <h1 className="font-bold text-4xl md:text-5xl mb-2">{hasBeenSentLink ? "Send Files" : "Quick Share"}</h1>
        <h2 className="text-gray-800 mb-4 md:text-lg">
          {hasBeenSentLink ?
            "Someone has requested you to send files!"
            :
            "Send files in realtime, with no size limit."
          }
        </h2>
      </div>
      <FileUpload onFiles={handleFiles} onReceiveClicked={hasBeenSentLink ? undefined : onReceiveClicked} />
      <p className="text-gray-500 text-xs mt-2">
        We do not use cookies. Your files are protected with end-to-end encryption, meaning they remain unreadable by anyone but you.<br /><a href="https://github.com/robinkarlberg/transfer.zip-web" className="text-primary hover:underline">GitHub {stars && <span>({stars} <BIcon name={"star"}/>)</span>} </a>
      </p>
    </div>
  )
}