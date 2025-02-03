import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import BIcon from "../../components/BIcon";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../providers/AuthProvider";
import Dropdown from "../../components/elements/Dropdown";
import { DashboardContext } from "../../providers/DashboardProvider";
import { ApplicationContext } from "../../providers/ApplicationProvider";

import logo from "../../img/icon.png"

export default function Dashboard({ }) {

  const location = useLocation()
  const currentPage = location.pathname

  const navigate = useNavigate()

  const { displayGenericModal } = useContext(ApplicationContext)
  const { user, isGuestUser } = useContext(AuthContext)

  const [open, setOpen] = useState(true)

  const Button = ({ icon, text, to, onClick, className }) => {
    const activeClassParent = ((to != "/app" ? currentPage.startsWith(to) : (currentPage == to || currentPage == `${to}/`)) ? "text-primary bg-body-secondary font-semibold " : "text-secondary font-medium ")

    return (
      <button onClick={onClick || (() => navigate(to))} className={`hover:bg-body-secondary grow text-start px-4 py-2 flex items-center rounded-lg hover:text-primary ${activeClassParent} ${className}`}>
        <BIcon className={`text-xl me-2`} name={icon} />{text}
      </button>
    )
  }

  useEffect(() => {
    const sponsorCtaElement = document.getElementById('sponsor_cta_dr');
    if (sponsorCtaElement) {
      sponsorCtaElement.style.display = 'none';
    }
    return () => {
      if (sponsorCtaElement) {
        sponsorCtaElement.style.display = '';
      }
    };
  }, []);

  useEffect(() => {
    if (user && isGuestUser) {
      navigate("/signup")
    }
  }, [user, location])

  const Wrapper = ({ children }) => {
    return (
      <div className="bg-gray-50 ">
        <div className="h-[100vh] --max-w-[96rem] mx-auto flex flex-row">
          {children}
        </div>
      </div>
    )
  }

  const loading = (
    <>
      <div>

      </div>
    </>
  )

  if (!user) {
    return (
      <Wrapper>
        {loading}
      </Wrapper>
    )
  }

  const loaded = (
    <>
      <div className="lg:w-64 py-6 px-6 pt-12 border-r bg-white flex flex-col">
        <Link className="mb-4" to="/">
          <div className="flex flex-row">
            <img
              alt="Company Logo"
              src={logo}
              className="h-8 w-auto me-1"
            />
            <h2 className="text-2xl font-bold text-gray-800">{process.env.REACT_APP_SITE_NAME}</h2>
          </div>
        </Link>
        <div className="flex flex-col gap-y-2">
          <Link to={"/app/transfers/new"} className="text-center bg-primary hover:bg-primary-light text-white text-sm font-semibold py-2 rounded-lg">Transfer<BIcon className={"ms-2"} name={"send-fill"}/></Link>
          {
            [
              { icon: "house-fill", text: "Overview", to: "/app" },
              { icon: "send-fill", text: "Transfers", to: "/app/transfers" },
            ].map((value, index) => <Button key={value.to} {...value} />)
          }
        </div>
        <div className="mt-auto">
          <Button icon={"person"} text={"Account"} to={"/app/settings"} className={"w-full"} />
        </div>
      </div>
      <div className="grow overflow-y-auto h-[100vh] z-10 mx-auto max-w-6xl">
        <Outlet />
      </div>
    </>
  )

  return (
    <Wrapper>
      {loaded}
    </Wrapper>
  )

}