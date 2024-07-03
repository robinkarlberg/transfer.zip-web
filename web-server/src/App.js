import { useContext, useEffect, useState } from "react";
import "./App.css";
// import "./extra.css";
import logo from "./img/transfer-zip-logotext-cropped.png"

import { Link, Outlet, useNavigate } from "react-router-dom";
import { ApplicationContext, ApplicationProvider } from "./providers/ApplicationProvider";
import Adsense from "./components/Adsense";
import SideBar from "./components/app/SideBar";
import { AuthContext, AuthProvider } from "./providers/AuthProvider";
import Header from "./components/app/Header";
import { Helmet } from "react-helmet";

function App() {
  const { user, isGuestOrFreeUser } = useContext(AuthContext)

  const adsDiv = (
    <div>
      <div className="d-flex flex-row gap-1">
        <div className="d-none d-xxl-block" style={{ width: "160px" }}>
          <Adsense data_ad_client="ca-pub-9550547294674683" data_ad_slot="5132630574" className="" />
        </div>
        <div className="d-none d-sm-block" style={{ width: "300px" }}>
          <Adsense data_ad_client="ca-pub-9550547294674683" data_ad_slot="5132630574" className="" />
        </div>
      </div>
      <div className="d-none d-sm-block mt-1">
        <Adsense data_ad_client="ca-pub-9550547294674683" data_ad_slot="5132630574" className="" />
      </div>
      <div className="d-block d-xxl-none mt-1">
        <Adsense data_ad_client="ca-pub-9550547294674683" data_ad_slot="5132630574" className="" />
      </div>
    </div>
  )

  return (
    <div className="d-flex flex-row">
      <Helmet>
        <title>Send large files | transfer.zip</title>
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

      { user != null && isGuestOrFreeUser() && adsDiv }
    </div>
  );
}

export default App;
