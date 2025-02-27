import { Outlet, useNavigate } from "react-router-dom";
import HashInterceptor from "../../components/HashInterceptor";
import Header from "../../components/Header";
import SelfHostHeader from "../../components/selfhost/SelfHostHeader";

export default function SelfHostApp({ }) {
  const navigate = useNavigate()

  return (
    <>
      <HashInterceptor onPass={() => {
        if (window.location.pathname == "/" || window.location.pathname == "") {
          navigate("/quick-share")
        }
      }} />
      <SelfHostHeader />
      <Outlet />
    </>
  )
}