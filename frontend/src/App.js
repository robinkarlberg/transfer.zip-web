import "./App.css";
// import Footer from "./components/Footer";
import { Navigate, Outlet, ScrollRestoration } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";

function App() {

  if (window.location.hash) {
    const hashList = window.location.hash.slice(1).split(",")
    if (hashList.length === 3) {
      const [k, remoteSessionId, transferDirection] = hashList

      if (remoteSessionId.length !== 36 && (transferDirection !== "R" && transferDirection !== "S")) {
        throw new Error("The URL parameters are malformed. Did you copy the URL correctly?")
      }

      const state = {
        k,
        remoteSessionId,
        transferDirection
      }

      window.location.hash = ""
      let newLocation = transferDirection == "R" ? "/quick-share/progress" : "/quick-share"

      return <Navigate to={newLocation} state={state} replace={true} />
    }
  }

  return (
    <div className="App">
      <ScrollRestoration />
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
}

export default App;
