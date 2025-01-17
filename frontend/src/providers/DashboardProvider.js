import { createContext, useCallback, useContext, useEffect, useState } from "react"
import { Outlet } from "react-router-dom"
import { AuthContext } from "./AuthProvider";
import { createAccountSession, getStripeAccount, getTenant } from "../Api";
import VerifyDomainModal from "../components/elements/modals/VerifyDomainModal";
import DomainSettingsModal from "../components/elements/modals/DomainSettingsModal";
import { loadConnectAndInitialize } from "@stripe/connect-js";
import { ConnectComponentsProvider } from "@stripe/react-connect-js";
import AddDomainModal from "../components/elements/modals/AddDomainModal";

export const DashboardContext = createContext({})

export const DashboardProvider = () => {

    const { user } = useContext(AuthContext)

    const [selectedTenantId, _setSelectedTenantId] = useState(null)
    const setSelectedTenantId = (tenantId) => {
        _setSelectedTenantId(tenantId)
        console.log("SET:", tenantId)
        window.localStorage.setItem("selectedTenantId", tenantId)
    }

    useEffect(() => {
        if (!selectedTenantId && user && user.tenants?.length > 0) {
            const savedSelectedTenantId = window.localStorage.getItem("selectedTenantId")
            console.log("SAVED:", savedSelectedTenantId)

            // Check if has a saved tenant id and it exists in current tenant list
            // If both conditions are true, auto-select that tenant
            if (savedSelectedTenantId && user.tenants.find(x => x.id == savedSelectedTenantId)) {
                setSelectedTenantId(savedSelectedTenantId)
            }
            else {
                setSelectedTenantId(user.tenants[0].id)
            }
        }
    }, [user])

    const [selectedTenant, setSelectedTenant] = useState(null)

    const refreshTenant = async () => {
        const res = await getTenant(selectedTenantId)
        setSelectedTenant(res.tenant)
    }

    const [showAddDomainModal, setShowAddDomainModal] = useState(false)
    
    const [stripeAccountData, setStripeAccountData] = useState(null)

    const [stripeConnectInstance, setStripeConnectInstance] = useState(undefined);

    useEffect(() => {
        const fetchClientSecret = async () => {
            try {
                const { accountSession } = await createAccountSession(selectedTenant.id)
                const { client_secret: clientSecret } = accountSession
                return clientSecret
            }
            catch (err) {
                console.error('An error occurred: ', err);
                return undefined;
            }
        };
        if (selectedTenant && selectedTenant.stripe_account_id) {
            getStripeAccount(selectedTenant.id).then(res => {
                setStripeAccountData(res)
            })

            setStripeConnectInstance(loadConnectAndInitialize({
                // This is your test publishable API key.
                publishableKey: process.env.REACT_APP_STRIPE_PK,
                fetchClientSecret: fetchClientSecret,
                appearance: {
                    overlays: 'dialog',
                    variables: {
                        colorPrimary: '#ea580c',
                    },
                },
                locale: "en-US"
            }))
        }
        else {
            setStripeConnectInstance(undefined)
            setStripeAccountData(null)
        }
    }, [selectedTenant])

    // const [showVerifyDomainModal, setShowVerifyDomainModal] = useState(true)

    useEffect(() => {
        if (selectedTenantId) {
            refreshTenant()
        }
    }, [selectedTenantId])

    return (
        <DashboardContext.Provider value={{
            selectedTenant,
            setSelectedTenantId,
            refreshTenant,
            stripeConnectInstance,
            stripeAccountData,
            setShowAddDomainModal
        }}>
            <AddDomainModal show={showAddDomainModal} onClose={() => setShowAddDomainModal(false)} />
            {stripeConnectInstance ?
                <ConnectComponentsProvider connectInstance={stripeConnectInstance}>
                    <Outlet />
                </ConnectComponentsProvider>
                :
                <Outlet />
            }
        </DashboardContext.Provider >
    );
};