import { useContext, useEffect, useState } from "react";
// import "./App.css";
// import "./extra.css";
import logo from "./img/transfer-zip-logotext-cropped.png"

import { Link, Outlet, useNavigate } from "react-router-dom";
import { ApplicationContext, ApplicationProvider } from "./providers/ApplicationProvider";
import IntentDescription from "./components/IntentDescription"
import AddContactModal from "./components/modals/AddContactModal";
import Adsense from "./components/Adsense";
import SideBar from "./components/app/SideBar";
import { AuthProvider } from "./providers/AuthProvider";
import Header from "./components/app/Header";

function App() {
  const { setShowContacts } = useContext(ApplicationContext)
  const navigate = useNavigate()

  const isInfoPage = window.location.href.indexOf("privacy-policy") + window.location.href.indexOf("about") > -1

  const mobile = document.body.clientWidth < 576

  return (
    <div className={"App bg-dark-subtle min-vh-100 d-flex flex-column flex-md-row"}>
      <Header className="d-md-none" />
      <SideBar className="d-none d-md-flex" />
      <div className="d-flex flex-row flex-grow-0 flex-sm-grow-1">
        <Outlet />
      </div>
      {/* <div className="w-100">
        <div className="m-auto" style={{ maxWidth: "1500px" }}>
        </div>
      </div> */}
    </div>
  );
}

export default App;
