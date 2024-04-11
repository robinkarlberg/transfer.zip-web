import { useContext, useEffect, useState } from "react";
import "./App.css";
import "./extra.css";
import logo from "./img/transfer-zip-logotext-cropped.png"

import { Link, Outlet, useNavigate } from "react-router-dom";
import { ApplicationContext } from "./providers/ApplicationProvider";
import IntentDescription from "./components/IntentDescription"
import AddContactModal from "./components/modals/AddContactModal";
import Adsense from "./components/Adsense";

function App() {
  const { setShowContacts } = useContext(ApplicationContext)
  const navigate = useNavigate()

  const isInfoPage = window.location.href.indexOf("privacy-policy") > -1

  useEffect(() => {
    if (window.location.hash) {  // User has been sent a link, assuming action be taken
      const hashList = window.location.hash.slice(1).split(",")

      if (hashList.length != 3) {
        throw "The URL parameters are malformed. Did you copy the URL correctly?"
      }

      const [key_b, recipientId, directionChar] = hashList
      // setHashList(hashList)
      // setTransferDirection(directionChar)
      const state = {
        key: key_b,
        remoteSessionId: recipientId,
        transferDirection: directionChar
      }

      window.location.hash = ""
      if(directionChar == "R") {
        navigate("/progress", {
          state
        })
      }
      else if(directionChar == "S") {
        navigate("/upload-on-behalf", {
          state
        })
      }
    }
  }, [])

  return (
    <div id="page-outer">
      <div className="outer">
        { !isInfoPage && <Adsense className={"outer-ad-left outer-ad"} data_ad_client={"ca-pub-9550547294674683"} data_ad_slot={"5132630574"}/>}
      </div>
      <div id="page">
        <div>
          <div id="heading-container" className="container mb-1 d-flex justify-content-between">
            <div>
              {/* <h1 className="display-5 fw-medium mb-0">transfer<i>.zip</i></h1> */}
              <img style={ { maxWidth: "200px", marginBottom: "-10px", marginLeft: "-5px" } } src={logo}></img>
              <p className="text-secondary">Free, Fast, Encrypted</p>
            </div>
            {/* <div>
              <button onClick={() => { setShowContacts(true) }} className="btn btn-outline-secondary m-1"><i className="bi bi-person-lines-fill"></i></button>
            </div> */}
          </div>
          <AddContactModal/>
          <main className="d-flex flex-column">
            <div className="container d-flex flex-column justify-content-center flex-grow-1">
              <Outlet/>
            </div>
          </main>

          <div id="footer-container" className="container fs-6">
            <footer style={{maxWidth: "900px"}}>
              { !isInfoPage && <IntentDescription/> }
              <div className="d-flex flex-row justify-content-center mb-3">
                <Link className="mx-1" to="/">Home</Link>
                <Link className="mx-1" to="https://github.com/robinkarlberg/transfer.zip-web/?tab=readme-ov-file#transferzip">About</Link>
                <Link className="mx-1" to="/privacy-policy">Privacy Policy</Link>
                <Link className="mx-1" to="https://github.com/robinkarlberg/transfer.zip-web">View on GitHub</Link>
              </div>
            </footer>
          </div>
        </div>
      </div>
      <div className="outer">
        { !isInfoPage && <Adsense className={"outer-ad-right outer-ad"} data_ad_client={"ca-pub-9550547294674683"} data_ad_slot={"5132630574"}/> }
      </div>
    </div>
  );
}

export default App;
