import { useContext, useEffect } from "react"
import { connectCreateAccount, connectLinkAccount } from "../../../Api"
import { AuthContext } from "../../../providers/AuthProvider"
import { DashboardContext } from "../../../providers/DashboardProvider"
import { ApplicationContext } from "../../../providers/ApplicationProvider"

export default function RefreshPage({ }) {

  const { user, refreshUser } = useContext(AuthContext)
  const { displayErrorModal } = useContext(ApplicationContext)
  const { selectedTenant } = useContext(DashboardContext)

  const handleLinkBankAccount = async () => {
    try {
      let connectedAccountId = null
      if (selectedTenant.stripe_account_id) {
        connectedAccountId = selectedTenant.stripe_account_id
      }
      else {
        const { account } = await connectCreateAccount(selectedTenant.id)
        await refreshUser()
        connectedAccountId = account
      }
      const { accountLink } = await connectLinkAccount(connectedAccountId)
      if (accountLink?.url) {
        window.location.replace(accountLink.url)
      }
      else {
        throw new Error("Somethink went wrong when creating bank account link URL")
      }
    }
    catch (err) {
      // displayErrorModal(err.message)
    }
  }

  useEffect(() => {
    if(selectedTenant) {
      handleLinkBankAccount()
    }
  }, [selectedTenant])

  return (
    <div className="flex flex-row justify-center items-center">
      <div className="text-lg font-bold pt-32 animate-bounce transform-gpu">
        Wait a moment...
      </div>
    </div>
  )
}