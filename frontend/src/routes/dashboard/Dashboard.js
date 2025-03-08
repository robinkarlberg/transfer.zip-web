import { Link, Outlet, useLoaderData, useLocation, useNavigate } from "react-router-dom";
import BIcon from "../../components/BIcon";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "../../providers/AuthProvider";
import Dropdown from "../../components/elements/Dropdown";
import { ApplicationContext } from "../../providers/ApplicationProvider";

import logo from "../../img/icon.png"
import { Dialog, DialogPanel, Disclosure, DisclosureButton, DisclosurePanel, Transition } from "@headlessui/react";
import { getTransferList, getUserStorage, getSettings } from "../../Api";
import TransferSidebar from "../../components/dashboard/sidebars/TransferSidebar";
import NewTransferModal from "../../components/elements/modals/NewTransferModal";
import UpgradeModal from "../../components/elements/modals/UpgradeModal";

const MAIN_MENU = [
  { icon: "house", text: "Overview", to: "/app" },
  { icon: "send", text: "Transfers", to: "/app/transfers" },
]

const SECONDARY_MENU = [
  { icon: "lightning", text: "Quick Share", to: "/quick-share" },
  { icon: "file-earmark-zip", text: "Create Zip", to: "/tools/zip-files-online" },
  { icon: "file-earmark-zip", text: "View Zip", to: "/tools/unzip-files-online" },
  { icon: "transparency", text: "HEIC to JPG", to: "/tools/heic-convert" },
]

export async function loader({ params }) {
  const [{ transfers }, settings] = await Promise.all([
    getTransferList(),
    getSettings()
  ])
  return { transfers, settings }
}

export const DashboardContext = createContext({})

const Wrapper = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  return (
    <div className="bg-white">
      <div className="z-20 bg-white fixed w-full md:hidden">
        <div className="h-16 border-b flex items-center justify-between px-4">
          <div>
            <a href="#" className="">
              <span className="sr-only">Your Company</span>
              <img
                alt="Logo"
                src={logo}
                className="h-8 w-auto"
              />
            </a>
          </div>
          <div className="flex lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
            >
              <span className="sr-only">Open main menu</span>
              <BIcon name={"list"} aria-hidden="true" className="text-xl" />
            </button>
          </div>
        </div>
        <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
          <div className="fixed inset-0 z-10" />
          <DialogPanel className="fixed inset-y-0 right-0 z-20 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
            <div className="flex items-center justify-between">
              <a href="#" className="-m-1.5 p-1.5">
                <span className="sr-only">Your Company</span>
                <img
                  alt="Logo"
                  src={logo}
                  className="h-8 w-auto"
                />
              </a>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="-m-2.5 rounded-md p-2.5 text-gray-700"
              >
                <span className="sr-only">Close menu</span>
                <BIcon name={"x-lg"} aria-hidden="true" className="size-6" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-500/10">
                <div className="space-y-2 py-6">
                  {MAIN_MENU.map(item => (
                    <Link onClick={() => setMobileMenuOpen(false)} to={item.to} key={item.text} className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-800 hover:bg-gray-50" >
                      <BIcon className={"me-2"} name={item.icon} />{item.text}
                    </Link>
                  ))}

                  <Disclosure as="div" className="-mx-3">
                    <DisclosureButton className="group flex w-full items-center rounded-lg py-2 pl-3 pr-3.5 text-base/7 font-semibold text-gray-800 hover:bg-gray-50">
                      <BIcon center aria-hidden="true" name={"chevron-up me-2"} className="flex-none group-data-[open]:rotate-180 transition-transform" />Tools
                    </DisclosureButton>
                    <DisclosurePanel className="mt-2 space-y-2">
                      {SECONDARY_MENU.map((item) => (
                        <DisclosureButton
                          onClick={() => setMobileMenuOpen(false)}
                          key={item.text}
                          as="a"
                          href={item.to}
                          className="block rounded-lg py-2 pl-6 pr-3 text-sm/7 font-semibold text-gray-800 hover:bg-gray-50"
                        >
                          {item.text}
                        </DisclosureButton>
                      ))}
                    </DisclosurePanel>
                  </Disclosure>
                  <Link onClick={() => setMobileMenuOpen(false)} to={"/app/settings"} className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-800 hover:bg-gray-50" >
                    <BIcon className={"me-2"} name={"gear"} />Settings
                  </Link>
                </div>
                {/* <div className="py-6">
                  <Link
                    onClick={handleCtaLinkClicked}
                    to={ctaLink}
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                  >
                    {ctaText}
                  </Link>
                </div> */}
              </div>
            </div>
          </DialogPanel>
        </Dialog>
      </div>
      <div className="pt-16 md:pt-0 h-[100vh] --max-w-[96rem] mx-auto flex flex-row">
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
        <div className="hidden lg:w-64 py-6 px-6 pt-12 border-r bg-white md:flex flex-col">
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
              MAIN_MENU.map((value, index) => <Button key={value.to} {...value} />)
            }
            <span className="text-sm font-medium text-gray-500 my-1">Tools</span>
            {
              SECONDARY_MENU.map((value, index) => <SmallLink key={value.to} {...value} />)
            }
          </div>
          <div className="mt-auto">
            <Button icon={"gear"} text={"Settings"} to={"/app/settings"} className={"w-full"} />
          </div>
        </div>
        <div className="grow overflow-y-auto md:h-[100vh] z-10 mx-auto max-w-6xl">
          <Outlet />
        </div>
        <Transition show={showSidebar}>
          <div className="z-20 --overflow-hidden duration-0 data-[closed]:w-0 data-[leave]:overflow-hidden data-[enter]:overflow-hidden fixed top-0 w-[100vw] h-full md:relative md:w-96 md:h-auto md:duration-300">
            <div className="absolute h-full w-full md:w-96">
              {selectedTransferId != null && <TransferSidebar />}
            </div>
          </div>
        </Transition>
      </Wrapper>
    </DashboardContext.Provider>
  )

}