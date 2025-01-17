import { Link, useLoaderData, useLocation, useNavigate } from "react-router-dom";
import GenericPage from "../../components/dashboard/GenericPage";
import { useContext, useRef, useState } from "react";
import { DashboardContext } from "../../providers/DashboardProvider";
import BIcon from "../../components/BIcon";
import { ApplicationContext } from "../../providers/ApplicationProvider";
import { AuthContext } from "../../providers/AuthProvider";
import { createAccountSession, connectCreateAccount, connectLinkAccount, createCheckoutSession, tenantSetAdPriceDollars } from "../../Api";

import {
    ConnectBalances,
    ConnectNotificationBanner,
} from "@stripe/react-connect-js";
import Modal from "../../components/elements/Modal";
import Alert from "../../components/elements/Alert";
import OnboardingSteps from "../../components/dashboard/OnboardingSteps";

import OnboardingDemo from "../../img/OnboardingDemo.mp4"
import { isWaitlist } from "../../utils";

export default function OverviewPage({ }) {

    const { displayErrorModal, displaySuccessModal } = useContext(ApplicationContext)
    const { selectedTenant, refreshTenant, stripeConnectInstance, stripeAccountData, setShowAddDomainModal } = useContext(DashboardContext)
    const { user } = useContext(AuthContext)

    const [showIntegrationCodeModal, setShowIntegrationCodeModal] = useState(false)
    const [showUpdatePriceModal, setShowUpdatePriceModal] = useState(false)
    const [updatePriceError, setUpdatePriceError] = useState(null)

    const [updatePriceLoading, setUpdatePriceLoading] = useState(false)

    const codeRef = useRef(null)
    const navigate = useNavigate()

    if (!selectedTenant && user && user.tenants.length == 0) {
        return (
            <GenericPage category={"Getting Started"} title={"Adding Your Domain"}>
                <p className="text-md max-w-2xl mb-4">
                    To begin using SponsorApp, first add the domain of your website. 
                </p>
                <button
                    onClick={() => setShowAddDomainModal(true)}
                    className="rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                    <BIcon name={"plus-lg"} /> Add Domain
                </button>
                {/* <div className="mt-4 max-w-3xl">
                    <video
                        width={2432}
                        height={1442}
                        className="mx-auto rounded-xl w-full max-w-5xl border shadow-lg"
                        loop
                        controls
                    >
                        <source src={OnboardingDemo} type="video/mp4" />
                    </video>
                </div> */}
                {/* <p className="text-md max-w-2xl mb-4">
                    Simply enter your domain in the popup box, then follow the instructions to integrate the script into your website and configure your payment settings.
                </p> */}
            </GenericPage>
        )
    }

    if (!selectedTenant) return <></>

    const handleCopy = async e => {
        if (codeRef.current) {
            try {
                await navigator.clipboard.writeText(codeRef.current.innerText);
                // alert('Copied to clipboard!');
                displaySuccessModal("Copied to clipboard!", "Paste the code into the <head> section on your website.")
            } catch (err) {
                console.error('Failed to copy: ', err);
            }
        }
    }

    const handleTestBuyProduct = async () => {
        try {
            const res = await createCheckoutSession(selectedTenant.id, "testproductid")
            if (res.url) {
                window.location.href = res.url
            }
        }
        catch (err) {
            displayErrorModal(err.message)
        }
    }

    const stats = [
        {
            name: 'Current Sponsor',
            stat: selectedTenant.activeSponsors.length > 0
                ? `${selectedTenant.activeSponsors[0].title}${selectedTenant.activeSponsors.length > 1 ? ' + ' + (selectedTenant.activeSponsors.length - 1) + ' more' : ''}`
                : <span className="bg-gray-400 text-white px-2 rounded-md">None</span>,
            actionName: "More Info",
            action: () => navigate("../sponsors")
        },
        {
            name: 'Message Price', stat: `$${selectedTenant.adPriceDollars}`,
            actionName: "Change Price",
            action: () => setShowUpdatePriceModal(true)
        },
        {
            name: 'All-time Sponsors', stat: selectedTenant.sponsors.length,
            // actionName: "Find Sponsors",
            action: () => {  }
        },
    ]

    const timeline = [
        {
            id: 1,
            content: '1. Add our script to your website',
            target: 'Add Script',
            onClick: () => {
                setShowIntegrationCodeModal(true)
            },
            icon: "code",
            done: true
        },
        {
            id: 2,
            content: '2. Setup Stripe account to enable payments',
            target: 'Setup Stripe',
            onClick: () => {
                navigate("/app/connect/refresh")
            },
            icon: "currency-dollar",
            done: (stripeAccountData && stripeAccountData?.payouts_enabled)
        },
        // {
        //     id: 3,
        //     content: 'Customize Sponsor Button',
        //     target: 'Customize',
        //     onClick: '#',
        //     icon: "brush",

        // },
        {
            id: 3,
            content: "That's all!",
            icon: "check-lg",
            done: (stripeAccountData && stripeAccountData?.payouts_enabled)
        },
    ]

    const handleUpdatePriceSubmit = async e => {
        e.preventDefault()

        const formData = new FormData(e.target)

        setUpdatePriceLoading(true)
        setUpdatePriceError(null)
        try {
            await tenantSetAdPriceDollars(selectedTenant.id, formData.get("price"))
            await refreshTenant()
            setShowUpdatePriceModal(false)
        }
        catch (err) {
            setUpdatePriceError(err.message)
        }
        finally {
            setUpdatePriceLoading(false)
        }
    }

    return (
        <GenericPage category={selectedTenant.domain} title={"Overview"}>
            <Modal title={"Message Price"} loading={updatePriceLoading} show={showUpdatePriceModal} buttons={[
                { title: "Change Price", form: "updatePriceForm" },
                { title: "Cancel", onClick: () => setShowUpdatePriceModal(false) },
            ]}>
                <p className="text-sm text-gray-500">
                    The price supporters pay to display a gold message and link on your site for 14 days.
                    This price serves as the basis for other pricing tiers.
                </p>
                <form id="updatePriceForm" onSubmit={handleUpdatePriceSubmit}>
                    <div>
                        {/* <label htmlFor="price" className="block text-sm font-medium leading-6 text-gray-900">
                            Price
                        </label> */}
                        <div className="relative mt-2 rounded-md shadow-sm">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <span className="text-gray-500 sm:text-sm">$</span>
                            </div>
                            <input
                                id="price"
                                defaultValue={selectedTenant.adPriceDollars}
                                name="price"
                                type="text"
                                required
                                placeholder="0.00"
                                inputMode="decimal"
                                pattern="[0-9]*"
                                aria-describedby="price-currency"
                                className="block w-full rounded-md border-0 py-1.5 pl-7 pr-12 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                            />
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                <span id="price-currency" className="text-gray-500 sm:text-sm">
                                    / 14 Days
                                </span>
                            </div>
                        </div>
                        {updatePriceError && <p className="text-red-600 text-sm">{updatePriceError}</p>}
                    </div>
                </form>
            </Modal>
            <Modal title={"Integrate Script"} buttons={[
                { title: "Copy Code", onClick: handleCopy },
                { title: "Close", onClick: () => setShowIntegrationCodeModal(false) },
            ]} show={showIntegrationCodeModal} onClose={() => setShowIntegrationCodeModal(false)}>
                <p className="mb-1">Add this script to your website's <code>&lt;head&gt;</code>:</p>
                <div className="inline-block">
                    <pre className="border rounded-md text-sm flex flex-row justify-between items-center max-w-96 overflow-x-auto">
                        <code ref={codeRef} className="p-4">
                            <span style={{ color: '#a626a4' }}>&lt;script</span> <span style={{ color: '#4078f2' }}>src</span>
                            <span style={{ color: '#e45649' }}>=</span><span style={{ color: '#50a14f' }}>"{window.location.origin}/platform.js?p={selectedTenant.pub}"</span><span style={{ color: '#a626a4' }}>&gt;&lt;/script&gt;</span>
                        </code>
                        {/* <button onClick={handleCopy} className="border py-2 px-3 me-2 rounded-md text-xs hover:bg-gray-100">
                            <BIcon name={"clipboard"} className={"me-1"} />Copy
                        </button> */}
                    </pre>
                </div>
            </Modal>
            <div className="">
                {stripeAccountData && !stripeAccountData?.charges_enabled && (
                    <div>
                        <Alert title={"No Payment Methods"}>
                            <Link to={"/app/connect/refresh"} className="hover:underline text-primary hover:text-primary-light">
                                Onboard your Stripe account
                            </Link>{" "}
                            to receive payments.
                        </Alert>
                    </div>
                )}
                {stripeAccountData?.charges_enabled && (!stripeConnectInstance || (stripeAccountData && !stripeAccountData?.payouts_enabled)) && (
                    <div>
                        <Alert title={"Payouts Not Enabled"}>
                            <Link to={"/app/connect/refresh"} className="hover:underline text-primary hover:text-primary-light">
                                Finish onboarding your Stripe account
                            </Link>{" "}
                            to receive payouts to your bank.
                        </Alert>
                    </div>
                )}
            </div>
            {stripeConnectInstance && <div className="mb-0 bg-white">
                <ConnectNotificationBanner />
            </div>}
            <div className="mb-4">
                {/* <h3 className="text-base font-semibold leading-6 text-gray-900">Statistics</h3> */}
                <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
                    {stats.map((item) => (
                        <div key={item.name} className="overflow-hidden bg-white rounded-lg border px-4 py-5 shadow sm:p-6">
                            <dt className="truncate text-sm font-medium text-gray-500">{item.name}</dt>
                            <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900 mb-3">{item.stat}</dd>
                            {item.action && <button className="text-sm text-secondary hover:text-primary" onClick={item.action}>{item.actionName} {item.actionName && <>&rarr;</>}</button>}
                        </div>
                    ))}
                </dl>
            </div>
            <div className="mb-4">
                <h3 className="text-base font-semibold leading-6 text-gray-900 mb-3">Integration Guide</h3>
                {/* <div className="flex flex-row gap-2 mt-3">
                    <button onClick={() => setShowIntegrationCodeModal(true)} className="text-white rounded-full shadow-sm px-3.5 py-2 text-sm bg-primary hover:bg-primary-light">1. Link Website &rarr;</button>
                    <Link to={"/app/connect/refresh"} className="text-white rounded-full shadow-sm px-3.5 py-2 text-sm bg-primary hover:bg-primary-light">2. Onboard Stripe Account &rarr;</Link>
                </div> */}
                <div className="p-6 bg-white rounded-lg shadow border max-w-lg">
                    <OnboardingSteps timeline={timeline} />
                </div>
            </div>
            {/* {isWaitlist() && <div className="mb-4">
                <div>
                    <a target="_blank" className="px-2 py-1 bg-primary text-white rounded text-sm font-medium hover:bg-primary-light" href="https://tally.so/r/wAAdMN">Beta Testing Feedback &rarr;</a>
                </div>
            </div>} */}
            <div className="mb-4">
                <div className="bg-white rounded-md inline border shadow py-1">
                    <span className="text-sm font-medium p-2 text-gray-600"><BIcon name={"info-circle"} /> SponsorApp is a new product</span>
                    <a target="_blank" className="text-sm font-medium text-primary hover:text-primary-light pe-2" href="https://tally.so/r/wAAl20">Report an Issue / Ask a Question &rarr;</a>
                </div>
            </div>
            {/* <div>
                <h3 className="text-base font-semibold leading-6 text-gray-900">Bank</h3>
                {
                    (!stripeConnectInstance || (stripeAccountData && !stripeAccountData?.payouts_enabled)) ?
                        <div className="mt-2 text-secondary">
                            <p>Enable payments to view bank balance.</p>
                        </div>
                        :
                        <div className="mt-2 p-6 bg-white rounded-lg border shadow mb-4 min-h-28">
                            <ConnectBalances />
                        </div>
                }
            </div> */}
            {/* {selectedTenant.stripe_account_id && <ConnectPayments />} */}
            {/* <h3 className="text-2xl font-bold">Payment List</h3> */}
        </GenericPage>
    )
}