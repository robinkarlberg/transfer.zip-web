import { Link, useLoaderData, useLocation, useNavigate } from "react-router-dom";
import GenericPage from "../../components/dashboard/GenericPage";
import { useContext, useRef, useState } from "react";
import BIcon from "../../components/BIcon";
import { ApplicationContext } from "../../providers/ApplicationProvider";
import { AuthContext } from "../../providers/AuthProvider";


export default function OverviewPage({ }) {

    const { displayErrorModal, displaySuccessModal } = useContext(ApplicationContext)
    const { user } = useContext(AuthContext)

    const [showIntegrationCodeModal, setShowIntegrationCodeModal] = useState(false)

    const codeRef = useRef(null)
    const navigate = useNavigate()

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

    const stats = [
        {
            name: 'Files',
            stat: 1,
            actionName: "More Info",
            action: () => navigate("../sponsors")
        },
        {
            name: 'Files', stat: `$2`,
            actionName: "Change Price",
            action: () => { }
        },
        {
            name: 'Many Files', stat: 1,
            // actionName: "Find Sponsors",
            action: () => {  }
        },
    ]

    const handleUpdatePriceSubmit = async e => {
        e.preventDefault()
        
    }

    return (
        <GenericPage title={"Overview"}>
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
        </GenericPage>
    )
}