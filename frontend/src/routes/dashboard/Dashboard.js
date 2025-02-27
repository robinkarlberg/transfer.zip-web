import { Link, Outlet, useLoaderData, useLocation, useNavigate } from "react-router-dom";
import BIcon from "../../components/BIcon";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "../../providers/AuthProvider";
import Dropdown from "../../components/elements/Dropdown";
import { ApplicationContext } from "../../providers/ApplicationProvider";

import logo from "../../img/icon.png"
import { Transition } from "@headlessui/react";
import { getTransferList, getUserStorage, getSettings } from "../../Api";
import TransferSidebar from "../../components/dashboard/sidebars/TransferSidebar";
import NewTransferModal from "../../components/elements/modals/NewTransferModal";
import UpgradeModal from "../../components/elements/modals/UpgradeModal";

export async function loader({ params }) {
  const [{ transfers }, settings] = await Promise.all([
    getTransferList(),
    getSettings()
  ])
  return { transfers, settings }
}

export const DashboardContext = createContext({})

const Wrapper = ({ children }) => {
  return (
    <div className="bg-white">
      <div className="h-[100vh] --max-w-[96rem] mx-auto flex flex-row">
        {children}
      </div>
    </div>
  )
}

const SmallLink = ({ icon, text, to }) => {
  return (
    <Link to={to} className={`hover:bg-body-secondary grow text-start text-sm px-4 py-1 flex items-center rounded-lg hover:text-primary text-secondary font-semibold`}>
      <BIcon className={`text-lg me-2`} name={`${icon}`} />{text}
    </Link>
  )
}

export default function Dashboard({ }) {
  const location = useLocation()
  const currentPage = location.pathname

  const navigate = useNavigate()

  const { displayGenericModal } = useContext(ApplicationContext)
  const { user, isGuestUser } = useContext(AuthContext)

  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  const { transfers } = useLoaderData()

  const [open, setOpen] = useState(true)
  const [storage, setStorage] = useState(null)

  const [showSidebar, setShowSidebar] = useState(false)

  const [selectedTransferId, _setSelectedTransferId] = useState(null)
  const setSelectedTransferId = (id) => {
    _setSelectedTransferId(id)
    setShowSidebar(true)
  }

  const selectedTransfer = useMemo(() => selectedTransferId ? transfers.find(x => x.id === selectedTransferId) : null, [selectedTransferId, transfers])
  const displayedTransferId = useMemo(() => showSidebar && selectedTransferId, [showSidebar, selectedTransferId])

  const refreshStorage = async () => {
    try {
      const res = await getUserStorage()
      setStorage(res.storage)
    }
    catch (err) {
      setStorage(null)
    }
  }

  const hideSidebar = () => setShowSidebar(false)

  useEffect(() => {
    refreshStorage()
  }, [user])

  const Button = ({ icon, text, to, onClick, className }) => {
    const isActive = (to != "/app" && to != "/app/transfers") ? currentPage.startsWith(to) : (currentPage == to || currentPage == `${to}/`)
    const activeClassParent = isActive ? "text-primary bg-body-secondary font-semibold " : "text-secondary font-semibold "

    return (
      <button onClick={onClick || (() => navigate(to))} className={`hover:bg-body-secondary grow text-start text-sm px-4 py-2 flex items-center rounded-lg hover:text-primary ${activeClassParent} ${className}`}>
        <BIcon className={`text-lg me-2`} name={`${icon}${isActive ? "-fill" : ""}`} />{text}
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

  return (
    <DashboardContext.Provider value={{
      storage,
      refreshStorage,
      displayedTransferId,
      setSelectedTransferId,
      selectedTransfer,
      hideSidebar,
      showSidebar,
      setShowUpgradeModal
    }}>
      <UpgradeModal show={showUpgradeModal} />
      <Wrapper>
        <div className="lg:w-64 py-6 px-6 pt-12 border-r bg-white flex flex-col">
          <Link className="mb-4" to="/">
            <div className="flex flex-row items-center">
              <img
                alt="Company Logo"
                src={logo}
                className="h-10 w-auto me-1"
              />
              <h2 className="text-2xl font-bold text-gray-800">{process.env.REACT_APP_SITE_NAME}</h2>
            </div>
          </Link>
          <div className="flex flex-col gap-y-1">
            <Link to={"/app/transfers/new"} className="mb-1 text-center bg-primary hover:bg-primary-light text-white text-sm font-medium py-2 rounded-md">New Transfer<BIcon className={"ms-1.5 text-xs"} name={"send-fill"} /></Link>
            <span className="text-sm font-medium text-gray-500 my-1">Dashboard</span>
            {
              [
                { icon: "house", text: "Overview", to: "/app" },
                { icon: "send", text: "Transfers", to: "/app/transfers" },
              ].map((value, index) => <Button key={value.to} {...value} />)
            }
            <span className="text-sm font-medium text-gray-500 my-1">Tools</span>
            {
              [
                { icon: "lightning", text: "Quick Share", to: "/quick-share" },
                { icon: "file-earmark-zip", text: "Create Zip", to: "/tools/zip-files-online" },
                { icon: "file-earmark-zip", text: "View Zip", to: "/tools/unzip-files-online" },
              ].map((value, index) => <SmallLink key={value.to} {...value} />)
            }
          </div>
          <div className="mt-auto">
            <Button icon={"gear"} text={"Settings"} to={"/app/settings"} className={"w-full"} />
          </div>
        </div>
        <div className="grow overflow-y-auto h-[100vh] z-10 mx-auto max-w-6xl">
          <Outlet />
        </div>
        <Transition show={showSidebar}>
          <div className="overflow-hidden relative transition-all duration-300 w-96 data-[closed]:w-0">
            <div className="absolute w-96 h-full">
              {selectedTransferId != null && <TransferSidebar />}
            </div>
          </div>
        </Transition>
      </Wrapper>
    </DashboardContext.Provider>
  )

}