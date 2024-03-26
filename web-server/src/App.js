import { useContext, useEffect, useState } from "react";
import "./App.css";

import { Outlet, useNavigate } from "react-router-dom";
import { ApplicationContext } from "./providers/ApplicationProvider";
import IntentDescription from "./components/IntentDescription"
import AddContactModal from "./components/modals/AddContactModal";

function App() {
  const { setHashList, setTransferDirection, setShowContacts } = useContext(ApplicationContext)
  const navigate = useNavigate()

  useEffect(() => {
    if (window.location.hash) {  // User has been sent a link, assuming action be taken
      const hashList = window.location.hash.slice(1).split(",")

      if (hashList.length != 3) {
        throw "The URL parameters are malformed. Did you copy the URL correctly?"
      }

      const [key_b, recipientId, directionChar] = hashList
      setHashList(hashList)
      setTransferDirection(directionChar)
      window.location.hash = ""
      if(directionChar == "R") {
        navigate("/progress")
      }
      else if(directionChar == "S") {
        navigate("/upload-on-behalf")
      }
    }
  }, [])

  return (
    <div id="page-outer">
      <div className="outer">

      </div>
      <div id="page">
        <div>
          <div id="heading-container" className="container mb-1 d-flex justify-content-between">
            <div>
              <h1 className="display-5 fw-medium mb-0">transfer<i>.zip</i></h1>
              <p className="text-secondary">Free, Fast, Encrypted</p>
            </div>
            <div>
              <button onClick={() => { setShowContacts(true) }} className="btn btn-outline-secondary m-1"><i className="bi bi-person-lines-fill"></i></button>
            </div>
          </div>
          <AddContactModal/>
          <main className="d-flex flex-column">
            <div className="container d-flex justify-content-center flex-grow-1">
              <Outlet/>
            </div>
          </main>

          <div id="footer-container" className="container fs-6">
            <footer>
              <IntentDescription/>
              <div className="d-flex flex-row justify-content-center mb-3">
                <a className="mx-1" href="/">Home</a>
                <a className="mx-1" href="/about">About</a>
                <a className="mx-1" href="/privacy-policy">Privacy Policy</a>
                <a className="mx-1" href="https://github.com/robinkarlberg/transfer.zip-web">View on GitHub</a>
              </div>
            </footer>
          </div>
        </div>
      </div>
      <div className="outer">

      </div>
    </div>
  );
}

export default App;
