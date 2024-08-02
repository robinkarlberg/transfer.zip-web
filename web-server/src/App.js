import { useContext, useEffect, useState } from "react";
import "./App.css";
// import "./extra.css";
import logo from "./img/transfer-zip-logotext-cropped.png"
import app_bg_dark from "./img/app_background_dark.png"

import { Link, Outlet, useNavigate } from "react-router-dom";
import { ApplicationContext, ApplicationProvider } from "./providers/ApplicationProvider";
import Adsense from "./components/Adsense";
import SideBar from "./components/app/SideBar";
import { AuthContext, AuthProvider } from "./providers/AuthProvider";
import Header from "./components/app/Header";
import { Helmet } from "react-helmet";
import { isSelfHosted } from "./utils";


function App() {
  const { user, isGuestUser } = useContext(AuthContext)
  let ads = (process.env.REACT_APP_ADSENSE && process.env.REACT_APP_ADSENSE == "true") && !isSelfHosted() && user && !user.hasPaidOnce
  // let extraAds = user && isGuestUser()

  const adsDiv = (
    <div>
      <div className="d-flex flex-row gap-1">
        <div className="d-none d-sm-block">
          <Adsense data_ad_client="ca-pub-9550547294674683" data_ad_slot="1839964465" staticAd={true} width={"300px"} height={"600px"} />
        </div>
      </div>
      <div className="d-none d-sm-block mt-1">
        <Adsense data_ad_client="ca-pub-9550547294674683" data_ad_slot="9628623444" staticAd={true} width={"300px"} height={"250px"} />
      </div>
    </div>
  )

  return (
    <div className="d-flex flex-row">
      <Helmet>
        <title>TransferZip - Send large files with no signup, no size limit, for free</title>
      </Helmet>
      <div className={"App flex-grow-1 bg-dark-subtle vh-100 d-flex flex-column flex-md-row"}>
        <Header className="d-md-none" />
        <SideBar className="d-none d-md-flex" />
        <div className="d-flex flex-row flex-grow-1 flex-sm-grow-1 overflow-y-scroll">
          <Outlet />
        </div>
        {/* <div className="w-100">
        <div className="m-auto" style={{ maxWidth: "1500px" }}>
        </div>
      </div> */}
      </div>

      {ads && adsDiv}
    </div>
  );
}

export default App;
