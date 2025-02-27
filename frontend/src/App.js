import "./App.css";
// import Footer from "./components/Footer";
import { Navigate, Outlet, ScrollRestoration, useLocation, useNavigate } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { useEffect } from "react";
import HashInterceptor from "./components/HashInterceptor";

function App() {

  return (
    <div className="App">
      <HashInterceptor />
      <ScrollRestoration />
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
}

export default App;
